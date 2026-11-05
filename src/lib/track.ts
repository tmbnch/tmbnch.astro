/**
 * Plausible-Ereignisse. Die Namen müssen im Plausible-Dashboard als Goal (Custom Event)
 * angelegt sein, sonst zählt Plausible sie zwar, zeigt sie aber nicht als Ziel.
 *
 * Trichter für die Abbruchquote:
 *   Beta: E-Mail (Hero) → Beta: Teamgröße → Beta: Tool → Beta: Abgeschickt
 */
export type TrackEvent =
  | 'Beta: E-Mail'
  | 'Beta: Teamgröße'
  | 'Beta: Tool'
  | 'Beta: Abgeschickt'
  | 'Beta: Fehler'
  | 'Kontakt: Abgeschickt'
  | 'Demo'
  | '404';

const sent = new Set<string>();

export function track(event: TrackEvent, props: Record<string, string> = {}, onceKey?: string): void {
  if (onceKey) {
    if (sent.has(onceKey)) return;
    sent.add(onceKey);
  }
  window.plausible?.(event, { props });
}
