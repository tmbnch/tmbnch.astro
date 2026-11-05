/**
 * Stunden-Rechnung über dem Kontaktformular: aus zwei Quiz-Antworten wird eine Zahl.
 *
 * Gerechnet wird nur Aufwand, den die Person selbst angegeben hat, plus die Annahmen, die auch
 * der Regler `LohntSich` nutzt (20 min je Auftrag, 10 h je Person und Monat, 400 min je Person
 * und Monat). Eine Ersparnis-Quote steht bewusst nicht dabei, solange keine belegte Zahl aus
 * Projekten freigegeben ist: Die Zahl sagt, was es heute kostet, Marten zeigt, was wegfällt.
 */

export type RechnungsStrecke = 'angebote' | 'einsatz' | 'zahlen' | 'eigene-software';

export interface Rechnung {
  stunden: number;
  /** Arbeitszeit im Jahr in Euro, gerundet auf Tausender. */
  euroJahr: number;
  /** Wie die Zahl zustande kam, in den Worten der Antworten. */
  weg: string;
  /** Wofür die Stunden draufgehen. */
  wofuer: string;
}

interface Antwort {
  optionId: string;
}

// 55.000 Euro Arbeitgeberkosten je Stelle (wie LohntSich) durch rund 1.900 Arbeitsstunden.
const EURO_JE_STUNDE = 30;

const ANGEBOTE_MENGE: Record<string, number> = { lt10: 5, '10-30': 20, '30-100': 60, gt100: 120 };
const ANGEBOTE_DAUER: Record<string, number> = { lt1: 0.75, '1-2': 1.5, halbtag: 4, tag: 8 };
const AUFTRAEGE: Record<string, number> = { lt30: 20, '30-100': 60, '100-300': 180, gt300: 400 };
const AUSWERTER: Record<string, number> = { '1': 1, '2-3': 2.5, '4-8': 6, gt8: 10 };
const LEUTE: Record<string, number> = { lt10: 6, '10-30': 20, '30-80': 50, gt80: 100 };

const zahl = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

function ergebnis(stunden: number, weg: string, wofuer: string): Rechnung {
  const gerundet = stunden < 20 ? Math.round(stunden) : Math.round(stunden / 5) * 5;
  return {
    stunden: gerundet,
    euroJahr: Math.round((gerundet * 12 * EURO_JE_STUNDE) / 1000) * 1000,
    weg,
    wofuer,
  };
}

export function rechnungFuer(
  strecke: RechnungsStrecke,
  antworten: Record<string, Antwort | undefined>
): Rechnung | null {
  const a = (id: string) => antworten[id]?.optionId ?? '';

  if (strecke === 'angebote') {
    const menge = ANGEBOTE_MENGE[a('menge')];
    const dauer = ANGEBOTE_DAUER[a('dauer')];
    if (!menge || !dauer) return null;
    return ergebnis(
      menge * dauer,
      `Rund ${menge} Angebote mal ${zahl(dauer)} Stunden`,
      'gehen bei euch in Angebote.'
    );
  }
  if (strecke === 'einsatz') {
    const auftraege = AUFTRAEGE[a('auftraege')];
    if (!auftraege) return null;
    return ergebnis(
      (auftraege * 20) / 60,
      `Rund ${auftraege} Aufträge mal 20 Minuten`,
      'gehen bei euch neben der eigentlichen Arbeit drauf.'
    );
  }
  if (strecke === 'zahlen') {
    const leute = AUSWERTER[a('leute')];
    if (!leute) return null;
    return ergebnis(
      leute * 10,
      `${zahl(leute)} ${leute === 1 ? 'Person' : 'Personen'} mal 10 Stunden im Monat`,
      'gehen bei euch ins Zusammensuchen der Zahlen.'
    );
  }
  const leute = LEUTE[a('personen')];
  if (!leute) return null;
  return ergebnis(
    (leute * 400) / 60,
    `Rund ${leute} Leute mal 20 Minuten am Tag`,
    'gehen bei euch in Excel und Doppelpflege.'
  );
}
