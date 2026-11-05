import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { z } from 'zod';
import { deliverToSales, type StoredLead } from '../lib/sales-delivery';

const answerSchema = z.object({
	questionId: z.string().max(100),
	question: z.string().max(500),
	optionId: z.string().max(100),
	answer: z.string().max(500),
	detail: z.string().max(2000).optional(),
});

/**
 * Pflicht sind Name, Telefon und E-Mail, auf jeder Strecke gleich (Quiz, Brief-Kontakt): Marten
 * ruft zurück, und wen er nicht erreicht, dem schreibt er. Nach der Firma
 * fragt das Formular seit 2026-10-29 nicht mehr (das Feld bleibt erlaubt, für offene alte Tabs).
 * Das Formular (`FunnelQuiz.tsx`, `PFLICHTFELDER`) prüft dasselbe; bis 2026-10-29 hing die
 * Regel an einer Liste von Strecken, und `/f/software-check/` fehlte darin, sodass Server
 * und Formular dort verschiedene Felder verlangten.
 */
const leadSchema = z.object({
	funnel: z.string().min(1).max(100),
	company: z.string().max(200),
	name: z.string().trim().min(2, 'Bitte mindestens 2 Zeichen eingeben.').max(100),
	email: z.string().trim().email('Bitte eine gueltige E-Mail-Adresse eingeben.').max(200),
	phone: z.string().trim().min(5, 'Bitte eine Telefonnummer angeben.').max(50),
	answers: z.array(answerSchema).max(20),
	utm: z.record(z.string(), z.string().max(500)).optional(),
	page: z.string().max(2000).optional(),
	eventId: z.string().max(100).optional(),
	/**
	 * Kennung des versendeten Briefs (Brief-Kanal /b/). Kommt als `?r=` an der
	 * Landingpage an und wird nur durchgereicht — die Zuordnung Kennung → Firma
	 * liegt ausschliesslich im lokalen Sales-Backend, nicht hier.
	 *
	 * Bewusst ein eigenes Feld statt eines Eintrags in `utm`: Die Brief-ID ist
	 * kein Kampagnen-Parameter, und im utm-Record waere sie in Mail und Blob
	 * schwer auffindbar.
	 */
	letterRef: z.string().max(50).optional(),
	honeypot: z.string().max(0),
});

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});

const parseJson = (value: string, fallback: unknown) => {
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
};

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

export default async (request: Request, context: Context) => {
	if (request.method !== 'POST') {
		return json({ success: false, error: 'Method not allowed' }, 405);
	}

	try {
		const formData = await request.formData();

		const data = {
			funnel: formData.get('funnel')?.toString() || '',
			company: formData.get('company')?.toString() || '',
			name: formData.get('name')?.toString() || '',
			email: formData.get('email')?.toString() || '',
			phone: formData.get('phone')?.toString() || '',
			answers: parseJson(formData.get('answers')?.toString() || '[]', []),
			utm: parseJson(formData.get('utm')?.toString() || '{}', {}),
			page: formData.get('page')?.toString() || undefined,
			eventId: formData.get('eventId')?.toString() || undefined,
			letterRef: formData.get('letterRef')?.toString() || undefined,
			honeypot: formData.get('honeypot')?.toString() || '',
		};

		const result = leadSchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: Record<string, string[]> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				if (!fieldErrors[field]) fieldErrors[field] = [];
				fieldErrors[field].push(issue.message);
			}
			return json({ success: false, errors: fieldErrors }, 400);
		}

		if (result.data.honeypot) {
			return json({ success: true });
		}

		const lead = result.data;
		const receivedAt = new Date().toISOString();
		const geo = {
			city: context.geo?.city,
			country: context.geo?.country?.name,
			subdivision: context.geo?.subdivision?.name,
		};
		const userAgent = request.headers.get('user-agent') || undefined;

		// Lead dauerhaft ablegen, BEVOR irgendetwas anderes passiert.
		// Abrufbar über das Netlify-Dashboard (Blobs) oder `netlify blobs:list funnel-leads`.
		//
		// Dieser Schritt ist als einziger fehlerkritisch: Der Blob ist die haltbare
		// Warteschlange, aus der `funnel-redeliver` nachliefert, wenn das CRM gerade
		// redeployed wird oder offline ist. Scheitert er, gibt es nichts zum Nachliefern —
		// dann muss der Besucher erneut absenden können, statt ein "Danke" zu sehen, hinter
		// dem nichts steht. Vorher wurde der Fehler nur geloggt und die Antwort blieb
		// `success: true`: ein bezahlter Lead war weg, und niemand hat es gemerkt.
		const store = getStore('funnel-leads');
		const day = receivedAt.slice(0, 10);
		const submissionId = `${day}/${receivedAt}-${crypto.randomUUID().slice(0, 8)}`;
		const stored: StoredLead = {
			receivedAt,
			funnel: lead.funnel,
			company: lead.company,
			name: lead.name,
			email: lead.email,
			phone: lead.phone,
			answers: lead.answers,
			attribution: lead.utm,
			letterRef: lead.letterRef,
			page: lead.page,
			geo,
			userAgent,
			deliveredAt: null,
		};
		try {
			await store.setJSON(submissionId, stored);
		} catch (blobError) {
			console.error('Blob store error:', blobError);
			return json(
				{
					success: false,
					errors: { form: ['Ein unerwarteter Fehler ist aufgetreten.'] },
				},
				500,
			);
		}

		// Ans CRM zustellen - best-effort. Gelingt es nicht, bleibt `deliveredAt: null`
		// stehen und `funnel-redeliver` versucht es alle zehn Minuten erneut; über
		// `submissionId` ist das idempotent.
		const delivery = await deliverToSales(stored, submissionId);
		if (delivery.ok) {
			try {
				await store.setJSON(submissionId, { ...stored, deliveredAt: new Date().toISOString() });
			} catch (stampError) {
				// Der Lead ist im CRM; nur der Stempel fehlt. Der Nachlieferer schickt ihn
				// dann ein zweites Mal, was das Backend über `submissionId` verwirft.
				console.error('Blob stamp error:', stampError);
			}
		}
		// Der Grund gehört in die Mail: Sie ist im Fehlerfall das Einzige, was den Lead noch
		// sichtbar macht, und "503" sagt etwas anderes als "SALES_API_URL fehlt".
		const deliveryReason = delivery.ok ? '' : delivery.reason;
		if (!delivery.ok) {
			console.error('Sales delivery failed:', deliveryReason);
		}

		// Meta Conversions API - serverseitiges Lead-Event (best-effort).
		// Nur senden, wenn Pixel-ID + Token konfiguriert sind. Die Attribution
		// (_fbp/_fbc/fbclid) liefert das Frontend nur nach Marketing-Consent mit,
		// sodass ohne Einwilligung keine Cookie-basierte Zuordnung stattfindet.
		const metaPixelId = Netlify.env.get('META_PIXEL_ID');
		const metaCapiToken = Netlify.env.get('META_CAPI_TOKEN');
		if (metaPixelId && metaCapiToken) {
			const attribution = lead.utm || {};
			const clientIp =
				request.headers.get('x-nf-client-connection-ip') ||
				request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
				undefined;
			await sendMetaCapiLead({
				pixelId: metaPixelId,
				token: metaCapiToken,
				eventId: lead.eventId,
				email: lead.email,
				phone: lead.phone,
				name: lead.name,
				fbp: attribution._fbp,
				fbc: attribution._fbc,
				fbclid: attribution.fbclid,
				sourceUrl: lead.page,
				clientIp,
				userAgent,
				receivedAt,
				testEventCode: Netlify.env.get('META_CAPI_TEST_EVENT_CODE'),
			});
		}

		const plunkSecretKey = Netlify.env.get('PLUNK_SECRET_KEY');
		const contactEmail = Netlify.env.get('CONTACT_NOTIFICATION_EMAIL');

		// Die Mail ist der Notnagel, nicht der Meldeweg. Angekommene Leads meldet das CRM
		// nach Slack; eine zweite Benachrichtigung pro Lead ist nur Lärm — und sie kostet:
		// Formular-POSTs von Bots ohne JavaScript lösten jedes Mal eine Mail aus, bis der
		// Plunk-Account wegen des Volumens gesperrt wurde. Erreicht der Lead das CRM nicht,
		// ist die Mail dagegen das Einzige, was ihn noch sichtbar macht.
		if (!delivery.ok && plunkSecretKey && contactEmail) {
			const answersHtml = lead.answers
				.map(
					(a) => `
            <p><strong>${a.question}</strong><br />
            ${a.answer}${a.detail ? `<br /><em style="white-space: pre-wrap">${a.detail}</em>` : ''}</p>
          `,
				)
				.join('');

			const utmEntries = Object.entries(lead.utm || {});
			const utmHtml = utmEntries.length
				? `<p><strong>Kampagnen-Daten:</strong><br />${utmEntries
						.map(([key, value]) => `${key}: ${value}`)
						.join('<br />')}</p>`
				: '';

			// Herkunft prominent oben: welcher Angle/Funnel + (falls gesetzt) welche Kampagne/Anzeige.
			const FUNNEL_LABELS: Record<string, string> = {
				'software-analyse': 'Angle 1 · Live-Zahlen / Software-Analyse',
				'live-zahlen': 'Angle 1 · Live-Zahlen',
				zeitfresser: 'Angle 2 · Zeitfresser / KI',
				// Angle 3 („Fünf Abos") ist am 18.10.2026 entfallen; der Slug gehört jetzt zu Tür 4.
				'eigene-software': 'Funnel · Eigene Software (/f/eigene-software/)',
				// Brief-Kanal (/b/) — eine Variante pro Branchencluster.
				'brief-fertigung': 'Brief · Fertigung & Handwerk',
				// Angebotsbaustein-Funnel (/f/angebote/) — Ziel der Social-Posts.
				// Schlüssel ist die Strecke aus dem Pfad; die Kurznamen bleiben als
				// Alias, solange noch Leads aus alten Tabs eintreffen können.
				'f/angebote': 'Funnel · Angebotsbaustein (/f/angebote/)',
				angebote: 'Funnel · Angebotsbaustein (/f/angebote/)',
				// Zahlen & Steuerung (/f/zahlen/, Tür 3).
				'f/zahlen': 'Funnel · Zahlen & Steuerung (/f/zahlen/)',
				zahlen: 'Funnel · Zahlen & Steuerung (/f/zahlen/)',
				// Einsatz & Abrechnung (/f/einsatz/, Tür 2).
				'f/einsatz': 'Funnel · Einsatz & Abrechnung (/f/einsatz/)',
				einsatz: 'Funnel · Einsatz & Abrechnung (/f/einsatz/)',
				// Eigene Software (/f/eigene-software/, Tür 4). Bis 2026-10-18 lag die Seite unter
				// /f/abloesung/; beide Schlüssel bleiben, damit alte Leads zuordenbar bleiben.
				'f/eigene-software': 'Funnel · Eigene Software (/f/eigene-software/)',
				'f/abloesung': 'Funnel · Eigene Software (früher /f/abloesung/)',
				// Backup der alten Fassungen, falls Anzeigen noch darauf zeigen sollen.
				'f/angebote-old': 'Funnel · Angebotsbaustein, alte Fassung (/f/angebote-old/)',
				'f/zahlen-old': 'Funnel · Zahlen & Steuerung, alte Fassung (/f/zahlen-old/)',
				'f/einsatz-old': 'Funnel · Einsatz & Abrechnung, alte Fassung (/f/einsatz-old/)',
			};
			const utm = lead.utm || {};
			const angleLabel = FUNNEL_LABELS[lead.funnel] || lead.funnel;
			const campaignBits = [utm.utm_campaign, utm.utm_content, utm.utm_source]
				.filter(Boolean)
				.join(' · ');
			const originHtml = `
				<div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:12px 16px;margin-bottom:16px">
					<strong>Kam über:</strong> ${angleLabel}
					${lead.letterRef ? `<br /><strong>Brief-Kennung:</strong> <code>${lead.letterRef}</code>` : ''}
					${campaignBits ? `<br /><strong>Kampagne/Anzeige:</strong> ${campaignBits}` : ''}
				</div>
				<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-bottom:16px">
					<strong>Noch nicht im CRM.</strong> ${deliveryReason}<br />
					Der Lead liegt gesichert in Netlify Blobs und wird automatisch nachgeliefert.
					Taucht er dort nicht auf, stehen die Daten unten.
				</div>`;

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 8000);

			try {
				// Die Antwort wird ausgewertet, nicht nur abgewartet: Ein deaktivierter Account
				// oder ein abgelaufener Key antwortet 401/403, und `fetch` wertet das nicht als
				// Fehler -- der `catch` unten greift nur bei Netzwerkabbruch oder Timeout. Ohne
				// diese Pruefung liefen die Mails still ins Leere, die Function loggte nichts,
				// und es fiel erst auf, als jemand das Plunk-Dashboard oeffnete.
				const plunkResponse = await fetch('https://next-api.useplunk.com/v1/send', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${plunkSecretKey}`,
					},
					body: JSON.stringify({
						to: contactEmail,
						from: 'kontakt@rocketbase.io',
						subject: `Funnel-Lead (${lead.funnel}): ${lead.company || lead.name}`,
						body: `
              ${originHtml}
              <p><strong>Firma:</strong> ${lead.company || '–'}</p>
              <p><strong>Name:</strong> ${lead.name}</p>
              <p><strong>E-Mail:</strong> ${lead.email || '–'}</p>
              ${lead.phone ? `<p><strong>Telefon:</strong> ${lead.phone}</p>` : ''}
              <hr />
              ${answersHtml}
              <hr />
              ${lead.page ? `<p><strong>Seite:</strong> ${lead.page}</p>` : ''}
              ${geo.city ? `<p><strong>Herkunft:</strong> ${[geo.city, geo.subdivision, geo.country].filter(Boolean).join(', ')}</p>` : ''}
              ${utmHtml}
            `,
					}),
					signal: controller.signal,
				});
				if (!plunkResponse.ok) {
					console.error(
						`Plunk email rejected: HTTP ${plunkResponse.status} ${await plunkResponse.text()}`,
					);
				}
			} catch (emailError) {
				console.error('Plunk email error:', emailError);
			} finally {
				clearTimeout(timeout);
			}
		} else {
			// Auch das gehoert ins Log: Eine fehlende Konfiguration sieht sonst genauso aus wie
			// eine erfolgreich verschickte Mail.
			console.warn('Plunk not configured (PLUNK_SECRET_KEY / CONTACT_NOTIFICATION_EMAIL)');
		}

		return json({ success: true });
	} catch (error) {
		console.error('Funnel lead error:', error);
		return json(
			{
				success: false,
				errors: { form: ['Ein unerwarteter Fehler ist aufgetreten.'] },
			},
			500,
		);
	}
};

export const config = {
	path: '/api/funnel-lead',
};
