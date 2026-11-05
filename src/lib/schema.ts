import type {
  WebSite,
  Organization,
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  Service,
  ProfessionalService,
  WithContext,
} from 'schema-dts';
import siteConfig from '@/config/site.config';

/**
 * Create WebSite schema for homepage
 */
export function createWebsiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

/**
 * Create Organization schema
 */
export function createOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    legalName: 'rocketbase.io software productions GmbH',
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.svg`,
    email: siteConfig.email,
    sameAs: siteConfig.socialLinks,
    areaServed: [
      { '@type': 'Country', name: 'Deutschland' },
      { '@type': 'AdministrativeArea', name: 'Metropolregion Hamburg' },
    ],
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
    contactPoint: siteConfig.phone
      ? {
          '@type': 'ContactPoint',
          telephone: siteConfig.phone,
          email: siteConfig.email,
          contactType: 'customer service',
          areaServed: 'DE',
          availableLanguage: ['de', 'en'],
        }
      : undefined,
  };
}

/**
 * Create BlogPosting schema for blog posts
 */
export function createBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: { name: string; url?: string };
  keywords?: string[];
  wordCount?: number;
}): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image,
    datePublished: post.datePublished.toISOString(),
    dateModified: post.dateModified?.toISOString() || post.datePublished.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    // Sprache und freie Zugänglichkeit explizit auszeichnen: KI-Suchagenten
    // nutzen beides, um Relevanz und Zitierbarkeit einzuschätzen.
    inLanguage: 'de-DE',
    isAccessibleForFree: true,
    ...(post.keywords?.length ? { keywords: post.keywords.join(', ') } : {}),
    ...(post.wordCount ? { wordCount: post.wordCount } : {}),
  };
}

/**
 * Create BreadcrumbList schema
 */
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

/**
 * Create Service schema for an individual offering (e.g. a productised workshop).
 */
export function createServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  areaServed?: string;
  offers?: Array<{ name: string; price: string; priceCurrency?: string; description?: string }>;
}): WithContext<Service> {
  const provider: Organization = {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    serviceType: service.serviceType,
    areaServed: service.areaServed ?? 'DE',
    provider,
    ...(service.offers && service.offers.length > 0
      ? {
          offers: service.offers.map((o) => ({
            '@type': 'Offer' as const,
            name: o.name,
            price: o.price,
            priceCurrency: o.priceCurrency ?? 'EUR',
            description: o.description,
            availability: 'https://schema.org/InStock',
            url: service.url,
          })),
        }
      : {}),
  };
}

/**
 * Create ProfessionalService schema describing the agency itself
 * (useful on the services overview page as a B2B local/pro-business signal).
 */
export function createProfessionalServiceSchema(params: {
  url: string;
  description: string;
  services: string[];
}): WithContext<ProfessionalService> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    legalName: 'rocketbase.io software productions GmbH',
    url: params.url,
    description: params.description,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    logo: `${siteConfig.url}/favicon.svg`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    // Konkrete Regionen zusaetzlich zu 'DE': Der Sitz liegt in der Metropolregion
    // Hamburg, gearbeitet wird bundesweit remote. Beides explizit auszeichnen,
    // damit regionale B2B-Suchen die Seite ueberhaupt in Betracht ziehen.
    areaServed: [
      { '@type': 'Country', name: 'Deutschland' },
      { '@type': 'City', name: 'Hamburg' },
      { '@type': 'AdministrativeArea', name: 'Metropolregion Hamburg' },
      { '@type': 'AdministrativeArea', name: 'Niedersachsen' },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 53.3583,
      longitude: 10.2119,
    },
    sameAs: siteConfig.socialLinks,
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
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${siteConfig.name} Leistungen`,
      itemListElement: params.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s,
          provider: {
            '@type': 'Organization',
            name: siteConfig.name,
          },
        },
      })),
    },
  };
}

/**
 * Create FAQPage schema
 */
export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
