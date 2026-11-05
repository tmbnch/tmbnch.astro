export const de = {
  site: {
    name: 'RocketBase',
    description:
      'Individuelle Unternehmenssoftware für den Mittelstand. Von der Prozessanalyse bis zum Betrieb, direkt mit Marten Prieß.',
  },

  nav: {
    home: 'Start',
    about: 'Über RocketBase',
    blog: 'Blog',
    contact: 'Kontakt',
    features: 'Leistungen',
    components: 'Komponenten',
    docs: 'Dokumentation',
    getStarted: 'Kontakt',
    services: 'Lösungen',
    work: 'Wie wir arbeiten',
    mission: 'Mission',
    references: 'Referenzen',
    discoveryWorkshop: 'Workshop',
    standardsoftwareAbloesung: 'Standardsoftware ablösen',
    einsatzplanung: 'Einsatz & Abrechnung',
  },

  common: {
    readMore: 'Mehr erfahren',
    loading: 'Lädt...',
    error: 'Ein Fehler ist aufgetreten',
    notFound: 'Seite nicht gefunden',
    backHome: 'Zur Startseite',
    copied: 'Kopiert',
    copy: 'Kopieren',
  },

  footer: {
    copyright: '© {year} RocketBase. Alle Rechte vorbehalten.',
    madeWith: 'Made with',
    maintainedBy: 'Betreut von',
    links: {
      documentation: 'Blog',
      github: 'GitHub',
      twitter: 'LinkedIn',
      license: 'Kontakt',
    },
  },

  about: {
    title: 'Über RocketBase',
    description:
      'RocketBase verbindet Konzern-Erfahrung, Prozessverständnis und pragmatische Softwareentwicklung für ambitionierte mittelständische Unternehmen.',
  },

  services: {
    title: 'Leistungen',
    description:
      'Von Discovery und Konzeption bis zu individueller Software, Integration und Betrieb.',
  },

  contact: {
    meta: {
      title: 'Kontakt: Erstgespräch zu Individualsoftware',
      description:
        '30 Minuten, kostenlos, direkt mit Marten Prieß: Ihr erzählt, wo es hakt, wir sagen ehrlich, ob und wie wir helfen. Aus Winsen bei Hamburg, bundesweit remote.',
    },
    hero: {
      badge: 'Direkter Kontakt',
      title: 'Sprechen wir',
      titleHighlight: 'über euer Vorhaben.',
      description:
        'Ihr sprecht direkt mit Marten Prieß: über eure Ziele, eure Prozesse und den nächsten sinnvollen Schritt. Ein Gespräch, kein Vertriebstermin.',
    },
    form: {
      title: 'Projekt anfragen',
      name: 'Name',
      namePlaceholder: 'Euer Name',
      email: 'E-Mail',
      emailPlaceholder: 'name@unternehmen.de',
      subject: 'Thema',
      subjectPlaceholder: 'Worum geht es?',
      message: 'Nachricht',
      messagePlaceholder:
        'Worum geht es? Bestehende Systeme, Engpässe im Ablauf, ein konkretes Vorhaben...',
      submit: 'Nachricht senden',
      sending: 'Wird gesendet...',
      success: 'Nachricht erfolgreich gesendet. Wir melden uns zeitnah zurück.',
      error: 'Die Nachricht kam nicht durch. Bitte noch einmal versuchen.',
    },
    info: {
      title: 'Direkte Wege zu RocketBase',
      email: {
        label: 'E-Mail',
        value: 'marten@rocketbase.io',
      },
      github: {
        label: 'GitHub',
        value: 'rocketbase-io',
      },
      twitter: {
        label: 'LinkedIn',
        value: 'rocketbase-io',
      },
    },
  },

  blog: {
    title: 'Individualsoftware & Prozesse: Praxisberichte',
    description:
      'Standardsoftware am Limit, Tool-Wildwuchs, Reporting aus Excel, Legacy-Hosting: Praxisbeiträge aus echten Ablöseprojekten im Mittelstand.',
    descriptionHtml:
      'Einblicke aus echten Projekten: <strong>Standardsoftware-Ablösung</strong>, <strong>Prozessoptimierung</strong>, Reporting und der Weg vom Tool-Wildwuchs zur belastbaren Steuerung.',
    allPosts: 'Alle Beiträge',
    featured: 'Empfohlen',
    noPosts: 'Noch keine Beiträge vorhanden.',
    relatedPosts: 'Weitere Beiträge',
    backToBlog: 'Zurück zum Blog',
    subscribe: 'Updates erhalten',
    subscribeDescription:
      'Neue Beiträge zu Produktstrategie, Plattformen und Delivery direkt ins Postfach.',
    emailPlaceholder: 'E-Mail-Adresse eingeben',
    subscribeButton: 'Abonnieren',
  },

  consent: {
    heading: 'Cookies',
    description: 'Cookies für Statistik & Marketing nur mit Zustimmung.',
    acceptAll: 'Alle akzeptieren',
    declineAll: 'Alle ablehnen',
    customize: 'Anpassen',
    savePreferences: 'Einstellungen speichern',
    settingsHeading: 'Datenschutzeinstellungen',
    privacyPolicyLabel: 'Datenschutz',
    alwaysOn: 'Immer aktiv',
  },
} as const;

export type TranslationKeys = typeof de;
