/**
 * Brief-Kennung aus der URL (`?r=`) lesen und über den Seitenaufenthalt halten.
 *
 * Ohne die Sicherung in `sessionStorage` wäre die Kennung weg, sobald ein
 * In-Page-Anker die URL ändert oder jemand von cal.com zurückkommt — und damit
 * die Zuordnung zum versendeten Brief.
 *
 * Die Kennung wird nur durchgereicht, nie aufgelöst: Welche Firma dahinter
 * steht, weiß ausschließlich das lokale Sales-Backend.
 */

const STORAGE_KEY = 'rb-brief-ref';

export function leseBriefRef(): string {
  const ausUrl = new URLSearchParams(window.location.search).get('r');
  if (ausUrl) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, ausUrl);
    } catch {
      // Private-Mode o. Ä. — die Kennung lebt dann nur für diesen Seitenaufruf.
    }
    return ausUrl;
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}
