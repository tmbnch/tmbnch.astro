/**
 * Stiller Versuch, Seitenaufruf und Verhalten der angeschriebenen Firma zuzuordnen.
 *
 * Der QR-Code auf dem Anschreiben und der Link in der persönlichen Mail tragen
 * `?r=<kennung>` — die Kennung ist kanalunabhängig. Liegt sie vor,
 * meldet diese Datei an das Sales-Backend, dass die Landingpage geöffnet wurde
 * und was danach passiert ist (Video gestartet, Termin geklickt, …). Aufgelöst
 * wird die Kennung hier nicht — welche Firma dahintersteht, weiß ausschließlich
 * das Backend (siehe `briefRef.ts`).
 *
 * Jedes Ereignis geht zusätzlich als Custom-Event an Plausible — dort ohne
 * Kennung, nur mit dem Funnel-Namen als Property. Plausible liefert damit die
 * Trichter-Sicht über alle Briefe (wie viele Öffner starten das Video, wie
 * viele klicken den Termin); das Backend liefert die Sicht pro Firma. Beides
 * zusammen beantwortet beim nächsten Nein die Frage, ob der Inhalt nicht
 * überzeugt hat oder gar nicht angesehen wurde.
 *
 * **Der Aufruf ist still, und zwar konsequent.** Kein Ergebnis, kein Fehler,
 * kein Zustand, keine Rückwirkung auf die Seite: Ein nicht erreichbares
 * Backend, ein Ad-Blocker oder eine fehlende Konfiguration bleiben für den
 * Besucher unsichtbar. Das Tracking ist eine Zugabe, die Landingpage
 * funktioniert ohne sie vollständig.
 *
 * **Kein Consent-Gate.** Der Aufruf setzt nichts auf dem Endgerät — kein
 * Cookie, kein localStorage — und fällt damit nicht unter §25 TTDSG.
 * Übertragen wird, was der Browser bei jedem Request ohnehin preisgibt, plus
 * eine grobe Geräteklasse. Ein roher User-Agent wäre zusammen mit Viewport und
 * Zeitzone ein brauchbarer Fingerabdruck und wird deshalb bewusst nicht
 * gesendet; für die einzige Frage, die daran hängt — am Handy gescannt oder am
 * Rechner abgetippt — reicht `mobile | tablet | desktop`.
 */

import { leseBriefRef } from '@/lib/briefRef';
import { sammleAttribution, trackPlausible } from '@/lib/leadTracking';

/**
 * Basis-URL des Sales-Backends, z. B. `https://api.example.com`. Ohne diese
 * Variable geht nichts ans Backend (Plausible läuft unabhängig davon): Ein
 * Default würde beim ersten Deploy ins Leere oder — schlimmer — an die
 * falsche Umgebung melden.
 */
const API_BASE = import.meta.env.PUBLIC_SALES_API_URL as string | undefined;

const ENDPOINT = '/api/public/funnel-events';

/**
 * Der Name der Strecke, abgeleitet aus dem Pfad: `/f/angebote/` → `f/angebote`.
 *
 * **Warum der Pfad und kein gepflegter Name.** Vorher trug jede Stelle ihren eigenen:
 * das Layout `tuer-angebote`, das Kontaktformular fest verdrahtet `angebote`, die
 * dynamische Route ihren `slug`. Keiner wusste vom anderen — im Board stand die Abgabe
 * unter einer anderen Strecke als die Öffnung, die zu ihr führte, und die Formulare auf
 * `/f/zahlen` und `/f/einsatz` meldeten beide `angebote`. Der Pfad ist immer da, immer
 * eindeutig, und Öffnung und Abgabe teilen ihn zwangsläufig.
 *
 * Das `f/` bzw. `b/` bleibt stehen: Es unterscheidet die Anzeigen-Tür von der
 * Brief-Landing, ohne ein künstliches Wort wie `tuer-`. Slashes am Rand fallen weg,
 * damit der Name im Board nicht wie ein Pfad aussieht — die Spalte „Seite" zeigt den
 * ohnehin.
 *
 * Kampagnen-Wellen (`brief-welle-01`) sind davon unberührt: Dort ist die Welle die
 * Aussage, nicht die Seite, und sie wird weiterhin explizit gesetzt.
 */
export function streckeAusPfad(pfad?: string): string {
  // Ohne Argument der aktuelle Pfad — aber nur im Browser: Die Funktion wird auch
  // beim statischen Render einer Insel aufgerufen, wo es kein `window` gibt.
  const roh = pfad ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  return roh.replace(/^\/+|\/+$/g, '') || 'start';
}

/**
 * Ereignisse, die das Backend kennt. Die Namen sind der Vertrag mit dem CRM
 * (rcktbs-sales) — wer hier umbenennt, muss dort die Anzeige nachziehen.
 *
 * **Bewusst kurz.** Ins CRM gehört, was eine Entscheidung trägt: Die Firma hat den Link
 * geöffnet, und sie hat abgeschickt. Alles dazwischen — Quiz-Schritte, Video-Fortschritt,
 * sichtbare Sektionen, der Klick auf den Termin-Knopf — ist eine Trichter-Frage über alle
 * Besucher und geht ausschließlich an Plausible (`trackPlausible`). Im CRM wäre jeder
 * Schritt eine eigene Zeile je Firma und eine eigene Slack-Meldung; ein einziger Besucher
 * löste damit fünf aus, und ein Kanal, den man stummschaltet, meldet gar nichts mehr.
 *
 * `form_submit` deckt das Kontaktformular ab, `email_open` / `email_click` sind für die
 * Mail-Strecke reserviert — der Backend-Resolver und die i18n-Labels kennen sie bereits.
 */
export type FunnelEreignis =
  | 'page_view'
  | 'quiz_lead'
  | 'form_submit'
  | 'email_open'
  | 'email_click';

type Payload = Record<string, unknown>;

interface Optionen {
  /**
   * Zusatzschlüssel für die Einmal-Zählung: `sektion_sichtbar` soll pro
   * Sektion einmal kommen, nicht pro Seite einmal. Ohne Schlüssel zählt der
   * Ereignisname allein.
   */
  schluessel?: string;
  /** `false`, wenn das Ereignis schon anderweitig bei Plausible landet. */
  plausible?: boolean;
}

/**
 * Pro Seitenaufruf jedes Ereignis nur einmal. Astro rendert statisch, aber ein
 * View-Transition-Wechsel, ein doppelt eingebundenes Skript oder ein Video,
 * das zurückgespult und erneut gestartet wird, würden sonst dieselbe Handlung
 * mehrfach zählen. `verweildauer` ist die Ausnahme — siehe `meldeEreignis`.
 *
 * Reicht für Verhalten, nicht für die Öffnung: Das Set lebt nur so lange wie die Seite.
 * `page_view` sperrt deshalb zusätzlich über die Sitzung — siehe unten.
 */
const gemeldet = new Set<string>();

/**
 * Was in dieser Sitzung schon gemeldet wurde — über Seitenwechsel hinweg.
 *
 * Das `Set` oben lebt nur, solange die Seite geladen ist: Astro rendert statisch, also
 * startet das Modul bei jedem internen Klick neu, und derselbe Besuch erzeugte bisher pro
 * besuchter Funnel-Seite einen eigenen `page_view`. Im CRM las sich das als "drei Aufrufe",
 * wo einer stattfand, und der Abend-Digest zählte sie mit.
 *
 * Nur für `page_view` gedacht, nicht für Verhalten: Dass jemand das Video ein zweites Mal
 * startet, ist eine eigene Handlung und soll auf einer neuen Seite wieder zählen dürfen.
 */
const SITZUNGS_PREFIX = 'rb-funnel-seen:';

function inDieserSitzungGemeldet(schluessel: string): boolean {
  try {
    return window.sessionStorage.getItem(SITZUNGS_PREFIX + schluessel) !== null;
  } catch {
    // Private-Mode o. Ä.: Dann greift nur die Einmal-Zählung dieses Seitenaufrufs. Lieber
    // eine Meldung zu viel als eine verlorene Öffnung.
    return false;
  }
}

function merkeFuerDieseSitzung(schluessel: string): void {
  try {
    window.sessionStorage.setItem(SITZUNGS_PREFIX + schluessel, '1');
  } catch {
    // Siehe oben — ohne Storage bleibt es bei der Einmal-Zählung pro Seitenaufruf.
  }
}

/** Grobe Geräteklasse statt User-Agent — siehe Modul-Kommentar. */
function geraeteKlasse(): string {
  if (!window.matchMedia('(pointer: coarse)').matches) return 'desktop';
  return Math.min(window.innerWidth, window.innerHeight) >= 600 ? 'tablet' : 'mobile';
}

function sende(body: string): void {
  if (!API_BASE) return;
  const url = `${API_BASE.replace(/\/+$/, '')}${ENDPOINT}`;

  try {
    // sendBeacon zuerst: Der Aufruf überlebt, wenn jemand sofort weiterklickt
    // oder den Tab schliesst — auf dem Handy nach einem QR-Scan der Normalfall.
    // Er schickt `text/plain` und löst damit keinen Preflight aus; der Endpunkt
    // nimmt beide Content-Types an.
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) return;

    // Fallback, wenn sendBeacon fehlt oder die Warteschlange voll ist.
    // `keepalive` hält den Request auch über das Entladen der Seite hinweg am
    // Leben; `catch` verschluckt jeden Fehler, inklusive Offline und CORS.
    void fetch(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'text/plain' },
      credentials: 'omit',
      keepalive: true,
      mode: 'cors',
    }).catch(() => {});
  } catch {
    // Auch der synchrone Pfad darf nichts nach aussen tragen: sendBeacon wirft
    // in manchen Browsern bei blockierten Requests, und ein unbehandelter
    // Fehler im Seitenskript kann nachfolgende Skripte mitreissen.
  }
}

/**
 * Meldet ein Ereignis — an Plausible immer, ans Backend nur mit Brief-Kennung.
 *
 * Ohne Kennung gibt es für das Backend nichts zuzuordnen; die reine Reichweite
 * zählt Plausible. Eine Meldung ohne Firma wäre dort nur Rauschen.
 *
 * @param funnel  Name der Strecke, unter der das Ereignis im CRM erscheint.
 * @param event   Ereignisname, siehe `FunnelEreignis`.
 * @param payload Zusätzliche Angaben, z. B. gesehene Sekunden.
 */
export function meldeEreignis(
  funnel: string,
  event: FunnelEreignis,
  payload: Payload = {},
  opt: Optionen = {}
): void {
  if (typeof window === 'undefined') return;
  const key = opt.schluessel ? `${event}:${opt.schluessel}` : event;
  if (gemeldet.has(key)) return;
  gemeldet.add(key);

  if (opt.plausible !== false) {
    // Plausible: Props müssen flach sein (string | number). Zahlen aus dem
    // Payload nehmen wir mit, Objekte nicht.
    const props: Record<string, string | number> = { funnel };
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === 'string' || typeof v === 'number') props[k] = v;
    }
    trackPlausible(event, props);
  }

  const ref = leseBriefRef();
  if (!ref) return;

  sende(
    JSON.stringify({
      companyId: ref,
      event,
      funnel,
      payload: {
        ...payload,
        path: window.location.pathname,
        device: geraeteKlasse(),
      },
    })
  );
}

/**
 * Meldet den Seitenaufruf, sofern eine Brief-Kennung vorliegt.
 *
 * Trägt mehr Kontext als die Folge-Ereignisse (Referrer, UTM, Viewport), weil
 * er die Frage "wie ist die Person hier gelandet" beantwortet — die anderen
 * Ereignisse hängen ohnehin an derselben Kennung.
 *
 * @param funnel Name der Strecke, unter der die Öffnung im CRM erscheint.
 */
export function meldeSeitenaufruf(funnel: string): void {
  if (typeof window === 'undefined' || gemeldet.has('page_view')) return;

  const ref = leseBriefRef();
  if (!ref || !API_BASE) return;

  // Einmal je Strecke und Sitzung, nicht je Seitenaufruf: Wer von `/f/angebote` auf eine
  // andere Funnel-Seite klickt, hat die Strecke einmal geöffnet, nicht zweimal. Der
  // Schlüssel trägt die Strecke mit, damit eine zweite Strecke in derselben Sitzung ihre
  // eigene Öffnung behält. Eine Wiederkehr morgen ist eine neue Sitzung und zählt wieder —
  // und das ist eine echte Aussage.
  const sitzungsSchluessel = `page_view:${funnel}`;
  if (inDieserSitzungGemeldet(sitzungsSchluessel)) return;
  merkeFuerDieseSitzung(sitzungsSchluessel);
  gemeldet.add('page_view');

  sende(
    JSON.stringify({
      companyId: ref,
      event: 'page_view',
      funnel,
      payload: {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || null,
        utm: sammleAttribution(),
        device: geraeteKlasse(),
        viewport: { w: window.innerWidth, h: window.innerHeight },
        scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        lang: navigator.language,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    })
  );
}
