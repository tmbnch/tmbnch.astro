/**
 * Zwischenschritt für Absendungen ohne JavaScript.
 *
 * **Warum es ihn gibt:** Jede Spam-Kontaktanfrage kam bisher ohne JavaScript — die
 * Formular-Scraper lesen das HTML, POSTen einmal und sind weg. Sie rendern keine
 * Antwort, folgen keinem zweiten Schritt. Genau da setzt dieser Schritt an: Wer
 * `renderedAt` nicht mitschickt, bekommt keine stille Bestätigung, sondern eine
 * Seite mit einem zweiten Knopf. Ein Mensch klickt einmal mehr, ein Scraper nicht.
 *
 * **Warum kein Captcha:** Eine Rechenaufgabe hält niemanden auf, der das Formular
 * gezielt nachbaut, kostet aber genau die wenigen echten Nicht-JS-Besucher Nerven.
 * Der zweite Schritt allein ist der Filter; die `[SPAM?]`-Markierung in `contact.ts`
 * bleibt als zweite Schicht daneben bestehen.
 *
 * **Warum ein signiertes Token und kein Store:** Der Zwischenschritt darf keinen
 * Zustand brauchen. Das Token trägt die Formulardaten selbst, signiert mit HMAC —
 * damit kann die zweite Anfrage nicht manipuliert werden (sonst wäre die Seite ein
 * offenes Relais, über das sich beliebige Inhalte ins CRM schreiben ließen) und
 * läuft nach kurzer Zeit ab, ohne dass jemand aufräumen muss.
 */

/** Gültigkeitsdauer des Tokens. Lang genug zum Lesen, kurz genug gegen Wiederverwendung. */
const GUELTIG_MS = 30 * 60 * 1000;

/**
 * Signaturschlüssel. Ohne gesetzte Variable ein prozessweiter Zufallswert: Dann
 * funktioniert der Ablauf trotzdem, Tokens überleben aber kein Deploy — besser als
 * ein fest eingebauter Schlüssel, der im Repo stünde.
 */
const geheimnis = (): string =>
  Netlify.env.get('FORM_TOKEN_SECRET') || Netlify.env.get('SALES_API_TOKEN') || zufallsSchluessel;

const zufallsSchluessel = crypto.randomUUID();

const b64url = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let roh = '';
  for (const b of view) roh += String.fromCharCode(b);
  return btoa(roh).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const vonB64url = (s: string): Uint8Array => {
  const roh = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(roh, (c) => c.charCodeAt(0));
};

const signiere = async (inhalt: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(geheimnis()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(inhalt));
  return b64url(sig);
};

/** Zeitkonstanter Vergleich: verrät über die Laufzeit nicht, wie weit eine Signatur stimmt. */
const gleich = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Baut ein signiertes Token aus den Formulardaten. */
export const baueToken = async (felder: Record<string, string>): Promise<string> => {
  const nutzlast = b64url(new TextEncoder().encode(JSON.stringify({ f: felder, t: Date.now() })));
  return `${nutzlast}.${await signiere(nutzlast)}`;
};

/**
 * Prüft ein Token und gibt die enthaltenen Felder zurück. `null`, sobald etwas nicht
 * stimmt — abgelaufen, verfälscht oder gar kein Token. Der Aufrufer unterscheidet die
 * Fälle bewusst nicht: Wer am Token dreht, soll nicht erfahren, woran es lag.
 */
export const pruefeToken = async (token: string): Promise<Record<string, string> | null> => {
  const [nutzlast, signatur] = token.split('.');
  if (!nutzlast || !signatur) return null;
  if (!gleich(signatur, await signiere(nutzlast))) return null;

  try {
    const { f, t } = JSON.parse(new TextDecoder().decode(vonB64url(nutzlast)));
    if (typeof t !== 'number' || Date.now() - t > GUELTIG_MS) return null;
    if (!f || typeof f !== 'object') return null;
    return f as Record<string, string>;
  } catch {
    return null;
  }
};

const escape = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Die drei Seiten dieses Ablaufs teilen sich ein Geruest.
 *
 * Bewusst vollstaendige, alleinstehende HTML-Seiten mit Inline-CSS: Sie werden als
 * Antwort auf den POST ausgeliefert, haben also keinen Zugriff auf das Astro-Layout
 * und sollen ohne eine einzige weitere Anfrage funktionieren — der Empfaenger hat
 * gerade bewiesen, dass bei ihm kein JavaScript laeuft.
 */
const rahmen = (titel: string, inhalt: string): string => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${escape(titel)} · RocketBase</title>
<style>
  :root { color-scheme: light dark; --bg:#fff; --fg:#1a1a1a; --muted:#5b6472; --line:#e3e6ea; --brand:#3b6cf6; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#111418; --fg:#f2f4f7; --muted:#9aa4b2; --line:#2a2f37; --brand:#7aa2ff; }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6; display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px;
  }
  main { width: 100%; max-width: 32rem; }
  h1 { font-size: 1.5rem; line-height: 1.25; margin: 0 0 .75rem; }
  p { margin: 0 0 1rem; color: var(--muted); }
  .karte { border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 0 0 1.5rem; }
  .zeile { display: flex; gap: 12px; padding: 6px 0; font-size: .95rem; }
  .zeile dt { color: var(--muted); flex: 0 0 5.5rem; }
  .zeile dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
  .zeile dd.text { white-space: pre-wrap; }
  button {
    width: 100%; min-height: 3rem; padding: .75rem 1.25rem; border: 0; border-radius: 10px;
    background: var(--brand); color: #fff; font: inherit; font-weight: 700; cursor: pointer;
  }
  button:hover { filter: brightness(1.08); }
  .fuss { font-size: .85rem; margin: 1rem 0 0; }
  a { color: var(--brand); }
</style>
</head>
<body>
<main>
  <h1>${escape(titel)}</h1>
  ${inhalt}
</main>
</body>
</html>`;

/**
 * Der Zwischenschritt selbst: zeigt die vollstaendige Anfrage und traegt das Token.
 *
 * Vollstaendig heisst alle vier sichtbaren Felder des Formulars - wer hier
 * bestaetigt, soll sehen, was er bestaetigt, und nicht nur Name und E-Mail. Die
 * Daten selbst reisen ohnehin im Token mit; angezeigt werden sie, damit der
 * zweite Klick eine bewusste Entscheidung ist und kein Blankoscheck.
 *
 * Das kleine Script am Ende ist der Ausgleich fuer die fehlende Herkunft: Laeuft doch
 * JavaScript (etwa weil nur ein Skript-Fehler die Hidden-Felder leer gelassen hat),
 * reicht es `utm` und `page` nach. Ohne JavaScript fehlen sie — die Anfrage geht
 * trotzdem durch, nur ohne Absender-Geschichte.
 */
export const bestaetigungsSeite = (
  token: string,
  anfrage: { name: string; email: string; subject?: string; message: string }
): string =>
  rahmen(
    'Nur noch ein Klick.',
    `<p>Wir konnten bei eurem Browser kein JavaScript feststellen. Damit keine automatisch
  verschickten Anfragen durchrutschen, bestätigt diesen Schritt bitte von Hand.</p>

  <dl class="karte">
    <div class="zeile"><dt>Name</dt><dd>${escape(anfrage.name)}</dd></div>
    <div class="zeile"><dt>E-Mail</dt><dd>${escape(anfrage.email)}</dd></div>
    ${anfrage.subject ? `<div class="zeile"><dt>Betreff</dt><dd>${escape(anfrage.subject)}</dd></div>` : ''}
    <div class="zeile"><dt>Nachricht</dt><dd class="text">${escape(anfrage.message)}</dd></div>
  </dl>

  <form method="POST" action="/api/contact">
    <input type="hidden" name="bestaetigung" value="${escape(token)}" />
    <input type="hidden" name="utm" id="n-utm" value="" />
    <input type="hidden" name="page" id="n-page" value="" />
    <button type="submit">Anfrage jetzt absenden</button>
  </form>

  <p class="fuss">Lieber direkt? <a href="mailto:kontakt@rocketbase.io">kontakt@rocketbase.io</a></p>
<script>
  try {
    document.getElementById('n-page').value = document.referrer || location.href;
    var p = new URLSearchParams(location.search);
    if (p.toString()) document.getElementById('n-utm').value = JSON.stringify(Object.fromEntries(p));
  } catch (e) {}
</script>`
  );

/** Nach erfolgreicher Bestaetigung: der Nicht-JS-Pfad braucht eine echte Danke-Seite. */
export const dankeSeite = (): string =>
  rahmen(
    'Danke, die Anfrage ist da.',
    '<p>Wir melden uns in der Regel noch am selben Werktag. Wenn es eilig ist, erreicht ihr uns unter <a href="tel:+4915123336263">(+49) 1512 333 6263</a>.</p>' +
      '<p><a href="/">Zurück zur Startseite</a></p>'
  );

/**
 * Token abgelaufen oder verfaelscht - mit dem Weg zurueck statt einer Sackgasse.
 * Kein Mail-Versand im Spiel: Es geht um das versteckte Feld auf der
 * Bestaetigungsseite, das nach 30 Minuten nicht mehr gilt.
 */
export const abgelaufenSeite = (): string =>
  rahmen(
    'Das hat zu lange gedauert.',
    '<p>Diese Seite war zu lange offen. Bitte füllt das Formular noch einmal aus — oder schreibt uns direkt an <a href="mailto:kontakt@rocketbase.io">kontakt@rocketbase.io</a>.</p>' +
      '<p><a href="/kontakt/">Zurück zum Formular</a></p>'
  );

/** Validierungsfehler fuer den Nicht-JS-Pfad: lesbar statt rohes JSON im Browser. */
export const fehlerSeite = (meldungen: string[]): string =>
  rahmen(
    'Da fehlt noch etwas.',
    `<ul>${meldungen.map((m) => `<li>${escape(m)}</li>`).join('')}</ul>` +
      '<p><a href="/kontakt/">Zurück zum Formular</a></p>'
  );
