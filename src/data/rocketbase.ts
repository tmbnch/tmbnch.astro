export const strengths = [
  {
    title: 'Direkte Zusammenarbeit mit Marten Prieß',
    description:
      'Ihr sprecht mit dem Gründer von RocketBase. Er sitzt in den Workshops, trifft die Architekturentscheidungen mit und bleibt euer Ansprechpartner, wenn es später hakt.',
  },
  {
    title: 'Konzernniveau für den Mittelstand',
    description:
      'Sechs Jahre bonprix, mehrere Jahre Statista: Was dort an Architektur funktioniert, bauen wir in einer Größe, die ihr auch ohne eigene IT-Abteilung betreiben könnt.',
  },
  {
    title: 'Team statt Einzelkämpfer',
    description:
      'Hinter dem Gründer steht ein eingespieltes kleines Team. Für jeden Projektbereich kennen sich mindestens zwei Leute aus, auch in der Urlaubszeit.',
  },
  {
    title: 'Pragmatisch mit Open Source',
    description:
      'Für Reporting nehmen wir Metabase, für Auth einen bewährten Baustein. Selbst gebaut wird da, wo euer Prozess anders ist als der aller anderen.',
  },
  {
    title: 'Auch die alten Daten',
    description:
      'In Vertec lagen drei Jahre, Projekte und Rechnungen davor in älteren Systemen. Wir haben sie eingelesen: über 20 Jahre Kundenhistorie, und damit erstmals ein Bild davon, was eine Kundenbeziehung über ihre Laufzeit wert ist.',
  },
  {
    title: 'Direkt, mit Widerspruch',
    description:
      'Ihr sprecht mit denen, die es bauen, nicht mit einem Projektleiter dazwischen. Und wenn ein Wunsch in die falsche Richtung läuft, sagen wir das, bevor wir ihn umsetzen.',
  },
];

export const serviceAreas = [
  {
    title: 'Discovery & Prozessanalyse',
    description:
      'Bevor wir über Umsetzung reden, schauen wir uns an, wie bei euch tatsächlich gearbeitet wird. Nicht wie es im Handbuch steht.',
    bullets: [
      'Aufnahme des Prozesses, wie er wirklich läuft',
      'Priorisierung: was schmerzt, was kann warten',
      'Lösungsrichtungen, die sich umsetzen lassen',
    ],
  },
  {
    title: 'Konzeption & UX',
    description:
      'Fachlogik und Bedienung entstehen zusammen. Eine Anwendung, die fachlich stimmt, aber niemand gern benutzt, wird umgangen.',
    bullets: [
      'Datenmodell und Prozessdesign',
      'Klickbare Mockups für die kritischen Abläufe',
      'Übersetzung zwischen Fachbereich und Technik',
    ],
  },
  {
    title: 'Individualsoftware & Integration',
    description:
      'Plattformen, Portale und interne Werkzeuge, die mit euren Prozessen wachsen und sich in das einfügen, was ihr schon habt.',
    bullets: [
      'Webbasierte Individualsoftware',
      'Migration aus Standard- oder Altsystemen, inklusive Datenbereinigung',
      'Schnittstellen zu ERP, PIM, CRM und BI',
    ],
  },
  {
    title: 'Betrieb & Weiterentwicklung',
    description:
      'Nach dem Go-live sind wir weiter da. Die meisten unserer Projekte laufen seit Jahren und werden Stück für Stück ausgebaut.',
    bullets: [
      'Monitoring und Qualitätssicherung',
      'Weiterentwicklung in kleinen Schritten',
      'Dokumentation, mit der auch andere weiterarbeiten können',
    ],
  },
];

const casesRaw = [
  {
    slug: 'bonprix',
    client: 'bonprix',
    title: 'PLM/PIM-Neubau mit internationaler Teamintegration',
    heading: 'Neue Plattform für Produktdaten, gebaut mit Teams in Hamburg und Indien',
    description:
      'Neubau einer Produktdaten-Plattform bei bonprix: RocketBase übernahm die technische Führung und verband die Hamburger Delivery mit einem Team in Indien.',
    navTeaser: 'Eine Plattform für Produktdaten im Konzernalltag.',
    kicker:
      'Drei Jahre lang hat RocketBase mit vier Leuten den Neubau der Produktdaten-Software von bonprix geführt, während die alte weiterlief.',
    highlights: [
      'Technische Leitung über mehrere Jahre',
      'Die alte Software lief während des Umbaus weiter',
      'Gemeinsame Entwicklung in Hamburg und Indien',
    ],
    challenge:
      'Die Software für Produktdaten war in die Jahre gekommen. Alles hing in einem großen Oracle/.NET-System, und neue Anforderungen wie Kollektionen und flexiblere Produktstrukturen ließen sich kaum noch umsetzen. Abschalten ging nicht, denn die Fachbereiche arbeiteten jeden Tag damit.',
    approach:
      'Von 2019 bis 2022 übernahm RocketBase die technische Konzeption, die Leitung und die Qualitätssicherung in einem gemischten Team in Hamburg und Indien. Wir bauten die Software Stück für Stück neu, aus kleinen, einzeln änderbaren Teilen. Daneben ordneten wir die Zusammenarbeit: Workshops, Übergaben, Zuständigkeiten. Auch die Oberflächen haben wir überarbeitet, damit sich Produkte und Stammdaten schneller erfassen lassen.',
    impact:
      'Die alte Software blieb die ganze Zeit in Betrieb, beide Datenstrukturen blieben kompatibel, und die Fachbereiche konnten jederzeit weiterarbeiten. Aus der einen großen Software wurden viele kleine Teile, und Kollektionen und flexiblere Produktstrukturen sind jetzt möglich.',
    processFocus: 'Pflege und Abstimmung von Produktdaten über mehrere Teams und Standorte hinweg.',
    outcomes: [
      'Umbau im laufenden Betrieb, die Fachbereiche konnten jederzeit weiterarbeiten',
      'Produkte und Stammdaten lassen sich spürbar schneller erfassen',
      'Kollektionen und flexiblere Produktstrukturen sind möglich',
      'Die Software lässt sich jetzt in Teilen weiterentwickeln',
      'Klare Übergaben und Zuständigkeiten zwischen den Standorten',
    ],
    services: [
      'Technische Konzeption und Leitung',
      'Qualitätssicherung',
      'Zusammenarbeit der Teams in Hamburg und Indien',
      'Überarbeitung der Oberflächen',
    ],
    fakten: [
      { label: 'Branche', wert: 'Handel, E-Commerce' },
      { label: 'Laufzeit', wert: '2019 bis 2022' },
      { label: 'RocketBase', wert: '4 Personen' },
    ],
    screenshots: [
      { key: 'bonprix-wizard', alt: 'Create Wizard' },
      { key: 'bonprix-datasheet', alt: 'Produkt Datenblatt' },
      { key: 'bonprix-search', alt: 'Flexible Suche' },
    ],
    testimonial: {
      quote:
        'Unsere Zusammenarbeit mit RocketBase war durchweg positiv. Die langjährige Erfahrung in der Individualentwicklung hat sich wirklich ausgezahlt. Selbst die Zusammenarbeit mit unseren Entwicklungsteams in Indien hat RocketBase hervorragend gemeistert. Heute ist unser Monolith in Microservices aufgeteilt, und wir haben eine flexible und effiziente Systemarchitektur.',
      author: 'Lars Globisch',
      position: 'Head of Product & Technology',
      portraitKey: 'globisch',
    },
  },
  {
    slug: 'statista',
    client: 'Statista',
    title: 'Neue Content-Plattform statt gewachsener Altsysteme',
    heading: 'Neue Plattform für die Statista-Redaktion im laufenden Betrieb',
    description:
      'Eine neue Plattform für die Pflege von Statistiken und Inhalten bei Statista, inklusive Migration, Parallelbetrieb und neuer Redaktionsoberflächen.',
    navTeaser: 'Redaktionsplattform für Statistik-Inhalte.',
    kicker: 'Die alte Software wurde ersetzt, während die Redaktion jeden Tag damit arbeitete.',
    highlights: [
      'Eine zentrale Anwendung im laufenden Betrieb ersetzt',
      'Neue Oberflächen für die tägliche Arbeit der Redaktion',
      'Die Redakteure saßen von Anfang an mit am Tisch',
    ],
    challenge:
      'Die Redaktion pflegte Statistiken und Inhalte in einer veralteten .NET-Plattform im eigenen Rechenzentrum. Sie sollte ersetzt werden, doch Statista veröffentlicht jeden Tag: Ein Stillstand kam nicht infrage, und die Redakteure sollten ihre eingespielten Abläufe behalten.',
    approach:
      'Zuerst saß RocketBase bei den Redakteuren und schaute zu, wie sie arbeiten. Was dabei auffiel, bestimmte den Aufbau der neuen Oberflächen. Gemeinsam mit dem Statista-Team entstand ein neues System in der AWS-Cloud. Alt und Neu liefen nebeneinander und glichen ihre Daten in beide Richtungen ab, sodass die Funktionen einzeln umziehen konnten.',
    impact:
      'Statista ist ohne großen Stichtag umgezogen, die Redaktion konnte durchgehend weiterarbeiten. Die alte Software ist ersetzt, und die neuen Oberflächen sparen im Alltag spürbar Klicks und Wartezeit. Das gelang, weil die späteren Nutzer vom ersten Workshop an dabei waren.',
    processFocus:
      'Pflege, Ordnung und Veröffentlichung von Statistiken und Inhalten in der Redaktion.',
    outcomes: [
      'Umzug in die Cloud ohne Stillstand, die Redaktion arbeitete durchgehend weiter',
      'Funktionen zogen einzeln um, statt alles an einem Stichtag',
      'Weniger Klicks und Wartezeit in den neuen Pflegeoberflächen',
      'Weniger Umwege und Handarbeit bei der Pflege der Inhalte',
      'Die Plattform lässt sich weiterentwickeln',
    ],
    services: [
      'Technische Leitung und Architektur',
      'Entwicklung von Serverteil und Oberflächen',
      'Betrieb in der AWS-Cloud',
      'Datenumzug und Parallelbetrieb',
      'Enge Abstimmung mit der Redaktion',
    ],
    fakten: [
      { label: 'Branche', wert: 'Daten und Medien' },
      { label: 'Laufzeit', wert: '2022 bis 2024' },
      { label: 'Unsere Rolle', wert: 'Technische Leitung' },
      { label: 'Ergebnis', wert: 'Umzug ohne Stillstand in der Redaktion' },
    ],
    screenshots: [
      { key: 'statista-search', alt: 'Flexible Suche' },
      { key: 'statista-visual-editor', alt: 'Visueller Editor' },
      { key: 'statista-editor', alt: 'Flexibler Editor' },
    ],
    testimonial: {
      quote:
        'Die Zusammenarbeit mit Marten und seinem Team war äußerst inspirierend und hat unsere Produktvision maßgeblich bereichert. Dank ihrer tiefgreifenden Expertise in maßgeschneiderten Datenverwaltungssystemen konnten sie ein präzises technisches Konzept entwickeln, das effizient und zielgerichtet umgesetzt wurde. Besonders beeindruckend war der nahtlose Wissenstransfer innerhalb des Teams, bei dem keine Unterscheidung zwischen externen und internen Beteiligten erkennbar war.',
      author: 'Ingo Schellhammer',
      position: 'CTO',
      portraitKey: 'schellhammer',
    },
  },
  {
    slug: 'fkc-consulting',
    client: 'FKC Consulting',
    title: 'Von der Vertec-Welt zur individuellen Beratungsplattform',
    heading: 'Vertec abgelöst durch eine Software, die zum Beratungsgeschäft passt',
    description:
      'Vertec passte an entscheidenden Stellen nicht zu FKC. RocketBase löste es ab, migrierte die Daten und baute den Weg von der Pipeline zur Rechnung neu.',
    kicker:
      'Die Standardsoftware war sauber gebaut, aber für alle gedacht. Für das, worauf es bei FKC ankam, fehlte der Platz. Die neue Anwendung arbeitet so, wie FKC berät.',
    highlights: [
      'Eine Standardsoftware ersetzt, die nicht zu den Abläufen passte',
      'Alte Daten aus Vertec und älteren Systemen übernommen und bereinigt',
      'Angebot, Kalkulation und Rechnung folgen dem echten Ablauf',
    ],
    challenge:
      'Eine etablierte Standardsoftware sollte das Beratungsgeschäft tragen. Binnen weniger Jahre wurde sie eher zur Last. Der eigene Angebots- und Projektablauf passte nur über Umwege hinein, und das Team fing immer mehr von Hand auf. Für Steuerung und Prognosen fehlten die Auswertungen im nötigen Detail. Gleichzeitig steckten wertvolle Daten in Strukturen, aus denen sie erst herausgelöst werden mussten.',
    approach:
      'RocketBase arbeitete sich in das alte System ein und schrieb auf, wie FKC wirklich arbeitet. Darauf baute die Planung des Datenumzugs auf. In Vertec lagen nur die letzten drei Jahre, Projekte und Rechnungen davor steckten in älteren Systemen. Beides wurde eingelesen und bereinigt, sodass heute über 20 Jahre Kundenhistorie in einer Anwendung liegen. Darauf entstand eine eigene Anwendung für das Beratungsgeschäft. Der Vertrieb läuft auf einer Tafel mit Karten (Kanban-Board), das Angebot rechnet sich automatisch, Termine sind eingebaut, und die Rechnung geht direkt aus dem System raus. Angebot und Durchführung sind getrennt, damit sich Plan und Ergebnis vergleichen lassen.',
    // TODO: Vorher/Nachher-Zahlen ergänzen (Minuten pro Angebot, Angebote pro Monat).
    impact:
      'Viele inhabergeführte Beratungen kennen das: Die Standardsoftware soll entlasten und bindet am Ende Personal. Beratungszeit ist das Produkt, also geht jede Stunde, die ins Auffangen statt in Kundenarbeit fließt, direkt von der Marge ab. Der zweite Effekt zeigt sich beim Kunden. FKC hat die eigenen Wettbewerber verglichen: Alle verschicken Angebote als Word oder PDF und klären Rückfragen per Mail. FKC schickt heute eine Web-Seite, auf der der Kunde Optionen an- und abwählt und die Summe mitläuft. Fehlende Angaben holt FKC über ein vorbefülltes Formular und sieht, wann das Angebot geöffnet wurde. Verwaltet eure Software mehr, als sie euch trägt, kennt ihr dieses Muster.',
    processFocus:
      'Der Kernablauf der Beratung vom Angebot über die Projektdurchführung bis zur Rechnung. In der Standardsoftware waren Angebot und Durchführung so verwoben, dass sich Plan und Ergebnis kaum noch vergleichen ließen.',
    outcomes: [
      'Über 20 Jahre Projekte und Rechnungen an einem Ort. Erstmals ist sichtbar, was ein Kunde über die ganze Zeit eingebracht hat.',
      'Der echte Angebots- und Projektablauf steht im System, für alle nachvollziehbar',
      'Weniger Handarbeit im Tagesgeschäft, weil Vertrieb, Kalkulation und Rechnung ineinandergreifen',
      'Kalkulation und Deckungsbeitrag entstehen direkt im Ablauf',
      'Die Software lässt sich mit dem Geschäft weiterentwickeln',
    ],
    services: [
      'Ablösung angepasster Standardsoftware (Vertec)',
      'Übernahme und Bereinigung der alten Daten',
      'Individuelle Beratungsplattform: Angebot, Kalkulation, Abrechnung',
    ],
    solved: [
      {
        title: 'Vertrieb als Kanban-Board',
        benefit: 'Jedes Angebot auf einen Blick, vom ersten Kontakt bis zum Auftrag.',
      },
      {
        title: 'Angebot rechnet sich selbst',
        benefit:
          'Mitarbeiter und Aufwände fließen automatisch in die Kalkulation, samt Deckungsbeitrag.',
      },
      {
        title: 'Angebote, die etwas hermachen',
        benefit:
          'Aus demselben System kommt eine Web-Seite mit Optionen zum Auf- und Zuklappen und mitlaufender Summe. Der Wettbewerb schickt PDFs.',
      },
      {
        title: 'Rückfragen über ein vorbefülltes Formular',
        benefit:
          'Fehlende Angaben trägt der Kunde selbst nach, auf einer Seite, die schon weiß, worum es geht.',
      },
      {
        title: 'Sehen, wann das Angebot geöffnet wurde',
        benefit: 'Nachfassen zum richtigen Zeitpunkt.',
      },
      {
        title: 'Termine direkt im Projekt',
        benefit: 'Planung und Durchführung liegen an einer Stelle.',
      },
      {
        title: 'Rechnung raus per Klick',
        benefit: 'Versand direkt aus dem System, mit einem Klick beim fertigen Beleg.',
      },
      {
        title: 'Plan gegen Ergebnis auswertbar',
        benefit:
          'Angebot und Durchführung sind getrennt, so lassen sich Kalkulation und Wirklichkeit vergleichen.',
      },
    ],
    screenshots: [
      { key: 'fkc-sales-kanban', alt: 'Sales-Pipeline im Kanban-Board' },
      { key: 'fkc-proposal-calculate', alt: 'Angebotskalkulation' },
      { key: 'fkc-poroposal-presentation', alt: 'Angebotspräsentation' },
      { key: 'fkc-invoice', alt: 'Rechnungsansicht' },
    ],
  },
  {
    slug: 'schlosserei-diezinger',
    client: 'Schlosserei Diezinger',
    title: 'Einsatzplanung, die den Betrieb wirklich kennt',
    heading: 'Einsatzplanung für eine Schlosserei, die vorher in Excel plante',
    description:
      'Wer wann woran arbeitet und wer ausfällt, lief bei Schlosserei Diezinger über Excel. Jetzt gibt es dafür ein System, das den Handwerksalltag versteht.',
    kicker:
      'Die aufwändige Planung von Hand ist abgelöst. Einsätze und Aufträge laufen jetzt in einer Software, in der jede Rolle ihre eigene Ansicht hat.',
    highlights: [
      'Kalender und Aufgabenplan für Mitarbeiter und Abteilungen',
      'Abwesenheiten wie Krankheit oder Urlaub werden automatisch angezeigt',
      'Eigene Übersicht je Rolle, Barcode-Scan und Anmeldung per Personalkarte',
    ],
    challenge:
      'Die Planung lief von Hand in Excel-Tabellen. Es fehlte ein zentraler Überblick, wer wann an welchem Auftrag arbeitet, und Abwesenheiten mussten gesondert gepflegt werden. Je größer der Betrieb wurde, desto unhandlicher wurde das.',
    approach:
      'RocketBase entwickelte eine eigene Software mit Kalender, Aufgabenplan und einer Übersicht je Rolle. Abwesenheiten berücksichtigt sie automatisch. Für den Alltag im Betrieb kamen Barcode-Scan und eine eigens gebaute Anmeldung per Personalkarte dazu.',
    impact:
      'Vorher gab es ein Excel-Blatt pro Woche. Flexibel verschieben ging nicht, der Blick über mehrere Wochen fehlte, und Konflikte fielen erst auf, wenn es zu spät war. Heute läuft die Planung im Büro mit allen Details und lässt sich am Werkstatt-Terminal genauso bedienen. Läuft eure Planung über gewachsene Tabellen, kennt ihr das.',
    processFocus:
      'Planung von Mitarbeitern und Aufträgen und die tägliche Steuerung im Handwerksbetrieb.',
    outcomes: [
      'Deutlich weniger Handarbeit, weil die Excel-Planung wegfällt',
      'Auslastung, Verfügbarkeit und Auftragsstand sind jederzeit aktuell sichtbar',
      'Einfachere Bedienung im Alltag durch Barcodes, Druckfunktion und Anmeldung per Personalkarte',
      'Seit 2026 produktiv im Einsatz',
    ],
    services: [
      'Eigene Software für Planung und Steuerung',
      'Übersichten je Rolle und Verwaltung der Einstellungen',
      'Anmeldung per Karte (NFC) und Barcode-Scan',
    ],
    solved: [
      {
        title: 'Planung über mehrere Wochen',
        benefit: 'Auslastung und freie Kapazitäten der nächsten Wochen auf einen Blick.',
      },
      {
        title: 'Abwesenheiten automatisch berücksichtigt',
        benefit:
          'Urlaub, Krankheit und Berufsschule fließen direkt in die Planung. Wer nicht da ist, lässt sich auch nicht verplanen.',
      },
      {
        title: 'Aufträge flexibel aufteilen',
        benefit: 'Ein Auftrag lässt sich auf mehrere Mitarbeiter und mehrere Tage aufteilen.',
      },
      {
        title: 'Wareneingang sauber protokolliert',
        benefit:
          'Teilelieferungen werden direkt in der Software erfasst. So lässt sich jederzeit nachsehen, was wann angekommen ist.',
      },
      {
        title: 'Jeder sieht, was er braucht',
        benefit:
          'Werkstatt, Planung und Leitung bekommen je eine eigene Übersicht, auf der das Wichtige direkt oben steht.',
      },
      {
        title: 'Anmeldung per Personalkarte',
        benefit:
          'Anmeldung am Werkstatt-Terminal mit der Karte, die jeder ohnehin dabei hat. Das ist schnell genug für den Alltag.',
      },
    ],
    fakten: [
      { label: 'Branche', wert: 'Metallbau, Handwerk' },
      { label: 'Betrieb', wert: 'Über 50 Mitarbeitende' },
      { label: 'Ergebnis', wert: 'Eigene Lösung statt Standardtool mit Jahreslizenz' },
    ],
    screenshots: [
      { key: 'metall-board-highlighted', alt: 'Einsatzplanung mit hervorgehobenem Auftrag' },
      { key: 'metall-dashboard', alt: 'Rollenbasiertes Dashboard' },
      { key: 'metall-order', alt: 'Auftragsübersicht' },
    ],
    testimonial: {
      quote:
        'Die großen Tools waren uns zu kompliziert und zu teuer. Jetzt haben wir genau das, was wir brauchen, und wenn etwas fehlt, wird es ergänzt.',
      // Zweites freigegebenes Zitat, nur für die Kundenstimmen auf der Startseite.
      homeQuote:
        'Wir kamen aus Excel und hätten fast ein großes Standardtool eingeführt. Jetzt haben wir etwas dazwischen: so einfach wie unsere alte Tabelle, aber mit Blick über mehrere Wochen und ohne jährliche Lizenzkosten.',
      author: 'Lukas Diezinger',
      position: 'Geschäftsführer',
      portraitKey: 'diezinger',
    },
  },
];

// Anzeige-Reihenfolge der Hauptreferenzen (Nav-Dropdown nimmt die ersten drei,
// die Referenz-Übersicht zeigt sie in genau dieser Folge). bonprix bewusst zuletzt.
const caseOrder = ['fkc-consulting', 'statista', 'schlosserei-diezinger', 'bonprix'];
export const cases = [...casesRaw].sort(
  (a, b) => caseOrder.indexOf(a.slug) - caseOrder.indexOf(b.slug)
);

export const additionalCases = [
  {
    slug: 'statista-canva',
    client: 'Statista',
    title: 'Statista-Daten direkt in Canva nutzbar',
    heading: 'Statista-Daten direkt in Canva nutzbar',
    description:
      'RocketBase entwickelte die Statista-App für Canva: geprüfte Statistiken direkt in Designs und Präsentationen, samt Image-Service für Vorschaubilder.',
    kicker: 'Statistiken landen dort, wo die Präsentation ohnehin entsteht.',
    highlights: [
      'Pilot-App für eine neue Canva-Schnittstelle, die noch in der Erprobung war',
      'Eigener Dienst, der Vorschaubilder im Moment der Anfrage erzeugt',
      'Automatische Veröffentlichung auf den Servern von AWS',
    ],
    challenge:
      'Statista suchte einen Weg, Inhalte auch außerhalb der eigenen Plattform anzubieten, dort, wo Anwender sie direkt weiterverarbeiten. Die neue Datenanbindung von Canva war noch in der Erprobung. Offen war unter anderem, wie Vorschaubilder und die Anmeldung laufen sollten.',
    approach:
      'Wir übernahmen Konzept und Umsetzung: die Anbindung an Canva, die direkte Abstimmung mit dem Canva-Team und einen eigenen Bilderdienst samt Betrieb auf AWS. Weil die Schnittstelle noch in der Erprobung war, änderten sich Vorgaben teilweise während der Entwicklung.',
    impact:
      'Statista hat einen neuen Vertriebsweg: Die Inhalte sind da, wo die Nutzer arbeiten. Das ist interessant, wenn ihr eure Daten in fremde Plattformen bringen wollt und nicht warten möchtet, bis Kunden auf eure Seite kommen.',
    processFocus:
      'Statistische Daten in fremde Gestaltungsprogramme bringen, über geprüfte Schnittstellen.',
    outcomes: [
      'Neuer Vertriebsweg für Statista-Inhalte in Canva',
      'Zuverlässigere Bilderzeugung durch einen eigenen Dienst, der mit der Last mitwächst',
      'Eine Grundlage für weitere Anbindungen an andere Plattformen',
    ],
    services: [
      'Konzept und Anbindung an die Plattform',
      'Bilderdienst und Serverbetrieb auf AWS',
      'Automatische Auslieferung und Betrieb',
    ],
    fakten: [
      { label: 'Branche', wert: 'Daten und Medien' },
      { label: 'Laufzeit', wert: '2024 bis 2025' },
      { label: 'Ergebnis', wert: 'Neuer Vertriebsweg in Canva' },
    ],
    screenshots: [
      { key: 'statista-canva-chart-drawing', alt: 'Canva-Chart erstellen mit Statista-Daten' },
      { key: 'statista-canva-search-results', alt: 'Suche nach Statistiken innerhalb der App' },
      { key: 'statista-canva-data-load', alt: 'Datenladen und Integration in Canva' },
    ],
    testimonial: {
      quote:
        'Durch die Integration der Statista-Daten in das Canva-Ökosystem ermöglichen wir unseren Nutzern eine neue, direkte Integration in ihre Arbeitsabläufe.',
      author: 'Lars Leipson',
      position: 'VP Data Production',
      portraitKey: 'leipson',
    },
  },
  {
    slug: 'stage-cml',
    client: 'Stage Entertainment',
    title: 'Budgetplanung raus aus Excel, rein in einen belastbaren Prozess',
    heading: 'Budgetplanung aus Excel in eine eigene Plattform geholt',
    description:
      'RocketBase holte die Budgetplanung von Stage Entertainment aus Excel in eine Plattform mit Validierung und nächtlichem Abgleich zur Buchhaltung.',
    kicker: 'Die Planung liegt jetzt an einem Ort, und die Zahlen passen zur Buchhaltung.',
    highlights: [
      'Gewachsene Excel-Modelle durch eine zentrale Plattform ersetzt',
      'Automatischer Abgleich mit dem Buchhaltungssystem, jede Nacht',
      'Deutliche Entlastung im Monatsabschluss',
    ],
    challenge:
      'Die Budgetplanung lief in komplexen, gewachsenen Excel-Modellen. Sie kamen an ihre Grenze, gemeinsames Arbeiten war fehleranfällig, und eine saubere Verbindung zur Buchhaltung fehlte.',
    approach:
      'Wir übertrugen die bestehenden Modelle in eine Plattform mit Datenbank, bauten Prüfungen ein und richteten einen nächtlichen Abgleich zwischen Planung und Buchhaltung ein. Die Fachleute planen weiter nach derselben Logik wie vorher, nur ohne die Tabellen.',
    impact:
      'Die Zahlen stimmen jetzt mit der Buchhaltung überein, und der Monatsabschluss geht schneller. Als Stage später das Buchhaltungssystem wechselte, überstand die Plattform das ohne Neubau.',
    processFocus: 'Finanzplanung, Berichte und Abgleich mit dem Buchhaltungssystem.',
    outcomes: [
      'Spürbar weniger unentdeckte Fehlbuchungen im laufenden Betrieb',
      'Deutlich kürzere Wege im Monatsabschluss durch automatische Berichte',
      'Die Plattform hat einen Wechsel des Buchhaltungssystems überstanden',
      'Bis heute täglich im Controlling im Einsatz',
    ],
    services: [
      'Analyse der Abläufe und Beratung',
      'Entwicklung der Planungsplattform',
      'Anbindung an das Buchhaltungssystem',
    ],
    fakten: [
      { label: 'Branche', wert: 'Entertainment' },
      { label: 'Laufzeit', wert: '2021 bis 2022' },
      { label: 'Ergebnis', wert: 'Bis heute täglich im Controlling' },
    ],
    screenshots: [
      { key: 'stage-cml-buchungsliste', alt: 'Buchungsliste mit Validierungs-Info' },
      { key: 'stage-cml-planausgaben', alt: 'Erfassung von Planausgaben' },
      { key: 'stage-cml-reports', alt: 'Reports und Exporte' },
    ],
    testimonial: {
      quote:
        'Mit RocketBase als Partner haben wir eine signifikante Qualitätssteigerung in unserer Finanzabwicklung erzielt.',
      author: 'Dirk Schwartzkopff',
      position: 'Managing Director',
      portraitKey: 'schwartzkopff',
    },
  },
  {
    slug: 'sam-vorteilsguru',
    client: 'Smart Active Media',
    title: 'Gutscheinportal, das sich in fremde Checkouts einbettet',
    heading: 'Gutscheinportal für die Checkouts anderer Shops',
    description:
      'Für Smart Active Media baute RocketBase ein Gutscheinportal, das per JavaScript in Partner-Websites und Checkouts läuft und Leads weiterverwertet.',
    kicker: 'Ein Produkt, das in fremden Shops läuft, über die man keine Kontrolle hat.',
    highlights: [
      'Einbettung per JavaScript in Partner-Shops und Landingpages',
      'Hohe Last stabil betrieben, fünfstellige Impressions pro Tag',
      'Vom Start bis zur ersten Live-Einbindung in sechs Monaten',
    ],
    challenge:
      'Smart Active Media brauchte eine Lösung, die sich reibungsarm in fremde Checkouts einbauen lässt, dabei performant bleibt und gleichzeitig verschiedene Kooperationspartner sauber bedient.',
    approach:
      'RocketBase begleitete Konzept und Wettbewerbsanalyse, setzte Frontend und Backend um und betrieb den Dienst auf einer Infrastruktur, die für hochfrequentierte Einbindungen ausgelegt ist.',
    impact:
      'Aus einer Startup-Idee wurde ein Produkt, das zuverlässig in fremden Shops läuft und auch bei hoher Last nicht wegbricht. Relevant für alle, die ein Produkt bei Partnern einbinden wollen, ohne dass es bei Andrang ausfällt.',
    processFocus: 'Leadverwertung über eingebettete Gutscheinflächen in Partner-Websites.',
    outcomes: [
      'Belastbares Produkt mit hoher Verfügbarkeit ab Go-live',
      'Skalierbarer Betrieb bei fünfstelligen Impressions pro Tag',
      'Tragfähige Basis, um weitere Partner und Varianten aufzuschalten',
    ],
    services: [
      'Beratung, Konzept und Wettbewerbsanalyse',
      'Frontend- und Backend-Entwicklung',
      'Hosting und Betrieb unter Last',
    ],
    fakten: [
      { label: 'Branche', wert: 'E-Commerce' },
      { label: 'Laufzeit', wert: '2018 bis 2020' },
      { label: 'Ergebnis', wert: 'Vom MVP zur etablierten Plattform' },
    ],
    screenshots: [
      { key: 'sam-vorteilsguru-workflows', alt: 'Ausgefeilte Workflows' },
      { key: 'sam-vorteilsguru-embed', alt: 'Embed-Testumgebung' },
      { key: 'sam-vorteilsguru-einbindung', alt: 'Flexible Einbindung in Partner-Sites' },
    ],
    testimonial: {
      quote:
        'RocketBase hat unsere Startup-Idee erfolgreich zum Leben erweckt und uns eine solide technische Grundlage geschaffen.',
      author: 'Thorsten Blöcker',
      position: 'CEO & Founder',
      portraitKey: 'bloecker',
    },
  },
  {
    slug: 'mavox-winterdienst',
    client: 'MAVOX Winterdienst',
    title: 'Tourenplanung und mobile Einsatzerfassung im Außendienst',
    heading: 'Tourenplanung und mobile Einsatzerfassung im Außendienst',
    description:
      'RocketBase löste ein Altsystem ab: hybride App und neues Backend für Routen, Fahrzeuge, Objekte und Einsätze, mit Offline-Funktion im Außendienst.',
    kicker:
      'Die App funktioniert auch dann, wenn draußen kein Netz ist, und gleicht die Daten später ab.',
    highlights: [
      'Alte Software ohne Dokumentation ersetzt, samt Datenübernahme',
      'Handy-App, die auch ohne Netz läuft und Benachrichtigungen schickt',
      'Erweitert für mehrere Mandanten und weitere Dienstleistungen',
    ],
    challenge:
      'Die bisherige Lösung war eine gewachsene alte Software, deren Datenaufbau kaum dokumentiert war. Gleichzeitig wuchs MAVOX und wollte Einsätze mobil erfassen, auch ohne stabiles Netz.',
    approach:
      'RocketBase untersuchte die alte Software, übernahm ihre Daten, baute einen neuen Serverteil für Routen, Objekte und Mitarbeiter und entwickelte eine App, die ohne Netz arbeitet und die Daten später abgleicht.',
    impact:
      'Der Außendienst erfasst seine Einsätze jetzt direkt vor Ort, auch mit Handschuhen und ohne Netz. Die Daten gleicht die App später ab, das Nachtragen am Abend fällt weg. Arbeiten eure Leute draußen und rechnen drinnen ab, ist das euer Fall.',
    processFocus: 'Einsatzplanung, Touren und Leistungserfassung im Außendienst.',
    outcomes: [
      'Weniger manuelle Nacharbeit durch direkte Erfassung im Einsatz',
      'Touren, Einsätze und Objekte sind jederzeit aktuell sichtbar',
      'Neue Dienstleistungen und weitere Mandanten lassen sich aufnehmen',
      'Einsätze sind auch bei Reklamationen lückenlos nachweisbar',
      'Die App betreuen wir seither durchgehend weiter',
    ],
    services: [
      'Analyse der alten Software und Datenübernahme',
      'Serverteil und App, die auch ohne Netz läuft',
      'Hosting und Veröffentlichung in App Store und Play Store',
    ],
    fakten: [
      { label: 'Branche', wert: 'Dienstleistung, Facility' },
      { label: 'Laufzeit', wert: '2020 bis 2021' },
      { label: 'Ergebnis', wert: 'Einsätze lückenlos nachweisbar' },
    ],
    screenshots: [
      { key: 'mavox-winterdienst-mobile', alt: 'Mobile App im Einsatz' },
      { key: 'mavox-winterdienst-tourenplanung', alt: 'Tourenplanung' },
      { key: 'mavox-winterdienst-planung', alt: 'Umfassende Planung' },
    ],
    // testimonial: deaktiviert, bis ein echtes Portrait von Christian Grupp verfügbar ist.
    // Ursprüngliche Daten:
    //   quote:    'Die Software von RocketBase hat unsere Prozesse exakt so abgebildet, wie wir es benötigen, wodurch wir unsere Effizienz und Effektivität weiter steigern konnten.'
    //   author:   'Christian Grupp'
    //   position: 'Head of IT'
  },
  {
    slug: 'bonprix-collection-planning',
    client: 'bonprix',
    title: 'VK- und Sortimentsplanung aus Excel in eine kollaborative Plattform überführt',
    heading: 'VK- und Sortimentsplanung aus Excel in eine gemeinsame Plattform geholt',
    description:
      'RocketBase holte das VK-Planungsmodell aus Excel in eine Plattform mit Massenbearbeitung, Versionierung und verlässlichen Referenzwerten.',
    kicker:
      'Die Flexibilität von Excel bleibt. Dazu kommen gemeinsames Arbeiten, saubere Daten und gesicherte Planstände.',
    highlights: [
      'Komplexe Excel-Modelle mit allen Formeln übernommen',
      'Mehrere Leute arbeiten gleichzeitig, und die Formeln bleiben erhalten',
      'Planstände werden gesichert, gesperrt und freigegeben',
    ],
    challenge:
      'Die Planungsmodelle waren in Excel über Jahre verfeinert worden. Excel kam an Grenzen: beim gleichzeitigen Arbeiten, beim Schutz der Formeln vor Überschreiben und bei der Frage, wie Planwerte festgeschrieben und später als Referenz genutzt werden.',
    approach:
      'RocketBase analysierte die Modelle und Abläufe und übertrug sie in eine Plattform, die sich wie Excel bedienen lässt. Dazu kamen Prüfungen, gesicherte Planstände und Freigaben.',
    impact:
      'Das Controlling plant jetzt gemeinsam an denselben Zahlen, so vertraut wie in Excel. Formeln gehen nicht mehr verloren, und niemand überschreibt dem anderen die Tabelle. Arbeiten bei euch mehrere Leute gleichzeitig an gewachsenen Planungstabellen, ist das derselbe Fall.',
    processFocus: 'VK- und Sortimentsmengenplanung im Controlling bei bonprix.',
    outcomes: [
      'Gemeinsames Planen, bei dem Formeln und Planstände erhalten bleiben',
      'Verlässliche Referenzwerte für Folgeplanungen durch klare Planstände',
      'Spürbar weniger Reibung im Alltag des Controllings',
    ],
    services: [
      'Beratung und Analyse der Abläufe',
      'Eigene Software, die sich wie Excel bedient',
      'Planstände und Freigaben',
    ],
    screenshots: [
      { key: 'bonprix-collection-plan-report', alt: 'Plan-Report mit Prüfungen' },
      { key: 'bonprix-collection-versionierung', alt: 'Versionierung und Sperrungen' },
      { key: 'bonprix-collection-plan-wizard', alt: 'Plan-Wizard' },
    ],
    testimonial: {
      quote:
        'RocketBase hat uns nicht nur mit einer leistungsfähigen Plattform überzeugt, sondern auch mit hervorragender Beratung und kreativen Lösungen.',
      author: 'Remin',
      position: 'Controlling Specialist',
      portraitKey: 'remin',
    },
  },
];

export const processSteps = [
  {
    title: 'Verstehen',
    description:
      'Wir schauen uns an, wie ihr arbeitet: Rollen, Systeme, die Stellen wo es klemmt. Bevor Budget in die falsche Richtung läuft.',
  },
  {
    title: 'Priorisieren',
    description:
      'Nicht alles muss gebaut werden. Wir trennen, wo sich Eigenentwicklung lohnt und wo ein fertiger Baustein schneller ans Ziel bringt.',
  },
  {
    title: 'Umsetzen',
    description:
      'Konzept, Architektur und Entwicklung bleiben in einer Hand. Ihr müsst Entscheidungen nicht zwischen mehreren Parteien übersetzen.',
  },
  {
    title: 'Weiterentwickeln',
    description:
      'Der Go-live ist der Anfang. Die meisten unserer Projekte laufen seit Jahren und wachsen in kleinen Schritten weiter.',
  },
];

export const discoveryOffer = {
  title: 'Workshop',
  subtitle: 'Drei Termine, ein Dokument, ein Festpreis.',
  description:
    'Aufnahme bei euch, Abstimmung wenige Tage später, Übergabe mit der Geschäftsführung: zusammen etwa ein halber Tag eurer Zeit. Am Ende steht euer Ablauf aufgeschrieben, ein Zielbild für die erste Stufe und ein Festpreis für die Umsetzung. Das Ergebnis gehört euch.',
  deliverables: [
    'Euer Ablauf, aufgeschrieben, mit den Stellen, an denen Zeit verloren geht',
    'Quickwins, die sich kurzfristig umsetzen lassen',
    'Zielbild und Entwürfe für die erste Ausbaustufe',
    'Eine Empfehlung: ausbauen, ablösen oder so lassen',
    'Festpreis für die Umsetzung, einmalig, inklusive Betrieb im ersten Jahr',
  ],
};

export const teamPrinciples = [
  'Remote arbeitendes Team, verteilt über Nord- und Süddeutschland',
  'Regelmäßige Offsites, weil manches am selben Tisch schneller geht',
  'Kurze Wege statt Agentur-Overhead',
  'KI da eingesetzt, wo sie Arbeit spart, nicht als Selbstzweck',
];

/**
 * Mission page – chapters with eyebrow, headline, key facts,
 * a visualization hint and a flowing body text.
 *
 * `visual` is a discriminator for the rendering layer; the page picks
 * the matching component pattern (timeline, counter, split, etc.).
 */

export const contactLinks = {
  email: 'marten@rocketbase.io',
  github: 'https://github.com/rocketbase-io',
  linkedin: 'https://www.linkedin.com/company/rocketbase-io/',
  instagram: 'https://www.instagram.com/rocketbase.io/',
  cal: 'https://cal.com/rocketbase-marten/erstgespraech',
  calDiscovery: 'https://cal.com/rocketbase-marten/discovery-vorabgesprach',
};
