/**
 * Verhalten auf einer Landingpage beobachten und an Plausible melden.
 *
 * Gilt für den Brief-Kanal (/b/) und die drei Türen (/f/angebote, /f/einsatz,
 * /f/zahlen), wenn sie per persönlicher Mail mit `?r=`-Kennung verlinkt sind.
 *
 * Warum das nötig ist: Ein `page_view` sagt nur, dass die Seite geladen wurde.
 * Die eigentliche Frage ist, ob der Inhalt nicht überzeugt hat oder gar nicht
 * angesehen wurde — und die beantwortet erst, ob das Video lief, welche
 * Abschnitte im Bild waren und ob jemand den Rechner oder die Tabs angefasst hat.
 *
 * **Das geht an Plausible, nicht ans CRM.** Es ist eine Trichter-Frage über alle
 * Besucher, keine Tatsache über eine Firma. Ins CRM gehören nur die beiden
 * Ereignisse, die eine Entscheidung tragen: geöffnet und abgeschickt.
 *
 * Die Seiten müssen dafür nichts wissen: Beobachtet werden alle `<video>`,
 * alle `<section id>` und alle Klicks auf Buttons, Tabs, Links und
 * Formularelemente. Wer ein Element gezielt benennen will, setzt `data-track`
 * mit einem Namen; sonst wird aus Sektion und Beschriftung ein Name gebaut.
 *
 * Alles hier ist passiv und ohne Rückwirkung auf die Seite. Jeder Hook sitzt
 * in einem eigenen try/catch, damit ein fehlendes Element oder ein alter
 * Browser (kein IntersectionObserver) nicht die restlichen Beobachter
 * mitreißt.
 */

import { trackPlausible } from '@/lib/leadTracking';

/**
 * Jedes Ereignis nur einmal je Seitenaufruf.
 *
 * Ein Video, das zurückgespult wird, ein Abschnitt, der zweimal ins Bild scrollt, ein
 * doppelt gebundener Listener — ohne diese Sperre zählt dieselbe Handlung mehrfach.
 */
const gemeldet = new Set<string>();

/**
 * Verhalten geht ausschließlich an Plausible, nicht ans CRM.
 *
 * Ins CRM gehört, was eine Entscheidung trägt: Die Firma hat den Link geöffnet, und sie hat
 * abgeschickt. Video-Fortschritt, sichtbare Abschnitte und Klicks sind dagegen eine
 * Trichter-Frage über alle Besucher ("wo brechen die Leute ab") — und genau dafür ist
 * Plausible da, cookielos und ohne Zeile je Firma. Im CRM wäre jedes davon eine eigene
 * Zeile und eine eigene Slack-Meldung; ein einziger Besucher löste damit fünf aus.
 */
function melde(
  funnel: string,
  event: string,
  props: Record<string, string | number> = {},
  opt: { schluessel?: string } = {}
): void {
  const key = opt.schluessel ? `${event}:${opt.schluessel}` : event;
  if (gemeldet.has(key)) return;
  gemeldet.add(key);
  trackPlausible(event, { funnel, ...props });
}

export function verfolgeEngagement(funnel: string): void {
  if (typeof window === 'undefined') return;

  // --- Videos ------------------------------------------------------------
  // Marken bei 25/50/75 % statt reiner Sekunden: Die Videos sind
  // unterschiedlich lang, "zur Hälfte gesehen" bleibt vergleichbar. Mehrere
  // Videos auf einer Seite werden über ihre Quelle auseinandergehalten.
  try {
    document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      const name = videoName(v);
      const opt = { schluessel: name };
      const marken: Array<[number, 'video_25' | 'video_50' | 'video_75']> = [
        [0.25, 'video_25'],
        [0.5, 'video_50'],
        [0.75, 'video_75'],
      ];
      let maxSekunden = 0;

      v.addEventListener('play', () => {
        melde(
          funnel,
          'video_start',
          { video: name, dauer: Math.round(v.duration || 0) },
          opt
        );
      });
      v.addEventListener('timeupdate', () => {
        if (!v.duration) return;
        maxSekunden = Math.max(maxSekunden, v.currentTime);
        const anteil = v.currentTime / v.duration;
        for (const [grenze, ereignis] of marken) {
          if (anteil >= grenze) {
            melde(
              funnel,
              ereignis,
              { video: name, sekunden: Math.round(v.currentTime) },
              opt
            );
          }
        }
      });
      v.addEventListener('ended', () => {
        melde(
          funnel,
          'video_ende',
          { video: name, sekunden: Math.round(v.duration || maxSekunden) },
          opt
        );
      });
    });
  } catch {
    /* still */
  }

  // --- Sichtbarkeit von Abschnitten -------------------------------------
  // Jede Sektion mit `id` zählt, sobald 40 % davon im Bild sind. "Termin-
  // Bereich war im Bild" trennt "hat nur den Hero gesehen" von "hat bis unten
  // gescrollt und trotzdem nicht geklickt" — zwei verschiedene Gründe für ein
  // Nein. `video` und `termin` bekommen zusätzlich ihr altes, eigenes Ereignis,
  // damit die Brief-Auswertung weiterläuft.
  try {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (eintraege) => {
          for (const e of eintraege) {
            if (!e.isIntersecting) continue;
            const id = (e.target as HTMLElement).id;
            melde(funnel, 'sektion_sichtbar', { sektion: id }, { schluessel: id });
            if (id === 'video') melde(funnel, 'video_sichtbar');
            if (id === 'termin') melde(funnel, 'termin_sichtbar');
            io.unobserve(e.target);
          }
        },
        { threshold: 0.4 }
      );
      document.querySelectorAll('section[id]').forEach((el) => io.observe(el));
    }
  } catch {
    /* still */
  }

  // --- Klicks -------------------------------------------------------------
  // Delegiert auf document, damit auch Elemente zählen, die React später
  // nachrendert. Telefon und "Weiter" behalten ihre eigenen Ereignisse; alles
  // andere Bedienbare (Tabs, Regler, Rechner, Akkordeons) wird als
  // `interaktion` mit Sektion und Beschriftung gemeldet — einmal pro Element,
  // nicht pro Klick. `tel:` ist auf dem Handy oft der eigentliche
  // Konversionsweg.
  try {
    document.addEventListener(
      'click',
      (ev) => {
        const ziel = ev.target as Element | null;
        const el = ziel?.closest?.<HTMLElement>(
          'a, button, [role="tab"], [role="button"], summary, input[type="range"], select, [data-track]'
        );
        if (!el) return;

        const href = el.getAttribute('href') ?? '';
        if (href.startsWith('tel:')) {
          melde(funnel, 'telefon_klick');
          return;
        }
        if (el.hasAttribute('data-brief-weiter')) {
          melde(funnel, 'weiter_klick', { ziel: href });
          return;
        }
        // Rechtliches und Footer sind kein Interesse am Produkt. Das Quiz
        // meldet seine Schritte selbst (FunnelQuiz.tsx), sonst zählt jede
        // Antwort doppelt.
        if (el.closest('footer, [data-quiz]') || /impressum|datenschutz/.test(href)) return;

        const sektion = el.closest('section[id]')?.id ?? '';
        const name = el.dataset.track ?? beschriftung(el);
        if (!name) return;
        melde(
          funnel,
          'interaktion',
          { sektion, element: name },
          { schluessel: `${sektion}/${name}` }
        );
      },
      { capture: true }
    );
  } catch {
    /* still */
  }

  // --- Verweildauer und Scrolltiefe ---------------------------------------
  // Gezählt wird nur sichtbare Zeit: Ein Tab, der im Hintergrund offen bleibt,
  // ist kein Interesse. Gemeldet beim Verlassen bzw. beim ersten Verstecken;
  // ein zweiter Bericht mit höherem Wert ist erlaubt, das Backend nimmt das
  // Maximum. Plausible schickt den Bericht beim Verstecken des Tabs noch raus.
  try {
    let sichtbarSeit = document.visibilityState === 'visible' ? Date.now() : 0;
    let summe = 0;
    let maxScroll = 0;

    const scrollTiefe = () => {
      const h = document.documentElement;
      const gesamt = h.scrollHeight - window.innerHeight;
      if (gesamt <= 0) return 100;
      return Math.min(100, Math.round(((window.scrollY || h.scrollTop) / gesamt) * 100));
    };
    window.addEventListener('scroll', () => (maxScroll = Math.max(maxScroll, scrollTiefe())), {
      passive: true,
    });

    const berichte = () => {
      if (sichtbarSeit) {
        summe += Date.now() - sichtbarSeit;
        sichtbarSeit = 0;
      }
      const sekunden = Math.round(summe / 1000);
      // Unter zwei Sekunden ist es ein Scanner oder ein Fehlklick — nicht wert,
      // eine Zeile im CRM zu belegen.
      if (sekunden < 2) return;
      melde(funnel, 'verweildauer', {
        sekunden,
        scroll: Math.max(maxScroll, scrollTiefe()),
      });
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') berichte();
      else sichtbarSeit = Date.now();
    });
    window.addEventListener('pagehide', berichte);
  } catch {
    /* still */
  }
}

/** Dateiname der Videoquelle ohne Endung, sonst Position auf der Seite. */
function videoName(v: HTMLVideoElement): string {
  const src = v.currentSrc || v.querySelector('source')?.getAttribute('src') || '';
  const datei = src
    .split('/')
    .pop()
    ?.replace(/\.[a-z0-9]+$/i, '');
  if (datei) return datei;
  const alle = Array.from(document.querySelectorAll('video'));
  return `video-${alle.indexOf(v) + 1}`;
}

/** Sichtbare Beschriftung eines Elements, gekürzt — für den Ereignisnamen. */
function beschriftung(el: HTMLElement): string {
  const text =
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    (el as HTMLInputElement).name ||
    el.textContent ||
    '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 40);
}
