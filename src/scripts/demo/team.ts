import { ABSENCE_TYPES, HOLIDAYS, MONL, REAL, key, wd, type AbsenceKey } from './data';

type Mark = [AbsenceKey] | [AbsenceKey, 'half' | 'req'];

interface Person {
  name: string;
  initials: string;
  abs: Record<number, Mark>;
  soll: string;
  ist: string;
  saldo: string;
  rest: number;
}

const PEOPLE: Person[] = [
  { name: 'Jonas Muster', initials: 'JM', abs: { 13: ['ueber'] }, soll: '64:00', ist: '66:15', saldo: '+12:30', rest: 7 },
  { name: 'Lena Viertag', initials: 'LV', abs: { 2: ['urlaub'], 3: ['urlaub'], 4: ['urlaub'], 5: ['urlaub'], 6: ['urlaub'] }, soll: '24:00', ist: '24:30', saldo: '+3:45', rest: 4 },
  { name: 'Mara Beispiel', initials: 'MB', abs: { 4: ['krank'], 5: ['krank'], 18: ['urlaub', 'half'] }, soll: '32:00', ist: '30:10', saldo: '−1:50', rest: 11 },
  { name: 'Tim Kramer', initials: 'TK', abs: { 4: ['schule'], 11: ['schule'], 18: ['schule'], 25: ['schule'] }, soll: '24:00', ist: '24:00', saldo: '±0:00', rest: 14 },
  { name: 'Aylin Demir', initials: 'AD', abs: { 23: ['urlaub', 'req'], 24: ['urlaub', 'req'], 25: ['urlaub', 'req'], 26: ['urlaub', 'req'], 27: ['urlaub', 'req'] }, soll: '40:00', ist: '43:20', saldo: '+6:05', rest: 9 },
];

/** Teamkalender: Personen x Tage des laufenden Monats plus Soll/Ist/Saldo. */
export function mountTeam(root: HTMLElement): void {
  const y = REAL.getFullYear();
  const m = REAL.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const today = REAL.getDate();
  const days = Array.from({ length: dim }, (_, i) => i + 1);
  const isWe = (d: number) => wd(new Date(y, m, d)) > 4;
  const saldoClass = (s: string) => (s.startsWith('+') ? 'pos' : s.startsWith('−') ? 'neg' : '');

  const cell = (p: Person, d: number) => {
    const a = p.abs[d];
    const hol = HOLIDAYS[key(y, m, d)];
    let inner = '';
    if (a) {
      const note = a[1] === 'req' ? ' (beantragt)' : a[1] === 'half' ? ' (halber Tag)' : '';
      inner = `<b class="${a[1] ?? ''}" style="--c:${ABSENCE_TYPES[a[0]].color}" title="${ABSENCE_TYPES[a[0]].name}${note}"></b>`;
    } else if (hol) inner = `<b class="hol" title="${hol}"></b>`;
    return `<td class="d ${isWe(d) ? 'we' : ''} ${d === today ? 'today' : ''}">${inner}</td>`;
  };

  root.innerHTML = `<div class="tm-wrap"><table class="tm">
    <thead><tr><th class="who" style="font-family:var(--font);font-size:12px;color:var(--ink)">${MONL[m]} ${y}</th>${days.map((d) => `<th class="${d === today ? 'today' : ''}">${d}</th>`).join('')}<th class="num sep">Soll</th><th class="num">Ist</th><th class="num">Saldo</th><th class="num">Rest&shy;urlaub</th></tr></thead>
    <tbody>${PEOPLE.map(
      (p) => `<tr><td class="who"><span>${p.initials}</span>${p.name}</td>${days.map((d) => cell(p, d)).join('')}<td class="num sep">${p.soll}</td><td class="num">${p.ist}</td><td class="num ${saldoClass(p.saldo)}">${p.saldo}</td><td class="num">${p.rest} T</td></tr>`,
    ).join('')}</tbody>
    <tfoot><tr><td class="who">Team</td>${days.map((d) => `<td class="d ${isWe(d) ? 'we' : ''}"></td>`).join('')}<td class="num sep">184:00</td><td class="num">188:15</td><td class="num pos">+20:30</td><td class="num">45 T</td></tr></tfoot>
  </table></div>`;
}
