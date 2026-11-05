import type { APIRoute } from 'astro';
import siteConfig from '@/config/site.config';

/**
 * /llms.txt: kurze Inhaltsübersicht für Sprachmodelle (llmstxt.org).
 * Bei neuen Lösungsseiten hier ergänzen.
 */
const PAGES = [
  {
    path: 'projektzeiterfassung/',
    title: 'Projektzeiterfassung',
    text: 'Zeit auf Kunde, Projekt und Aufgabe buchen: Timer, Kalender, Stundenzettel, Desktop-Vorschläge, Stundensätze, Rundung, Reports mit CSV-, Excel- und PDF-Export, Toggl-Import.',
  },
  {
    path: 'arbeitszeiterfassung/',
    title: 'Arbeitszeiterfassung',
    text: 'ArbZG-Prüfung (Pausen, Ruhezeit, Höchstarbeitszeit), Soll/Ist und Überstundenkonto, Urlaub und Abwesenheiten mit Jahreskalender, Freigabe-Inbox, Teamkalender, Monatsabschluss.',
  },
];

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || `${siteConfig.url}/`).replace(/\/$/, '');
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

timebench ist eine Zeiterfassung für Teams, die nach Projekten arbeiten. Es gibt eine Web-App und eine Desktop-App für macOS, Windows und Linux. Die Desktop-App zeichnet lokal auf, welches Fenster, welche Website und welches Git-Repo aktiv war, und schlägt daraus Buchungen vor. Diese Aktivitätsdaten bleiben sieben Tage auf dem Rechner und werden nicht hochgeladen. timebench lässt sich auch selbst hosten (Docker Compose, PostgreSQL).

Status: Warteliste. Betreiber: ${siteConfig.legalName}, ${siteConfig.address?.city}.

## Lösungen

${PAGES.map((p) => `- [${p.title}](${base}/${p.path}): ${p.text}`).join('\n')}

## Rechtliches

- [Impressum](${base}/impressum/)
- [Datenschutz](${base}/datenschutz/)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
