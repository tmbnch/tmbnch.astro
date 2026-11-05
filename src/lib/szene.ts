/**
 * Szenen, die beim Scrollen anlaufen.
 *
 * Ein Element mit `data-szene` bekommt `data-szene="an"`, sobald seine Oberkante kurz über
 * dem unteren Bildschirmrand steht. CSS hängt die Animationen daran, JS kann auf das Ereignis
 * `szene:an` hören. Einmalig: Was einmal gelaufen ist, bleibt stehen.
 *
 * Zusätze, alle optional, am selben Element:
 *   data-szene-kinder        Direkte Kinder blenden gestaffelt ein (CSS in styles/szene.css).
 *   data-szene-klick="sel"   Klickt nach dem Anlaufen einmal auf das Element `sel` darin,
 *                            z. B. „Verzug melden“ im Ablaufplan. Verzögerung: data-szene-pause (ms).
 *   data-szene-zaehlen="sel" Zählt die Zahlen in allen Elementen `sel` darin von null hoch.
 *   data-szene-folge="a,b,c" Klickt die Elemente nacheinander an (Intervall data-szene-takt, ms),
 *                            z. B. die Umschalter „heute, 6 Monate, 12 Monate“. Hört auf, sobald
 *                            jemand selbst in die Grafik klickt.
 *
 * Ohne JS oder bei `prefers-reduced-motion` steht alles sofort im Endzustand, automatische
 * Klicks entfallen.
 */
export function szenenStarten(root: ParentNode = document): void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-szene]')].filter(
    (el) => el.dataset.szene !== 'an' && !el.dataset.szeneBeobachtet
  );
  if (!els.length) return;
  const html = document.documentElement;
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  els.forEach((el) => {
    el.dataset.szeneBeobachtet = '1';
    if (el.hasAttribute('data-szene-kinder')) {
      [...el.children].forEach((k, i) =>
        (k as HTMLElement).style.setProperty('--szene-i', String(i))
      );
    }
  });
  if (ruhig || !('IntersectionObserver' in window)) {
    els.forEach((el) => an(el, false));
    return;
  }
  html.classList.add('szenen-ready');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        an(e.target as HTMLElement, true);
        io.unobserve(e.target);
      }
    },
    // Anlaufen, sobald die Oberkante gut sichtbar über dem unteren Rand steht (12 %).
    // Vorher -30 %: flache Blöcke wie das Vertrauensband liefen erst in der Bildschirmmitte an.
    { rootMargin: '0px 0px -12% 0px', threshold: 0 }
  );
  els.forEach((el) => io.observe(el));
}

function an(el: HTMLElement, bewegt: boolean) {
  if (el.dataset.szene === 'an') return;
  el.dataset.szene = 'an';
  el.dispatchEvent(new CustomEvent('szene:an', { bubbles: false }));
  if (bewegt) autoKlick(el);
}

function autoKlick(el: HTMLElement) {
  const zaehlen = el.dataset.szeneZaehlen;
  if (zaehlen) el.querySelectorAll<HTMLElement>(zaehlen).forEach((z) => hochzaehlen(z, 1100));
  let eingegriffen = false;
  el.addEventListener('pointerdown', () => (eingegriffen = true), { once: true, capture: true });
  const pause = Number(el.dataset.szenePause ?? 900);
  const klick = el.dataset.szeneKlick;
  if (klick) {
    window.setTimeout(() => {
      if (!eingegriffen) el.querySelector<HTMLElement>(klick)?.click();
    }, pause);
  }
  const folge = el.dataset.szeneFolge
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (folge?.length) {
    const takt = Number(el.dataset.szeneTakt ?? 1800);
    folge.forEach((sel, i) => {
      window.setTimeout(
        () => {
          if (!eingegriffen) el.querySelector<HTMLElement>(sel)?.click();
        },
        pause + i * takt
      );
    });
  }
}

/** Zahl von 0 auf den Zielwert hochzählen, Format wie im Text (de-DE, Einheit bleibt). */
export function hochzaehlen(el: HTMLElement, dauer = 900): void {
  const text = el.textContent ?? '';
  const m = text.match(/-?[\d.]+(,\d+)?/);
  if (!m) return;
  const roh = m[0];
  const dezimal = roh.includes(',') ? roh.split(',')[1]!.length : 0;
  const ziel = Number(roh.replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(ziel)) return;
  const vor = text.slice(0, m.index);
  const nach = text.slice((m.index ?? 0) + roh.length);
  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: dezimal, maximumFractionDigits: dezimal });
  const start = performance.now();
  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / dauer);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = vor + fmt(ziel * eased) + nach;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = text;
  };
  requestAnimationFrame(tick);
}
