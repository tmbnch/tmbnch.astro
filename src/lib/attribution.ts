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
