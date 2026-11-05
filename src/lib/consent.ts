import consentConfig from '@/config/consent.config';

/**
 * Lesezugriff auf die Consent-Entscheidung des Besuchers.
 *
 * Der `ConsentBanner` schreibt sie nach `localStorage` und feuert bei jeder
 * Änderung ein `consent-updated`-Event. Beides hier gekapselt, damit
 * Komponenten nicht das Speicherformat kennen müssen — die Version im
 * gespeicherten Objekt entwertet alte Einwilligungen automatisch.
 */

export type ConsentKategorie = keyof typeof consentConfig.categories;

interface GespeicherterConsent {
  version: number;
  timestamp: string;
  categories: Record<string, boolean>;
}

function lies(): GespeicherterConsent | null {
  try {
    const raw = localStorage.getItem(consentConfig.storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw) as GespeicherterConsent;
    // Version-Mismatch = Kategorien haben sich geändert; die alte Zustimmung
    // deckt die neuen nicht ab und gilt als nicht erteilt.
    return data?.version === consentConfig.version ? data : null;
  } catch {
    return null;
  }
}

/**
 * Hat der Besucher dieser Kategorie zugestimmt?
 *
 * `false` auch dann, wenn noch gar nicht entschieden wurde — im Zweifel gilt
 * keine Einwilligung, nicht "noch nicht abgelehnt".
 */
export function hatConsent(kategorie: ConsentKategorie): boolean {
  return lies()?.categories?.[kategorie] === true;
}

/**
 * Ruft `callback` bei jeder Consent-Änderung auf. Gibt eine Aufräumfunktion
 * zurück (für React-`useEffect`).
 */
export function beiConsentAenderung(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('consent-updated', handler);
  return () => window.removeEventListener('consent-updated', handler);
}
