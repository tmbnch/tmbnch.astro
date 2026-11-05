import {
  ABSENCES, ABSENCE_TYPES, DAYN, HOLIDAYS, MONL, MONN, REAL, YEAR,
  isWorkday, kd, key, range, wd, type AbsenceKey,
} from './data';

const ENTITLEMENT = 30;
const CARRY_OVER = 3;

/** Jahresübersicht: 12 Monate x 31 Tage, Bereich ziehen öffnet einen Antrag. */
export function mountYear(root: HTMLElement): void {
  const todayK = kd(REAL);
  root.innerHTML = `
    <div class="bal"><div><small>Anspruch ${YEAR}</small><strong>${ENTITLEMENT}</strong></div><div><small>Resturlaub ${YEAR - 1}</small><strong>${CARRY_OVER}</strong> <small style="display:inline">verfällt 31.3.</small></div><div><small>Genommen</small><strong class="b-taken"></strong></div><div><small>Verfügbar</small><strong class="b-free" style="color:var(--live-text)"></strong></div></div>
    <div class="yr-wrap"><div class="yr"></div></div>
    <div class="legend">${Object.values(ABSENCE_TYPES).map((a) => `<span><i style="--c:${a.color}"></i>${a.name}</span>`).join('')}<span><i class="striped" style="--c:#14a38b"></i>beantragt</span><span><i style="--c:#b8a6f5"></i>Feiertag</span><span><i style="--c:var(--muted)"></i>Wochenende</span></div>
    <div class="req-panel" role="dialog" aria-label="Urlaubsantrag"><div class="info"></div><select aria-label="Abwesenheitsart">${Object.entries(ABSENCE_TYPES).map(([k, a]) => `<option value="${k}">${a.name}</option>`).join('')}</select><button class="btn btn-sm do">Beantragen</button><button class="btn btn-sm btn-ghost cancel">Abbrechen</button></div>
    <div class="hint"><span class="hint-mouse">Zieh über mehrere Tage, um einen Antrag vorzubereiten.</span><span class="hint-touch">Tipp den ersten und dann den letzten Tag an, um einen Antrag vorzubereiten.</span></div>`;
  const grid = root.querySelector<HTMLElement>('.yr')!;
  const panel = root.querySelector<HTMLElement>('.req-panel')!;

  const balance = () => {
    const vac = Object.entries(ABSENCES).filter(([k, a]) => a.type === 'urlaub' && isWorkday(k));
    const taken = vac.filter(([, a]) => !a.req).length;
    const req = vac.filter(([, a]) => a.req).length;
    return { taken, req, free: ENTITLEMENT + CARRY_OVER - taken - req };
  };

  function render() {
    let html = '<div></div>' + Array.from({ length: 31 }, (_, i) => `<div class="dh">${i + 1}</div>`).join('');
    for (let m = 0; m < 12; m++) {
      html += `<div class="mh">${MONN[m]}</div>`;
      const dim = new Date(YEAR, m + 1, 0).getDate();
      for (let d = 1; d <= 31; d++) {
        if (d > dim) {
          html += '<div class="c void"></div>';
          continue;
        }
        const k = key(YEAR, m, d);
        const w = wd(new Date(YEAR, m, d));
        const a = ABSENCES[k];
        let cls = 'c';
        let st = '';
        let tip = `${d}. ${MONL[m]}`;
        if (a && w < 5 && !HOLIDAYS[k]) {
          cls += a.req ? ' req' : ' abs';
          st = `--c:${ABSENCE_TYPES[a.type].color}`;
          tip += ` · ${ABSENCE_TYPES[a.type].name}${a.req ? ' (beantragt)' : ''}`;
        } else if (HOLIDAYS[k]) {
          cls += ' hol';
          tip += ` · ${HOLIDAYS[k]}`;
        } else if (w > 4) cls += ' we';
        if (k === todayK) cls += ' today';
        html += `<div class="${cls}" style="${st}" data-k="${k}" title="${tip}"></div>`;
      }
    }
    grid.innerHTML = html;
    const b = balance();
    root.querySelector('.b-taken')!.textContent = String(b.taken);
    root.querySelector('.b-free')!.textContent = String(b.free);
  }
  render();

  let a: string | null = null;
  let b: string | null = null;
  let sel: string[] = [];
  const mark = () => {
    grid.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel'));
    if (!a || !b) return;
    const [x, y] = a < b ? [a, b] : [b, a];
    sel = range(x, y);
    sel.forEach((k) => grid.querySelector(`[data-k="${k}"]`)?.classList.add('sel'));
  };
  const fmt = (k: string) => {
    const d = new Date(k + 'T12:00');
    return `${DAYN[wd(d)]}, ${d.getDate()}. ${MONN[d.getMonth()]}`;
  };
  const showPanel = () => {
    const days = sel.filter((k) => isWorkday(k) && !ABSENCES[k]).length;
    render();
    mark();
    const free = balance().free;
    const rest = free - days;
    const after = rest >= 0 ? `danach ${rest} Tag${rest === 1 ? '' : 'e'} verfügbar` : `<span style="color:var(--bloom-600);font-weight:600">${-rest} Tag${rest === -1 ? '' : 'e'} mehr als verfügbar</span>`;
    panel.querySelector('.info')!.innerHTML = `<strong>${fmt(sel[0])} bis ${fmt(sel[sel.length - 1])}</strong>${days} Arbeitstag${days === 1 ? '' : 'e'} · ${after} · geht an Lena Viertag`;
    panel.classList.add('show');
  };

  // Touch: zwei Tipps (Start, dann Ende), damit das Raster horizontal scrollbar bleibt.
  let touchStart: string | null = null;
  grid.addEventListener('pointerdown', (e) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>('.c:not(.void)');
    if (!c) return;
    if (e.pointerType === 'touch') {
      const sx = e.clientX;
      const sy = e.clientY;
      const done = () => {
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', done);
      };
      const up = (u: PointerEvent) => {
        done();
        if (Math.hypot(u.clientX - sx, u.clientY - sy) > 8) return;
        if (!touchStart) {
          touchStart = a = b = c.dataset.k!;
          mark();
          panel.classList.add('show');
          panel.querySelector('.info')!.innerHTML = `<strong>${fmt(touchStart)}</strong>Jetzt den letzten Tag antippen.`;
          return;
        }
        a = touchStart;
        b = c.dataset.k!;
        touchStart = null;
        mark();
        showPanel();
      };
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', done);
      return;
    }
    e.preventDefault();
    a = b = c.dataset.k!;
    mark();
    const mv = (m: PointerEvent) => {
      const el = document.elementFromPoint(m.clientX, m.clientY);
      const cc = el?.closest<HTMLElement>('.yr .c:not(.void)');
      if (cc && cc.dataset.k !== b) {
        b = cc.dataset.k!;
        mark();
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      showPanel();
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  });

  panel.querySelector<HTMLButtonElement>('.cancel')!.onclick = () => {
    panel.classList.remove('show');
    a = b = touchStart = null;
    mark();
  };
  panel.querySelector<HTMLButtonElement>('.do')!.onclick = () => {
    const type = panel.querySelector<HTMLSelectElement>('select')!.value as AbsenceKey;
    sel.filter((k) => isWorkday(k) && !ABSENCES[k]).forEach((k) => {
      ABSENCES[k] = { type, req: true };
    });
    a = b = null;
    render();
    panel.querySelector('.info')!.innerHTML = '<strong>Beantragt.</strong>Lena Viertag sieht den Antrag jetzt in ihrer Freigabe-Inbox.';
    setTimeout(() => panel.classList.remove('show'), 2600);
  };
}
