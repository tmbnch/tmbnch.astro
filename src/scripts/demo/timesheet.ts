import { DAYN, MONDAY, PROJECTS, PROJECT_KEYS, esc, hm, weekEntries, type ProjectKey } from './data';

/** "1:30", "90m", "1,5" -> Minuten; null bei ungültiger Eingabe */
export function parseDuration(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (!s) return 0;
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d+):(\d{1,2})$/))) return Number(m[1]) * 60 + Number(m[2]);
  if ((m = s.match(/^(\d+)\s*m(in)?$/i))) return Number(m[1]);
  if ((m = s.match(/^(\d+(?:\.\d+)?)\s*h?$/i))) return Math.round(parseFloat(m[1]) * 60);
  return null;
}

/** Stundenzettel: Projekte x Tage, editierbar, Summen live. */
export function mountTimesheet(root: HTMLElement): void {
  const val = {} as Record<ProjectKey, number[]>;
  PROJECT_KEYS.forEach((p) => {
    val[p] = [0, 0, 0, 0, 0, 0, 0];
  });
  weekEntries().forEach((e) => {
    val[e.p][e.d] += e.e - e.s;
  });
  const dates = DAYN.map((_, i) => {
    const x = new Date(MONDAY);
    x.setDate(MONDAY.getDate() + i);
    return x;
  });

  root.innerHTML = `<div class="ts-wrap"><table class="ts">
    <thead><tr><th>Projekt</th>${DAYN.map((d, i) => `<th class="${i > 4 ? 'we' : ''}">${d} ${dates[i].getDate()}.</th>`).join('')}<th>Summe</th></tr></thead>
    <tbody>${PROJECT_KEYS.map(
      (p) => `<tr data-p="${p}"><td style="--c:${PROJECTS[p].color}"><div class="pn"><i></i>${esc(PROJECTS[p].name)}</div><div class="cn">${esc(PROJECTS[p].client)}</div></td>
      ${val[p].map((v, i) => `<td class="${i > 4 ? 'we' : ''}"><input data-i="${i}" value="${v ? hm(v) : ''}" inputmode="decimal" aria-label="${esc(PROJECTS[p].name)} ${DAYN[i]}"></td>`).join('')}
      <td class="sum"></td></tr>`,
    ).join('')}</tbody>
    <tfoot><tr><td>Gesamt</td>${DAYN.map((_, i) => `<td class="col-sum ${i > 4 ? 'we' : ''}" data-i="${i}"></td>`).join('')}<td class="all"></td></tr></tfoot>
  </table></div>
  <div class="hint" style="margin-top:12px">Tippe <kbd>1:30</kbd>, <kbd>90m</kbd> oder <kbd>1,5</kbd>. Summen rechnen sofort mit. <span class="ts-soll" style="margin-left:auto"></span></div>`;

  const recalc = () => {
    let all = 0;
    PROJECT_KEYS.forEach((p) => {
      const s = val[p].reduce((a, b) => a + b, 0);
      all += s;
      root.querySelector(`tr[data-p="${p}"] .sum`)!.textContent = s ? hm(s) : '–';
    });
    DAYN.forEach((_, i) => {
      const s = PROJECT_KEYS.reduce((a, p) => a + val[p][i], 0);
      root.querySelector(`.col-sum[data-i="${i}"]`)!.textContent = s ? hm(s) : '–';
    });
    root.querySelector('.all')!.textContent = hm(all);
    const diff = all - 40 * 60;
    root.querySelector('.ts-soll')!.innerHTML = `Soll 40:00 h · <b style="color:${diff >= 0 ? 'var(--live-text)' : 'var(--ink)'}">${diff >= 0 ? '+' : '−'}${hm(Math.abs(diff))} h</b>`;
  };

  root.querySelectorAll<HTMLInputElement>('input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const p = inp.closest<HTMLElement>('tr')!.dataset.p as ProjectKey;
      const i = Number(inp.dataset.i);
      const v = parseDuration(inp.value);
      if (v === null) {
        inp.value = val[p][i] ? hm(val[p][i]) : '';
        return;
      }
      val[p][i] = v;
      inp.value = v ? hm(v) : '';
      inp.classList.add('flash');
      setTimeout(() => inp.classList.remove('flash'), 600);
      recalc();
    });
    inp.addEventListener('keydown', (k) => {
      if (k.key === 'Enter') inp.blur();
    });
  });
  recalc();
}
