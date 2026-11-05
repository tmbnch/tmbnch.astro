/**
 * Geteilte Tracking-Bausteine der Lead-Formulare.
 *
 * Extrahiert aus `FunnelQuiz.tsx`, damit der Brief-Kanal (/b/) dieselbe
 * Attributions-Mechanik nutzt wie der Anzeigen-Kanal (/f/). Zwei Kopien wären
 * hier ein echter Bug-Vektor: Wer das Meta-Tracking anfasst und nur eine Seite
 * anpasst, verliert die Deduplizierung stillschweigend.
 *
 * Die Formulare selbst bleiben getrennt — nur diese Mechanik ist geteilt.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

/** Click-IDs der Ad-Plattformen — Basis für server-seitige Conversion-APIs. */
export const CLICK_ID_KEYS = ['fbclid', 'gclid', 'msclkid', 'li_fat_id', 'ttclid'] as const;

export function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function pushEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

/**
 * Feuert das Meta-Pixel-Lead-Event im Browser — aber nur, wenn der Pixel nach
 * Marketing-Consent geladen wurde (fbq existiert dann). Die eventId wird mit
 * dem serverseitigen CAPI-Event geteilt, damit Meta beide dedupliziert.
 */
export function trackMetaLead(eventId: string) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq !== 'function') return;
  w.fbq('track', 'Lead', {}, { eventID: eventId });
}

/** Sammelt UTM-Parameter, Click-IDs und Referrer aus der aktuellen URL. */
const ATTRIBUTION_KEY = 'rb-attribution';

/**
 * Herkunft der Sitzung: zuerst aus der URL, sonst aus dem, was beim Einstieg gemerkt wurde.
 *
 * **Warum gemerkt wird.** Die Kampagnen-Parameter stehen nur an der Einstiegsseite. Beim Quiz
 * fiel das nie auf, weil Formular und Einstieg dieselbe Seite sind — beim Kontaktformular ist
 * genau das nicht so: Wer über eine Anzeige auf `/f/angebote` landet und dann auf „Kontakt"
 * klickt, hat in der URL nichts mehr stehen. Ohne die Sicherung käme die Anfrage im Board ohne
 * Quelle an, und die Frage „welche Anzeige bringt Anfragen" wäre für genau die Besucher
 * unbeantwortbar, die sich am gründlichsten umgesehen haben.
 *
 * Gemerkt wird die **erste** Herkunft der Sitzung: Ein späterer interner Klick darf die Anzeige
 * nicht überschreiben, die den Besuch ausgelöst hat. Fehlschläge sind egal (Private Mode) — dann
 * gilt wie bisher nur die aktuelle URL. Gleiche Mechanik wie `briefRef.ts`, aus demselben Grund.
 */
export function sammleAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};
  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }

  if (Object.keys(attribution).length > 0) {
    // Der Referrer gehört zum Einstieg und wird mitgesichert, nicht der einer
    // Folgeseite — sonst stünde dort die eigene Domain.
    if (document.referrer) attribution.referrer = document.referrer;
    try {
      if (!window.sessionStorage.getItem(ATTRIBUTION_KEY)) {
        window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
      }
    } catch {
      // Private Mode o. Ä. — die Herkunft lebt dann nur für diesen Seitenaufruf.
    }
    return attribution;
  }

  try {
    const gemerkt = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (gemerkt) return JSON.parse(gemerkt) as Record<string, string>;
  } catch {
    // Unlesbar oder gesperrt: unten ohne Kampagnen-Daten weiter.
  }

  if (document.referrer) attribution.referrer = document.referrer;
  return attribution;
}

/**
 * Meta-Cookies erst beim Absenden lesen — sie existieren nur nach Consent,
 * also nicht zwingend schon beim Laden der Seite.
 */
export function ergaenzeMetaCookies(attribution: Record<string, string>): Record<string, string> {
  const ergaenzt = { ...attribution };
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) ergaenzt._fbp = fbp;
  if (fbc) ergaenzt._fbc = fbc;
  return ergaenzt;
}

/**
 * Geteilte Event-ID für Browser-Pixel und serverseitige Conversions-API.
 * Meta nutzt sie, um das doppelt gemeldete Lead-Event zu deduplizieren.
 */
export function erzeugeEventId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `lead-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

/**
 * Plausible-Event, falls das Script geladen ist (cookieless, kein Consent nötig).
 * Bisher gab es keine Custom-Events; der Cal-Klick auf /f/angebote/ ist der erste
 * Konversionspunkt, der ohne Formular auskommt und sonst unsichtbar bliebe.
 */
export function trackPlausible(event: string, props: Record<string, string | number> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  };
  if (typeof w.plausible !== 'function') return;
  w.plausible(event, { props });
}
