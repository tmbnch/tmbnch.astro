/**
 * Erste Einschätzung zwischen der letzten Quizfrage und dem Kontaktformular.
 *
 * Vom 23. bis 29.10.2026 haben 31 Besucher aus den Meta-Anzeigen alle Fragen beantwortet, im
 * Schnitt 74 Sekunden auf der Seite verbracht und dann nicht abgeschickt. Bis zum Formular
 * bekamen sie nichts zurück. Diese Karte macht aus zwei Antworten eine Aussage, die die Person
 * selbst noch nicht gesagt hat, und nennt, worum es im Gespräch geht.
 *
 * Die Texte stehen in `src/data/quizEinordnung.json`, je Strecke eine Aussage für jede
 * Kombination aus Frage A und Frage B. Keine Bausteine: ein Satz, der neben jedem anderen stehen
 * muss, liest sich als Echo der eigenen Antwort. Das Quiz zeigt seit 2026-10-29 nur `titel`;
 * `text`, `gespraech`, `check` und `zusatz` bleiben als Stoff für eine längere Fassung stehen.
 */

import daten from '@/data/quizEinordnung.json';

interface Aussage {
  titel: string;
  text: string;
  gespraech: string;
  /** Nur Software-Check: welcher der beiden Checks von der Seite passt. */
  check?: string;
}

interface StreckenEinordnung {
  frageA: string;
  frageB: string;
  frageZusatz: string;
  /** Fasst Antworten von Frage B zusammen, wenn mehrere dieselbe Aussage tragen. */
  gruppenB?: Record<string, string>;
  aussagen: Record<string, Aussage>;
  zusatz: Record<string, string>;
  /** Gesprächssatz, wenn bei Frage A „Anders“ gewählt wurde. */
  gespraechAnders: string;
}

const EINORDNUNGEN = daten as Record<string, StreckenEinordnung>;

export type EinordnungsStrecke = keyof typeof daten;

export interface Einordnung extends Aussage {
  zusatz?: string;
  /** Der Freitext zu „Anders“, wörtlich, damit die Person sieht, dass er angekommen ist. */
  freitext?: string;
  /** Für Plausible: welche Antworten die Aussage bestimmt haben. */
  antwortA: string;
  antwortB: string;
}

interface Antwort {
  optionId: string;
  detail?: string;
}

export function einordnungFuer(
  strecke: EinordnungsStrecke,
  antworten: Record<string, Antwort | undefined>
): Einordnung | null {
  const e = EINORDNUNGEN[strecke];
  if (!e) return null;
  const a = antworten[e.frageA];
  const b = antworten[e.frageB];
  if (!a || !b) return null;

  const zusatzAntwort = antworten[e.frageZusatz]?.optionId;
  const zusatz = zusatzAntwort ? e.zusatz[zusatzAntwort] : undefined;
  const basis = { zusatz, antwortA: a.optionId, antwortB: b.optionId };

  if (a.optionId === 'sonstiges') {
    const freitext = a.detail?.trim() || undefined;
    return {
      ...basis,
      titel: 'Euren Fall schaut sich Marten genau an.',
      text: freitext
        ? 'Ihr habt geschrieben:'
        : 'Ihr arbeitet anders, als die Antworten oben es vorsehen. Genau das ist ein guter Anfang.',
      freitext,
      gespraech: e.gespraechAnders,
    };
  }

  const gruppe = e.gruppenB?.[b.optionId] ?? b.optionId;
  const aussage = e.aussagen[`${a.optionId}|${gruppe}`];
  return aussage ? { ...basis, ...aussage } : null;
}
