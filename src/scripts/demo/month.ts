import {
  ABSENCES, ABSENCE_TYPES, DAYN, HOLIDAYS, MONL, PROJECTS, REAL, WEEK_TEMPLATE,
  esc, hm, kd, t, wd,
} from './data';

export interface MonthOptions {
  /** Klick auf einen Tag (z. B. in die Wochenansicht springen) */
  onDay?: (key: string) => void;
}

interface Chip {
  color: string;
  label: string;
  abs?: boolean;
  min?: number;
}

/** Monatsansicht: 42 Zellen, Chips pro Tag, "+N mehr". */
export function mountMonth(root: HTMLElement, opts: MonthOptions = {}): void {
  const y = REAL.getFullYear();
  const m = REAL.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(first);
  start.setDate(1 - wd(first));
  const todayK = kd(REAL);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const chipsFor = (d: Date): Chip[] => {
    const k = kd(d);
    const a = ABSENCES[k];
    if (a) return [{ abs: true, color: ABSENCE_TYPES[a.type].color, label: ABSENCE_TYPES[a.type].name + (a.req ? ' (beantragt)' : '') }];
    if (HOLIDAYS[k]) return [{ abs: true, color: '#8b5cf6', label: HOLIDAYS[k] }];
    if (wd(d) > 4 || d > REAL) return [];
    return WEEK_TEMPLATE.filter((x) => x[0] === wd(d)).map((x) => ({
      color: PROJECTS[x[3]].color,
      label: `${x[1]} ${x[4]}`,
      min: t(x[2]) - t(x[1]),
    }));
  };

  root.innerHTML = `<div class="mo">
    <div class="app-toolbar" style="margin-bottom:6px"><span class="title">${MONL[m]} ${y}</span></div>
    <div class="mo-head">${DAYN.map((d) => `<div>${d}</div>`).join('')}</div>
    <div class="mo-grid">${cells
      .map((d) => {
        const ch = chipsFor(d);
        const sum = ch.reduce((s, c) => s + (c.min ?? 0), 0);
        return `<div class="mo-cell ${d.getMonth() !== m ? 'out' : ''} ${kd(d) === todayK ? 'today' : ''}" data-k="${kd(d)}">
          <div class="n"><span>${d.getDate()}</span>${sum ? `<small>${hm(sum)}</small>` : ''}</div>
          ${ch
            .slice(0, 3)
            .map((c) => `<div class="mo-chip ${c.abs ? 'abs' : ''}" style="--c:${c.color}"><i></i><span>${esc(c.label)}</span></div>`)
            .join('')}
          ${ch.length > 3 ? `<div class="mo-more">+${ch.length - 3} mehr</div>` : ''}
        </div>`;
      })
      .join('')}</div></div>`;

  root.querySelectorAll<HTMLElement>('.mo-cell').forEach((c) =>
    c.addEventListener('click', () => opts.onDay?.(c.dataset.k!)),
  );
}
