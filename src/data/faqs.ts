/**
 * Häufige Fragen der Lösungsseiten. Eine Quelle für die Seiten (Faq.astro), das FAQ-Schema
 * und /llms-full.txt, damit die drei nicht auseinanderlaufen.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const projektFaqs: FaqItem[] = [
  {
    question: 'Muss jeder die Desktop-App installieren?',
    answer: 'Die Web-App reicht zum Erfassen. Die Desktop-App lohnt sich für alle, die viel zwischen Projekten springen und abends die Vorschläge nutzen wollen. Sie läuft auf macOS, Windows und Linux.',
  },
  {
    question: 'Wie kommen unsere Daten aus Toggl rüber?',
    answer: 'Mit einem API-Token aus Toggl. timebench holt Kunden, Projekte, Tags und Einträge und gleicht danach jede Stunde ab, auch Löschungen. Lokale Änderungen in timebench bleiben dabei erhalten.',
  },
  {
    question: 'Wer sieht die Stundensätze?',
    answer: 'Nur Admins und Owner eines Workspace. Mitarbeitende sehen ihre Stunden und ob ein Eintrag abrechenbar ist.',
  },
  {
    question: 'Gibt es eine App fürs Handy?',
    answer: 'Die Web-App ist fürs Handy gebaut: Die Woche zeigt drei Tage, der Monat wird kompakt. Eine eigene App aus dem Store gibt es noch nicht.',
  },
  {
    question: 'Können wir timebench selbst betreiben?',
    answer: 'Ja. timebench läuft mit Docker Compose und PostgreSQL auf eurem eigenen Server. Wer das nicht möchte, nutzt unsere Instanz.',
  },
];

export const arbeitFaqs: FaqItem[] = [
  {
    question: 'Reicht das für die Pflicht zur Arbeitszeiterfassung?',
    answer: 'timebench dokumentiert Beginn, Ende und Dauer jeder Arbeitszeit und prüft die Regeln des ArbZG. Ob das in eurem Fall genügt, hängt auch von Tarifvertrag und Betriebsvereinbarung ab. Die Regeln lassen sich pro Workspace anpassen. Eine Rechtsberatung ersetzt das nicht.',
  },
  {
    question: 'Müssen wir zusätzlich stempeln?',
    answer: 'Wer seine Projektzeit bucht, hat seine Arbeitszeit schon erfasst. Für Tätigkeiten ohne Projekt gibt es interne Projekte wie „Verwaltung“ oder „Weiterbildung“.',
  },
  {
    question: 'Was passiert bei Vertrauensarbeitszeit?',
    answer: 'Die Zeit wird trotzdem erfasst, nur der Saldo spielt dann eine kleinere Rolle. Ihr könnt den Arbeitsplan so setzen, dass kein Soll entsteht.',
  },
  {
    question: 'Wer genehmigt Urlaub?',
    answer: 'Admins und die als Führungskraft eingetragene Person. Führungskräfte sehen außerdem die Stunden ihrer direkten Mitarbeitenden.',
  },
  {
    question: 'Können wir unsere Abwesenheiten aus dem alten System übernehmen?',
    answer: 'Resturlaub und Überstundenstand tragt ihr als Startwert ein. Für einen vollständigen Import sprecht uns an, das richten wir in der Beta gemeinsam ein.',
  },
];
