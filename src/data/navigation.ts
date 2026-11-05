/** Navigation und Footer an einer Stelle. Neue Lösungen hier eintragen. */
export interface SolutionLink {
  href: string;
  title: string;
  text: string;
  /** Noch nicht gebaut: wird ausgegraut mit "bald" angezeigt */
  soon?: boolean;
}

export const solutions: SolutionLink[] = [
  {
    href: '/projektzeiterfassung/',
    title: 'Projektzeiterfassung',
    text: 'Zeit auf Kunden und Projekte buchen, Stundensätze, Reports',
  },
  {
    href: '/arbeitszeiterfassung/',
    title: 'Arbeitszeiterfassung',
    text: 'ArbZG-Prüfung, Überstunden, Urlaub und Abwesenheiten',
  },
  { href: '#', title: 'Integrationen', text: 'Toggl-Import, iCal, API, CLI', soon: true },
  { href: '#', title: 'Branchen', text: 'Agenturen, Beratung, Handwerk', soon: true },
];

export const mainLinks = [
  { href: '/#desktop', label: 'Desktop-App' },
  { href: '/#tour', label: 'Produkt-Tour' },
];

export const footerColumns = [
  {
    title: 'Lösungen',
    links: [
      ...solutions.filter((s) => !s.soon).map((s) => ({ href: s.href, label: s.title })),
      { href: '/#desktop', label: 'Desktop-App' },
    ],
  },
  {
    title: 'Produkt',
    links: [
      { href: '/#tour', label: 'Produkt-Tour' },
      { href: '/#datenschutz-feature', label: 'Privatsphäre' },
      { href: '/#warteliste', label: 'Warteliste' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { href: '/impressum/', label: 'Impressum' },
      { href: '/datenschutz/', label: 'Datenschutz' },
    ],
  },
];
