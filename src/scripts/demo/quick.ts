import { PROJECTS, PROJECT_KEYS, esc, hm, type ProjectKey } from './data';

interface Running {
  title: string;
  p: ProjectKey | null;
  tags: string[];
  start: number;
}

interface Done {
  title: string;
  p: ProjectKey | null;
  tags: string[];
  min: number;
  isNew?: boolean;
}

const TAGS = ['design', 'frontend', 'backend', 'meeting', 'support', 'review'];

/**
 * Schnelleingabe: Beschreibung tippen, @ wählt das Projekt, # ein Tag, Enter startet den Timer.
 * Spielt sich beim ersten Sichtbarwerden einmal selbst vor, bis jemand ins Feld klickt.
 */
export function mountQuick(root: HTMLElement): void {
  const today: Done[] = [
    { title: 'Mails & Tagesplanung', p: 'intern', tags: [], min: 35 },
    { title: 'Weekly mit TechVision', p: 'app', tags: ['meeting'], min: 45 },
    { title: 'Onboarding-Flow', p: 'app', tags: ['frontend'], min: 105 },
  ];
  let running: Running | null = { title: 'PR 128 Review', p: 'web', tags: ['review'], start: Date.now() - 23 * 60 * 1000 };
  let chosen: ProjectKey | null = null;
  let chosenTags: string[] = [];
  let menu: { kind: 'p' | 't'; items: string[]; idx: number } | null = null;
  let autoplay = true;

  root.innerHTML = `<div class="qe">
    <div class="qe-bar">
      <div class="qe-field">
        <div class="qe-tokens"></div>
        <input type="text" placeholder="Woran arbeitest du?" aria-label="Woran arbeitest du? @ für Projekt, # für Tag" autocomplete="off" spellcheck="false">
        <div class="qe-menu" role="listbox" hidden></div>
      </div>
      <button class="qe-go" type="button" aria-label="Timer starten"></button>
    </div>
    <div class="qe-run"></div>
    <div class="qe-cols">
      <div class="qe-today"><div class="qe-h">Heute</div><div class="qe-list"></div></div>
      <div class="qe-sums"><div class="qe-h">Nach Kunde</div><div class="qe-bars"></div></div>
    </div>
    <div class="hint"><kbd>@</kbd> Projekt · <kbd>#</kbd> Tag · <kbd>↵</kbd> Timer starten</div>
  </div>`;

  const input = root.querySelector<HTMLInputElement>('input')!;
  const tokens = root.querySelector<HTMLElement>('.qe-tokens')!;
  const menuEl = root.querySelector<HTMLElement>('.qe-menu')!;
  const runEl = root.querySelector<HTMLElement>('.qe-run')!;
  const listEl = root.querySelector<HTMLElement>('.qe-list')!;
  const barsEl = root.querySelector<HTMLElement>('.qe-bars')!;

  const elapsed = () => (running ? Math.floor((Date.now() - running.start) / 1000) : 0);
  const fmtS = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  function renderTokens() {
    tokens.innerHTML =
      (chosen ? `<span class="qe-tok p" style="--c:${PROJECTS[chosen].color}"><i></i>${esc(PROJECTS[chosen].name)}</span>` : '') +
      chosenTags.map((t) => `<span class="qe-tok t">#${esc(t)}</span>`).join('');
  }

  function renderRun() {
    if (!running) {
      runEl.innerHTML = '<div class="qe-idle">Kein Timer läuft.</div>';
      return;
    }
    const p = running.p ? PROJECTS[running.p] : null;
    runEl.innerHTML = `<div class="qe-running"><span class="pulse"></span><div class="b"><b>${esc(running.title)}</b><small>${p ? `<i style="background:${p.color}"></i>${esc(p.name)} · ${esc(p.client)}` : 'ohne Projekt'}${running.tags.map((t) => ` · #${esc(t)}`).join('')}</small></div><span class="mono qe-clock">${fmtS(elapsed())}</span><button type="button" class="qe-stop" aria-label="Timer stoppen"></button></div>`;
    runEl.querySelector<HTMLButtonElement>('.qe-stop')!.onclick = () => {
      stopRunning();
      render();
    };
  }

  function renderToday() {
    listEl.innerHTML = today
      .slice()
      .reverse()
      .map((d) => {
        const p = d.p ? PROJECTS[d.p] : null;
        return `<div class="qe-row ${d.isNew ? 'new' : ''}" style="--c:${p?.color ?? 'var(--border)'}"><i></i><div class="b"><div>${esc(d.title)}</div><small>${p ? esc(p.name) : 'ohne Projekt'}${d.tags.map((t) => ` · #${esc(t)}`).join('')}</small></div><span class="mono">${hm(d.min)}</span></div>`;
      })
      .join('');
    today.forEach((d) => {
      d.isNew = false;
    });
    const byClient = new Map<string, { min: number; color: string }>();
    today.forEach((d) => {
      const p = d.p ? PROJECTS[d.p] : null;
      const k = p?.client ?? 'ohne Projekt';
      const cur = byClient.get(k) ?? { min: 0, color: p?.color ?? '#c9c6ba' };
      cur.min += d.min;
      byClient.set(k, cur);
    });
    const max = Math.max(...[...byClient.values()].map((v) => v.min), 1);
    barsEl.innerHTML = [...byClient.entries()]
      .sort((a, b) => b[1].min - a[1].min)
      .map(([k, v]) => `<div class="qe-sum"><span>${esc(k)}</span><div class="track"><b style="width:${(v.min / max) * 100}%;background:${v.color}"></b></div><span class="mono">${hm(v.min)}</span></div>`)
      .join('');
  }

  function render() {
    renderTokens();
    renderRun();
    renderToday();
  }

  function stopRunning() {
    if (!running) return;
    today.push({ title: running.title, p: running.p, tags: running.tags, min: Math.max(1, Math.round(elapsed() / 60)), isNew: true });
    running = null;
  }

  function start() {
    const raw = input.value.replace(/[@#]\S*$/, '').trim();
    const title = raw || (chosen ? PROJECTS[chosen].name : '');
    if (!title) return;
    stopRunning();
    running = { title, p: chosen, tags: chosenTags, start: Date.now() };
    chosen = null;
    chosenTags = [];
    input.value = '';
    closeMenu();
    render();
  }

  function closeMenu() {
    menu = null;
    menuEl.hidden = true;
  }

  function openMenu(kind: 'p' | 't', q: string) {
    const ql = q.toLowerCase();
    const items =
      kind === 'p'
        ? PROJECT_KEYS.filter((k) => (PROJECTS[k].name + ' ' + PROJECTS[k].client).toLowerCase().includes(ql))
        : [...TAGS.filter((t) => t.includes(ql) && !chosenTags.includes(t)), ...(q && !TAGS.includes(ql) ? [`+${ql}`] : [])];
    if (!items.length) {
      closeMenu();
      return;
    }
    menu = { kind, items, idx: 0 };
    drawMenu();
  }

  function drawMenu() {
    if (!menu) return;
    const m = menu;
    menuEl.hidden = false;
    menuEl.innerHTML = m.items
      .map((it, i) => {
        if (m.kind === 'p') {
          const p = PROJECTS[it as ProjectKey];
          return `<button type="button" role="option" class="${i === m.idx ? 'on' : ''}" data-i="${i}"><i style="background:${p.color}"></i>${esc(p.name)}<small>${esc(p.client)}</small></button>`;
        }
        return `<button type="button" role="option" class="${i === m.idx ? 'on' : ''}" data-i="${i}">${it.startsWith('+') ? `Neues Tag <b>#${esc(it.slice(1))}</b>` : `#${esc(it)}`}</button>`;
      })
      .join('');
    menuEl.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      b.onmousedown = (e) => {
        e.preventDefault();
        pick(Number(b.dataset.i));
      };
    });
  }

  function pick(i: number, focus = true) {
    if (!menu) return;
    const it = menu.items[i];
    if (menu.kind === 'p') chosen = it as ProjectKey;
    else chosenTags = [...chosenTags, it.replace(/^\+/, '')];
    input.value = input.value.replace(/[@#]\S*$/, '').replace(/\s+$/, '') + (input.value.trim() ? ' ' : '');
    closeMenu();
    renderTokens();
    if (focus) input.focus();
  }

  input.addEventListener('input', () => {
    const m = input.value.match(/([@#])(\S*)$/);
    if (m) openMenu(m[1] === '@' ? 'p' : 't', m[2]);
    else closeMenu();
  });
  input.addEventListener('keydown', (e) => {
    if (menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      menu.idx = (menu.idx + (e.key === 'ArrowDown' ? 1 : -1) + menu.items.length) % menu.items.length;
      drawMenu();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (menu) pick(menu.idx);
      else start();
    } else if (e.key === 'Escape') closeMenu();
    else if (e.key === 'Backspace' && !input.value) {
      if (chosenTags.length) chosenTags = chosenTags.slice(0, -1);
      else chosen = null;
      renderTokens();
    }
  });
  input.addEventListener('focus', () => {
    autoplay = false;
  });
  input.addEventListener('blur', () => setTimeout(closeMenu, 120));
  root.querySelector<HTMLButtonElement>('.qe-go')!.onclick = () => {
    autoplay = false;
    start();
  };

  setInterval(() => {
    const c = runEl.querySelector('.qe-clock');
    if (c) c.textContent = fmtS(elapsed());
  }, 1000);

  render();

  // Einmalige Vorführung, sobald der Dummy sichtbar ist
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function type(text: string) {
    for (const ch of text) {
      if (!autoplay) return false;
      input.value += ch;
      input.dispatchEvent(new Event('input'));
      await sleep(70);
    }
    return autoplay;
  }
  async function play() {
    await sleep(600);
    if (!(await type('Hero-Varianten @web'))) return;
    await sleep(500);
    if (!autoplay) return;
    pick(0, false);
    if (!(await type('#des'))) return;
    await sleep(500);
    if (!autoplay) return;
    pick(0, false);
    await sleep(600);
    if (!autoplay) return;
    start();
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) {
      io.disconnect();
      play();
    }
  }, { threshold: 0.6 });
  io.observe(root);
}
