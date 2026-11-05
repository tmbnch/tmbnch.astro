import { PROJECTS, esc, hm, type ProjectKey } from './data';

type GroupBy = 'client' | 'project' | 'person';

interface Row {
  person: string;
  p: ProjectKey;
  /** Einzelne Einträge in Minuten; die Rundung greift pro Eintrag */
  entries: number[];
  rate: number;
}

const PEOPLE_COLORS: Record<string, string> = {
  'Jonas Muster': '#17160f',
  'Lena Viertag': '#ea3d92',
  'Mara Beispiel': '#7ac62f',
};

// Oktober 2026, bewusst krumme Minuten, damit die Rundung sichtbar wird.
const ROWS: Row[] = [
  { person: 'Jonas Muster', p: 'web', entries: [172, 95, 48, 210, 133, 67, 188, 102, 155, 41, 220, 90], rate: 105 },
  { person: 'Lena Viertag', p: 'web', entries: [120, 85, 160, 44, 199, 76, 131], rate: 95 },
  { person: 'Mara Beispiel', p: 'app', entries: [240, 182, 97, 166, 205, 73, 148, 190, 61], rate: 95 },
  { person: 'Jonas Muster', p: 'app', entries: [52, 38, 77, 64], rate: 95 },
  { person: 'Lena Viertag', p: 'shop', entries: [225, 140, 188, 96, 172, 210, 83], rate: 110 },
  { person: 'Mara Beispiel', p: 'wart', entries: [33, 47, 21, 62, 55, 38, 44, 29, 51, 36, 49, 27, 58], rate: 90 },
  { person: 'Jonas Muster', p: 'intern', entries: [60, 45, 90, 30, 75, 50, 40, 55, 35, 60, 45, 80], rate: 0 },
];

const euro = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';

/** Report-Pivot: gruppieren, nur abrechenbar, Rundung an/aus, Export (nur Hinweis). */
export function mountReport(root: HTMLElement): void {
  let group: GroupBy = 'client';
  let billOnly = true;
  let round = true;

  root.innerHTML = `<div class="rp">
    <div class="rp-ctrl">
      <div class="seg" role="group" aria-label="Gruppieren nach">
        <button type="button" data-g="client" class="on">Kunde</button><button type="button" data-g="project">Projekt</button><button type="button" data-g="person">Person</button>
      </div>
      <label class="rp-tg"><input type="checkbox" data-o="bill" checked> nur abrechenbar</label>
      <label class="rp-tg"><input type="checkbox" data-o="round" checked> auf 15 min runden</label>
    </div>
    <div class="rp-head"><b>Oktober 2026</b><span class="muted">Stunden · Betrag</span></div>
    <div class="rp-rows"></div>
    <div class="rp-total"></div>
    <div class="exports"><button type="button" class="chip" data-x="csv">CSV</button><button type="button" class="chip" data-x="xlsx">Excel</button><button type="button" class="chip" data-x="pdf">PDF</button><button type="button" class="chip" data-x="save">Als „letzter Monat“ speichern</button></div>
    <div class="rp-toast" role="status" hidden></div>
  </div>`;

  const rowsEl = root.querySelector<HTMLElement>('.rp-rows')!;
  const totalEl = root.querySelector<HTMLElement>('.rp-total')!;
  const toast = root.querySelector<HTMLElement>('.rp-toast')!;

  const keyOf = (r: Row) => (group === 'client' ? PROJECTS[r.p].client : group === 'project' ? PROJECTS[r.p].name : r.person);
  const colorOf = (r: Row) => (group === 'person' ? PEOPLE_COLORS[r.person] : PROJECTS[r.p].color);

  function render() {
    const agg = new Map<string, { min: number; raw: number; amount: number; color: string }>();
    ROWS.forEach((r) => {
      if (billOnly && r.rate === 0) return;
      const raw = r.entries.reduce((a, b) => a + b, 0);
      const min = round && r.rate > 0 ? r.entries.reduce((a, b) => a + Math.ceil(b / 15) * 15, 0) : raw;
      const k = keyOf(r);
      const cur = agg.get(k) ?? { min: 0, raw: 0, amount: 0, color: colorOf(r) };
      cur.min += min;
      cur.raw += raw;
      cur.amount += (min / 60) * r.rate;
      agg.set(k, cur);
    });
    const list = [...agg.entries()].sort((a, b) => b[1].min - a[1].min);
    const max = Math.max(...list.map(([, v]) => v.min), 1);
    rowsEl.innerHTML = list
      .map(([k, v]) => `<div class="rbar"><span>${esc(k)}</span><div class="track"><b style="width:${(v.min / max) * 100}%;background:${v.color}"></b></div><span class="v">${hm(v.min)}${v.min !== v.raw ? `<small class="rp-diff">+${hm(v.min - v.raw)}</small>` : ''}<br><small class="muted">${euro(v.amount)}</small></span></div>`)
      .join('');
    const tMin = list.reduce((a, [, v]) => a + v.min, 0);
    const tAmt = list.reduce((a, [, v]) => a + v.amount, 0);
    totalEl.innerHTML = `<span>${billOnly ? 'Abrechenbar' : 'Gesamt'}</span><span class="mono">${hm(tMin)} h · ${euro(tAmt)}</span>`;
  }

  root.querySelectorAll<HTMLButtonElement>('[data-g]').forEach((b) =>
    b.addEventListener('click', () => {
      group = b.dataset.g as GroupBy;
      root.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }),
  );
  root.querySelectorAll<HTMLInputElement>('[data-o]').forEach((c) =>
    c.addEventListener('change', () => {
      if (c.dataset.o === 'bill') billOnly = c.checked;
      else round = c.checked;
      render();
    }),
  );
  let t: ReturnType<typeof setTimeout> | undefined;
  root.querySelectorAll<HTMLButtonElement>('[data-x]').forEach((b) =>
    b.addEventListener('click', () => {
      const x = b.dataset.x;
      toast.textContent =
        x === 'save'
          ? 'Gespeichert: „Oktober nach Kunde“ läuft ab jetzt immer über den letzten Monat.'
          : `oktober-2026.${x} wäre jetzt heruntergeladen. In dieser Vorschau bleibt es beim Beispiel.`;
      toast.hidden = false;
      clearTimeout(t);
      t = setTimeout(() => {
        toast.hidden = true;
      }, 3200);
    }),
  );
  render();
}
