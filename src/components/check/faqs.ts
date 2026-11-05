import { softwareCheck } from '@/data/funnelSchlank';

/** FAQs der indexierten Seite, auch fürs FAQ-Schema und /llms-full.txt. Der Funnel bleibt bei den kurzen Fragen. */
export const softwareCheckFaqs = [
  {
    q: 'Wie prüft ihr Software, die mit KI gebaut wurde?',
    a: 'Euer Entwickler zeigt uns die Software, dann lesen wir den Code und messen an einer lokalen Instanz. Geprüft wird nach den Kapiteln des OWASP ASVS, dazu Geschäftslogik, Ausfall angebundener Systeme und Betrieb. Jeder Befund bekommt eine Einstufung, eine Fundstelle und einen Vorschlag, den eure KI umsetzen kann.',
  },
  {
    q: 'Wie lange dauert ein Software-Check?',
    a: '4 bis 5 Werktage vom Zeigen bis zum Abschlusstermin. Von euch braucht es etwa drei Stunden: das Zeigen und den Termin am Ende. Ein Architektur-Review ist nach wenigen Tagen fertig.',
  },
  {
    q: 'Betrifft uns der Cyber Resilience Act?',
    a: 'Das kann sein, wenn ihr Software an andere abgebt. Der CRA-Fahrplan klärt, ob er euch trifft, und legt einen Plan bis Dezember 2027 fest.',
  },
  ...softwareCheck.fragenUndAntworten,
];
