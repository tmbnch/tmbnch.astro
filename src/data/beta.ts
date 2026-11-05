/**
 * Fragen des Beta-Fragebogens. Frage- und Antworttexte reisen so mit ins CRM, wie sie hier
 * stehen; die IDs sind die Schlüssel für die Auswertung. IDs nur ändern, wenn alte Einträge
 * nicht mehr mit neuen verglichen werden sollen.
 */
export interface BetaOption {
  id: string;
  label: string;
  /** Blendet ein Freitextfeld ein, dessen Inhalt als `detail` mitgeht */
  freetext?: boolean;
}

export interface BetaQuestion {
  id: string;
  question: string;
  options: BetaOption[];
}

export const BETA_FUNNEL = 'timebench-beta';

export const betaQuestions: BetaQuestion[] = [
  {
    id: 'team',
    question: 'Wie viele Leute sollen bei euch Zeit erfassen?',
    options: [
      { id: '1-5', label: '1 bis 5' },
      { id: '6-20', label: '6 bis 20' },
      { id: '21-50', label: '21 bis 50' },
      { id: '51-200', label: '51 bis 200' },
      { id: '200+', label: 'Mehr als 200' },
    ],
  },
  {
    id: 'tool',
    question: 'Womit erfasst ihr heute?',
    options: [
      { id: 'zep', label: 'ZEP' },
      { id: 'moco', label: 'MOCO' },
      { id: 'clockodo', label: 'Clockodo' },
      { id: 'toggl', label: 'Toggl Track' },
      { id: 'excel', label: 'Excel oder Papier' },
      { id: 'nichts', label: 'Noch gar nicht' },
      { id: 'anderes', label: 'Etwas anderes', freetext: true },
    ],
  },
];

/** Die letzte Frage steht neben den Kontaktdaten und ist reiner Freitext. */
export const betaWishQuestion = {
  id: 'wunsch',
  question: 'Was ist dir besonders wichtig, oder was nervt dich heute?',
};
