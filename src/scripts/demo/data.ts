/**
 * Beispieldaten und Helfer für die klickbaren Produkt-Dummies.
 * Namen und Projekte stammen aus dem DevDataSeedRunner des tmbnch-Monorepos.
 */

export type ProjectKey = 'web' | 'app' | 'shop' | 'wart' | 'intern';
export type AbsenceKey = 'urlaub' | 'krank' | 'ueber' | 'schule';

export interface Project {
  name: string;
  client: string;
  color: string;
}

export const PROJECTS: Record<ProjectKey, Project> = {
  web: { name: 'Website Relaunch', client: 'Musterfabrik AG', color: '#4f7cff' },
  app: { name: 'Mobile App', client: 'TechVision UG', color: '#14a38b' },
  shop: { name: 'Onlineshop', client: 'Studio Halm', color: '#f08a24' },
  wart: { name: 'Wartung & Support', client: 'Musterfabrik AG', color: '#a0703c' },
  intern: { name: 'Intern', client: 'Eigene Firma', color: '#8f8b7d' },
};
export const PROJECT_KEYS = Object.keys(PROJECTS) as ProjectKey[];

export const ABSENCE_TYPES: Record<AbsenceKey, { name: string; color: string }> = {
  urlaub: { name: 'Urlaub', color: '#14a38b' },
  krank: { name: 'Krankheit', color: '#ea3d92' },
  ueber: { name: 'Überstundenausgleich', color: '#f08a24' },
  schule: { name: 'Berufsschule', color: '#4f7cff' },
};

export const BILLABLE: Record<ProjectKey, boolean> = { web: true, app: true, shop: true, wart: true, intern: false };

export const DAYN = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const MONN = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
export const MONL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** "09:30" -> 570 */
export const t = (s: string): number => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
/** 570 -> "9:30" */
export const hm = (min: number): string => `${Math.floor(min / 60)}:${String(Math.round(min % 60)).padStart(2, '0')}`;
export const dur = (min: number): string => `${hm(min)} h`;
export const esc = (s: string): string =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
export const h = <T extends HTMLElement = HTMLElement>(html: string): T => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild as T;
};

/** Wochentag-Index mit Montag = 0 */
export const wd = (d: Date): number => (d.getDay() + 6) % 7;

export const REAL = new Date();
/** Am Wochenende zeigt die Demo den Freitag als "heute". */
export const TODAY_IDX = Math.min(wd(REAL), 4);
export const MONDAY = (() => {
  const m = new Date(REAL);
  m.setHours(0, 0, 0, 0);
  m.setDate(REAL.getDate() - wd(REAL));
  return m;
})();
/** Feste Demo-Uhrzeit, damit Timer und Jetzt-Linie immer gut aussehen. */
export const NOW = t('14:37');
export const YEAR = 2026;

export const key = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export const kd = (dt: Date): string => key(dt.getFullYear(), dt.getMonth(), dt.getDate());

/** Feiertage Niedersachsen 2026 */
export const HOLIDAYS: Record<string, string> = {
  '2026-01-01': 'Neujahr',
  '2026-04-03': 'Karfreitag',
  '2026-04-06': 'Ostermontag',
  '2026-05-01': 'Tag der Arbeit',
  '2026-05-14': 'Christi Himmelfahrt',
  '2026-05-25': 'Pfingstmontag',
  '2026-10-03': 'Tag der Dt. Einheit',
  '2026-10-31': 'Reformationstag',
  '2026-12-25': '1. Weihnachtstag',
  '2026-12-26': '2. Weihnachtstag',
};

export function range(a: string, b: string): string[] {
  const out: string[] = [];
  const d = new Date(a + 'T12:00');
  const e = new Date(b + 'T12:00');
  while (d <= e) {
    out.push(kd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export interface Absence {
  type: AbsenceKey;
  req: boolean;
}

/** Abwesenheiten von Jonas Muster, geteilt zwischen Monats- und Jahresansicht. */
export const ABSENCES: Record<string, Absence> = {};
const addAbs = (a: string, b: string | null, type: AbsenceKey, req = false) =>
  range(a, b ?? a).forEach((k) => {
    ABSENCES[k] = { type, req };
  });
addAbs('2026-01-02', null, 'urlaub');
addAbs('2026-02-10', '2026-02-11', 'krank');
addAbs('2026-03-13', null, 'ueber');
addAbs('2026-05-15', null, 'urlaub');
addAbs('2026-07-20', '2026-08-07', 'urlaub');
addAbs('2026-09-16', null, 'krank');
addAbs('2026-10-26', '2026-10-30', 'urlaub');
addAbs('2026-11-13', null, 'ueber');
addAbs('2026-12-21', '2026-12-23', 'urlaub', true);
addAbs('2026-12-28', '2026-12-31', 'urlaub', true);

export const isWorkday = (k: string): boolean => wd(new Date(k + 'T12:00')) < 5 && !HOLIDAYS[k];

/** Wochenvorlage: Tag-Index, Start, Ende, Projekt, Titel, Tags */
export const WEEK_TEMPLATE: Array<[number, string, string, ProjectKey, string, string[]]> = [
  [0, '08:30', '09:00', 'intern', 'Mails & Tagesplanung', []],
  [0, '09:00', '12:00', 'web', 'Startseite: Hero-Varianten', ['design']],
  [0, '13:00', '15:30', 'app', 'Onboarding-Screens umsetzen', ['frontend']],
  [0, '15:30', '17:00', 'wart', 'Ticket 482: Login-Fehler', ['support']],
  [1, '08:45', '10:15', 'shop', 'Produktfilter Backend', ['backend']],
  [1, '10:15', '11:00', 'app', 'Weekly mit TechVision', ['meeting']],
  [1, '11:00', '12:30', 'shop', 'Produktfilter Backend', ['backend']],
  [1, '13:30', '16:45', 'web', 'CMS-Anbindung Blog', ['backend']],
  [2, '09:00', '11:30', 'app', 'Push-Benachrichtigungen', ['frontend']],
  [2, '11:30', '12:00', 'intern', 'Code Review', []],
  [2, '12:45', '14:15', 'web', 'Texte abstimmen mit Kunde', ['meeting']],
  [2, '14:15', '17:30', 'shop', 'Checkout: Zahlungsarten', ['backend']],
  [3, '08:40', '09:30', 'intern', 'Mails & Tagesplanung', []],
  [3, '09:30', '10:15', 'app', 'Weekly mit TechVision', ['meeting']],
  [3, '09:45', '10:15', 'wart', 'Hotfix Kontaktformular', ['support']],
  [3, '10:20', '12:05', 'app', 'Onboarding-Flow', ['frontend']],
  [3, '13:10', '13:45', 'web', 'PR 128 Review', []],
  [4, '09:00', '12:00', 'shop', 'Checkout: Zahlungsarten', ['backend']],
  [4, '13:00', '15:00', 'web', 'Release vorbereiten', []],
  [4, '15:00', '16:00', 'intern', 'Wochenrückblick', []],
];

export interface Entry {
  id: number;
  d: number;
  s: number;
  e: number;
  p: ProjectKey;
  title: string;
  tags: string[];
  bill: boolean;
  running?: boolean;
  isNew?: boolean;
  lane?: number;
  lanes?: number;
}

let uid = 1;
export const nextId = (): number => uid++;

/** Einträge der laufenden Woche bis "jetzt", plus der laufende Timer. */
export function weekEntries(): Entry[] {
  const list: Entry[] = [];
  WEEK_TEMPLATE.forEach(([d, s, e, p, title, tags]) => {
    if (d > TODAY_IDX) return;
    if (d === TODAY_IDX && t(e) > t('14:00')) return;
    list.push({ id: nextId(), d, s: t(s), e: t(e), p, title, tags, bill: BILLABLE[p] });
  });
  list.push({ id: nextId(), d: TODAY_IDX, s: t('14:00'), e: NOW, p: 'web', title: 'Release-Checkliste', tags: [], bill: true, running: true });
  return list;
}
