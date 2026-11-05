import type {
  WebSite,
  Organization,
  SoftwareApplication,
  BreadcrumbList,
  FAQPage,
  WithContext,
} from 'schema-dts';
import siteConfig from '@/config/site.config';

export function createWebsiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'de',
  };
}

/** Betreiber der Seite (laut Impressum). */
export function createOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    legalName: siteConfig.legalName,
    url: 'https://rocketbase.io',
    email: siteConfig.email,
    address: siteConfig.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address.street,
          postalCode: siteConfig.address.zip,
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.state,
          addressCountry: siteConfig.address.country,
        }
      : undefined,
  };
}

/** Das Produkt selbst. Bewusst ohne Preis, solange es keinen gibt. */
export function createSoftwareSchema(params: {
  name?: string;
  description?: string;
  url?: string;
} = {}): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: params.name ?? siteConfig.name,
    description: params.description ?? siteConfig.description,
    url: params.url ?? siteConfig.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, macOS, Windows, Linux',
    inLanguage: ['de', 'en'],
    publisher: { '@type': 'Organization', name: siteConfig.legalName },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
