/**
 * Route Definitions for Translated URLs
 *
 * This file defines the URL slugs for each route in each supported locale.
 * The route ID (key) is used internally to reference routes, while the values
 * define the actual URL segments for each language.
 *
 * Example:
 * - Route 'about' → /about (en), /es/sobre-nosotros (es), /fr/a-propos (fr)
 *
 * Note: Empty string '' represents the root/home page.
 */

import type { Locale } from './config';

/**
 * Navigation configuration for a route
 */
export type NavConfig = {
  /** Whether to show this route in the navbar */
  show: boolean;
  /** Sort order in navigation (lower = first) */
  order: number;
  /** Translation key for the navigation label (e.g., 'nav.about') */
  label: string;
};

/**
 * A route definition maps each locale to its URL slug
 * Optionally includes navigation configuration
 */
export type RouteDefinition = Record<Locale, string> & {
  nav?: NavConfig;
};

/**
 * Route definitions for all static pages
 *
 * Keys are internal route IDs (use these in LocalizedLink and getLocalizedPath)
 * Values are the URL slugs for each locale, plus optional nav config
 *
 * Rules:
 * - Use lowercase letters and hyphens only (no underscores, no special chars)
 * - Empty string '' for home/root page
 * - Do not include leading or trailing slashes
 */
export const routes = {
  // Home page (root) - not shown in nav (logo links there)
  home: {
    de: '',
    nav: { show: false, order: 0, label: 'nav.home' },
  },

  // Static pages
  about: {
    de: 'about',
    nav: { show: false, order: 4, label: 'nav.about' },
  },
  contact: {
    de: 'kontakt',
    nav: { show: false, order: 5, label: 'nav.contact' },
  },

  // Blog section
  blog: {
    de: 'blog',
    nav: { show: true, order: 6, label: 'nav.blog' },
  },

  // Components showcase
  components: {
    de: 'components',
    nav: { show: false, order: 98, label: 'nav.components' },
  },

  // Lösungen-Dropdown (die drei Türen plus Ablöse); die Seite /leistungen/ bleibt die Übersicht
  services: {
    de: 'leistungen',
    nav: { show: true, order: 1, label: 'nav.services' },
  },

  // How we work
  // Arbeitsweise und Mission: nur noch im Footer, nicht in der Hauptnavigation
  // (entschieden 2026-10-07: oben stehen die Lösungen, der Workshop, Referenzen, Blog)
  work: {
    de: 'arbeitsweise',
    nav: { show: false, order: 3, label: 'nav.work' },
  },

  // Referenzen / Case studies
  references: {
    de: 'referenzen',
    nav: { show: true, order: 4, label: 'nav.references' },
  },

  // Discovery-Workshop: direkt in der Hauptnavigation
  discoveryWorkshop: {
    de: 'discovery-workshop',
    nav: { show: true, order: 2, label: 'nav.discoveryWorkshop' },
  },

  // Die Türen (Sub-Landingpages - nicht als Top-Level-Eintrag, aber im Lösungen-Dropdown der Navbar).
  // Tür 1 (Angebot & Kalkulation) ist /angebote/ (statische Seite, nicht über routes.ts verlinkt),
  // Tür 3 (Zahlen & Steuerung) ist /zahlen/ (ebenfalls statisch).
  standardsoftwareAbloesung: {
    de: 'standardsoftware-abloesung',
    nav: { show: false, order: 51, label: 'nav.standardsoftwareAbloesung' },
  },
  einsatzplanung: {
    de: 'einsatzplanung',
    nav: { show: false, order: 52, label: 'nav.einsatzplanung' },
  },

  // Ziel des Bio-Links auf Instagram (noindex, nicht in der Navigation).
  // `nav` steht hier, obwohl die Seite nie in der Navigation auftaucht: Der
  // Typ entsteht über `as const satisfies`, und ein Eintrag ohne `nav` hat die
  // Eigenschaft dann gar nicht — `getNavRoutes()` in i18n/helpers.ts greift
  // aber über alle Einträge darauf zu.
  instagram: {
    de: 'instagram',
    nav: { show: false, order: 92, label: 'nav.instagram' },
  },

  // Legal pages (noindex, no nav)
  imprint: {
    de: 'impressum',
    nav: { show: false, order: 90, label: 'nav.imprint' },
  },
  privacy: {
    de: 'datenschutz',
    nav: { show: false, order: 91, label: 'nav.privacy' },
  },
} as const satisfies Record<string, RouteDefinition>;

/**
 * Type-safe route identifier
 */
export type RouteId = keyof typeof routes;

/**
 * Get all available route IDs
 */
export const routeIds = Object.keys(routes) as RouteId[];

/**
 * Validate if a string is a valid route ID
 */
export function isValidRouteId(id: string): id is RouteId {
  return id in routes;
}

