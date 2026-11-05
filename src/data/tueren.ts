/**
 * Die drei Türen, die Ablösung und der Workshop als Ziele für Querverweise.
 * Blogartikel nennen sie im Frontmatter (`doors`), Referenzen über `referenzTueren`.
 * Daraus entstehen: Artikel unter der Tür (BlogQuerverweis), „Passende Lösung“ am
 * Ende eines Artikels und auf Referenzseiten. Nicht auf Funnel-Seiten (/f/).
 */
export const tuerIds = ['angebot', 'einsatz', 'zahlen', 'abloesung', 'check', 'workshop'] as const;
export type TuerId = (typeof tuerIds)[number];

export const tueren: Record<TuerId, { titel: string; href: string; icon: string; text: string }> = {
  angebot: {
    titel: 'Angebot & Kalkulation',
    href: '/angebote/',
    icon: 'edit',
    text: 'Angebote, die nach eurer Regel rechnen. Als Seite statt PDF, Zusage per Klick.',
  },
  einsatz: {
    titel: 'Einsatz & Abrechnung',
    href: '/einsatzplanung/',
    icon: 'users',
    text: 'Plantafel, Ablauf je Auftrag, Leistung, Rechnung und Mahnwesen in einem System.',
  },
  zahlen: {
    titel: 'Zahlen & Steuerung',
    href: '/zahlen/',
    icon: 'table',
    text: 'Umsatz, Auslastung bis zur Person und auslaufende Verträge, live statt am Monatsende.',
  },
  abloesung: {
    titel: 'Standardsoftware ablösen',
    href: '/standardsoftware-abloesung/',
    icon: 'layers',
    text: 'Branchensoftware samt Excel drumherum Schritt für Schritt ablösen, mit allen Daten.',
  },
  check: {
    titel: 'Software-Check',
    href: '/software-check/',
    icon: 'shield',
    text: 'Bestehende Software nach OWASP ASVS prüfen, Architektur-Review, Fahrplan für den Cyber Resilience Act.',
  },
  workshop: {
    titel: 'Der Workshop',
    href: '/discovery-workshop/',
    icon: 'check-circle',
    text: 'Drei Termine, in denen wir euren Ablauf aufnehmen. Danach steht der Festpreis.',
  },
};

/** Welche Lösungen aus welcher Referenz entstanden sind (Slug aus data/rocketbase.ts). */
export const referenzTueren: Record<string, TuerId[]> = {
  'fkc-consulting': ['abloesung', 'angebot', 'zahlen'],
  'stage-cml': ['zahlen'],
  'schlosserei-diezinger': ['einsatz'],
  'mavox-winterdienst': ['einsatz'],
};

/** „Das passt zu euch, wenn …“ auf Referenzseiten: damit sich Interessenten im Projekt wiederfinden. */
export const referenzPasstWenn: Record<string, string[]> = {
  'fkc-consulting': ['Eure Standardsoftware passt nicht zu eurem Angebotsprozess', 'Angebot, Projekt und Rechnung sollen an einem Ort liegen'],
  'schlosserei-diezinger': ['Ihr plant Einsätze und Aufträge heute von Hand', 'Verschiedene Rollen brauchen eine eigene Ansicht'],
  'stage-cml': ['Eure Planung läuft in gewachsenen Excel-Modellen', 'Eure Planzahlen müssen zur Buchhaltung passen'],
  statista: ['Ein altes System soll im laufenden Betrieb ersetzt werden', 'Euer Team soll dabei weiterarbeiten können'],
  'statista-canva': ['Eure Daten sollen direkt in den Programmen eurer Kunden nutzbar sein'],
  bonprix: ['Eine große Software soll in kleinere Teile zerlegt werden', 'Teams an mehreren Standorten bauen gemeinsam daran'],
  'bonprix-collection-planning': ['Mehrere Leute planen in denselben Excel-Dateien', 'Die Flexibilität von Excel soll erhalten bleiben'],
  'mavox-winterdienst': ['Eure Leute arbeiten draußen, oft ohne Netz', 'Touren und Einsätze sollen in einem System liegen'],
  'sam-vorteilsguru': ['Euer Produkt soll sich in fremde Shops einbetten lassen'],
};
