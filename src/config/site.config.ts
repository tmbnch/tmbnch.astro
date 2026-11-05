export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  /** Betreiber laut Impressum */
  legalName: string;
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
  branding: {
    logo: { alt: string };
    /** Favicon (liegt in public/) */
    favicon: { svg: string };
    colors: {
      /** Browser-Toolbar */
      themeColor: string;
      /** PWA-Splash-Hintergrund */
      backgroundColor: string;
    };
  };
}

const env = import.meta.env;

const siteConfig: SiteConfig = {
  name: 'timebench',
  description:
    'timebench erfasst Projektzeit, Arbeitszeit und Urlaub in einer App. Der Desktop-Tracker schlägt dir offene Stunden zum Buchen vor, die Aktivitätsdaten bleiben auf deinem Rechner.',
  url: env.SITE_URL || env.PUBLIC_SITE_URL || 'https://timebench.io',
  ogImage: '/og/index.png',
  author: 'rocketbase.io software productions GmbH',
  email: 'info@rocketbase.io',
  phone: '+49 4173 21995 20',
  legalName: 'rocketbase.io software productions GmbH',
  address: {
    street: 'Am Ortsfelde 24',
    city: 'Winsen (Luhe)',
    state: 'Niedersachsen',
    zip: '21423',
    country: 'DE',
  },
  // Profile der rocketbase.io GmbH; timebench hat (noch) keine eigenen.
  socialLinks: [
    'https://github.com/rocketbase-io',
    'https://www.linkedin.com/company/rocketbase-io/',
    'https://www.instagram.com/rocketbase.io/',
  ],
  verification: {
    google: env.GOOGLE_SITE_VERIFICATION,
    bing: env.BING_SITE_VERIFICATION,
  },
  branding: {
    logo: { alt: 'timebench' },
    favicon: { svg: '/favicon.svg' },
    colors: {
      themeColor: '#17160f',
      backgroundColor: '#fbfaf4',
    },
  },
};

export default siteConfig;
