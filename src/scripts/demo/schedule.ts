import { DAYN, HOLIDAYS, hm, key, wd } from './data';

interface Preset {
  name: string;
  hours: number[];
}

const PRESETS: Preset[] = [
  { name: 'Vollzeit 40 h', hours: [8, 8, 8, 8, 8] },
  { name: 'Teilzeit 32 h, Mi frei', hours: [8, 8, 0, 8, 8] },
  { name: '4 Tage à 9 h', hours: [9, 9, 9, 9, 0] },
  { name: 'Vormittags 20 h', hours: [4, 4, 4, 4, 4] },
];
const STEPS = [8, 9, 6, 4, 0];
// Oktober 2026: Ist-Stunden und Abwesenheiten (Urlaub 26.–30.10.)
const IST_MIN = 139 * 60 + 10;
const ABSENT = new Set(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']);

/** Arbeitsplan: Stunden pro Wochentag anklicken, Soll und Saldo für Oktober rechnen mit. */
export function mountSchedule(root: HTMLElement): void {
  let hours = [...PRESETS[0].hours];

  root.innerHTML = `<div class="sc">
    <div class="sc-presets">${PRESETS.map((p, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-p="${i}">${p.name}</button>`).join('')}</div>
    <div class="sc-days"></div>
    <div class="hint">Tag antippen ändert die Stunden: 8 → 9 → 6 → 4 → frei.</div>
    <div class="sc-calc"></div>
  </div>`;
  const daysEl = root.querySelector<HTMLElement>('.sc-days')!;
  const calc = root.querySelector<HTMLElement>('.sc-calc')!;

  function soll() {
    let min = 0;
    let workdays = 0;
    let absent = 0;
    let hol = 0;
    for (let d = 1; d <= 31; d++) {
      const k = key(2026, 9, d);
      const w = wd(new Date(2026, 9, d));
      if (w > 4 || !hours[w]) continue;
      if (HOLIDAYS[k]) {
        hol++;
        continue;
      }
      if (ABSENT.has(k)) {
        absent++;
        continue;
      }
      workdays++;
      min += hours[w] * 60;
    }
    return { min, workdays, absent, hol };
  }

  function render() {
    daysEl.innerHTML = hours
      .map((h, i) => `<button type="button" class="sc-day ${h ? '' : 'off'}" data-d="${i}" aria-label="${DAYN[i]}: ${h ? h + ' Stunden' : 'frei'}"><span>${DAYN[i]}</span><b>${h ? h + ' h' : 'frei'}</b><i style="height:${(h / 9) * 100}%"></i></button>`)
      .join('');
    const s = soll();
    const saldo = IST_MIN - s.min;
    const week = hours.reduce((a, b) => a + b, 0);
    calc.innerHTML = `
      <div><small>Woche</small><strong>${week} h</strong></div>
      <div><small>Soll Oktober</small><strong>${hm(s.min)}</strong><small>${s.workdays} Tage · ${s.absent} Tage Urlaub${s.hol ? ` · ${s.hol} Feiertag${s.hol === 1 ? '' : 'e'}` : ''}</small></div>
      <div><small>Ist Oktober</small><strong>${hm(IST_MIN)}</strong></div>
      <div><small>Saldo</small><strong class="${saldo >= 0 ? 'pos' : 'neg'}">${saldo >= 0 ? '+' : '−'}${hm(Math.abs(saldo))}</strong></div>`;
    daysEl.querySelectorAll<HTMLButtonElement>('.sc-day').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.d);
        hours[i] = STEPS[(STEPS.indexOf(hours[i]) + 1) % STEPS.length];
        root.querySelectorAll('[data-p]').forEach((x) => x.classList.remove('on'));
        render();
      }),
    );
  }
  root.querySelectorAll<HTMLButtonElement>('[data-p]').forEach((b) =>
    b.addEventListener('click', () => {
      hours = [...PRESETS[Number(b.dataset.p)].hours];
      root.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }),
  );
  render();
}
