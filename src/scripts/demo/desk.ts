import { PROJECTS, PROJECT_KEYS, dur, esc, h, hm, t, type ProjectKey } from './data';

export interface DeskOptions {
  /** Kleine Variante für den Hero: ohne Favoriten, ohne Kalender-Tab */
  compact?: boolean;
}

export interface DeskApi {
  setAway(v: boolean): void;
  setTab(v: 'list' | 'cal'): void;
}

interface Suggestion {
  id: number;
  kind: 'meet' | 'repo' | 'site';
  label: string;
  s: string;
  e: string;
  meta: string;
  /** Projekt, auf das diese Quelle zuletzt gebucht wurde */
  hint: ProjectKey;
  group?: number;
}

interface Tracked {
  s: string;
  e: string;
  title: string;
  p: ProjectKey;
  isNew?: boolean;
  run?: boolean;
}

const RUN_TITLE = 'Release-Checkliste';
const RUN_START = '14:00';
const START_SECS = 37 * 60 + 12;

/**
 * Desktop-Tracker: Timer, Vorschläge unter "Nicht erfasst", Kalender-Spur mit
 * Aktivitäts- und Meeting-Bändern, Abwesenheits-Frage nach der Mittagspause.
 */
export function mountDesk(root: HTMLElement & { _desk?: DeskApi }, opts: DeskOptions = {}): void {
  const compact = !!opts.compact;
  const sugs: Suggestion[] = [
    { id: 1, kind: 'meet', label: 'Weekly mit TechVision', s: '09:30', e: '10:15', meta: 'Stichwort „Weekly“ · Mikrofon in Zoom', hint: 'app' },
    { id: 2, kind: 'repo', label: 'techvision/mobile-app · feature/onboarding', s: '10:20', e: '11:40', meta: 'VS Code · iTerm', hint: 'app', group: 1 },
    { id: 3, kind: 'site', label: 'figma.com · Onboarding Flow v3', s: '11:40', e: '12:05', meta: 'Arc', hint: 'app', group: 1 },
    { id: 4, kind: 'site', label: 'github.com · musterfabrik/relaunch #128', s: '13:10', e: '13:45', meta: 'Arc · VS Code', hint: 'web' },
  ];
  const tracked: Tracked[] = [{ s: '08:40', e: '09:30', title: 'Mails & Tagesplanung', p: 'intern' }];
  let secs = START_SECS;
  let running = true;
  let tab: 'list' | 'cal' = 'list';
  let away = false;
  const P = PROJECTS;

  root.innerHTML = `<div class="desk">
    <div class="desk-title"><i></i><i></i><i></i><span><img src="/logo.svg" alt="" width="14" height="14">timebench</span></div>
    <div class="desk-bar">
      <div class="row"><div style="min-width:0;flex:1"><div class="desc">${RUN_TITLE}</div>
        <div class="meta"><span class="chip" style="--c:${P.web.color};cursor:default"><i></i>${P.web.name}</span><span class="tag">€</span></div></div>
        <span class="clock" aria-live="off">0:37:12</span><button class="stop" aria-label="Timer stoppen"></button></div>
      <div class="desk-away"><p>Keine Aktivität seit 12:05 (55 min)</p><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm aw-stop">Um 12:05 stoppen</button><button class="btn btn-sm btn-ghost aw-keep">Zeit behalten</button></div></div>
    </div>
    ${compact ? '' : `<div class="desk-fav"><span class="chip" style="--c:${P.app.color}"><i></i>Onboarding-Flow</span><span class="chip" style="--c:${P.shop.color}"><i></i>Checkout</span><span class="chip" style="--c:${P.wart.color}"><i></i>Support</span><span class="chip" style="--c:${P.intern.color}"><i></i>Mails</span></div>`}
    <div class="desk-nav"><span>Heute</span><div class="tabs"><button data-t="list" class="on">Liste <span class="cnt"></span></button>${compact ? '' : '<button data-t="cal">Kalender</button>'}</div></div>
    <div class="desk-pane"></div>
    <div class="desk-foot"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></svg>Aktivitätsdaten bleiben auf diesem Rechner</div>
    <div class="desk-modal"><div class="sheet" role="dialog" aria-label="Buchen"></div></div>
  </div>`;

  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const pane = $('.desk-pane');
  const clock = $('.clock');
  const stopBtn = $<HTMLButtonElement>('.stop');
  const modal = $('.desk-modal');
  const awayBox = $('.desk-away');
  const fmtS = (s: number) =>
    `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  setInterval(() => {
    if (running && !away) {
      secs++;
      clock.textContent = fmtS(secs);
    }
  }, 1000);

  stopBtn.onclick = () => {
    running = !running;
    stopBtn.classList.toggle('play', !running);
    stopBtn.setAttribute('aria-label', running ? 'Timer stoppen' : 'Timer starten');
    if (!running) {
      tracked.push({ s: RUN_START, e: hm(t(RUN_START) + Math.max(1, Math.floor(secs / 60))), title: RUN_TITLE, p: 'web', isNew: true });
      render();
    } else {
      secs = 0;
      clock.textContent = fmtS(0);
    }
  };
  $<HTMLButtonElement>('.aw-stop').onclick = () => {
    away = false;
    running = false;
    stopBtn.classList.add('play');
    awayBox.classList.remove('show');
    clock.textContent = fmtS(START_SECS);
    render();
  };
  $<HTMLButtonElement>('.aw-keep').onclick = () => {
    away = false;
    awayBox.classList.remove('show');
  };
  root.querySelectorAll<HTMLButtonElement>('.desk-nav [data-t]').forEach((b) => {
    b.onclick = () => {
      tab = b.dataset.t as 'list' | 'cal';
      root.querySelectorAll('.desk-nav [data-t]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    };
  });

  function openBook(sg: Suggestion) {
    const sheet = $('.sheet');
    const order = [sg.hint, ...PROJECT_KEYS.filter((k) => k !== sg.hint)].slice(0, 4);
    let pick: ProjectKey = sg.hint;
    sheet.innerHTML = `<h5>${esc(sg.label)}</h5><div class="muted mono" style="font-size:11px">${sg.s}–${sg.e} · ${dur(t(sg.e) - t(sg.s))}</div>
      <div class="opts">${order.map((k) => `<button class="opt ${k === pick ? 'sel' : ''}" data-p="${k}" style="--c:${P[k].color}"><i></i>${P[k].name}${k === sg.hint ? '<small>zuletzt hierfür gebucht</small>' : ''}</button>`).join('')}</div>
      <div style="display:flex;gap:6px"><button class="btn btn-sm ok" style="flex:1">Buchen</button><button class="btn btn-sm btn-ghost no">Abbrechen</button></div>`;
    sheet.querySelectorAll<HTMLButtonElement>('.opt').forEach((o) => {
      o.onclick = () => {
        pick = o.dataset.p as ProjectKey;
        sheet.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === o));
      };
    });
    sheet.querySelector<HTMLButtonElement>('.no')!.onclick = () => modal.classList.remove('show');
    sheet.querySelector<HTMLButtonElement>('.ok')!.onclick = () => {
      modal.classList.remove('show');
      const row = pane.querySelector(`.sug[data-id="${sg.id}"]`);
      const commit = () => {
        const i = sugs.indexOf(sg);
        if (i >= 0) sugs.splice(i, 1);
        const title = sg.kind === 'meet' ? sg.label : (sg.label.split(' · ')[1] ?? sg.label);
        tracked.push({ s: sg.s, e: sg.e, title, p: pick, isNew: true });
        tracked.sort((a, b) => t(a.s) - t(b.s));
        render();
      };
      if (row) {
        row.classList.add('gone');
        setTimeout(commit, 330);
      } else commit();
    };
    modal.classList.add('show');
  }

  function renderList() {
    const seen = new Set<number>();
    let html = '';
    const rowHtml = (sg: Suggestion) => `<div class="sug ${sg.kind === 'meet' ? 'meet' : ''}" data-id="${sg.id}"><div class="b">
        <div class="l">${sg.kind === 'meet' ? '<span class="badge meet">Meeting</span> ' : ''}${esc(sg.label)}</div>
        <div class="s"><span class="mono">${sg.s}–${sg.e}</span><span>${dur(t(sg.e) - t(sg.s))}</span><span>${esc(sg.meta)}</span></div>
        ${compact ? '' : `<div class="s" style="margin-top:3px"><span class="badge hint">→ ${P[sg.hint].name}</span></div>`}
      </div><button class="book">Buchen</button></div>`;
    if (sugs.length) {
      html += '<div class="desk-h">Nicht erfasst</div>';
      sugs.forEach((sg) => {
        if (sg.group === undefined) {
          html += rowHtml(sg);
          return;
        }
        if (seen.has(sg.group)) return;
        seen.add(sg.group);
        const g = sugs.filter((x) => x.group === sg.group);
        html += g.length > 1
          ? `<div class="desk-group"><small>Ohne Pause, ${g[0].s}–${g[g.length - 1].e}</small>${g.map(rowHtml).join('')}</div>`
          : rowHtml(g[0]);
      });
    } else html += '<div class="desk-h" style="color:var(--live-text)">Alles erfasst für heute</div>';
    if (!compact || !sugs.length) {
      html += '<div class="desk-h">Erfasst</div>' + tracked
        .map((x) => `<div class="tracked ${x.isNew ? 'new' : ''}" style="--c:${P[x.p].color}"><i></i><div class="b"><div>${esc(x.title)}</div><small>${P[x.p].name}</small></div><span class="mono">${x.s}–${x.e}</span></div>`)
        .join('');
    }
    tracked.forEach((x) => {
      x.isNew = false;
    });
    pane.innerHTML = html;
    pane.querySelectorAll<HTMLButtonElement>('.sug .book').forEach((b) => {
      b.onclick = () => {
        const id = Number(b.closest<HTMLElement>('.sug')!.dataset.id);
        const sg = sugs.find((s) => s.id === id);
        if (sg) openBook(sg);
      };
    });
  }

  function renderCal() {
    const S = 8;
    const E = 15;
    const H = 34;
    const y = (s: string) => ((t(s) - S * 60) / 60) * H;
    const acts: Array<[string, string, number | null]> = [
      ['08:40', '09:30', null], ['09:30', '10:15', 1], ['10:20', '11:40', 2], ['11:40', '12:05', 3], ['13:10', '13:45', 4],
    ];
    pane.innerHTML = `<div class="desk-cal" style="--h:${H}px">
      <div class="colh"></div><div class="colh">Akt.</div><div class="colh">Mtg.</div><div class="colh">Einträge</div>
      <div class="hrs">${Array.from({ length: E - S }, (_, i) => `<div>${S + i}:00</div>`).join('')}</div>
      <div class="col c-act" style="height:${(E - S) * H}px"></div><div class="col c-mt"></div><div class="col c-ev"></div>
    </div>`;
    const ca = pane.querySelector<HTMLElement>('.c-act')!;
    const cm = pane.querySelector<HTMLElement>('.c-mt')!;
    const ce = pane.querySelector<HTMLElement>('.c-ev')!;
    acts.forEach(([s, e, id]) => {
      const open = id !== null ? sugs.find((x) => x.id === id) : undefined;
      const b = h(`<div class="band act ${open ? '' : 'booked'}" style="top:${y(s)}px;height:${y(e) - y(s) - 1}px" title="${s}–${e}"></div>`);
      if (open) b.onclick = () => showActPop(open, b);
      ca.appendChild(b);
    });
    ca.appendChild(h(`<div class="band act live" style="top:${y(RUN_START)}px;height:${y('14:37') - y(RUN_START)}px" title="wird noch aufgezeichnet"></div>`));
    const meet = sugs.find((x) => x.id === 1);
    const mb = h(`<div class="band mt" style="top:${y('09:30')}px;height:${y('10:15') - y('09:30') - 1}px" title="Weekly mit TechVision"></div>`);
    if (meet) mb.onclick = () => showActPop(meet, mb);
    cm.appendChild(mb);
    const all: Tracked[] = running ? [...tracked, { s: RUN_START, e: '14:37', title: RUN_TITLE, p: 'web', run: true }] : tracked;
    all.forEach((x) => {
      ce.appendChild(h(`<div class="ev ${x.run ? 'running' : ''}" style="--c:${P[x.p].color};top:${y(x.s)}px;height:${Math.max(y(x.e) - y(x.s) - 2, 14)}px;left:2px;right:2px"><div class="t1">${esc(x.title)}</div></div>`));
    });
    ce.appendChild(h(`<div class="now-line" style="top:${y('14:37')}px"></div>`));
  }

  function showActPop(sg: Suggestion, band: HTMLElement) {
    pane.querySelectorAll('.desk-pop').forEach((x) => x.remove());
    const apps: Array<[string, number, string]> =
      sg.kind === 'meet'
        ? [['Zoom', 88, '#2d8cff'], ['Arc', 12, '#ea3d92']]
        : sg.kind === 'repo'
          ? [['VS Code', 61, '#4f7cff'], ['iTerm', 31, '#17160f'], ['Arc', 8, '#ea3d92']]
          : [['Arc', 78, '#ea3d92'], ['VS Code', 22, '#4f7cff']];
    const g = sg.group !== undefined ? sugs.filter((x) => x.group === sg.group) : [sg];
    const pop = h(`<div class="desk-pop"><h5>${esc(sg.label)}</h5><div class="mono muted">${sg.s}–${sg.e}</div>
      <div class="bar">${apps.map((a) => `<span style="width:${a[1]}%;background:${a[2]}"></span>`).join('')}</div>
      <div class="apps">${apps.map((a) => `<div><span>${a[0]}</span><span class="mono">${a[1]} %</span></div>`).join('')}</div>
      <div class="acts"><button class="p1">Diesen Teil übernehmen</button>${g.length > 1 ? `<button class="p2">Ganzen Block übernehmen (${g[0].s}–${g[g.length - 1].e})</button>` : ''}</div></div>`);
    const cal = pane.querySelector<HTMLElement>('.desk-cal')!;
    pop.style.top = Math.min(band.offsetTop + 14, cal.offsetHeight - 160) + 'px';
    pop.style.left = '62px';
    cal.appendChild(pop);
    pop.querySelector<HTMLButtonElement>('.p1')!.onclick = () => {
      pop.remove();
      openBook(sg);
    };
    const p2 = pop.querySelector<HTMLButtonElement>('.p2');
    if (p2) {
      p2.onclick = () => {
        pop.remove();
        const merged: Suggestion = {
          ...sg,
          id: -1,
          label: g.map((x) => x.label.split(' · ')[0]).join(' + '),
          s: g[0].s,
          e: g[g.length - 1].e,
        };
        g.slice(1).forEach((x) => sugs.splice(sugs.indexOf(x), 1));
        sugs.splice(sugs.indexOf(sg), 1, merged);
        openBook(merged);
      };
    }
    setTimeout(() => {
      const off = (e: PointerEvent) => {
        if (!pop.contains(e.target as Node)) {
          pop.remove();
          document.removeEventListener('pointerdown', off);
        }
      };
      document.addEventListener('pointerdown', off);
    }, 0);
  }

  function render() {
    root.querySelectorAll<HTMLElement>('.cnt').forEach((c) => {
      c.textContent = String(sugs.length);
      c.style.display = sugs.length ? '' : 'none';
    });
    if (tab === 'list') renderList();
    else renderCal();
  }
  render();

  root._desk = {
    setAway(v) {
      away = v;
      awayBox.classList.toggle('show', v);
      if (v) {
        running = true;
        stopBtn.classList.remove('play');
      }
    },
    setTab(v) {
      root.querySelector<HTMLButtonElement>(`.desk-nav [data-t="${v}"]`)?.click();
    },
  };
}
