export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  /**
   * Branding configuration
   * Logo files: Replace SVGs in src/assets/branding/
   * Favicon: Replace in public/favicon.svg
   */
  branding: {
    /** Logo alt text for accessibility */
    logo: {
      alt: string;
    };
    /** Favicon path (lives in public/) */
    favicon: {
      svg: string;
    };
    /** Theme colors for manifest and browser UI */
    colors: {
      /** Browser toolbar color (hex) */
      themeColor: string;
      /** PWA splash screen background (hex) */
      backgroundColor: string;
    };
  };
}

const env = import.meta.env;

const siteConfig: SiteConfig = {
  name: 'RocketBase',
  description:
    'Software für inhabergeführte Betriebe, die nicht in Standardlösungen passen: Angebot und Kalkulation, Einsatz und Abrechnung, Zahlen und Steuerung. Direkt mit Marten Prieß.',
  url: env.SITE_URL || env.PUBLIC_SITE_URL || 'https://rocketbase.io',
  ogImage: '/og-default.png',
  author: 'Marten Prieß',
  email: 'marten@rocketbase.io',
  phone: '+49 4173 21995 20',
  address: {
    street: 'Am Ortsfelde 24',
    city: 'Winsen (Luhe)',
    state: 'Niedersachsen',
    zip: '21423',
    country: 'DE',
  },
  socialLinks: [
    'https://github.com/rocketbase-io',
    'https://www.linkedin.com/company/rocketbase-io/',
    'https://www.instagram.com/rocketbase.io/',
  ],
  verification: {
    google: env.GOOGLE_SITE_VERIFICATION,
    bing: env.BING_SITE_VERIFICATION,
  },
  // Branding: Logo files live in src/assets/branding/
  // Replace the SVG files there with your own branding
  branding: {
    logo: {
      alt: 'RocketBase Logo',
    },
    favicon: {
      svg: '/favicon.svg',
    },
    colors: {
      themeColor: '#6372A5',
      backgroundColor: '#ffffff',
    },
  },
};

export default siteConfig;
