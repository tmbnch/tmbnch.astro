import { PROJECTS, esc, hm, t, type ProjectKey } from './data';

interface Block {
  s: string;
  e: string;
  title: string;
  p: ProjectKey;
}

interface Gap {
  s: string;
  e: string;
  source: string;
  kind: 'Repo' | 'Website' | 'Meeting';
  p: ProjectKey;
  title: string;
}

const START = 8;
const END = 18;

/**
 * Tagesende: Zeitleiste eines Tages mit gebuchten Blöcken und den Lücken, in denen der
 * Desktop-Tracker Aktivität gesehen hat. Jede Lücke lässt sich mit einem Tipp füllen.
 */
export function mountGaps(root: HTMLElement): void {
  const blocks: Block[] = [
    { s: '08:40', e: '09:30', title: 'Mails & Tagesplanung', p: 'intern' },
    { s: '10:20', e: '12:05', title: 'Onboarding-Flow', p: 'app' },
    { s: '13:50', e: '16:10', title: 'Checkout: Zahlungsarten', p: 'shop' },
  ];
  const gaps: Gap[] = [
    { s: '09:30', e: '10:15', source: 'Zoom · „Weekly TechVision“', kind: 'Meeting', p: 'app', title: 'Weekly mit TechVision' },
    { s: '13:10', e: '13:45', source: 'github.com/musterfabrik/relaunch', kind: 'Website', p: 'web', title: 'PR 128 Review' },
    { s: '16:10', e: '16:55', source: 'musterfabrik/website · hotfix/kontakt', kind: 'Repo', p: 'wart', title: 'Hotfix Kontaktformular' },
    { s: '17:00', e: '17:25', source: 'figma.com · Onboarding v3', kind: 'Website', p: 'app', title: 'Onboarding Feedback' },
  ];
  // Erkannte Aktivität = gebuchte Blöcke plus Lücken; sind alle Lücken gefüllt, ist der Tag zu 100 % gebucht.
  const ACTIVE = [...blocks, ...gaps].reduce((a, x) => a + t(x.e) - t(x.s), 0);

  root.innerHTML = `<div class="gp">
    <div class="gp-top"><div><b>Donnerstag, 5. November</b><small class="muted">Feierabend · noch nicht alles gebucht</small></div><div class="gp-meter"><span class="gp-num"></span><div class="track"><b></b></div></div></div>
    <div class="gp-line" aria-hidden="true"><div class="gp-axis">${Array.from({ length: END - START + 1 }, (_, i) => `<span style="left:${(i / (END - START)) * 100}%">${START + i}</span>`).join('')}</div><div class="gp-track"></div></div>
    <div class="gp-list"></div>
  </div>`;
  const track = root.querySelector<HTMLElement>('.gp-track')!;
  const list = root.querySelector<HTMLElement>('.gp-list')!;
  const num = root.querySelector<HTMLElement>('.gp-num')!;
  const bar = root.querySelector<HTMLElement>('.gp-meter b')!;
  const pos = (s: string) => ((t(s) - START * 60) / ((END - START) * 60)) * 100;

  function render(flash?: string) {
    track.innerHTML =
      blocks.map((b) => `<div class="gp-b ${flash === b.s ? 'new' : ''}" style="left:${pos(b.s)}%;width:${pos(b.e) - pos(b.s)}%;--c:${PROJECTS[b.p].color}" title="${esc(b.title)}"></div>`).join('') +
      gaps.map((g) => `<div class="gp-g" style="left:${pos(g.s)}%;width:${pos(g.e) - pos(g.s)}%" title="${esc(g.source)}"></div>`).join('');
    list.innerHTML = gaps.length
      ? gaps
          .map(
            (g, i) => `<div class="gp-item"><span class="gp-kind">${g.kind}</span><div class="b"><b class="mono">${g.s}–${g.e}</b> <span class="muted">${hm(t(g.e) - t(g.s))} h</span><div class="gp-src">${esc(g.source)}</div></div>
              <button type="button" class="gp-fill" data-i="${i}" style="--c:${PROJECTS[g.p].color}"><i></i>${esc(PROJECTS[g.p].name)} übernehmen</button></div>`,
          )
          .join('')
      : '<div class="gp-done">Lückenlos. Der Tag ist gebucht.</div>';
    const booked = blocks.reduce((a, b) => a + t(b.e) - t(b.s), 0);
    num.innerHTML = `<b>${hm(booked)}</b> von ${hm(ACTIVE)} h gebucht`;
    bar.style.width = Math.min(100, (booked / ACTIVE) * 100) + '%';
    list.querySelectorAll<HTMLButtonElement>('.gp-fill').forEach((b) =>
      b.addEventListener('click', () => {
        const g = gaps.splice(Number(b.dataset.i), 1)[0];
        blocks.push({ s: g.s, e: g.e, title: g.title, p: g.p });
        render(g.s);
      }),
    );
  }
  render();
}
