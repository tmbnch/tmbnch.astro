// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Produktions-URL für Sitemap, Canonical und OG-Bilder */
  readonly SITE_URL?: string;
  /** Plausible-Skript-ID (`pa-…`); ohne sie lädt keine Analyse */
  readonly PUBLIC_PLAUSIBLE_SCRIPT_ID?: string;
  readonly PUBLIC_CONSENT_ENABLED?: string;
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_META_DOMAIN_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  plausible?: (event: string, options?: { props?: Record<string, string>; callback?: () => void }) => void;
}
