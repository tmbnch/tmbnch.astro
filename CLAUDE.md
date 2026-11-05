# CLAUDE.md

Marketing-Website für timebench (timebench.io). Astro 7, Tailwind v4, TypeScript strict, pnpm, Node 24, statisch auf Netlify. Überblick und Befehle stehen in `README.md`.

## Produkt und Quelle

- Das Produkt lebt im Monorepo `/Users/marten/Development/2026/rcktbs-tmbnch`, dort heißt es noch „tmbnch“. Auf der Website heißt es überall **timebench**.
- Funktionen: `docs/release-notes.md` und `docs/architecture/` im Monorepo. Domänenwörter stehen in `apps/frontend/src/i18n/de.json`.
- **Nur behaupten, was es gibt.** Es gibt keine Jira-Integration, keine native Mobile-App und keine Rechnungsstellung. Integrationen sind Toggl-Import, iCal, API-Token, CLI/MCP sowie Login mit Google und Microsoft.

## Aufbau

- Seiten in `src/pages/`, alle über `src/layouts/SiteLayout.astro`. `hasWaitlist` setzen, wenn die Seite einen `#warteliste`-Block hat.
- Navigation und Footer kommen aus `src/data/navigation.ts`. Eine neue Lösungsseite wird dort eingetragen; ein `soon`-Eintrag erscheint ausgegraut.
- Bei einer neuen Seite auch `src/pages/og/[...slug].ts` (OG-Bild) und `src/pages/llms.txt.ts` ergänzen.
- Klickbare Dummies: `src/components/demo/` (Astro) und `src/scripts/demo/` (TypeScript, eine Datei pro Ansicht). Beispieldaten nur in `data.ts`.
- Styles: Tokens in `src/styles/tokens/primitives.css` und `src/styles/themes/timebench.css`, Seitenkomponenten in `src/styles/timebench.css`. Die Klassen dort (`.wrap`, `.split`, `.btn`, `.ink-band` …) sind die erste Wahl. Tailwind ist für Einzelfälle da.
- `src/components/ui/` ist die Komponentenbibliothek aus dem Boilerplate und wird derzeit nicht genutzt.

## Gestaltung

- Grün (`--live`) bedeutet nur „läuft / jetzt / heute“. Primäraktionen sind Ink.
- Jede Lösungsseite hat eine eigene Akzentfarbe (`SiteLayout accent=…`: Projektzeit `bloom`, Arbeitszeit `clock`), den zentrierten Hero `.shero` und eigene Dummies. Startseiten-Dummies dort nicht wiederholen.
- Dummies müssen per Touch funktionieren: kein `touch-action: none`, Tippen statt Ziehen. Popover dürfen den Geisterklick nach einem Tipp nicht abfangen.
- Ruhige, linierte Flächen, damit Projektfarben und Zahlen hervorstechen.
- Bei 375 px darf die Seite nicht horizontal scrollen. Breite Dummies scrollen in ihrem eigenen Container.

## Texte

Deutsch, Du-Ansprache, Rechtstexte in Sie-Form. Konkrete Beispiele statt Superlativen.

## Datenschutz

Ohne Einwilligung setzt die Seite keine Cookies. Plausible zählt cookielos (`PUBLIC_PLAUSIBLE_SCRIPT_ID`). Das Meta-Pixel lädt nur nach Zustimmung im Cookie-Banner; neue Dienste mit Cookies gehören in eine Kategorie von `src/config/consent.config.ts`. Wer einen Dienst ergänzt, ergänzt im selben Commit `src/pages/datenschutz.astro`.

## Variablen und Functions

- Jede neue Variable kommt mit Kommentar in `.env.example`. Secrets nie mit `PUBLIC_`.
- Functions in `netlify/functions/` (v2, `export const config`), gemeinsamer Code in `netlify/lib/`.
- Formulare gehen über `beta.ts`/`contact.ts` ins Sales-Backend; `netlify/lib/sales-delivery.ts` ist der Vertrag mit dem CRM und stammt aus rcktbs.astro. Dort geänderte Felder hier nachziehen.
- Keine Testeinträge gegen das echte `SALES_API_URL` schicken.
