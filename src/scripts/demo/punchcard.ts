import { hm, t } from './data';

interface Day {
  label: string;
  date: string;
  in: string;
  out: string;
  /** Pause in Minuten */
  brk: number;
  /** Auffälligkeit, die sich per Klick beheben lässt */
  issue?: { code: string; text: string; fix: string; apply: (d: Day) => void };
  fixed?: boolean;
  today?: boolean;
}

const SOLL = 8 * 60;

/**
 * Stempelkarte: Kommen, Gehen, Pause, Arbeitszeit und Saldo pro Tag.
 * Markierte Tage zeigen den ArbZG-Verstoß und bieten eine Korrektur an.
 */
export function mountPunchcard(root: HTMLElement): void {
  const days: Day[] = [
    { label: 'Mo', date: '26.10.', in: '08:12', out: '16:58', brk: 45 },
    { label: 'Di', date: '27.10.', in: '08:30', out: '17:15', brk: 30 },
    {
      label: 'Mi', date: '28.10.', in: '07:55', out: '15:25', brk: 0,
      issue: { code: '§ 4', text: '7:30 h ohne Pause', fix: 'Pause 12:00–12:30 eintragen', apply: (d) => { d.brk = 30; } },
    },
    { label: 'Do', date: '29.10.', in: '12:00', out: '21:15', brk: 45 },
    {
      label: 'Fr', date: '30.10.', in: '06:30', out: '15:10', brk: 30,
      issue: { code: '§ 5', text: 'nur 9:15 h Ruhe nach Donnerstag', fix: 'Tag auf 08:15–16:55 verschieben', apply: (d) => { d.in = '08:15'; d.out = '16:55'; } },
    },
    { label: 'Mo', date: '2.11.', in: '08:05', out: '16:45', brk: 30 },
    { label: 'Di', date: '3.11.', in: '08:20', out: '16:35', brk: 30 },
    {
      label: 'Mi', date: '4.11.', in: '07:45', out: '18:20', brk: 30,
      issue: { code: '§ 3', text: '10:05 h über der Höchstgrenze', fix: '0:05 h auf Donnerstag verschieben', apply: (d) => { d.out = '18:15'; } },
    },
    { label: 'Do', date: '5.11.', in: '08:40', out: '', brk: 15, today: true },
  ];

  root.innerHTML = `<div class="pc">
    <div class="pc-holes" aria-hidden="true"></div>
    <div class="pc-head"><div><span class="pc-k">Stempelkarte</span><b>Jonas Muster</b></div><div class="pc-meta"><span>KW 44–45</span><span>Arbeitsplan 40 h</span></div></div>
    <div class="pc-table" role="table" aria-label="Stempelkarte">
      <div class="pc-row pc-th" role="row"><span>Tag</span><span>Kommen</span><span>Gehen</span><span>Pause</span><span>Arbeit</span><span>±</span><span></span></div>
      <div class="pc-body"></div>
    </div>
    <div class="pc-foot"><span class="pc-open"></span><span>Saldo <b class="pc-saldo mono"></b></span></div>
  </div>`;
  const body = root.querySelector<HTMLElement>('.pc-body')!;
  const open = root.querySelector<HTMLElement>('.pc-open')!;
  const saldoEl = root.querySelector<HTMLElement>('.pc-saldo')!;
  let expanded: number | null = null;

  const work = (d: Day) => (d.out ? t(d.out) - t(d.in) - d.brk : 0);
  const sign = (m: number) => (m > 0 ? '+' : m < 0 ? '−' : '±') + hm(Math.abs(m));

  function render(stamp?: number) {
    body.innerHTML = days
      .map((d, i) => {
        const w = work(d);
        const diff = d.out ? w - SOLL : 0;
        const bad = d.issue && !d.fixed;
        return `<div class="pc-row ${bad ? 'bad' : ''} ${d.fixed ? 'ok' : ''} ${d.today ? 'today' : ''}" role="row" ${bad ? `data-i="${i}" tabindex="0"` : ''}>
          <span><b>${d.label}</b> ${d.date}</span>
          <span class="mono">${d.in}</span>
          <span class="mono">${d.out || '<span class="pc-live">läuft</span>'}</span>
          <span class="mono">${d.brk ? hm(d.brk) : '<span class="pc-miss">0:00</span>'}</span>
          <span class="mono">${d.out ? hm(w) : '–'}</span>
          <span class="mono ${diff > 0 ? 'pos' : diff < 0 ? 'neg' : ''}">${d.out ? sign(diff) : ''}</span>
          <span class="pc-flag">${bad ? `<em>${d.issue!.code}</em>` : d.fixed ? `<em class="okm ${stamp === i ? 'stamp' : ''}">ok</em>` : ''}</span>
        </div>
        ${bad && expanded === i ? `<div class="pc-fix"><span><b>${d.issue!.text}.</b> Vorschlag:</span><button type="button" class="btn btn-sm" data-fix="${i}">${d.issue!.fix}</button></div>` : ''}`;
      })
      .join('');
    const openCount = days.filter((d) => d.issue && !d.fixed).length;
    open.innerHTML = openCount ? `<i></i>${openCount} Auffälligkeit${openCount === 1 ? '' : 'en'} · Zeile antippen` : '<i class="ok"></i>Keine Auffälligkeiten';
    const saldo = 11 * 60 + 20 + days.reduce((a, d) => a + (d.out ? work(d) - SOLL : 0), 0);
    saldoEl.textContent = sign(saldo) + ' h';
    saldoEl.className = 'pc-saldo mono ' + (saldo >= 0 ? 'pos' : 'neg');

    body.querySelectorAll<HTMLElement>('.pc-row.bad').forEach((r) => {
      const toggle = () => {
        const i = Number(r.dataset.i);
        expanded = expanded === i ? null : i;
        render();
      };
      r.addEventListener('click', toggle);
      r.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
    body.querySelectorAll<HTMLButtonElement>('[data-fix]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.fix);
        days[i].issue!.apply(days[i]);
        days[i].fixed = true;
        expanded = null;
        render(i);
      }),
    );
  }
  render();
}
