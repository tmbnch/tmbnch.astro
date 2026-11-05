import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { z } from 'zod';
import { deliverToSales, type StoredLead } from '../lib/sales-delivery';

/**
 * Beta-Fragebogen (`src/components/site/BetaQuiz.astro`) → Netlify Blobs → Sales-Backend.
 *
 * Gleicher Weg wie `funnel-lead` auf rocketbase.io: erst haltbar im Blob ablegen, dann ans
 * CRM zustellen. Klappt die Zustellung nicht, liefert `lead-redeliver` alle zehn Minuten
 * nach; über `submissionId` ist das idempotent. Die Mail über Plunk ist nur der Notnagel,
 * wenn das CRM den Eintrag beim ersten Versuch nicht angenommen hat. Dazu meldet die Function
 * den Lead an die Meta Conversions API, sobald META_PIXEL_ID und META_CAPI_TOKEN gesetzt sind.
 */

const answerSchema = z.object({
  questionId: z.string().max(100),
  question: z.string().max(500),
  optionId: z.string().max(100),
  answer: z.string().max(500),
  detail: z.string().max(2000).optional(),
});

const leadSchema = z.object({
  funnel: z.string().min(1).max(100),
  company: z.string().trim().max(200),
  name: z.string().trim().min(2, 'Bitte mindestens 2 Zeichen eingeben.').max(100),
  email: z.string().trim().pipe(z.email('Bitte eine gültige E-Mail-Adresse eingeben.').max(200)),
  phone: z.string().trim().max(50),
  answers: z.array(answerSchema).max(20),
  utm: z.record(z.string(), z.string().max(500)).optional(),
  page: z.string().max(2000).optional(),
  /** Geteilt mit dem Browser-Pixel, damit Meta das Lead-Event dedupliziert */
  eventId: z.string().max(100).optional(),
  // Bewusst permissiv (siehe contact.ts): Ein Fehler mit Feldnamen wäre eine Anleitung für Bots.
  honeypot: z.string().max(200),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const parseJson = (value: string, fallback: unknown) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Meta Conversions API, unverändert aus rcktbs.astro (funnel-lead.ts) ---

// SHA-256-Hash (hex), wie von der Meta Conversions API für PII gefordert.
const sha256 = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Meta verlangt Normalisierung (trim + lowercase) vor dem Hashen.
const hashField = (value?: string) => {
  const normalized = value?.trim().toLowerCase();
  return normalized ? sha256(normalized) : undefined;
};

// Telefonnummer: nur Ziffern behalten (Meta-Empfehlung), dann hashen.
const hashPhone = (value?: string) => {
  const digits = value?.replace(/[^0-9]/g, '');
  return digits ? sha256(digits) : undefined;
};

interface CapiInput {
  pixelId: string;
  token: string;
  eventId?: string;
  email?: string;
  phone?: string;
  name: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  sourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
  receivedAt: string;
  testEventCode?: string;
}

// Serverseitiges Lead-Event an die Meta Conversions API senden.
// Läuft best-effort: Fehler dürfen die Lead-Verarbeitung nie blockieren.
const sendMetaCapiLead = async (input: CapiInput): Promise<void> => {
  const nameParts = input.name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

  const [em, ph, fn, ln] = await Promise.all([
    hashField(input.email),
    hashPhone(input.phone),
    hashField(firstName),
    hashField(lastName),
  ]);

  const userData: Record<string, unknown> = {};
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  // Der fbc-Cookie hat Vorrang; sonst aus fbclid rekonstruieren.
  const fbc =
    input.fbc ||
    (input.fbclid
      ? `fb.1.${Date.parse(input.receivedAt) || Date.now()}.${input.fbclid}`
      : undefined);
  if (input.fbp) userData.fbp = input.fbp;
  if (fbc) userData.fbc = fbc;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor((Date.parse(input.receivedAt) || Date.now()) / 1000),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: input.sourceUrl,
        user_data: userData,
      },
    ],
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${input.pixelId}/events?access_token=${encodeURIComponent(input.token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      console.error('Meta CAPI error:', res.status, await res.text());
    }
  } catch (capiError) {
    console.error('Meta CAPI request failed:', capiError);
  } finally {
    clearTimeout(timeout);
  }
};

/** Notnagel-Mail, nur wenn das CRM die Abgabe nicht angenommen hat. Wirft nie. */
const sendFallbackMail = async (lead: StoredLead, reason: string) => {
  const key = Netlify.env.get('PLUNK_SECRET_KEY');
  const to = Netlify.env.get('CONTACT_NOTIFICATION_EMAIL');
  if (!key || !to) {
    console.warn('Plunk nicht konfiguriert (PLUNK_SECRET_KEY / CONTACT_NOTIFICATION_EMAIL)');
    return;
  }
  const answers = lead.answers
    .map(
      (a) =>
        `<p><strong>${escape(a.question)}</strong><br />${escape(a.answer)}${a.detail ? `<br /><em style="white-space:pre-wrap">${escape(a.detail)}</em>` : ''}</p>`,
    )
    .join('');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://next-api.useplunk.com/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        to,
        from: 'kontakt@rocketbase.io',
        subject: `timebench Beta: ${lead.company || lead.name}`,
        body: `
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-bottom:16px">
            <strong>Noch nicht im CRM.</strong> ${escape(reason)}<br />
            Der Eintrag liegt in Netlify Blobs und wird automatisch nachgeliefert.
          </div>
          <p><strong>Name:</strong> ${escape(lead.name)}</p>
          <p><strong>E-Mail:</strong> ${escape(lead.email || '–')}</p>
          <p><strong>Firma:</strong> ${escape(lead.company || '–')}</p>
          ${lead.phone ? `<p><strong>Telefon:</strong> ${escape(lead.phone)}</p>` : ''}
          <hr />${answers}
          ${lead.page ? `<p><strong>Seite:</strong> ${escape(lead.page)}</p>` : ''}`,
      }),
      signal: controller.signal,
    });
    if (!res.ok) console.error(`Plunk lehnt ab: HTTP ${res.status} ${await res.text()}`);
  } catch (error) {
    console.error('Plunk-Fehler:', error);
  } finally {
    clearTimeout(timeout);
  }
};

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  try {
    const form = await request.formData();
    const result = leadSchema.safeParse({
      funnel: form.get('funnel')?.toString() || 'timebench-beta',
      company: form.get('company')?.toString() || '',
      name: form.get('name')?.toString() || '',
      email: form.get('email')?.toString() || '',
      phone: form.get('phone')?.toString() || '',
      answers: parseJson(form.get('answers')?.toString() || '[]', []),
      utm: parseJson(form.get('utm')?.toString() || '{}', {}),
      page: form.get('page')?.toString() || undefined,
      eventId: form.get('eventId')?.toString() || undefined,
      honeypot: form.get('honeypot')?.toString() || '',
    });

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        (errors[field] ??= []).push(issue.message);
      }
      return json({ success: false, errors }, 400);
    }

    // Honeypot gefüllt: dieselbe Antwort wie für Menschen, damit der Bot nichts lernt.
    if (result.data.honeypot) return json({ success: true });

    const lead = result.data;
    const receivedAt = new Date().toISOString();
    const stored: StoredLead = {
      receivedAt,
      event: 'quiz_lead',
      funnel: lead.funnel,
      company: lead.company,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || undefined,
      answers: lead.answers,
      attribution: lead.utm,
      page: lead.page,
      geo: {
        city: context.geo?.city,
        country: context.geo?.country?.name,
        subdivision: context.geo?.subdivision?.name,
      },
      userAgent: request.headers.get('user-agent') || undefined,
      deliveredAt: null,
    };

    // Der einzige fehlerkritische Schritt: Ohne Blob gibt es nichts zum Nachliefern, also
    // muss die Person erneut absenden können, statt ein „Danke“ ohne Eintrag zu sehen.
    const store = getStore('funnel-leads');
    const submissionId = `${receivedAt.slice(0, 10)}/${receivedAt}-${crypto.randomUUID().slice(0, 8)}`;
    try {
      await store.setJSON(submissionId, stored);
    } catch (error) {
      console.error('Blob-Fehler:', error);
      return json({ success: false, errors: { form: ['Ein unerwarteter Fehler ist aufgetreten.'] } }, 500);
    }

    const delivery = await deliverToSales(stored, submissionId);
    if (delivery.ok) {
      try {
        await store.setJSON(submissionId, { ...stored, deliveredAt: new Date().toISOString() });
      } catch (error) {
        // Im CRM ist er; der Nachlieferer schickt ihn noch einmal, das Backend verwirft das.
        console.error('Blob-Stempel fehlt:', error);
      }
    } else {
      console.error('Zustellung ans Sales-Backend fehlgeschlagen:', delivery.reason);
      await sendFallbackMail(stored, delivery.reason);
    }

    // Serverseitiges Lead-Event an Meta, best-effort. Die Cookie-Zuordnung (_fbp/_fbc) schickt
    // der Browser nur mit, wenn Marketing erlaubt ist; ohne sie bleibt nur die gehashte Mail.
    const metaPixelId = Netlify.env.get('META_PIXEL_ID');
    const metaCapiToken = Netlify.env.get('META_CAPI_TOKEN');
    if (metaPixelId && metaCapiToken) {
      const attribution = lead.utm || {};
      await sendMetaCapiLead({
        pixelId: metaPixelId,
        token: metaCapiToken,
        eventId: lead.eventId,
        email: lead.email,
        phone: lead.phone || undefined,
        name: lead.name,
        fbp: attribution._fbp,
        fbc: attribution._fbc,
        fbclid: attribution.fbclid,
        sourceUrl: lead.page,
        clientIp:
          request.headers.get('x-nf-client-connection-ip') ||
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          undefined,
        userAgent: stored.userAgent,
        receivedAt,
        testEventCode: Netlify.env.get('META_CAPI_TEST_EVENT_CODE'),
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Beta-Fehler:', error);
    return json({ success: false, errors: { form: ['Ein unerwarteter Fehler ist aufgetreten.'] } }, 500);
  }
};

export const config = { path: '/api/beta' };
