import type { ConsentConfig } from '@/lib/consent.types';

/**
 * Einwilligung für timebench.io. Übernommen aus rcktbs.astro, gekürzt auf das, was die Seite
 * wirklich einsetzt: Plausible zählt cookielos und braucht keine Einwilligung, deshalb gibt
 * es hier nur „Notwendig“ und „Marketing“ (Meta-Pixel).
 */
const consentConfig: ConsentConfig = {
  /** Erhöhen, wenn sich Kategorien ändern: Dann fragt der Banner alle neu. */
  version: 1,

  /** 'consent_mode_v2' = Skripte laden mit „denied“-Vorgaben; 'strict' = blockiert bis zur Einwilligung */
  mode: 'consent_mode_v2',

  /** localStorage-Schlüssel für die gespeicherte Wahl */
  storageKey: 'timebench-consent',

  categories: {
    necessary: {
      label: 'Notwendig',
      description: 'Speichert nur, wie du dich hier entschieden hast. Lässt sich nicht abschalten.',
      required: true,
      defaultEnabled: true,
      gcmTypes: ['security_storage'],
    },
    marketing: {
      label: 'Marketing',
      description:
        'Meta-Pixel: misst, ob unsere Anzeigen auf Facebook und Instagram zu Anmeldungen führen. Setzt Cookies von Meta.',
      required: false,
      defaultEnabled: false,
      gcmTypes: ['ad_storage', 'ad_user_data', 'ad_personalization'],
    },
  },

  ui: {
    heading: 'Cookies',
    description: 'Cookies für Marketing nur mit Zustimmung. Die Statistik läuft ohne Cookies.',
    acceptAll: 'Alle akzeptieren',
    declineAll: 'Alle ablehnen',
    customize: 'Anpassen',
    savePreferences: 'Einstellungen speichern',
    settingsHeading: 'Datenschutzeinstellungen',
    alwaysOnLabel: 'Immer aktiv',
    privacyPolicyLabel: 'Datenschutz',
  },

  /** Millisekunden, bis der Banner einfährt */
  showDelay: 500,
};

export default consentConfig;
