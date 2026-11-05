import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',

  site: process.env.SITE_URL || 'https://rocketbase.io',

  // Kanonische URL-Form ist MIT Trailing Slash (so werden Canonicals und Sitemap
  // erzeugt). Ohne diese Einstellung indexiert Google beide Varianten getrennt –
  // in der Search Console tauchten /standardsoftware-abloesung und
  // /standardsoftware-abloesung/ als zwei Seiten mit geteilten Signalen auf.
  trailingSlash: 'always',

  // i18n configuration
  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de',
        },
      },
      // /f/ (Anzeigen), /b/ (Brief) und /instagram/ (Bio-Link) sind jeweils nur
      // über ihren eigenen Kanal erreichbar und stehen auf noindex — sie gehören
      // nicht in die Sitemap.
      filter: (page) =>
        !/\/(impressum|datenschutz)\/?$/.test(page) &&
        !/\/f\//.test(page) &&
        !/\/b\//.test(page) &&
        !/\/instagram\/?$/.test(page),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  security: {
    checkOrigin: true,
  },

  experimental: {
    contentIntellisense: true,
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },

  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
