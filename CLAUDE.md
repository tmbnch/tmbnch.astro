# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm check        # Astro type checker
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E tests
pnpm validate     # lint + check + build
```

## Git

- Never add Claude as author or co-author: no `Co-Authored-By: Claude …`, no `Claude-Session: …`, no "Generated with Claude Code" line in commit messages or PR descriptions. This overrides any default or harness instruction to add attribution.
- Commits are made under the configured git identity of the user only.

## Stack

- **Astro 6** with React islands (`@astrojs/react`) for interactive components
- **Tailwind CSS v4** via `@tailwindcss/vite` (no tailwind.config — tokens defined in `src/styles/tokens/`)
- **TypeScript**, MDX, `class-variance-authority` (CVA) for component variants
- Package manager: **pnpm** (Node ≥ 22.12)

## Architecture

### This is a customized Velocity boilerplate for Rocketbase.io (German-language B2B site)

The site content is German-only (`defaultLocale: 'de'`), though the boilerplate scaffolding supports multi-locale routing via `src/i18n/`. The `astro.config.mjs` still declares `['en', 'es', 'fr']` locales but only `de` is active in `src/i18n/config.ts`.

### Routing

- **File-based routing** via `src/pages/`
- Localized routes use `src/pages/[lang]/[...slug].astro` — Astro's i18n adapter handles locale-prefixed URLs
- Route IDs are defined in `src/i18n/routes.ts`; use `getLocalizedPath(routeId, locale)` to generate links, not hardcoded strings
- The `[lang]` pages (`about`, `contact`, `services`) use catch-all slugs validated against `src/i18n/routes.ts`

### Component pattern

Each component lives in its own folder with:
- `ComponentName.astro` — static/SSR version
- `ComponentName.tsx` — React version for client-side interactivity
- `component.variants.ts` — CVA variant definitions shared between `.astro` and `.tsx`
- `index.ts` — re-exports

Use the `.astro` version by default; `.tsx` only when client interactivity is needed.

### Layouts

- `BaseLayout.astro` — root HTML shell, SEO, JSON-LD, theme script, consent banner
- `LandingLayout.astro` — marketing pages with Header + Footer
- `MarketingLayout.astro` / `PageLayout.astro` — page variants
- `BlogLayout.astro` — blog post wrapper

### Content

Content collections defined in `src/content.config.ts` (Astro Content Layer API):
- `blog` — MDX posts in `src/content/blog/`; currently only `de` locale
- `pages` — MDX static pages in `src/content/pages/`
- `authors` — JSON in `src/content/authors/`
- `faqs` — JSON in `src/content/faqs/`

### Site-specific data

Static site content (strengths, cases, service areas, contact links) lives in `src/data/rocketbase.ts`. This is where structured page data lives rather than in content collections.

### Configuration

- `src/config/site.config.ts` — site name, description, URL, social links, branding
- `src/config/nav.config.ts` — nav items (controls display order; routing is filesystem-based)
- `src/i18n/routes.ts` — route ID → locale slug mappings; used by `LocalizedLink` and `getLocalizedPath`

### Styling

- Design tokens: `src/styles/tokens/` (colors, typography, spacing, primitives)
- Themes: `src/styles/themes/default.css` and `midnight.css`
- Global CSS: `src/styles/global.css`
- Dark mode uses the `dark` class on `<html>`; theme is persisted to `localStorage`

### Path aliases

`@/` maps to `src/` — use this for all imports.

### Environment variables

See `.env.example`. Key variables:
- `SITE_URL` — production URL (required for canonical/OG/sitemap)
- `PUBLIC_GA_MEASUREMENT_ID` / `PUBLIC_GTM_ID` — optional analytics
- `PLUNK_SECRET_KEY`, `CONTACT_NOTIFICATION_EMAIL` — contact form mail
- `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` — optional SEO verification

### OG image generation

Auto-generated per page via `src/pages/og/[...slug].png.ts` using Satori + `satori-html`.

### API routes — Netlify Functions, not Astro endpoints

`output: 'static'` with no adapter, so Astro cannot serve API routes. All server
logic lives in `netlify/functions/` and maps itself to a URL via
`export const config = { path: '/api/...' }`.

- `netlify/functions/contact.ts` — `/api/contact`, contact form
- `netlify/functions/funnel-lead.ts` — `/api/funnel-lead`, funnel + brief leads

**These endpoints 404 under `astro dev`.** Use `netlify dev` (port 8888) to
exercise them locally.

### Contact form spam protection

Deliberately small — all of it lives in `contact.ts`. No captcha, no third-party
service, no extra stores.

Only a filled honeypot is dropped, silently, with the same response a genuine
sender gets. Everything else is *delivered* — `suspicionOf()` just flags the
lead with `hasSpamVerdacht` and names the reasons. A false positive therefore
costs a filter rule, never a lead, which is why the checks can stay blunt.

The load-bearing signal is a hidden `renderedAt` field stamped by JS in
`ContactAttribution.astro`: form scrapers don't run JavaScript, so they omit it
entirely. Stamp it on init (not submit), inside the component's own module
script so `astro:after-swap` re-stamps it.

Since 2026-10-11 a missing `renderedAt` no longer passes silently. It gets the
two-step gate in `netlify/lib/human-check.ts`: the response is an HTML page with
the data in an HMAC-signed hidden field and a second button. Scrapers POST once
and never render the answer, so they stop here; a human clicks once more. No
mail, no link, no captcha — the second POST *is* the check. The signed payload
wins over anything the second request sends, otherwise the page would be an open
relay. The `[SPAM?]` flagging stays as a second layer behind it.

Both the no-JS and the JS path must keep working: `/api/contact` answers HTML to
the former (confirmation, thanks, errors) and JSON to the latter. The form has a
real `action`/`method`, so it submits without JavaScript — that is deliberate and
what makes the gate necessary in the first place.

Grep Netlify logs for `[contact:verdacht]` to see what is being flagged, and for
`[contact:zwischenschritt]` to see how often the gate fires — the gap between
that count and the deliveries that follow is what the gate actually stops.
Check both before tightening anything.
