/**
 * Herkunft eines Formulars: UTM-Parameter und Klick-IDs der aktuellen Adresse plus
 * externer Referrer. Bewusst ohne sessionStorage oder Cookie: Etwas auf dem Gerät
 * abzulegen, bräuchte nach § 25 TDDDG eine Einwilligung, und die Seite kommt ohne
 * Banner aus. Wer die Seite wechselt, verliert dafür die Parameter der Einstiegsseite.
 */
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

export function collectAttribution(): Record<string, string> {
  const out: Record<string, string> = {};
  const q = new URLSearchParams(location.search);
  for (const p of PARAMS) {
    const v = q.get(p);
    if (v) out[p] = v.slice(0, 500);
  }
  if (document.referrer && !document.referrer.startsWith(location.origin)) out.referrer = document.referrer.slice(0, 500);
  return out;
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Meta-Cookies erst beim Absenden lesen: Sie existieren nur nach Marketing-Einwilligung,
 * also nicht zwingend schon beim Laden der Seite (wie in rcktbs.astro, leadTracking.ts).
 */
export function withMetaCookies(attribution: Record<string, string>): Record<string, string> {
  const out = { ...attribution };
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) out._fbp = fbp;
  if (fbc) out._fbc = fbc;
  return out;
}

/** Geteilte Event-ID für Browser-Pixel und Conversions API, damit Meta das Lead-Event nur einmal zählt. */
export function newEventId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

/** Browser-Lead, nur wenn der Pixel nach Einwilligung geladen ist. */
export function trackMetaLead(eventId: string): void {
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq === 'function') w.fbq('track', 'Lead', {}, { eventID: eventId });
}
