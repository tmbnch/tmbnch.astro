import {
  BILLABLE, DAYN, HOLIDAYS, MONDAY, NOW, PROJECTS, PROJECT_KEYS, TODAY_IDX,
  dur, esc, h, hm, kd, nextId, weekEntries,
  type Entry, type ProjectKey,
} from './data';

export interface WeekOptions {
  /** Pixel pro Stunde */
  h?: number;
  /** 5 (Mo–Fr) oder 7 Tage */
  days?: 5 | 7;
}

const START = 8;
const END = 18;

/** Wochenansicht: anlegen per Ziehen, verschieben per Drag, Details per Klick. */
export function mountWeek(root: HTMLElement, opts: WeekOptions = {}): void {
  const H = opts.h ?? 44;
  const entries = weekEntries();
  const width = root.clientWidth || 600;
  const days =
    width < 520
      ? [Math.max(0, TODAY_IDX - 1), TODAY_IDX, Math.min(6, TODAY_IDX + 1)].filter((v, i, a) => a.indexOf(v) === i)
      : opts.days === 7
        ? [0, 1, 2, 3, 4, 5, 6]
        : [0, 1, 2, 3, 4];

  root.innerHTML = '';
  const wk = h(`<div class="wk" style="--h:${H}px;--days:${days.length}"></div>`);
  root.appendChild(wk);
  let pop: HTMLElement | null = null;

  const closePop = () => {
    pop?.remove();
    pop = null;
    wk.querySelectorAll('.ev.draft').forEach((x) => x.remove());
  };
  const topOf = (min: number) => ((min - START * 60) / 60) * H;

  function layoutDay(list: Entry[]) {
    list.sort((a, b) => a.s - b.s || b.e - a.e);
    let cluster: Entry[] = [];
    let end = -1;
    const flush = () => {
      const lanes: number[] = [];
      cluster.forEach((e) => {
        let i = lanes.findIndex((le) => le <= e.s);
        if (i < 0) {
          i = lanes.length;
          lanes.push(0);
        }
        lanes[i] = e.e;
        e.lane = i;
      });
      cluster.forEach((e) => {
        e.lanes = lanes.length;
      });
      cluster = [];
    };
    list.forEach((e) => {
      if (cluster.length && e.s >= end) flush();
      cluster.push(e);
      end = Math.max(end, e.e);
    });
    flush();
  }

  function render() {
    const dates = days.map((d) => {
      const x = new Date(MONDAY);
      x.setDate(MONDAY.getDate() + d);
      return x;
    });
    const tot = days.map((d) => entries.filter((e) => e.d === d).reduce((s, e) => s + (e.e - e.s), 0));
    wk.innerHTML = `
      <div class="wk-head"><div></div>${days
        .map((d, i) => {
          const hol = HOLIDAYS[kd(dates[i])];
          return `<div class="${d === TODAY_IDX ? 'today' : ''}"><span class="dn">${DAYN[d]}</span> <span class="dd">${dates[i].getDate()}.</span><br><span class="dt">${tot[i] ? dur(tot[i]) : '–'}</span>${hol ? `<div class="hol">${hol}</div>` : ''}</div>`;
        })
        .join('')}</div>
      <div class="wk-body">
        <div class="wk-hours">${Array.from({ length: END - START }, (_, i) => `<div>${START + i}:00</div>`).join('')}</div>
        ${days.map((d) => `<div class="wk-col ${d > 4 ? 'we' : ''} ${d === TODAY_IDX ? 'today' : ''}" data-d="${d}" style="height:${(END - START) * H}px"></div>`).join('')}
      </div>`;
    days.forEach((d) => {
      const col = wk.querySelector<HTMLElement>(`.wk-col[data-d="${d}"]`)!;
      const list = entries.filter((e) => e.d === d);
      layoutDay(list);
      list.forEach((e) => {
        const top = topOf(e.s);
        const ht = Math.max(((e.e - e.s) / 60) * H - 2, 14);
        const w = 100 / (e.lanes ?? 1);
        const p = PROJECTS[e.p];
        const el = h(`<div class="ev ${e.running ? 'running' : ''} ${e.isNew ? 'new' : ''}" data-id="${e.id}" style="--c:${p.color};top:${top}px;height:${ht}px;left:calc(${(e.lane ?? 0) * w}% + 2px);right:auto;width:calc(${w}% - 4px)">
          <div class="t1">${esc(e.title)}</div>
          ${ht > 30 ? `<div class="t2"><i></i>${esc(p.name)}</div>` : ''}
          ${ht > 46 ? `<div class="t3">${hm(e.s)}–${e.running ? 'läuft' : hm(e.e)}</div>` : ''}
        </div>`);
        e.isNew = false;
        col.appendChild(el);
      });
      if (d === TODAY_IDX) col.appendChild(h(`<div class="now-line" style="top:${topOf(NOW)}px"></div>`));
    });
  }

  function place(popEl: HTMLElement, col: HTMLElement, top: number) {
    const wr = wk.getBoundingClientRect();
    const cr = col.getBoundingClientRect();
    let left = cr.right - wr.left + 6;
    if (left + 250 > wr.width) left = cr.left - wr.left - 256;
    if (left < 0) left = Math.max(0, (wr.width - 250) / 2);
    popEl.style.left = left + 'px';
    popEl.style.top = Math.max(0, Math.min(top + 40, wk.offsetHeight - 200)) + 'px';
    // Auf Touch-Geräten folgt dem Tipp ein Klick an derselben Stelle. Der darf nicht
    // im gerade geöffneten Popover landen.
    popEl.style.pointerEvents = 'none';
    setTimeout(() => {
      popEl.style.pointerEvents = '';
    }, 400);
    wk.appendChild(popEl);
  }

  function showEntry(e: Entry, col: HTMLElement) {
    closePop();
    const p = PROJECTS[e.p];
    pop = h(`<div class="pop" role="dialog" aria-label="Eintrag"><button class="x" aria-label="Schließen">×</button>
      <h4>${esc(e.title)}</h4>
      <div class="row"><span class="chip" style="--c:${p.color};cursor:default"><i></i>${esc(p.name)}</span></div>
      <div class="row muted" style="font-size:12px">${esc(p.client)}</div>
      <div class="row mono">${DAYN[e.d]} · ${hm(e.s)}–${e.running ? hm(NOW) + ' (läuft)' : hm(e.e)} · ${dur(e.e - e.s)}</div>
      <div class="row">${e.tags.map((x) => `<span class="tag">#${esc(x)}</span>`).join(' ')} ${
        e.bill
          ? '<span class="tag" style="background:var(--sprout-100);color:var(--live-text)">€ abrechenbar</span>'
          : '<span class="tag">nicht abrechenbar</span>'
      }</div>
      <div class="hint"><span class="hint-mouse">Ziehen verschiebt, <kbd>s</kbd> teilt den Eintrag</span><span class="hint-touch">In der App verschiebst du Einträge per Drag</span></div>
    </div>`);
    pop.querySelector<HTMLButtonElement>('.x')!.onclick = closePop;
    place(pop, col, topOf(e.s));
  }

  function showCreate(d: number, s: number, e: number, col: HTMLElement) {
    const el = h(`<div class="pop" role="dialog" aria-label="Neuer Eintrag"><button class="x" aria-label="Schließen">×</button>
      <h4>Neuer Eintrag</h4>
      <div class="row mono">${DAYN[d]} · ${hm(s)}–${hm(e)} · ${dur(e - s)}</div>
      <input class="title-in" placeholder="Woran hast du gearbeitet?" aria-label="Beschreibung" style="width:100%;margin-top:8px;height:32px;border:1px solid var(--border);border-radius:6px;padding:0 8px;font:inherit;font-size:13px">
      <div class="chips">${PROJECT_KEYS.map((k) => `<button class="chip" data-p="${k}" style="--c:${PROJECTS[k].color}"><i></i>${esc(PROJECTS[k].name)}</button>`).join('')}</div>
      <div class="hint">Projekt wählen legt den Eintrag an</div>
    </div>`);
    pop = el;
    el.querySelector<HTMLButtonElement>('.x')!.onclick = closePop;
    el.querySelectorAll<HTMLButtonElement>('[data-p]').forEach((b) => {
      b.onclick = () => {
        const p = b.dataset.p as ProjectKey;
        const title = el.querySelector<HTMLInputElement>('.title-in')!.value.trim() || PROJECTS[p].name;
        entries.push({ id: nextId(), d, s, e, p, title, tags: [], bill: BILLABLE[p], isNew: true });
        closePop();
        render();
      };
    });
    place(el, col, topOf(s));
    setTimeout(() => el.querySelector<HTMLInputElement>('.title-in')?.focus({ preventScroll: true }), 30);
  }

  const snap = (min: number) => Math.round(min / 15) * 15;
  const yToMin = (col: HTMLElement, y: number) => START * 60 + ((y - col.getBoundingClientRect().top) / H) * 60;
  const colAt = (x: number) =>
    [...wk.querySelectorAll<HTMLElement>('.wk-col')].find((c) => {
      const r = c.getBoundingClientRect();
      return x >= r.left && x <= r.right;
    });

  wk.addEventListener('pointerdown', (ev) => {
    const target = ev.target as HTMLElement;
    if (target.closest('.pop')) return;
    const evEl = target.closest<HTMLElement>('.ev');
    const col = target.closest<HTMLElement>('.wk-col');
    if (!col) {
      closePop();
      return;
    }
    // Touch: Die Seite muss scrollbar bleiben. Deshalb nur Tippen auswerten:
    // Tipp auf Eintrag öffnet ihn, Tipp auf freie Fläche legt eine Stunde an.
    if (ev.pointerType === 'touch') {
      handleTap(ev, col, evEl);
      return;
    }
    ev.preventDefault();

    // Bestehenden Eintrag verschieben oder öffnen
    if (evEl && !evEl.classList.contains('draft')) {
      const e = entries.find((x) => x.id === Number(evEl.dataset.id))!;
      const off = yToMin(col, ev.clientY) - e.s;
      const len = e.e - e.s;
      let moved = false;
      let ns = e.s;
      let nd = e.d;
      const sx = ev.clientX;
      const sy = ev.clientY;
      const mv = (m: PointerEvent) => {
        if (!moved && Math.hypot(m.clientX - sx, m.clientY - sy) < 5) return;
        if (e.running) return;
        if (!moved) {
          closePop();
          moved = true;
          evEl.classList.add('drag');
        }
        const c = colAt(m.clientX) ?? col;
        ns = Math.max(START * 60, Math.min(END * 60 - len, snap(yToMin(c, m.clientY) - off)));
        nd = Number(c.dataset.d);
        evEl.style.top = topOf(ns) + 'px';
        if (c !== evEl.parentElement) c.appendChild(evEl);
      };
      const up = () => {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        if (!moved) {
          showEntry(e, col);
          return;
        }
        e.s = ns;
        e.e = ns + len;
        e.d = nd;
        render();
      };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
      return;
    }

    // Neuen Eintrag aufziehen
    closePop();
    const d = Number(col.dataset.d);
    const s0 = snap(yToMin(col, ev.clientY) - 7);
    const draft = h(`<div class="ev draft" style="top:${topOf(s0)}px;height:${H / 2}px"><div class="t1"></div></div>`);
    col.appendChild(draft);
    let s = s0;
    let e = s0 + 30;
    const label = () => {
      draft.querySelector('.t1')!.textContent = `${hm(s)}–${hm(e)}`;
    };
    const mv = (m: PointerEvent) => {
      const cur = snap(yToMin(col, m.clientY));
      s = Math.max(START * 60, Math.min(s0, cur));
      e = Math.min(END * 60, Math.max(s0 + 15, cur));
      draft.style.top = topOf(s) + 'px';
      draft.style.height = ((e - s) / 60) * H - 2 + 'px';
      label();
    };
    const up = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      label();
      showCreate(d, s, e, col);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  });

  function handleTap(ev: PointerEvent, col: HTMLElement, evEl: HTMLElement | null) {
    const sx = ev.clientX;
    const sy = ev.clientY;
    const done = () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', done);
    };
    const up = (u: PointerEvent) => {
      done();
      if (Math.hypot(u.clientX - sx, u.clientY - sy) > 8) return;
      if (evEl && !evEl.classList.contains('draft')) {
        const e = entries.find((x) => x.id === Number(evEl.dataset.id));
        if (e) showEntry(e, col);
        return;
      }
      closePop();
      const d = Number(col.dataset.d);
      const s = Math.max(START * 60, Math.min(END * 60 - 60, snap(yToMin(col, sy) - 30)));
      const draft = h(`<div class="ev draft" style="top:${topOf(s)}px;height:${H - 2}px"><div class="t1">${hm(s)}–${hm(s + 60)}</div></div>`);
      col.appendChild(draft);
      showCreate(d, s, s + 60, col);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', done);
  }

  document.addEventListener('keydown', (k) => {
    if (k.key === 'Escape') closePop();
  });
  render();
}
