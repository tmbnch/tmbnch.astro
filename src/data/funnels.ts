/**
 * Funnel-Definitionen für Anzeigen-Landingpages (/f/[slug]).
 *
 * Jeder Eintrag ist eine eigenständige Landingpage für eine Anzeigen-Variante.
 * Für eine neue Variante: Eintrag kopieren, Slug + Hero/Details anpassen –
 * Fragen können zwischen Varianten geteilt werden (siehe analyseQuestions).
 */

export interface FunnelQuizOption {
  id: string;
  label: string;
  description?: string;
  /** Beschreibung auch unter 640 px zeigen; sonst steht dort nur das Label. */
  descriptionOnMobile?: boolean;
  /** Zeigt nach Auswahl ein Freitextfeld statt direkt weiterzuspringen */
  allowText?: boolean;
  textPlaceholder?: string;
}

export interface FunnelQuizQuestion {
  id: string;
  question: string;
  hint?: string;
  options: FunnelQuizOption[];
}

export interface FunnelDetailBlock {
  icon: string;
  title: string;
  text: string;
}

export interface FunnelStep {
  icon: string;
  title: string;
  text: string;
}

export interface FunnelDefinition {
  slug: string;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    subline: string;
  };
  /** Vertiefungs-Blöcke unterhalb des Quiz – pro Anzeigen-Variante anpassbar */
  details: {
    heading: string;
    intro?: string;
    blocks: FunnelDetailBlock[];
  };
  /** Ablauf-Schritte für Vertrauen ("was passiert nach dem Absenden?") */
  steps: FunnelStep[];
  /**
   * Optionales Trust-/Vorstell-Video (Screencast aus echten Projekten). Solange `src` fehlt,
   * zeigt die Seite einen sichtbaren Platzhalter, damit die Sektion schon steht.
   */
  trustVideo?: {
    heading: string;
    text?: string;
    /** MP4/WebM-URL des fertigen Screencasts. Fehlt sie, wird der Platzhalter angezeigt. */
    src?: string;
    /** Optionales Vorschaubild (Poster). */
    poster?: string;
  };
  questions: FunnelQuizQuestion[];
  contact: {
    heading: string;
    text: string;
  };
  success: {
    heading: string;
    text: string;
    calUrl?: string;
    calLabel?: string;
  };
}

/**
 * Geteilte Impact-Frage (Frage 2) aller Funnels – angle-neutral. Lässt den Interessenten sein
 * Schmerz-/Budgetniveau selbst einordnen, ohne direkt nach Budget zu fragen.
 */
export const impactQuestion: FunnelQuizQuestion = {
  id: 'impact',
  question: 'Was kostet es euch, wenn das die nächsten 6–12 Monate so bleibt?',
  hint: 'Grobe Schätzung reicht: Mehraufwand, entgangene Aufträge, gebremstes Wachstum.',
  options: [
    { id: 'lt10', label: 'Unter 10.000 €' },
    { id: '10-50', label: '10.000 – 50.000 €' },
    { id: '50-250', label: '50.000 – 250.000 €' },
    { id: 'gt250', label: 'Über 250.000 €' },
    {
      id: 'wachstum',
      label: 'Schwer zu beziffern',
      description: 'Es bremst vor allem unser Wachstum und die nächsten Schritte.',
    },
  ],
};

/**
 * Frage 1 je Angle. Statt nach dem "Problem" (konfrontativ) zu fragen, erfassen wir den IST-Zustand
 * der Softwarelandschaft bzw. den angle-spezifischen Einstieg – gibt fürs Erstgespräch das
 * wertvollste Bild, ohne viele Fragen zu stellen. Branche/Größe kommt ohnehin von der Website.
 */

// Angle 1 (Live-Zahlen / Software-Analyse): Wie ist die Softwarelandschaft aufgestellt?
const landscapeQuestion: FunnelQuizQuestion = {
  id: 'landscape',
  question: 'Wie ist eure Software heute aufgestellt?',
  hint: 'Grobe Einordnung reicht – es geht nur um ein erstes Bild.',
  options: [
    {
      id: 'standard',
      label: 'Standardsoftware von der Stange',
      description: 'Gekaufte Tools, die wir weitgehend so nutzen, wie sie sind.',
    },
    {
      id: 'gewachsen',
      label: 'Gewachsen & zusammengestückelt',
      description: 'Viele Einzeltools, Excel, historisch entstanden.',
    },
    {
      id: 'angepasst',
      label: 'Teils individuell angepasst',
      description: 'Standardsoftware, aber mit eigenen Anpassungen und Schnittstellen.',
    },
    {
      id: 'eigen',
      label: 'Eigenentwicklung / Altsystem',
      description: 'Etwas Eigenes, das langsam in die Jahre kommt.',
    },
    {
      id: 'unklar',
      label: 'Ehrlich gesagt unübersichtlich',
      description: 'Wir wissen selbst nicht genau, was alles im Einsatz ist.',
    },
    {
      id: 'sonstiges',
      label: 'Etwas anderes',
      allowText: true,
      textPlaceholder: 'Beschreibt eure Software-Situation in ein, zwei Sätzen …',
    },
  ],
};

// Angle 2 (Zeitfresser): Wo verliert das Team die meiste Zeit?
const timeQuestion: FunnelQuizQuestion = {
  id: 'timesink',
  question: 'Wo verliert euer Team am meisten Zeit?',
  hint: 'Wählt, was am ehesten zutrifft – es zählt der Bauch.',
  options: [
    {
      id: 'daten',
      label: 'Daten übertragen & pflegen',
      description: 'Dieselben Infos landen mehrfach in verschiedenen Tools.',
    },
    {
      id: 'reporting',
      label: 'Reportings & Auswertungen',
      description: 'Zahlen werden mühsam von Hand zusammengesucht.',
    },
    {
      id: 'kommunikation',
      label: 'E-Mails, Termine & Nachfassen',
      description: 'Viel Abstimmung, Follow-ups, Koordination von Hand.',
    },
    {
      id: 'dokumentation',
      label: 'Angebote & Dokumentation',
      description: 'Wiederkehrende Dokumente immer wieder neu erstellen.',
    },
    {
      id: 'ueberall',
      label: 'Ehrlich gesagt überall etwas',
      description: 'Es summiert sich an vielen kleinen Stellen.',
    },
    {
      id: 'sonstiges',
      label: 'Etwas anderes',
      allowText: true,
      textPlaceholder: 'Beschreibt euren größten Zeitfresser in ein, zwei Sätzen …',
    },
  ],
};

// Angle 3 (Lizenz / Eigene Software): Was stört an der aktuellen Software?
/** Fragen-Decks je Angle: angle-spezifische Frage 1 + geteilte Impact-Frage 2. */
// Angle 4 (Code-Check): Wer hat die bestehende Anwendung gebaut? Der Ausgangspunkt sagt mehr
// über die typischen Lücken als jede Technikfrage – und vermeidet, dass sich jemand rechtfertigen muss.
const builderQuestion: FunnelQuizQuestion = {
  id: 'builder',
  question: 'Wer hat die Anwendung gebaut, um die es geht?',
  hint: 'Grobe Einordnung reicht – es geht um den Ausgangspunkt, nicht um Schuld.',
  options: [
    {
      id: 'ki-selbst',
      label: 'Wir selbst, mit KI-Werkzeugen',
      description: 'Lovable, Cursor, Claude, ChatGPT: Es läuft, aber geprüft hat es noch niemand.',
    },
    {
      id: 'freelancer',
      label: 'Freelancer oder Agentur',
      description: 'Extern gebaut, die Übergabe war dünn oder der Kontakt ist inzwischen weg.',
    },
    {
      id: 'ehemalig',
      label: 'Ein ehemaliger Kollege',
      description: 'Im Haus entstanden, heute kennt sich niemand mehr darin aus.',
    },
    {
      id: 'gewachsen',
      label: 'Über Jahre gewachsen',
      description: 'Mehrere Hände, mehrere Phasen, kaum Dokumentation.',
    },
    {
      id: 'sonstiges',
      label: 'Anders',
      allowText: true,
      textPlaceholder: 'Beschreibt in ein, zwei Sätzen, worum es geht …',
    },
  ],
};

export const analyseQuestions: FunnelQuizQuestion[] = [landscapeQuestion, impactQuestion];
export const codeCheckQuestions: FunnelQuizQuestion[] = [builderQuestion, impactQuestion];
export const zeitfresserQuestions: FunnelQuizQuestion[] = [timeQuestion, impactQuestion];

export const funnels: FunnelDefinition[] = [
  {
    slug: 'software-analyse',
    meta: {
      title: 'Software-Analyse: Schwachpunkte in 2 Minuten einordnen',
      description:
        'Beantwortet zwei kurze Fragen und erhaltet eine ehrliche Ersteinschätzung, wo eure Softwarelandschaft Geld verliert.',
    },
    hero: {
      eyebrow: 'Software-Analyse',
      headline: 'Wo verliert eure Softwarelandschaft Geld?',
      headlineAccent: 'Findet es heraus – im persönlichen Gespräch.',
      subline:
        'Zwei kurze Fragen, eure Kontaktdaten – und ihr bekommt eine ehrliche Ersteinschätzung von einem Softwarearchitekten mit über 15 Jahren Praxis. Kein Verkaufsgespräch, keine Massenmail.',
    },
    details: {
      heading: 'Was eine Software-Analyse aufdeckt',
      intro:
        'Gewachsene Systemlandschaften verlieren selten an einer großen Stelle Geld – sondern an vielen kleinen, die niemand auf dem Zettel hat.',
      blocks: [
        {
          icon: 'share',
          title: 'Versteckte Doppelarbeit',
          text: 'Daten, die in mehreren Systemen parallel gepflegt werden, kosten jeden Tag Arbeitszeit – und erzeugen Fehler, die später teuer korrigiert werden.',
        },
        {
          icon: 'layers',
          title: 'Prozesse, die um Software herumgebaut wurden',
          text: 'Wenn Abläufe sich der Software anpassen statt umgekehrt, entstehen Workarounds, Excel-Schatten-IT und Wissen, das nur in Köpfen existiert.',
        },
        {
          icon: 'zap',
          title: 'Blockierte Wachstumsschritte',
          text: 'Neue Standorte, neue Produkte, mehr Volumen: Oft ist nicht der Markt der Engpass, sondern die Systemlandschaft, die nicht mitskaliert.',
        },
        {
          icon: 'shield',
          title: 'Riskante Abhängigkeiten',
          text: 'Ein einzelner Dienstleister, ein Altsystem ohne Dokumentation, ein Kollege kurz vor der Rente – Risiken, die erst auffallen, wenn es ernst wird.',
        },
      ],
    },
    steps: [
      {
        icon: 'check-circle',
        title: 'Formular ausfüllen',
        text: 'Ein paar kurze Fragen zu eurer Situation – direkt hier auf der Seite, in zwei Minuten.',
      },
      {
        icon: 'file-text',
        title: 'Terminvorschlag von mir',
        text: 'Ich melde mich werktags persönlich mit einem Vorschlag für einen 30-Minuten-Call.',
      },
      {
        icon: 'users',
        title: 'Einschätzung im Gespräch',
        text: 'Im Call schauen wir uns eure Situation gemeinsam an – und ihr bekommt eine ehrliche Einschätzung vom Entwickler, nicht vom Vertriebler.',
      },
    ],
    trustVideo: {
      heading: 'Ein Einblick in das, was wir bauen',
      text: 'Ein kurzer Ausschnitt aus echten Projekten – damit ihr seht, wie individuelle Software für Betriebe wie euren aussieht.',
    },
    questions: analyseQuestions,
    contact: {
      heading: 'Wohin dürfen wir die Ersteinschätzung schicken?',
      text: 'Ich melde mich werktags persönlich, um einen kurzen Call zu vereinbaren – kein Newsletter, keine Weitergabe eurer Daten.',
    },
    success: {
      heading: 'Danke – eure Angaben sind angekommen.',
      text: 'Ich schaue mir eure Antworten an und melde mich werktags, um einen 30-Minuten-Call zu vereinbaren. Wenn ihr wollt, bucht ihr direkt einen Termin:',
      calUrl: 'https://cal.com/rocketbase-marten/discovery-vorabgesprach',
      calLabel: 'Direkt 30-Minuten-Call buchen',
    },
  },
  {
    // Message-Match-Variante für die Reel-Ads (Dialog- & Zeitverzug-Hook).
    // Gleiche Fragen/Ablauf wie software-analyse, aber Hero + Details greifen den
    // Video-Hook auf: "Zahlen live statt Wochen alt / Frage → sofort Antwort".
    slug: 'live-zahlen',
    meta: {
      title: 'Live-Zahlen statt Wochen alt: Software-Analyse in 2 Minuten',
      description:
        'Eure aktuellsten Betriebszahlen sind Wochen alt? Beantwortet zwei kurze Fragen und erhaltet eine ehrliche Ersteinschätzung, wie ihr eure Zahlen live bekommt.',
    },
    hero: {
      eyebrow: 'Software-Analyse',
      headline: 'Wie läuft das Jahr – und wo landet ihr?',
      headlineAccent: 'Klärt es im persönlichen Gespräch.',
      subline:
        'Wenn ihr die aktuellen Zahlen erst zusammensuchen müsst und die Prognose Tage dauert, verliert ihr täglich Überblick. Beantwortet zwei kurze Fragen und bekommt eine ehrliche Ersteinschätzung von einem Softwarearchitekten mit über 15 Jahren Praxis. Kein Verkaufsgespräch, keine Massenmail.',
    },
    details: {
      heading: 'Was passiert, wenn Zahlen nicht live sind',
      intro:
        'Nicht die große Fehlentscheidung kostet – sondern die vielen kleinen, die man trifft, weil die Zahlen gerade nicht griffbereit sind.',
      blocks: [
        {
          icon: 'clock',
          title: 'Entscheidungen auf Basis alter Zahlen',
          text: 'Wenn die aktuellste Auswertung Wochen zurückliegt, steuert ihr den Betrieb im Rückspiegel statt in Echtzeit.',
        },
        {
          icon: 'share',
          title: 'Zahlen in fünf Systemen verstreut',
          text: 'Buchhaltung, Excel, ERP, CRM, Zeiterfassung – jede Frage nach dem Stand wird zur Suchaufgabe statt zu einer Antwort.',
        },
        {
          icon: 'layers',
          title: 'Manuelles Zusammensuchen bindet Köpfe',
          text: 'Statt Kennzahlen automatisch zu sehen, verbringt jemand Stunden mit Exporten, Copy-Paste und Abgleich.',
        },
        {
          icon: 'zap',
          title: 'Reaktion statt Vorsprung',
          text: 'Wer seine Marge, Auslastung und Liquidität live sieht, reagiert früher – wer wartet, reagiert zu spät.',
        },
      ],
    },
    steps: [
      {
        icon: 'check-circle',
        title: 'Formular ausfüllen',
        text: 'Ein paar kurze Fragen zu eurer Situation – direkt hier auf der Seite, in zwei Minuten.',
      },
      {
        icon: 'file-text',
        title: 'Terminvorschlag von mir',
        text: 'Ich melde mich werktags persönlich mit einem Vorschlag für einen 30-Minuten-Call.',
      },
      {
        icon: 'users',
        title: 'Einschätzung im Gespräch',
        text: 'Im Call schauen wir uns eure Situation gemeinsam an – und ihr bekommt eine ehrliche Einschätzung vom Entwickler, nicht vom Vertriebler.',
      },
    ],
    trustVideo: {
      heading: 'Ein Einblick in das, was wir bauen',
      text: 'Ein kurzer Ausschnitt aus echten Projekten – damit ihr seht, wie individuelle Software für Betriebe wie euren aussieht.',
    },
    questions: analyseQuestions,
    contact: {
      heading: 'Wohin dürfen wir die Ersteinschätzung schicken?',
      text: 'Ich melde mich werktags persönlich, um einen kurzen Call zu vereinbaren – kein Newsletter, keine Weitergabe eurer Daten.',
    },
    success: {
      heading: 'Danke – eure Angaben sind angekommen.',
      text: 'Ich schaue mir eure Antworten an und melde mich werktags, um einen 30-Minuten-Call zu vereinbaren. Wenn ihr wollt, bucht ihr direkt einen Termin:',
      calUrl: 'https://cal.com/rocketbase-marten/discovery-vorabgesprach',
      calLabel: 'Direkt 30-Minuten-Call buchen',
    },
  },
  {
    // ── ANGLE 2 — Zeitfresser / KI-Entlastung ──────────────────────────────────────────────────
    slug: 'zeitfresser',
    meta: {
      title: 'Zeitfresser finden: Wo euer Team unnötig Zeit verliert',
      description:
        'Beantwortet zwei kurze Fragen und erhaltet eine ehrliche Ersteinschätzung, wo euer Team Zeit an Routine verliert – und wo Automatisierung und gezielte KI wirklich helfen.',
    },
    hero: {
      eyebrow: 'Zeitfresser-Analyse',
      headline: 'Wofür bezahlt ihr euer Team eigentlich?',
      headlineAccent: 'Findet die Zeitfresser – gemeinsam im Gespräch.',
      subline:
        'Wenn ein wachsender Teil der Arbeitszeit in Routine, Datenpflege und Nachfassen fließt, bremst das euer Wachstum. Beantwortet zwei kurze Fragen und bekommt eine ehrliche Ersteinschätzung, wo Automatisierung und gezielte KI euch spürbar entlasten. Kein Verkaufsgespräch, keine Massenmail.',
    },
    details: {
      heading: 'Wo Fleißarbeit euer Wachstum bremst',
      intro:
        'Nicht die eine große Aufgabe kostet – sondern die vielen kleinen, wiederkehrenden, die niemand hinterfragt.',
      blocks: [
        {
          icon: 'clock',
          title: 'Routine, die sich Jahr für Jahr summiert',
          text: 'Termine planen, Daten übertragen, Reportings bauen. Aufgaben, die mitwachsen und trotzdem niemandem etwas bringen.',
        },
        {
          icon: 'share',
          title: 'Dieselben Daten, mehrfach gepflegt',
          text: 'Infos werden in mehrere Tools kopiert – jede Minute dafür fehlt an anderer Stelle.',
        },
        {
          icon: 'zap',
          title: 'Weniger Zeit fürs Wesentliche',
          text: 'Je mehr Fleißarbeit, desto weniger Kapazität für Kundenbetreuung und Vertrieb – genau das, was Umsatz bringt.',
        },
        {
          icon: 'layers',
          title: 'Automatisierung & KI – gezielt eingesetzt',
          text: 'Nicht als Selbstzweck, sondern dort, wo sie echte Stunden zurückgibt und die Arbeit besser macht.',
        },
      ],
    },
    steps: [
      {
        icon: 'check-circle',
        title: 'Formular ausfüllen',
        text: 'Ein paar kurze Fragen zu eurer Situation – direkt hier auf der Seite, in zwei Minuten.',
      },
      {
        icon: 'file-text',
        title: 'Terminvorschlag von mir',
        text: 'Ich melde mich werktags persönlich mit einem Vorschlag für einen 30-Minuten-Call.',
      },
      {
        icon: 'users',
        title: 'Einschätzung im Gespräch',
        text: 'Im Call schauen wir uns eure Situation gemeinsam an – und ihr bekommt eine ehrliche Einschätzung vom Entwickler, nicht vom Vertriebler.',
      },
    ],
    trustVideo: {
      heading: 'Ein Einblick in das, was wir bauen',
      text: 'Ein kurzer Ausschnitt aus echten Projekten – damit ihr seht, wie Automatisierung im Alltag aussieht.',
    },
    questions: zeitfresserQuestions,
    contact: {
      heading: 'Wohin dürfen wir die Ersteinschätzung schicken?',
      text: 'Ich melde mich werktags persönlich, um einen kurzen Call zu vereinbaren – kein Newsletter, keine Weitergabe eurer Daten.',
    },
    success: {
      heading: 'Danke – eure Angaben sind angekommen.',
      text: 'Ich schaue mir eure Antworten an und melde mich werktags, um einen 30-Minuten-Call zu vereinbaren. Wenn ihr wollt, bucht ihr direkt einen Termin:',
      calUrl: 'https://cal.com/rocketbase-marten/discovery-vorabgesprach',
      calLabel: 'Direkt 30-Minuten-Call buchen',
    },
  },
  {
    slug: 'code-check',
    meta: {
      title: 'Code-Check: Läuft bei euch eine Anwendung, der ihr nicht ganz traut?',
      description:
        'Zwei kurze Fragen und ihr bekommt eine ehrliche Ersteinschätzung, ob eure KI-gebaute oder übernommene Anwendung sicher zu betreiben ist.',
    },
    hero: {
      eyebrow: 'Code-Check',
      headline: 'Läuft bei euch eine Anwendung, der ihr nicht ganz traut?',
      headlineAccent: 'Wir sagen euch, ob ihr sie betreiben könnt.',
      subline:
        'Zwei kurze Fragen, eure Kontaktdaten – und ihr bekommt eine ehrliche Ersteinschätzung von einem Softwarearchitekten, der seit 15 Jahren Systeme abnimmt und selbst täglich KI-generierten Code prüft. Kein Verkaufsgespräch, keine Massenmail.',
    },
    details: {
      heading: 'Was ein Code-Check prüft',
      intro:
        'KI-Werkzeuge liefern Code, der funktioniert, solange sich alle benehmen. Die Lücken sitzen an Stellen, die im Tagesgeschäft nie auffallen.',
      blocks: [
        {
          icon: 'shield',
          title: 'Wer darf was sehen',
          text: 'Kann Nutzer A den Datensatz von Nutzer B öffnen, wenn er die Nummer in der Adresszeile ändert? Diese eine Frage entscheidet bei den meisten KI-gebauten Anwendungen über alles.',
        },
        {
          icon: 'code',
          title: 'Schlüssel und Zugänge',
          text: 'API-Keys im Frontend, Datenbank-Regeln auf „offen“, Passwörter im Repository. Wir gehen die Stellen durch, an denen Werkzeuge gern abkürzen.',
        },
        {
          icon: 'layers',
          title: 'Betrieb und Weiterbau',
          text: 'Backups, Updates, Monitoring, wem der Hosting-Account gehört. Was passiert, wenn morgen jemand weiterbauen muss oder etwas ausfällt?',
        },
        {
          icon: 'file-text',
          title: 'Ein Dokument mit Empfehlung',
          text: 'Geprüft entlang OWASP ASVS, priorisiert nach Risiko, am Ende eine von drei Antworten: betreiben, härten oder neu aufsetzen. Das Dokument gehört euch. Ein Penetrationstest ist der Check nicht; wenn ihr einen braucht, steht das drin.',
        },
      ],
    },
    steps: [
      {
        icon: 'check-circle',
        title: 'Formular ausfüllen',
        text: 'Zwei kurze Fragen zur Anwendung – direkt hier auf der Seite, in zwei Minuten.',
      },
      {
        icon: 'file-text',
        title: 'Terminvorschlag von mir',
        text: 'Ich melde mich werktags persönlich mit einem Vorschlag für einen 30-Minuten-Call.',
      },
      {
        icon: 'users',
        title: 'Einschätzung im Gespräch',
        text: 'Im Call klären wir, um welche Anwendung es geht und ob ein Code-Check der richtige Schritt ist – Einschätzung vom Architekten, nicht vom Vertriebler.',
      },
    ],
    trustVideo: {
      heading: 'Wie wir Code lesen',
      text: 'Ein kurzer Ausschnitt, wie so eine Durchsicht abläuft und wie das Ergebnisdokument am Ende aussieht.',
    },
    questions: codeCheckQuestions,
    contact: {
      heading: 'Wohin dürfen wir die Ersteinschätzung schicken?',
      text: 'Ich melde mich werktags persönlich, um einen kurzen Call zu vereinbaren – kein Newsletter, keine Weitergabe eurer Daten.',
    },
    success: {
      heading: 'Danke – eure Angaben sind angekommen.',
      text: 'Ich schaue mir eure Antworten an und melde mich werktags, um einen 30-Minuten-Call zu vereinbaren. Wenn ihr wollt, bucht ihr direkt einen Termin:',
      calUrl: 'https://cal.com/rocketbase-marten/discovery-vorabgesprach',
      calLabel: 'Direkt 30-Minuten-Call buchen',
    },
  },
];

export function getFunnelBySlug(slug: string): FunnelDefinition | undefined {
  return funnels.find((funnel) => funnel.slug === slug);
}
