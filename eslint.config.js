import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '.netlify/',
      'public/pagefind/',
      // Scaffolding not yet wired into the site. Remove when activating.
      'src/pages/\\[lang\\]/**',
      'src/pages/_blog/**',
      'src/layouts/BlogLayout.astro',
      'src/layouts/MarketingLayout.astro',
      'src/components/landing/CTA.astro',
      'src/components/landing/Credibility.astro',
      'src/components/landing/LighthouseScores.astro',
      'src/components/landing/TechStack.astro',
      'src/components/landing/FeatureTabs.tsx',
      'src/components/layout/Header.astro',
      'src/components/layout/Footer.astro',
      'src/components/i18n/LocalizedLink.astro',
      'src/i18n/translations/en.ts',
      'src/i18n/translations/es.ts',
      'src/i18n/translations/fr.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // CLI-Werkzeuge: Die Konsole ist hier die Ausgabe, kein vergessenes Debugging.
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
