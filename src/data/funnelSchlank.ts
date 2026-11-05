/**
 * Texte und Quizfragen der schlanken Anzeigen-Landings, je Tor ein Eintrag.
 * Darstellung: `src/components/funnel-schlank/SchlankPage.astro`.
 *
 * Regeln fürs Quiz: höchstens vier kurze Antworten, keine Beschreibungen, kein Freitext. Jede
 * Frage liefert eine Zahl für die Rechnung (`lib/quizRechnung.ts`) oder sortiert vor.
 * Die Wochenangaben im Ablauf folgen `VonHeuteBisDahin.astro`.
 */
import type { FunnelQuizQuestion } from '@/data/funnels';
import type { RechnungsStrecke } from '@/lib/quizRechnung';

interface Schritt {
  wann: string;
  titel: string;
  text: string;
}

export interface SchlankTor {
  funnel?: string;
  leadEvent: string;
  rechnung?: RechnungsStrecke;
  einordnung?: 'software-check';
  fuerWen: string;
  headline: string;
  lead: string;
  /** Mobil kürzer, damit das Bild in die erste Bildschirmhöhe rückt. */
  leadMobil: string;
  /** Vier Fakten zu Zeit, Aufwand und Risiko. */
  fakten: string[];
  logos: { key: string; name: string }[];
  wasEsIst: { titel: string; text: string; schritte: { titel: string; text: string }[] };
  beweis: { hinweis: string };
  /** Die Zahl, die den Schmerz zeigt. Fehlt, wenn es keine belegte gibt. */
  schmerz?: { text: string; zahl: string; einheit: string };
  vergleichTitel: string;
  vergleich: [string, string][];
  ablaufTitel: string;
  ablauf: Schritt[];
  /** Dauer des Rückrufs, wenn kürzer als das übliche 30-Minuten-Gespräch, z. B. „15 Minuten“. */
  telefonat?: string;
  fragenUndAntworten: { q: string; a: string }[];
  schlussTitel: string;
  schlussText: string;
  fragen: FunnelQuizQuestion[];
}

const groesse: FunnelQuizQuestion = {
  id: 'groesse',
  question: 'Wie viele Leute arbeiten bei euch?',
  options: [
    { id: 'lt30', label: 'Unter 30' },
    { id: '30-80', label: '30 bis 80' },
    { id: '80-150', label: '80 bis 150' },
    { id: 'gt150', label: 'Über 150' },
  ],
};

export const preisFrage = {
  q: 'Was kostet das?',
  a: 'Das lässt sich pauschal nicht seriös sagen, weil wir für jeden Betrieb einzeln bauen. Im Erstgespräch schauen wir uns an, was ihr braucht, und ihr bekommt eine ehrliche Einschätzung. Das Gespräch ist kostenlos und verpflichtet euch zu nichts. Gebaut wird erst, wenn ihr den festen Preis kennt und zugesagt habt.',
};
const zeitFrage = {
  q: 'Wie viel Zeit kostet uns das?',
  a: 'Etwa zwei bis drei Stunden pro Woche: ein Termin mit uns, dazu Ausprobieren.',
};

export const angebote: SchlankTor = {
  leadEvent: 'angebote_lead',
  rechnung: 'angebote',
  fuerWen: 'Für Betriebe aus Prüfung, Wartung, Zertifizierung und Handwerk',
  headline: 'Beim Angebotschreiben schon sehen, wie viel Gewinn übrig bleibt',
  lead: 'Wir bauen euch eine Software, die eure Preise so ausrechnet, wie ihr es heute in Excel macht. Euer Kunde sagt online mit einem Klick zu. Meldet er sich nicht, erinnert ihn die Software.',
  leadMobil: 'Software, die eure Preise so rechnet wie eure Excel. Euer Kunde sagt per Klick zu.',
  fakten: ['Läuft nach 3 bis 6 Wochen', 'Fester Preis, bevor wir anfangen', '2 bis 3 Stunden pro Woche für euch', 'Eure Daten bleiben in Deutschland'],
  logos: [
    { key: 'fkc_logo', name: 'FKC Consulting' },
    { key: 'statista-logo', name: 'Statista' },
    { key: 'stage_logo', name: 'Stage Entertainment' },
    { key: 'diezinger_logo', name: 'Schlosserei Diezinger' },
    { key: 'mavox_logo', name: 'MAVOX Winterdienst' },
  ],
  wasEsIst: {
    titel: 'Eine Software, die wir nur für euren Betrieb bauen',
    text: 'Wir entwickeln sie für jeden Betrieb einzeln, damit sie so rechnet wie ihr. Egal ob ihr nach Fläche, Stückzahl, Stunden oder Vorschrift rechnet.',
    schritte: [
      { titel: 'Ausrechnen', text: 'Die Software rechnet eure Preise aus und zeigt sofort, wie viel Gewinn übrig bleibt.' },
      { titel: 'Angebot verschicken', text: 'Der Kunde sieht das Angebot online und sagt mit einem Klick zu.' },
      { titel: 'Nachhaken', text: 'Meldet sich der Kunde nicht, erinnert ihn die Software automatisch.' },
    ],
  },
  schmerz: {
    text: 'Ein Angebot dauert rund 2 Stunden, von der Anfrage bis zur Zusage. Bei 25 Angeboten im Monat sind das gut 6 ganze Arbeitstage.',
    zahl: '50 h',
    einheit: 'im Monat bei 25 Angeboten',
  },
  beweis: { hinweis: 'Beispielzahlen. Bei euch rechnet die Software mit euren Preisen.' },
  vergleichTitel: 'Was sich bei euren Angeboten ändert',
  vergleich: [
    ['Preis in Excel ausrechnen und ins Angebot abtippen', 'Der Preis landet von selbst im Angebot'],
    ['Erst hinterher merken, dass sich ein Auftrag nicht gelohnt hat', 'Ihr seht vorher, wie viel Gewinn übrig bleibt'],
    ['PDF per Mail schicken und hoffen, dass es gelesen wird', 'Der Kunde sieht das Angebot online und sagt mit einem Klick zu'],
    ['Nachhaken, wenn jemand daran denkt', 'Die Software erinnert den Kunden automatisch'],
  ],
  ablaufTitel: 'In wenigen Wochen läuft eure Kalkulation',
  ablauf: [
    { wann: 'Tag 1', titel: 'Erstgespräch', text: '30 Minuten am Bildschirm, kostenlos. Ihr zeigt uns euer schwierigstes Angebot und wisst danach, ob es passt.' },
    { wann: 'Woche 1 bis 2', titel: 'Genau hinschauen', text: 'Passt es, schreiben wir in einem bezahlten Schritt auf, wie ihr rechnet. Was er kostet, sagt euch Marten vorher. Danach bekommt ihr einen festen Preis.' },
    { wann: 'Danach, 2 bis 4 Wochen', titel: 'Software bauen', text: 'Mit eurem Briefkopf. Euer altes System läuft weiter, bis das neue funktioniert.' },
  ],
  fragenUndAntworten: [
    preisFrage,
    { q: 'Wir haben schon eine Branchensoftware. Lohnt sich das trotzdem?', a: 'Oft nicht, und das sagen wir euch auch. Es lohnt sich, wenn ihr viele Sonderfälle habt, die eure Software nicht rechnen kann.' },
    { q: 'Bleibt das PDF?', a: 'Ja, auf Knopfdruck und mit eurem Briefkopf, zum Abheften.' },
    zeitFrage,
  ],
  schlussTitel: 'Erstgespräch vereinbaren',
  schlussText: 'Ihr zeigt uns ein echtes Angebot und wisst danach, ob es passt und ungefähr was es kostet.',
  fragen: [
    {
      id: 'menge',
      question: 'Wie viele Angebote schreibt ihr im Monat?',
      options: [
        { id: 'lt10', label: 'Unter 10' },
        { id: '10-30', label: '10 bis 30' },
        { id: '30-100', label: '30 bis 100' },
        { id: 'gt100', label: 'Über 100' },
      ],
    },
    {
      id: 'dauer',
      question: 'Wie lange dauert eins, von der Anfrage bis es raus ist?',
      options: [
        { id: 'lt1', label: 'Unter einer Stunde' },
        { id: '1-2', label: 'Ein bis zwei Stunden' },
        { id: 'halbtag', label: 'Ein halber Tag' },
        { id: 'tag', label: 'Ein Tag oder mehr' },
      ],
    },
    groesse,
  ],
};

export const einsatz: SchlankTor = {
  leadEvent: 'einsatz_lead',
  rechnung: 'einsatz',
  fuerWen: 'Für Betriebe, deren Leute beim Kunden oder unterwegs arbeiten',
  headline: 'Bei jedem Ausfall sofort sehen, wer einspringen kann',
  lead: 'Wir bauen euch eine Software für Planung, Stundenzettel und Rechnung, nach eurem Ablauf. Was erledigt ist, wird zur Rechnung, und Stundenzettel tippt niemand mehr ab.',
  leadMobil: 'Software für Planung, Stundenzettel und Rechnung, nach eurem Ablauf gebaut.',
  fakten: ['Läuft nach 4 bis 8 Wochen', 'Fester Preis, bevor wir anfangen', '2 bis 3 Stunden pro Woche für euch', 'Eure Daten bleiben in Deutschland'],
  logos: [
    { key: 'fkc_logo', name: 'FKC Consulting' },
    { key: 'diezinger_logo', name: 'Schlosserei Diezinger' },
    { key: 'mavox_logo', name: 'MAVOX Winterdienst' },
    { key: 'stage_logo', name: 'Stage Entertainment' },
  ],
  wasEsIst: {
    titel: 'Eine Software für Planung, Stunden und Rechnung',
    text: 'Wir bauen sie nach eurem Ablauf. Alle sehen denselben Plan, und was erledigt ist, wird zur Rechnung.',
    schritte: [
      { titel: 'Planen', text: 'Auf der Plantafel seht ihr, wer wann wo ist. Fällt jemand aus, zeigt sie, wer Zeit hat.' },
      { titel: 'Erfassen', text: 'Eure Leute tragen Stunden und Material am Handy ein.' },
      { titel: 'Abrechnen', text: 'Aus dem, was erledigt ist, wird die Rechnung.' },
    ],
  },
  schmerz: {
    text: 'Rund 20 Minuten gehen je Auftrag für Umplanen, Stundenzettel und Rechnung drauf. Bei 60 Aufträgen im Monat sind das gut 2 ganze Arbeitstage.',
    zahl: '20 h',
    einheit: 'im Monat bei 60 Aufträgen',
  },
  beweis: { hinweis: 'Nachbau aus einer laufenden Kundenlösung, mit Beispieldaten.' },
  vergleichTitel: 'Was sich bei eurer Planung ändert',
  vergleich: [
    ['Eine Person hält den Plan in Excel oder an der Tafel zusammen', 'Alle sehen denselben Plan'],
    ['Fällt jemand aus, wird rumtelefoniert', 'Ihr seht sofort, wer einspringen kann'],
    ['Stundenzettel kommen spät und unvollständig zurück', 'Eure Leute erfassen alles am Handy'],
    ['Rechnungen entstehen aus Zetteln und Mails', 'Was erledigt ist, wird zur Rechnung'],
  ],
  ablaufTitel: 'In wenigen Wochen läuft eure Planung',
  ablauf: [
    { wann: 'Tag 1', titel: 'Erstgespräch', text: '30 Minuten, kostenlos. Ihr erzählt, wie ihr heute plant, und wisst danach, ob es passt.' },
    { wann: 'Woche 1 bis 2', titel: 'Genau hinschauen', text: 'Passt es, schreiben wir in einem bezahlten Schritt euren Ablauf auf, so wie er wirklich läuft. Was er kostet, sagt euch Marten vorher. Danach bekommt ihr einen festen Preis.' },
    { wann: 'Danach, 3 bis 6 Wochen', titel: 'Software bauen', text: 'Erfassung und Rechnung folgen Stufe für Stufe. Eure Wochenplanung bleibt, bis das Neue trägt.' },
  ],
  fragenUndAntworten: [
    preisFrage,
    { q: 'Wir haben schon ein ERP.', a: 'Das bleibt meist für Belege und Finanzen. Das Neue holt sich die Daten von dort.' },
    { q: 'Machen unsere Leute das mit?', a: 'Am Handy reichen ein Foto und ein Tipp, auch unterwegs beim Kunden.' },
    zeitFrage,
  ],
  schlussTitel: 'Erstgespräch vereinbaren',
  schlussText: 'Ihr zeigt uns eure Planung und wisst danach, ob es passt und ungefähr was es kostet.',
  fragen: [
    {
      id: 'auftraege',
      question: 'Wie viele Aufträge rechnet ihr im Monat ab?',
      options: [
        { id: 'lt30', label: 'Unter 30' },
        { id: '30-100', label: '30 bis 100' },
        { id: '100-300', label: '100 bis 300' },
        { id: 'gt300', label: 'Über 300' },
      ],
    },
    {
      id: 'hakt',
      question: 'Was kostet euch am meisten Zeit?',
      options: [
        { id: 'planung', label: 'Planen und Umplanen' },
        { id: 'erfassung', label: 'Stundenzettel' },
        { id: 'abrechnung', label: 'Rechnungen schreiben' },
      ],
    },
    groesse,
  ],
};

export const zahlen: SchlankTor = {
  leadEvent: 'zahlen_lead',
  rechnung: 'zahlen',
  fuerWen: 'Für Inhaber und Geschäftsführer',
  headline: 'Jeden Tag sehen, wie der Betrieb läuft und wo er in drei Monaten steht',
  lead: 'Wir bauen euch eine Übersicht aus den Zahlen, die ihr schon habt: Umsatz, Auslastung und Verträge. BWA und Steuerberater bleiben. Ihr seht nur früher, was los ist.',
  leadMobil: 'Umsatz, Auslastung und Verträge auf einen Blick. Die BWA bleibt, ihr seht nur früher.',
  fakten: ['Steht nach 5 bis 8 Wochen', 'Fester Preis, bevor wir anfangen', '2 bis 3 Stunden pro Woche für euch', 'Eure Daten bleiben in Deutschland'],
  logos: [
    { key: 'fkc_logo', name: 'FKC Consulting' },
    { key: 'statista-logo', name: 'Statista' },
    { key: 'stage_logo', name: 'Stage Entertainment' },
    { key: 'diezinger_logo', name: 'Schlosserei Diezinger' },
  ],
  wasEsIst: {
    titel: 'Eine Übersicht aus den Zahlen, die ihr schon habt',
    text: 'Wir holen sie aus euren Programmen und zeigen sie auf einer Seite. Niemand muss dafür eine Excel bauen.',
    schritte: [
      { titel: 'Umsatz', text: 'Ihr seht, wo ihr steht und wo ihr in drei Monaten landet.' },
      { titel: 'Auslastung', text: 'Ihr seht, wer voll ist und wer Luft hat.' },
      { titel: 'Verträge', text: 'Ihr seht, was ausläuft und was nächstes Jahr fehlt.' },
    ],
  },
  schmerz: {
    text: 'Wer Zahlen zusammensucht, braucht dafür rund anderthalb Arbeitstage im Monat. Bei 3 Leuten sind das fast 4 ganze Arbeitstage.',
    zahl: '30 h',
    einheit: 'im Monat bei 3 Leuten',
  },
  beweis: { hinweis: 'Nachbau aus einer laufenden Kundenlösung, mit Beispieldaten.' },
  vergleichTitel: 'Was sich bei euren Zahlen ändert',
  vergleich: [
    ['Exporte ziehen und in Excel zusammenbauen', 'Die Zahlen stehen jeden Tag von selbst da'],
    ['Die BWA kommt drei Wochen später', 'Die BWA bleibt, ihr seht den Stand schon vorher'],
    ['Die Auslastung schätzt jemand nebenbei', 'Ihr seht, wer voll ist und wer Luft hat'],
    ['Auslaufende Verträge fallen spät auf', 'Ihr seht heute, was nächstes Jahr fehlt'],
  ],
  ablaufTitel: 'In wenigen Wochen steht eure Übersicht',
  ablauf: [
    { wann: 'Tag 1', titel: 'Erstgespräch', text: '30 Minuten, kostenlos. Wir reden über eure Zahlen, und ihr wisst danach, ob es passt.' },
    { wann: 'Woche 1 bis 2', titel: 'Genau hinschauen', text: 'Passt es, sehen wir uns in einem bezahlten Schritt an, wo eure Daten liegen und was zuerst fehlt. Was er kostet, sagt euch Marten vorher. Danach bekommt ihr einen festen Preis.' },
    { wann: 'Danach, 4 bis 6 Wochen', titel: 'Übersicht bauen', text: 'Umsatz, Auslastung und Verträge aus euren Systemen. Weitere Zahlen kommen dazu, sobald die ersten tragen.' },
  ],
  fragenUndAntworten: [
    preisFrage,
    { q: 'Unsere Daten sind nicht sauber genug.', a: 'Das ist der Normalfall. Oft reicht es, zwei, drei Felder verbindlich zu machen.' },
    { q: 'Wir haben schon ein ERP.', a: 'Das bleibt. Die Übersicht holt sich die Zahlen von dort, aus der Zeiterfassung und der Buchhaltung.' },
    zeitFrage,
  ],
  schlussTitel: 'Erstgespräch vereinbaren',
  schlussText: 'Wir schauen uns an, wo ihr in drei Monaten landet, und ihr wisst danach, ob es passt.',
  fragen: [
    {
      id: 'alter',
      question: 'Wie aktuell sind eure Zahlen, wenn ihr sie seht?',
      options: [
        { id: 'heute', label: 'Von heute' },
        { id: 'tage', label: 'Ein paar Tage alt' },
        { id: 'wochen', label: 'Ein paar Wochen alt' },
        { id: 'monat', label: 'Älter als ein Monat' },
      ],
    },
    {
      id: 'leute',
      question: 'Wie viele Leute bauen bei euch Auswertungen?',
      options: [
        { id: '1', label: 'Eine Person' },
        { id: '2-3', label: '2 bis 3' },
        { id: '4-8', label: '4 bis 8' },
        { id: 'gt8', label: 'Mehr als 8' },
      ],
    },
    groesse,
  ],
};

export const eigeneSoftware: SchlankTor = {
  leadEvent: 'abloesung_lead',
  rechnung: 'eigene-software',
  fuerWen: 'Für Betriebe ab etwa 30 Leuten',
  headline: 'Braucht ihr eine Software, die es so noch nicht gibt?',
  lead: 'Wir bauen sie. Vieles davon läuft schon bei anderen Betrieben, wir programmieren nur, was bei euch anders ist. Euer altes Programm läuft weiter, bis das Neue trägt.',
  leadMobil: 'Wir bauen sie. Vieles läuft schon bei anderen Betrieben, nur euer Teil ist neu.',
  fakten: ['Erster Abschnitt nach 5 bis 8 Wochen', 'Fester Preis, bevor wir anfangen', '2 bis 3 Stunden pro Woche für euch', 'Eure Daten bleiben in Deutschland'],
  logos: [
    { key: 'fkc_logo', name: 'FKC Consulting' },
    { key: 'diezinger_logo', name: 'Schlosserei Diezinger' },
    { key: 'statista-logo', name: 'Statista' },
    { key: 'stage_logo', name: 'Stage Entertainment' },
  ],
  wasEsIst: {
    titel: 'Eine Software, die wir nur für euren Betrieb bauen',
    text: 'Vieles davon läuft schon bei anderen Betrieben: Angebote, Planung, Rechnungen und Auswertungen. Wir programmieren, was bei euch anders ist.',
    schritte: [
      { titel: 'Anfangen', text: 'Wir nehmen den Abschnitt, der am meisten Zeit kostet.' },
      { titel: 'Umziehen', text: 'Eure Daten ziehen mit, das alte Programm läuft daneben weiter.' },
      { titel: 'Abschalten', text: 'Das alte Programm geht erst aus, wenn alles läuft.' },
    ],
  },
  beweis: { hinweis: 'Beispiel für einen Betrieb mit drei Bereichen.' },
  vergleichTitel: 'Was sich bei euch ändert',
  vergleich: [
    ['Das Lieferdatum steht im Bemerkungsfeld', 'Jede Angabe hat ihren Platz'],
    ['Daneben läuft eine Excel', 'Die Regel steckt in der Software'],
    ['Dasselbe wird in zwei Programmen gepflegt', 'Alles steht an einer Stelle'],
    ['Der Ablauf steckt in ein paar Köpfen', 'Neue Leute finden ihn im System'],
  ],
  ablaufTitel: 'In wenigen Wochen läuft der erste Abschnitt',
  ablauf: [
    { wann: 'Tag 1', titel: 'Erstgespräch', text: '30 Minuten, kostenlos. Ihr erzählt, wie ihr arbeiten wollt. Wir sagen, was davon heute geht.' },
    { wann: 'Woche 1 bis 2', titel: 'Genau hinschauen', text: 'Passt es, legen wir in einem bezahlten Schritt fest, was zuerst umzieht und welche Daten mitmüssen. Was er kostet, sagt euch Marten vorher. Danach bekommt ihr einen festen Preis.' },
    { wann: 'Danach, 4 bis 6 Wochen', titel: 'Der erste Abschnitt läuft', text: 'Mit euren Daten darin und dem alten Programm daneben. Jeder weitere Bereich dauert ein bis drei Monate.' },
  ],
  fragenUndAntworten: [
    preisFrage,
    { q: 'Gibt es das nicht längst fertig?', a: 'Die Hälfte schon: Angebote, Planung, Rechnungen und Auswertungen laufen bei anderen Betrieben. Darauf setzen wir auf.' },
    { q: 'Vielleicht ist Bleiben besser?', a: 'Oft ja. Das sagen wir im Erstgespräch genauso klar, obwohl wir am Bauen verdienen.' },
    { q: 'Was passiert mit unseren Daten?', a: 'Die ziehen mit: erst der Abschnitt, dann die Historie, geprüft gegen das Alte.' },
  ],
  schlussTitel: 'Erstgespräch vereinbaren',
  schlussText: 'Erzählt uns, wie ihr arbeiten wollt. Wir sagen, was davon heute geht und womit man anfängt.',
  fragen: [
    {
      id: 'wo',
      question: 'Was wolltet ihr schon immer anders machen?',
      options: [
        { id: 'angebote', label: 'Angebote' },
        { id: 'einsatz', label: 'Planung und Abrechnung' },
        { id: 'zahlen', label: 'Auswertungen' },
        { id: 'ueberall', label: 'Den ganzen Ablauf' },
      ],
    },
    {
      id: 'personen',
      question: 'Wie viele Leute arbeiten täglich mit eurer Software?',
      options: [
        { id: 'lt10', label: 'Unter 10' },
        { id: '10-30', label: '10 bis 30' },
        { id: '30-80', label: '30 bis 80' },
        { id: 'gt80', label: 'Über 80' },
      ],
    },
  ],
};

// Die Antwort-Ids bleiben die aus quizEinordnung.json, dort stehen die Sätze je Kombination.
// Preis seit 2026-11-04 genannt (Marten): 2.400 € Festpreis je System, Geschäftslogik an den wichtigsten
// Abläufen. Ist es größer, gibt es nach dem Zeigen einen Preis für den Rest. Nachprüfung optional, 800 €, mit den Änderungen seit dem Bericht.
// Kein ASVS-Level und keine Abdeckung in Prozent: die Berichte folgen der Kapitelsystematik, ohne Level.
export const softwareCheck: SchlankTor = {
  funnel: 'software-check',
  leadEvent: 'software_check_lead',
  einordnung: 'software-check',
  fuerWen: 'Für Betriebe, die Software selbst gebaut haben',
  headline: 'Mit KI gebaute Software prüfen lassen, bevor ein Kunde nachfragt',
  lead: 'Erfahrene Entwickler schauen von außen drauf, nach dem Standard OWASP ASVS und darüber hinaus: Geschäftslogik, Ausfälle, Betrieb. Ihr bekommt einen Prüfbericht, den ihr Kunden und Auditoren zeigen könnt, und zu jedem Befund einen Vorschlag.',
  leadMobil: 'Geprüft nach OWASP ASVS und darüber hinaus. Ihr bekommt einen Bericht für Kunden und Auditoren.',
  fakten: ['2.400 € Festpreis je System', 'Bericht nach 4 bis 5 Werktagen', 'Nach OWASP ASVS und darüber hinaus', 'Für Kunden und Auditoren'],
  logos: [
    { key: 'bonprix_logo', name: 'bonprix' },
    { key: 'statista-logo', name: 'Statista' },
    { key: 'stage_logo', name: 'Stage Entertainment' },
    { key: 'fkc_logo', name: 'FKC Consulting' },
  ],
  wasEsIst: {
    titel: 'Ein Prüfbericht von Leuten, die selbst Software bauen',
    text: 'Erfahrene Entwickler schauen von außen auf eure Software. Jeder Fund ist eingestuft und hat einen Vorschlag, mit dem eure KI direkt weiterarbeiten kann.',
    schritte: [
      { titel: 'Prüfen', text: 'Automatisch und von Hand: Rechte, Anmeldung, Geschäftslogik und was passiert, wenn etwas ausfällt.' },
      { titel: 'Aufschreiben', text: 'Ihr bekommt einen Bericht, den ihr Kunden und Auditoren zeigen könnt.' },
      { titel: 'Besprechen', text: 'Wir gehen ihn durch: Was ist kritisch, was kann warten?' },
    ],
  },
  beweis: { hinweis: '' },
  vergleichTitel: 'Was sich nach dem Check ändert',
  vergleich: [
    ['Die Software läuft, von außen hat sie keiner gesehen', 'Jemand mit Erfahrung hat sie geprüft'],
    ['Ihr wisst nicht, ob Nutzer A die Daten von Nutzer B sieht', 'Rechte, Anmeldung und Schlüssel sind geprüft'],
    ['Ein Kunde fragt nach einem Nachweis', 'Ihr schickt den Prüfbericht'],
    ['Unklar, was zuerst zu tun ist', 'Ihr wisst, was kritisch ist und was warten kann'],
  ],
  telefonat: '15 Minuten',
  ablaufTitel: 'In 4 bis 5 Werktagen habt ihr den Bericht',
  ablauf: [
    { wann: 'Kostenlos, 15 Minuten', titel: 'Kurzes Telefonat', text: 'Was gebaut ist und was ansteht. Passt es in einen Check, machen wir den Termin zum Zeigen aus.' },
    { wann: 'Tag 1 bis 4', titel: 'Zeigen und prüfen', text: 'Euer Entwickler zeigt uns die Software. Dann lesen und messen wir: Rechte, Anmeldung, Geschäftslogik, Ausfälle.' },
    { wann: '1,5 Stunden', titel: 'Bericht durchgehen', text: 'Was kritisch ist, was warten kann. Die wichtigsten Befunde führen wir live vor.' },
  ],
  fragenUndAntworten: [
    { q: 'Was kostet das?', a: '2.400 € netto, Festpreis für ein System. Darin: Sicherheit nach OWASP ASVS vollständig, die Geschäftslogik an den wichtigsten Abläufen, Bericht, Management-Summary und Abschlusstermin. Ist das System größer, sagen wir das nach dem Zeigen mit Preis für den Rest, und ihr entscheidet.' },
    { q: 'Prüft ihr nach, ob alles behoben ist?', a: 'Auf Wunsch, innerhalb von sechs Wochen nach dem Bericht, für 800 €. Wir gehen die Befunde noch einmal durch und schauen uns mit an, was ihr seitdem geändert habt. Ihr bekommt je Befund behoben, teilweise oder offen, und was uns an den Änderungen auffällt.' },
    { q: 'Ist das ein Penetrationstest?', a: 'Nein. Wenn ihr einen braucht, sagen wir es und holen einen Partner dazu.' },
    { q: 'Bekommen wir ein Zertifikat?', a: 'Nein, das stellen Prüfstellen aus. Wir bereiten vor und begleiten.' },
    { q: 'Müssen wir danach alles neu bauen?', a: 'Selten. Der Bericht sagt je Fund, ob ihr ihn so lassen, umbauen oder neu machen solltet.' },
  ],
  schlussTitel: 'Kurz telefonieren',
  schlussText: '15 Minuten: was gebaut ist und was ansteht. Passt es in einen Check, machen wir direkt den Termin zum Zeigen mit eurem Entwickler aus.',
  fragen: [
    {
      id: 'was',
      question: 'Worum geht es?',
      options: [
        { id: 'intern', label: 'Internes Tool, mit KI gebaut' },
        { id: 'portal', label: 'App oder Portal für Kunden' },
        { id: 'produkt', label: 'Software, die wir verkaufen' },
        { id: 'konzept', label: 'Soll erst gebaut werden' },
      ],
    },
    {
      id: 'anlass',
      question: 'Was ist der Anlass?',
      options: [
        { id: 'golive', label: 'Der Go-Live steht an' },
        { id: 'kunde', label: 'Ein Kunde will einen Nachweis' },
        { id: 'cra', label: 'Cyber Resilience Act' },
        { id: 'bauch', label: 'Schlechtes Bauchgefühl' },
      ],
    },
    groesse,
  ],
};

/**
 * Anzeigen-Landing /f/software-check/: wie softwareCheck, aber der Preis nicht in den Fakten oben
 * (Marten, 2026-11-04). 2.400 € und die Nachprüfung für 800 € stehen nur in den Fragen und Antworten.
 */
export const softwareCheckFunnel: SchlankTor = {
  ...softwareCheck,
  fakten: ['Bericht nach 4 bis 5 Werktagen', 'Nach OWASP ASVS und darüber hinaus', 'Für Kunden und Auditoren', 'Fester Preis, bevor wir anfangen'],
};
