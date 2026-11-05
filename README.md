# timebench.io

Die Marketing-Website von timebench, der Zeiterfassung aus dem Monorepo `rcktbs-tmbnch` (dort heißt das Produkt noch „tmbnch“). Die Seite läuft statisch auf Netlify unter **timebench.io**.

Technisch ist sie eine Kopie von `rcktbs.astro`: Astro 7, Tailwind CSS v4, TypeScript, pnpm, Node 24.

## Loslegen

```sh
pnpm install
pnpm dev        # Dev-Server; Astro 7 startet ihn im Hintergrund, Adresse steht in der Ausgabe
pnpm build      # statischer Build nach dist/
pnpm check      # astro check (Typen)
pnpm lint
```

## Seiten

| Pfad | Inhalt |
|---|---|
| `/` | Startseite: Hero, drei Säulen, Produkt-Tour, Desktop-Tracker, Privatsphäre, ArbZG, Funktionen, Warteliste |
| `/projektzeiterfassung/` | Lösungsseite Projektzeit |
| `/arbeitszeiterfassung/` | Lösungsseite Arbeitszeit, Urlaub und Abwesenheiten |
| `/impressum/`, `/datenschutz/` | Rechtstexte, Betreiber ist die rocketbase.io software productions GmbH |

Dazu kommen OG-Bilder unter `/og/*.png`, generiert mit Satori in `src/lib/og.ts`, außerdem `robots.txt`, `llms.txt`, Manifest und Icons.

## Die klickbaren Dummies

Die Produktansichten auf den Seiten sind kein Screenshot. Sie werden im Browser aus Beispieldaten aufgebaut und lassen sich anklicken, mit der Maus und auf dem Handy per Tippen.

- Startseite: Wochen- und Monatskalender, Stundenzettel, Jahresübersicht für Urlaub, Teamkalender und das Fenster des Desktop-Trackers mit den Buchungsvorschlägen.
- Projektzeiterfassung: Schnelleingabe mit `@` und `#`, Tagesende mit Lücken zum Füllen, Report-Pivot mit Rundung.
- Arbeitszeiterfassung: Stempelkarte mit ArbZG-Verstößen zum Beheben, Arbeitsplan-Editor, dazu Urlaubskalender und Teamkalender.

- Ein Dummy wird mit `<Demo kind="week" />` eingebunden (`src/components/demo/Demo.astro`).
- Die Logik liegt in `src/scripts/demo/`, eine Datei pro Ansicht. `data.ts` enthält Projekte, Personen, Feiertage und Abwesenheiten.
- `DemoTour.astro` setzt mehrere Dummies hinter Tabs in einen App-Rahmen.

Optik und Farben folgen der echten App im Monorepo (`packages/calendar`, `apps/desktop/src/renderer`, `apps/frontend/src/absence`). Ändert sich dort etwas Sichtbares, sollte der Dummy nachziehen.

## Warteliste

Das Formular (`src/components/site/Waitlist.astro`) läuft über Netlify Forms. Netlify erkennt es beim Deploy am Attribut `data-netlify`. Die Einträge stehen im Netlify-Dashboard unter „Forms“, Formularname `warteliste`, mit dem Feld `quelle` für die Stelle auf der Seite.

## Design

Logo und Palette stammen aus `rcktbs-tmbnch/docs/brand/`. Die Tokens liegen in `src/styles/tokens/primitives.css` und `src/styles/themes/timebench.css`, die Seitenkomponenten in `src/styles/timebench.css`. Die Schriften Bricolage Grotesque und JetBrains Mono werden über Fontsource selbst ausgeliefert.

## Deploy

`netlify.toml` baut mit `pnpm run build` und veröffentlicht `dist/`. `www.timebench.io` leitet auf `timebench.io` weiter. Die Domain muss im Netlify-Projekt noch eingetragen werden.
