# timebench.io

Die Marketing-Website von timebench, der Zeiterfassung aus dem Monorepo `rcktbs-tmbnch` (dort heißt das Produkt noch „tmbnch“). Die Seite läuft statisch auf Netlify unter **timebench.io**.

Technisch ist sie eine Kopie von `rcktbs.astro`: Astro 7, Tailwind CSS v4, TypeScript, pnpm, Node 24.

## Loslegen

```sh
pnpm install
cp .env.example .env.local   # einmalig, dann ausfüllen
pnpm dev          # nur Astro, http://localhost:4321
pnpm dev:netlify  # Astro plus Functions, Redirects und Forms, http://localhost:8888
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
| `/kontakt/` | Kontaktformular |
| `/impressum/`, `/datenschutz/` | Rechtstexte, Betreiber ist die rocketbase.io software productions GmbH |

OG-Bilder: `pnpm og:capture` fotografiert die Seiten mit Playwright und legt sie unter `public/og-screenshots/` ab (eingecheckt, nach Änderungen am Hero neu aufnehmen; einzelne Seiten mit `pnpm og:capture kontakt`). Wo kein Screenshot liegt, etwa bei Impressum und Datenschutz, greift das mit Satori generierte Bild aus `src/lib/og.ts`. Dazu kommen `robots.txt`, `llms.txt`, Manifest und Icons.

## Die klickbaren Dummies

Die Produktansichten auf den Seiten sind kein Screenshot. Sie werden im Browser aus Beispieldaten aufgebaut und lassen sich anklicken, mit der Maus und auf dem Handy per Tippen.

- Startseite: Wochen- und Monatskalender, Stundenzettel, Jahresübersicht für Urlaub, Teamkalender und das Fenster des Desktop-Trackers mit den Buchungsvorschlägen.
- Projektzeiterfassung: Schnelleingabe mit `@` und `#`, Tagesende mit Lücken zum Füllen, Report-Pivot mit Rundung.
- Arbeitszeiterfassung: Stempelkarte mit ArbZG-Verstößen zum Beheben, Arbeitsplan-Editor, dazu Urlaubskalender und Teamkalender.

- Ein Dummy wird mit `<Demo kind="week" />` eingebunden (`src/components/demo/Demo.astro`).
- Die Logik liegt in `src/scripts/demo/`, eine Datei pro Ansicht. `data.ts` enthält Projekte, Personen, Feiertage und Abwesenheiten.
- `DemoTour.astro` setzt mehrere Dummies hinter Tabs in einen App-Rahmen.

Optik und Farben folgen der echten App im Monorepo (`packages/calendar`, `apps/desktop/src/renderer`, `apps/frontend/src/absence`). Ändert sich dort etwas Sichtbares, sollte der Dummy nachziehen.

## Beta-Fragebogen und Kontakt

Der Block `#warteliste` (`BetaSection.astro`) enthält den Beta-Fragebogen: Teamgröße, bisheriges Werkzeug mit Freitext für „Etwas anderes“, dann Wunsch-Freitext und Kontaktdaten. Fragen und IDs stehen in `src/data/beta.ts`. Das Feld im Hero (`BetaStart.astro`) trägt die Mail-Adresse nur vor und springt zum Fragebogen.

Beide Formulare laufen wie auf rocketbase.io:

- `/api/beta` (`netlify/functions/beta.ts`) und `/api/contact` (`contact.ts`) legen jeden Eintrag zuerst in Netlify Blobs ab (Store `funnel-leads`) und stellen ihn dann an `SALES_API_URL/api/public/funnel-events` zu. Im CRM heißen die Strecken `timebench-beta` und `timebench-kontakt`.
- `lead-redeliver.ts` liefert alle zehn Minuten nach, was nicht angekommen ist.
- Wer ohne JavaScript absendet, bekommt einen Bestätigungsschritt (`netlify/lib/human-check.ts`).

Lokal testen mit `pnpm dev:netlify`. Für Testeinträge `SALES_API_URL` auf einen lokalen Dienst stellen, sonst landen sie im echten CRM.

## Umgebungsvariablen und Functions

Alle Variablen stehen mit Erklärung in `.env.example`. Lokal liegen die Werte in `.env.local`, die nicht eingecheckt wird; auf Netlify stehen sie unter Site configuration → Environment variables. Was mit `PUBLIC_` beginnt, landet im Browser-Code. Secrets bekommen dieses Präfix nie.

Serverless Functions liegen in `netlify/functions/`, eine Datei pro Function im v2-Format, Pfad als `export const config`. Variablen lesen sie über `env()` und `requireEnv()` aus `netlify/lib/env.ts`. `health.ts` antwortet unter `/api/health` und zeigt, ob Functions laufen.

`pnpm dev:netlify` holt die Netlify CLI per `pnpm dlx`, eine Installation ist nicht nötig.

## Analyse

Plausible lädt, sobald `PUBLIC_PLAUSIBLE_SCRIPT_ID` gesetzt ist (`src/components/seo/Plausible.astro`). Es setzt keine Cookies und braucht kein Einwilligungsbanner. Eigene Ereignisse laufen über `track()` in `src/lib/track.ts`:

| Ereignis | Wann | Eigenschaften |
|---|---|---|
| `Beta: E-Mail` | Mail im Hero eingetragen | `quelle` |
| `Beta: Teamgröße` | Frage 1 beantwortet | `quelle`, `team` |
| `Beta: Tool` | Frage 2 beantwortet | `quelle`, `tool` |
| `Beta: Abgeschickt` | Fragebogen angekommen | `quelle`, `team`, `tool` |
| `Beta: Fehler` | Absenden gescheitert | `grund` |
| `Kontakt: Abgeschickt` | Kontaktformular angekommen | |
| `Demo` | erste Bedienung eines Dummys | `ansicht`, `seite` |
| `404` | Seite nicht gefunden | `pfad`, `von` |

Die vier `Beta`-Schritte ergeben den Trichter für die Abbruchquote. Jeder Name muss in Plausible unter Goals als Custom Event angelegt sein. Die Datenschutzerklärung zeigt den Plausible-Absatz nur, wenn die Variable gesetzt ist.

## Cookie-Banner und Meta

Banner (`src/components/ui/overlay/ConsentBanner`, Einstellungen in `src/config/consent.config.ts`), Meta-Pixel (`src/components/seo/MetaPixel.astro`) und Conversions API (in `netlify/functions/beta.ts`) stammen aus rcktbs.astro.

- Der Banner erscheint mit `PUBLIC_CONSENT_ENABLED=true` und kennt nur „Notwendig“ und „Marketing“. Plausible braucht keine Einwilligung.
- Das Pixel lädt erst nach Zustimmung zu „Marketing“. Ein abgeschickter Beta-Fragebogen meldet `Lead` im Browser und über die Conversions API mit derselben `eventId`, damit Meta ihn nur einmal zählt.
- Datensatz ist „timebench.io Web“ (`1755967522173018`) im Business-Portfolio der rocketbase.io GmbH, bewusst getrennt vom Pixel von rocketbase.io.
- Die Domain-Verifizierung steht in `PUBLIC_META_DOMAIN_VERIFICATION`. Nach dem Deploy unter Business-Einstellungen → Domains → timebench.io auf „Domain verifizieren“ klicken.
- „Cookie-Einstellungen“ im Footer öffnet die Auswahl erneut.

## Design

Logo und Palette stammen aus `rcktbs-tmbnch/docs/brand/`. Die Tokens liegen in `src/styles/tokens/primitives.css` und `src/styles/themes/timebench.css`, die Seitenkomponenten in `src/styles/timebench.css`. Die Schriften Bricolage Grotesque und JetBrains Mono werden über Fontsource selbst ausgeliefert.

## Deploy

`netlify.toml` baut mit `pnpm run build` und veröffentlicht `dist/`. `www.timebench.io` leitet auf `timebench.io` weiter. Die Domain muss im Netlify-Projekt noch eingetragen werden.
