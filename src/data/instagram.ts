/**
 * Posts für die Bio-Seite (/instagram/).
 *
 * Instagram erlaubt genau einen Link im Profil. Statt ihn bei jedem Post zu
 * tauschen, zeigt er dauerhaft auf /instagram/ — und diese Liste bestimmt, was
 * dort steht. Ein neuer Post ist ein neuer Eintrag hier, sonst nichts.
 *
 * Die **vier neuesten** Einträge erscheinen als große Kachel (quadratisches
 * Bild, Text daneben, auf dem Desktop zwei nebeneinander), alle älteren als
 * schlichte Linkzeile darunter. Die Seite wird fast nur für den jeweils
 * aktuellen Post benutzt; die Liste hält die älteren erreichbar, ohne die
 * Seite lang zu machen.
 *
 * Kein Instagram-Datum: Das Veröffentlichungsdatum ist über die öffentliche
 * Post-URL nicht abrufbar (die Seite rendert clientseitig, der Embed liefert
 * keins). `datum` wird deshalb von Hand gepflegt und dient nur der Sortierung.
 */

interface InstagramPostBasis {
  /**
   * Shortcode aus der Post-URL: instagram.com/p/<code>/
   *
   * Zugleich der Schlüssel für das Kachelbild in
   * `src/features/instagram/coverImages.ts`. Steht dort keins, zeigt die
   * Kachel das Hero-Bild des Blogbeitrags — und bei freien Zielen (siehe
   * unten) gar keins.
   */
  code: string;
  /**
   * Aufhänger der Kachel — die Frage aus der Caption, nicht der Artikeltitel.
   * Wer aus dem Post kommt, sucht die Zeile wieder, die ihn hergebracht hat.
   */
  hook: string;
  /** Erscheinungsdatum (ISO), nur für die Sortierung — neueste zuerst. */
  datum: string;
  /**
   * Feste Rubrik über der chronologischen Liste, nur für freie Ziele (eine
   * Funnel-Seite), die kein eigener Post sind. Echte Posts tragen keine
   * Kategorie: Sie gehören in die Chronologie, auch wenn ihr Thema zur Rubrik
   * passt. Welche Blogbeiträge die Rubrik nennt, steht an der Kategorie
   * (`instagramKategorien[…].beitraege`).
   */
  kategorie?: InstagramKategorie;
}

export type InstagramKategorie = 'angebote';

export const instagramKategorien: Record<
  InstagramKategorie,
  {
    titel: string;
    text: string;
    /** Ordnernamen unter src/content/blog/de/, als Linkzeilen unter der Rubrik-Kachel. */
    beitraege: string[];
  }
> = {
  angebote: {
    titel: 'Angebotsbaustein',
    text: 'Was sieht euer Kunde, wenn euer Angebot ankommt? Die Seite dazu und die Beiträge dahinter.',
    beitraege: ['angebotskalkulation-regel-deckungsbeitrag', 'angebotsprozess-anfrage-bis-zusage'],
  },
};

/**
 * Der Regelfall: Der Post verweist auf einen Blogbeitrag. Titel, Beschreibung
 * und Hero-Bild holt die Seite zur Buildzeit aus der Collection — so driftet
 * nichts, wenn jemand später eine Überschrift schärft.
 */
interface InstagramPostMitBeitrag extends InstagramPostBasis {
  /** Ordnername des Blogposts unter src/content/blog/de/ */
  postSlug: string;
  url?: never;
  titel?: never;
  text?: never;
}

/**
 * Freies Ziel: Leistungsseite, Workshop, externe Seite. Hier gibt es keine
 * Collection, aus der sich Text nachladen ließe — `titel` ist deshalb Pflicht
 * und wird von Hand gepflegt.
 */
interface InstagramPostMitUrl extends InstagramPostBasis {
  postSlug?: never;
  /** Ziel-URL. Intern bitte mit Schrägstrich am Ende (trailingSlash: 'always'). */
  url: string;
  /** Linktext bzw. Kachel-Überschrift. */
  titel: string;
  /** Optionaler Beschreibungstext für die große Kachel. */
  text?: string;
}

export type InstagramPost = InstagramPostMitBeitrag | InstagramPostMitUrl;

export const instagramPosts: InstagramPost[] = [
  {
    // Vorläufiger Schlüssel bis zum Veröffentlichen (geplant 08.10.). Danach hier
    // und in coverImages.ts gegen den echten Shortcode tauschen. Kein Blogbeitrag
    // zum Thema, deshalb geht die Kachel auf die Kontaktseite.
    code: 'e-rechnung-2027-5-fragen-an-euch',
    url: '/kontakt/',
    titel: 'E-Rechnung ab 1.1.2027: Seid ihr dran?',
    text: 'Ab 1. Januar 2027 müssen Unternehmen mit mehr als 800.000 € Vorjahresumsatz E-Rechnungen ausstellen. Wisst ihr schon, wie das bei euch läuft? Schreibt uns.',
    hook: 'E-Rechnung ab 1.1.2027: Seid ihr dran?',
    datum: '2026-10-08',
  },
  {
    // Vorläufiger Schlüssel bis zum Veröffentlichen (geplant 07.10.), siehe oben.
    code: 'ein-tag-mit-dem-server-im-bueroschrank',
    postSlug: 'legacy-hosting-hetzner-dsgvo',
    hook: 'Schrank oder Rechenzentrum: Was ist günstiger?',
    datum: '2026-10-07',
  },
  {
    // Vorläufiger Schlüssel, bis der echte Shortcode des Posts eingetragen ist.
    code: 'rate-mal-17-gegen-494',
    postSlug: 'tool-sprawl-hubspot-pipedrive-lexoffice',
    hook: 'Welche Kunden tragen bei dir das erste Drittel des Umsatzes?',
    datum: '2026-10-06',
  },
  {
    // Vorläufiger Schlüssel bis zum Veröffentlichen (Hot Take „Gute Tools machen
    // blind“). Danach gegen den echten Shortcode tauschen.
    code: 'hot-take-gute-tools-machen-blind',
    postSlug: 'tool-sprawl-hubspot-pipedrive-lexoffice',
    hook: 'Wie viele Tools habt ihr offen, bis ihr eine Frage zu einem einzigen Kunden beantworten könnt?',
    datum: '2026-10-05',
  },
  {
    // Vorläufiger Schlüssel: Den Shortcode gibt es erst nach dem Veröffentlichen,
    // der Eintrag muss aber vorher live sein. Danach hier und in coverImages.ts
    // gegen den echten Code tauschen.
    code: 'quartalsbericht-3-leute-2-wochen',
    postSlug: 'standardsoftware-vertec-centric-grenzen',
    hook: 'Wie lange dauert euer Quartalsbericht?',
    datum: '2026-10-02',
  },
  {
    code: 'DdJekmNFtUk',
    postSlug: 'angebotsprozess-anfrage-bis-zusage',
    hook: 'Wurde dein letztes Angebot überhaupt geöffnet?',
    datum: '2026-09-10',
  },
];
