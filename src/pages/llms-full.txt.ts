import type { APIRoute } from 'astro';
import siteConfig from '@/config/site.config';
import { projektFaqs, arbeitFaqs, type FaqItem } from '@/data/faqs';

/**
 * /llms-full.txt: der fachliche Inhalt der Website in einem Abruf, als Markdown.
 *
 * Ergänzt /llms.txt (dort nur der Index). Die Texte fassen zusammen, was die Seiten zeigen;
 * die FAQs kommen aus src/data/faqs.ts und bleiben so synchron mit den Seiten.
 * Regel wie überall: nur behaupten, was es im Produkt gibt (siehe CLAUDE.md).
 */
const faqBlock = (items: FaqItem[]) => items.map((f) => `### ${f.question}\n\n${f.answer}`).join('\n\n');

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || `${siteConfig.url}/`).replace(/\/$/, '');
  const body = `# ${siteConfig.name}: vollständige Inhalte

> ${siteConfig.description}

timebench ist eine Zeiterfassung für Teams, die nach Projekten arbeiten, etwa Agenturen, Beratungen und Kanzleien. Projektzeit, Arbeitszeit und Urlaub laufen in einer App zusammen. Ein gebuchter Eintrag zählt für die Kundenabrechnung, für das Überstundenkonto und für die Prüfung nach Arbeitszeitgesetz.

- Status: geschlossene Beta. Anmeldung über den Fragebogen auf ${base}/#warteliste
- Plattformen: Web-App (auch mobil im Browser), Desktop-App für macOS, Windows und Linux. Eine App aus dem App Store oder Play Store gibt es nicht.
- Betrieb: gehostet von uns oder selbst betrieben mit Docker Compose und PostgreSQL.
- Anbieter: ${siteConfig.legalName}, ${siteConfig.address?.street}, ${siteConfig.address?.zip} ${siteConfig.address?.city}. Kontakt: ${siteConfig.email}, ${base}/kontakt/

## Projektzeiterfassung

Quelle: ${base}/projektzeiterfassung/

- **Struktur:** Bis zu drei Ebenen, frei benennbar, etwa Kunde, Projekt und Aufgabe oder Mandant und Akte. Farben pro Kunde.
- **Erfassen:** Timer, Wochen- und Monatskalender oder Stundenzettel. Alle drei zeigen dieselben Einträge. In der Schnelleingabe wählt \`@\` das Projekt und \`#\` ein Tag, Enter startet den Timer.
- **Tagesende:** Die Desktop-App schlägt für Lücken im Tag das passende Projekt vor, abgeleitet aus Repo, Website oder Meeting. Ein Klick übernimmt den Vorschlag.
- **Stundensätze:** Fünf Stufen, der speziellste Satz gilt, in dieser Reihenfolge: Person bei diesem Kunden, Satz der Person, Projekt oder Aufgabe, Kunde, Workspace-Standard. Abrechenbar wird pro Projekt vorgegeben und lässt sich am Eintrag ändern. Mehrere Währungen werden getrennt summiert. Sätze sehen nur Admins und Owner.
- **Rundung:** standardmäßig 15 Minuten pro Eintrag, pro Kunde änderbar.
- **Reports:** gruppiert nach Kunde, Projekt oder Person, speicherbar (etwa „Musterfabrik, immer letzter Monat“), Export als CSV, Excel und PDF. timebench schreibt keine Rechnungen; die Stunden gehen ins Buchhaltungsprogramm.
- **Umzug aus Toggl Track:** Import von Kunden, Projekten, Tags und Einträgen per API-Token, danach laufender Abgleich inklusive Löschungen.

## Arbeitszeiterfassung, Urlaub und Abwesenheiten

Quelle: ${base}/arbeitszeiterfassung/

Seit dem Beschluss des Bundesarbeitsgerichts vom September 2022 müssen Arbeitgeber in Deutschland die Arbeitszeit erfassen. In timebench entsteht der Nachweis aus denselben Einträgen wie die Projektzeit; ein zusätzliches Stempeln ist nicht nötig.

- **ArbZG-Prüfung:** § 4 Pause (30 Minuten nach 6 Stunden, 45 nach 9, gezählt ab 15-Minuten-Blöcken), § 5 Ruhezeit (11 Stunden), § 3 Höchstarbeitszeit (10 Stunden am Tag). Dazu überlappende Einträge und gebuchte Zeit an Feiertagen oder Urlaubstagen. timebench warnt und markiert, es zieht keine Pausen ab und sperrt nichts.
- **Regelversionen:** nach deutschem Recht voreingestellt, versioniert mit Startdatum, pro Workspace anpassbar (etwa für Tarifverträge). Alte Monate werden nach den alten Regeln geprüft.
- **Arbeitsplan und Überstunden:** Soll pro Wochentag, auch Teilzeit. Urlaub, Krankheit und Feiertage senken das Soll. Überstundenausgleich ist eine Abwesenheitsart. Korrekturen trägt ein Admin mit Begründung ein.
- **Urlaub:** Jahreskalender, Antrag direkt im Kalender, Wochenenden und Feiertage werden herausgerechnet. Resturlaub verfällt standardmäßig am 31. März (einstellbar). Halbe Tage und Stunden möglich. Elternzeit kürzt den Anspruch nach § 17 BEEG. Urlaub über den Jahreswechsel wird auf beide Jahre verteilt.
- **Abwesenheitsarten:** unter anderem Urlaub, Krankheit, Krankheit stundenweise, unbezahlter Urlaub, Überstundenausgleich, Elternzeit, Berufsschule; eigene Arten mit eigener Farbe.
- **Freigabe:** Admins und die eingetragene Führungskraft genehmigen. Jeder Antrag zeigt, was er kostet und was übrig bleibt. Im Teamkalender sehen Kolleginnen und Kollegen, dass jemand fehlt; den Grund sehen nur Admins und die Führungskraft.
- **Feiertage:** für alle 16 Bundesländer.
- **Monatsabschluss:** abgeschlossene Monate sind gesperrt. Ein Admin kann wieder öffnen; das Änderungsprotokoll hält fest, wer was geändert hat.

## Desktop-Tracker und Privatsphäre

Quelle: ${base}/#desktop

- Alle fünf Sekunden notiert die Desktop-App das aktive Fenster: Fenstertitel, Website, Git-Repo mit Branch, ob ein Mikrofon läuft. Daraus entstehen Blöcke unter „Nicht erfasst“, schon mit dem zuletzt genutzten Projekt.
- Meetings erkennt timebench am Fenstertitel oder am aktiven Mikrofon in Zoom, Teams oder Meet.
- Nach einer Pause fragt der Timer, ob er früher hätte stoppen sollen. Favoriten und das Kürzel ⌘ ⌥ T starten den Timer aus jeder App.
- Die Aktivitätsdaten bleiben sieben Tage lokal auf dem Rechner und werden dann gelöscht. Auf den Server geht nur, was die Person selbst als Eintrag bestätigt.
- Sperrliste für Apps (etwa Banking, Passwortmanager) und Masken, die Muster wie Patientennamen vor dem Speichern schwärzen.
- Keine Tastenanschläge, keine Screenshots, keine Zwischenablage.

## Integrationen

Toggl-Import mit laufendem Abgleich, iCal-Abo für eigene und Team-Abwesenheiten (Outlook, Google, Apple), API-Token, Kommandozeile, MCP-Server für KI-Assistenten, Login mit Google und Microsoft. Eine Jira-Integration gibt es nicht; weitere Integrationen sind in Planung.

## Häufige Fragen zur Projektzeiterfassung

${faqBlock(projektFaqs)}

## Häufige Fragen zur Arbeitszeiterfassung

${faqBlock(arbeitFaqs)}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
