/**
 * Mountet alle Dummies ([data-demo]) und die kleinen Interaktionen der Seiten.
 * Eingebunden über components/demo/Demo.astro; Astro bündelt das Script einmal pro Seite.
 */
import { mountWeek } from './week';
import { mountMonth } from './month';
import { mountTimesheet } from './timesheet';
import { mountYear } from './year';
import { mountTeam } from './team';
import { mountDesk, type DeskApi } from './desk';
import { mountQuick } from './quick';
import { mountReport } from './report';
import { mountGaps } from './gaps';
import { mountPunchcard } from './punchcard';
import { mountSchedule } from './schedule';

type Mount = (el: HTMLElement, opts: Record<string, unknown>) => void;

const MOUNTS: Record<string, Mount> = {
  week: mountWeek as Mount,
  month: mountMonth as Mount,
  timesheet: mountTimesheet as Mount,
  year: mountYear as Mount,
  team: mountTeam as Mount,
  desk: mountDesk as Mount,
  quick: mountQuick as Mount,
  report: mountReport as Mount,
  gaps: mountGaps as Mount,
  punchcard: mountPunchcard as Mount,
  schedule: mountSchedule as Mount,
};

function mountAll(scope: ParentNode) {
  scope.querySelectorAll<HTMLElement>('[data-demo]').forEach((el) => {
    if (el.dataset.mounted) return;
    // In versteckten Tabs erst beim Öffnen mounten, damit die Breite stimmt.
    if (el.closest('.panel:not(.on)')) return;
    el.dataset.mounted = '1';
    const opts: Record<string, unknown> = el.dataset.opts ? JSON.parse(el.dataset.opts) : {};
    if (el.dataset.demo === 'month') {
      opts.onDay = () => el.closest('[data-tour]')?.querySelector<HTMLButtonElement>('.tour-tabs [data-tab="week"]')?.click();
    }
    MOUNTS[el.dataset.demo!]?.(el, opts);
  });
}

function initTours() {
  document.querySelectorAll<HTMLElement>('[data-tour]').forEach((tour) => {
    const buttons = tour.querySelectorAll<HTMLButtonElement>('.tour-tabs button');
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        buttons.forEach((x) => {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-selected', String(x === b));
        });
        tour.querySelectorAll<HTMLElement>('.panel').forEach((p) => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
        tour.querySelectorAll<HTMLElement>('.tour-cap [data-cap]').forEach((c) => {
          c.hidden = c.dataset.cap !== b.dataset.tab;
        });
        const title = tour.querySelector<HTMLElement>('[data-title-slot]');
        if (title && b.dataset.title) title.textContent = b.dataset.title;
        mountAll(tour);
      }),
    );
  });
}

function initScenes() {
  document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((b) =>
    b.addEventListener('click', () => {
      const target = document.querySelector<HTMLElement & { _desk?: DeskApi }>(b.dataset.target!);
      const desk = target?._desk;
      if (!desk) return;
      if (b.dataset.scene === 'away') desk.setAway(true);
      if (b.dataset.scene === 'cal') desk.setTab('cal');
      if (b.dataset.scene === 'list') desk.setTab('list');
    }),
  );
}

function initSmallInteractions() {
  // Freigabe-Inbox
  document.querySelectorAll<HTMLButtonElement>('.inbox .acts button').forEach((b) =>
    b.addEventListener('click', () => {
      const ok = b.classList.contains('ok');
      b.closest('.acts')!.outerHTML = `<span class="st ${ok ? 'ok' : 'no'}">${ok ? 'Genehmigt' : 'Abgelehnt'}</span>`;
    }),
  );

  // Auffälligkeiten als geklärt markieren
  document.querySelectorAll<HTMLElement>('.frow').forEach((r) =>
    r.addEventListener('click', () => {
      r.classList.toggle('ok');
      const list = r.closest('.flist')!;
      const open = list.querySelectorAll('.frow:not(.ok)').length;
      const c = list.querySelector('.fcount');
      if (c) c.textContent = open ? `${open} offen` : 'alles geklärt';
    }),
  );

  // Monatsabschluss
  document.querySelectorAll<HTMLButtonElement>('.close-row [data-close]').forEach((b) =>
    b.addEventListener('click', () => {
      const cell = b.parentElement!;
      cell.classList.add('locked');
      cell.classList.remove('cur');
      const s = document.createElement('span');
      s.textContent = '🔒 abgeschlossen';
      b.replaceWith(s);
    }),
  );

  // Report-Balken beim Sichtbarwerden wachsen lassen
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll<HTMLElement>('[data-w]').forEach((bar) => {
          bar.style.width = bar.dataset.w + '%';
        });
        io.unobserve(e.target);
      }),
    { threshold: 0.3 },
  );
  document.querySelectorAll('.report').forEach((r) => io.observe(r));

  // Toggl-Abgleich (nur Anzeige)
  document.querySelectorAll<HTMLButtonElement>('[data-sync]').forEach((b) =>
    b.addEventListener('click', () => {
      const box = b.closest('.sync')!;
      const log = box.querySelector<HTMLElement>('.sync-log')!;
      const when = box.querySelector<HTMLElement>('[data-sync-when]')!;
      b.disabled = true;
      log.innerHTML = '<span class="spin"></span> gleiche mit Toggl ab …';
      setTimeout(() => {
        log.textContent = '✓ 3 neue Einträge übernommen, 1 gelöschter entfernt, 0 Konflikte';
        when.textContent = 'gerade eben';
        b.disabled = false;
      }, 1400);
    }),
  );

  // Rangfolge der Stundensätze
  document.querySelectorAll<HTMLElement>('[data-cascade]').forEach((wrap) =>
    wrap.querySelectorAll<HTMLButtonElement>('button').forEach((b) =>
      b.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        const lvl = Number(b.dataset.lvl);
        wrap.querySelectorAll<HTMLElement>('.cascade > div').forEach((d) => {
          const l = Number(d.dataset.l);
          d.classList.toggle('win', l === lvl);
          d.classList.toggle('skip', l < lvl);
        });
      }),
    ),
  );
}

initTours();
initScenes();
initSmallInteractions();
// Nach dem ersten Layout messen, damit die Wochenansicht die richtige Spaltenzahl wählt.
requestAnimationFrame(() => mountAll(document));
