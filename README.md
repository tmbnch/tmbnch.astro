<p align="center">
  <a href="https://www.rocketbase.io">
    <img src="src/assets/rocketbase/logo.svg" alt="Rocketbase" width="280" />
  </a>
</p>

<p align="center">
  <strong>rocketbase.io</strong> — Digitalpartner für individuelle Software, Prozessoptimierung und nachhaltige Plattformen.
</p>

<p align="center">
  <a href="https://www.rocketbase.io">www.rocketbase.io</a>
</p>

---

## Über diese Website

Dies ist der Quellcode der öffentlichen Rocketbase-Website. Die Seite erklärt, was wir tun, wen wir begleiten und wie eine Zusammenarbeit aussieht — mit direktem Draht zu Marten Prieß.

Inhaltlich im Fokus:

- **Individuelle Software & Plattformen** — vom Konzept bis zum laufenden Betrieb
- **Prozessoptimierung** — Digitalisierung entlang bestehender Abläufe
- **Direkte Begleitung** — kein Agentur-Staffellauf, sondern ein Ansprechpartner
- **Blog & Cases** — Einblicke in Projekte, Technik und Arbeitsweise

Die Seite ist deutschsprachig (B2B, DACH) und wird über Netlify ausgeliefert.

---

## Entwicklung

```bash
# Voraussetzungen: Node ≥ 22.12, pnpm
pnpm install

# .env anlegen (siehe .env.example)
cp .env.example .env

# Dev-Server
pnpm dev
```

### Commands

| Command | Beschreibung |
|---------|--------------|
| `pnpm dev` | Dev-Server starten |
| `pnpm build` | Production-Build |
| `pnpm preview` | Build lokal vorschauen |
| `pnpm check` | Astro Type-Checker |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint mit Auto-Fix |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest (Unit) |
| `pnpm test:e2e` | Playwright (E2E) |
| `pnpm validate` | lint + check + build |

---

## Stack & Dependencies

- **[Astro 6](https://astro.build)** mit React Islands für interaktive Komponenten
- **[Tailwind CSS v4](https://tailwindcss.com)** via `@tailwindcss/vite` — Design-Tokens in `src/styles/tokens/`
- **TypeScript**, **MDX** für Inhalte, **CVA** für Component-Varianten
- **Satori** für automatisch generierte OG-Images
- **Pagefind** für die Volltextsuche
- **Vitest** (Unit) und **Playwright** (E2E) für Tests
- Deployment über **[Netlify](https://www.netlify.com)** (`@astrojs/netlify`)

Aufgesetzt auf dem [**Velocity**](https://github.com/southwellmedia/velocity) Astro-Boilerplate von Southwell Media — inzwischen stark an Rocketbase angepasst.

---

## Projektstruktur

```
src/
  assets/         # Bilder, Logos, Client-Logos, Cases
  components/
    ui/           # Basis-UI-Komponenten
    patterns/     # Zusammengesetzte Patterns (ContactForm, etc.)
    layout/       # Header, Footer, ThemeToggle
    blog/         # ArticleHero, BlogCard, ShareButtons
    landing/      # Credibility, TechStack, FeatureTabs
    seo/          # SEO, JSON-LD, Breadcrumbs
  content/        # Blog-Posts, Autoren, FAQs (MDX/JSON)
  config/         # site.config.ts, nav.config.ts
  data/           # rocketbase.ts — Cases, Strengths, Kontaktdaten
  i18n/           # Routen- und Locale-Config
  styles/         # Global CSS, Tokens, Themes
  pages/          # Routen, API-Endpoints, OG-Image-Generierung
```

---

## Konfiguration

- **Site-Config**: `src/config/site.config.ts` — Name, Beschreibung, Kontakt, Social Links
- **Navigation**: `src/config/nav.config.ts`
- **Inhalte & Daten**: `src/data/rocketbase.ts` (Cases, Strengths, Service-Areas)
- **Design-Tokens**: `src/styles/tokens/` (Farben, Typografie, Spacing)
- **Themes**: `src/styles/themes/` (`default`, `midnight`)
- **Environment**: `.env` — siehe `.env.example`

---
