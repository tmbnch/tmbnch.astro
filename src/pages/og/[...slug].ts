import type { APIRoute, GetStaticPaths } from 'astro';
import { resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { generateOGImage, generateCaseOGImage, generateBlogOGImage } from '@/lib/og';
import siteConfig from '@/config/site.config';
import { cases, additionalCases } from '@/data/rocketbase';
import { defaultLocale } from '@/i18n/config';

const STATIC_PAGES = [
  { slug: 'index',        title: siteConfig.name,          description: siteConfig.description },
  { slug: 'leistungen',   title: 'Leistungen',             description: 'Discovery, Konzeption, Individualsoftware und Betrieb. Vier Leistungsbereiche für nachhaltige Softwareprojekte.' },
  { slug: 'arbeitsweise', title: 'Wie wir arbeiten',       description: 'Vier konkrete Wechsel, die unsere Projekte schneller, leichter und tragfähiger machen.' },
  { slug: 'referenzen',   title: 'Referenzen',             description: 'Ausgewählte Referenzen mit Hintergrund zu Ausgangslage, Vorgehen und Projektrahmen.' },
  { slug: 'standardsoftware-abloesung', title: 'Standardsoftware ablösen', description: 'Wenn die Branchensoftware, Vertec oder ein gewachsenes System das Wachstum bremst: Ablösung durch eine individuelle Lösung, die zum Prozess passt.' },
  { slug: 'einsatzplanung', title: 'Einsatzplanung & Disposition', description: 'Disposition, Einsatzplanung und Abrechnung raus aus Excel – eine Lösung, die euren realen Ablauf kennt.' },
  { slug: 'f/angebote',   title: 'Angebotsbaustein',       description: 'Was sieht euer Kunde, wenn euer Angebot ankommt? Kalkulation nach eurer Regel, Deckungsbeitrag vor dem Versand, Angebot als Seite.' },
  { slug: 'discovery-workshop', title: 'Discovery-Workshop', description: 'Strukturierter Außenblick auf Prozesse und Systemlandschaft: Datenflüsse, Mockups und eine Empfehlung mit Festpreis. Drei Termine, ein Dokument, ein Festpreis.' },
  { slug: 'kontakt',      title: 'Kontakt',                description: `Sprecht direkt mit Marten Prieß von ${siteConfig.name}.` },
  { slug: 'imprint',      title: 'Impressum',              description: 'Rechtliche Informationen zu RocketBase.' },
  { slug: 'privacy',      title: 'Datenschutz',            description: 'Datenschutzinformationen und Ihre Rechte als Nutzer.' },
];

// Map case slug → teaser filename under src/assets/references/
const CASE_TEASER_FILES: Record<string, string> = {
  bonprix: 'teaser-bonprix.jpeg',
  statista: 'teaser-statista.jpeg',
  'fkc-consulting': 'teaser-fkc.jpeg',
  'schlosserei-diezinger': 'teaser-schlosserei.jpeg',
  'statista-canva': 'teaser-statista-canva.jpeg',
  'stage-cml': 'teaser-stage-cml.jpeg',
  'sam-vorteilsguru': 'teaser-sam-vorteilsguru.jpeg',
  'mavox-winterdienst': 'teaser-mavox-winterdienst.jpeg',
  'bonprix-collection-planning': 'teaser-bonprix-collection-planning.jpeg',
};

const ASSETS_REFERENCES_DIR = resolve(process.cwd(), 'src/assets/references');

type StaticProps = {
  kind: 'static';
  title: string;
  description?: string;
  type: 'website' | 'article';
};

type CaseProps = {
  kind: 'case';
  client: string;
  title: string;
  description?: string;
  teaserPath: string;
};

type BlogProps = {
  kind: 'blog';
  title: string;
  description?: string;
  author?: string;
  teaserPath: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const staticPaths = STATIC_PAGES.map((page) => ({
    params: { slug: `${page.slug}.png` },
    props: {
      kind: 'static',
      title: page.title,
      description: page.description,
      type: 'website' as const,
    } satisfies StaticProps,
  }));

  const allCases = [...cases, ...additionalCases];
  const casePaths = allCases
    .filter((c) => CASE_TEASER_FILES[c.slug])
    .map((c) => ({
      params: { slug: `referenzen/${c.slug}.jpg` },
      props: {
        kind: 'case',
        client: c.client,
        title: c.title,
        description: c.description,
        teaserPath: resolve(ASSETS_REFERENCES_DIR, CASE_TEASER_FILES[c.slug]),
      } satisfies CaseProps,
    }));

  // Blog posts: use the post's own hero image as OG background.
  // The image path in the frontmatter is relative to the MDX file (e.g. "./hero.png")
  // - we resolve it against the post's directory via post.filePath.
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.locale === defaultLocale && (import.meta.env.PROD ? data.draft !== true : true);
  });

  const blogPaths = blogPosts
    .filter((post) => post.data.image && post.filePath)
    .map((post) => {
      const slug = post.id.replace(`${defaultLocale}/`, '');
      // post.filePath is like "src/content/blog/de/<slug>/index.mdx"
      // Resolve the image path (e.g. "./hero.png") relative to its directory.
      const postDir = resolve(process.cwd(), post.filePath!, '..');
      const rawImagePath = (post.data.image as { src?: string } | undefined)?.src ?? './hero.png';
      // ImageMetadata.src is something like "/@fs/.../hero.png" in dev or a hashed path.
      // Fall back to the known convention ./hero.png inside the post folder for safety.
      const teaserPath = resolve(postDir, 'hero.png');
      void rawImagePath;
      return {
        params: { slug: `blog/${slug}.jpg` },
        props: {
          kind: 'blog',
          title: post.data.title,
          description: post.data.description,
          author: post.data.author,
          teaserPath,
        } satisfies BlogProps,
      };
    });

  return [...staticPaths, ...casePaths, ...blogPaths];
};

export const GET: APIRoute = async ({ props }) => {
  const p = props as StaticProps | CaseProps | BlogProps;

  let buffer: Buffer;
  if (p.kind === 'case') {
    buffer = await generateCaseOGImage({
      teaserPath: p.teaserPath,
      client: p.client,
      title: p.title,
      description: p.description,
    });
  } else if (p.kind === 'blog') {
    buffer = await generateBlogOGImage({
      teaserPath: p.teaserPath,
      title: p.title,
      description: p.description,
      author: p.author,
    });
  } else {
    buffer = await generateOGImage({
      title: p.title,
      description: p.description,
      type: p.type,
    });
  }

  // Case + Blog OGs are JPEG (photographic background), static OGs are PNG.
  // The URL extension matches the real format (.jpg vs .png, see getStaticPaths),
  // so Content-Type and og:image:type stay consistent.
  const contentType = p.kind === 'case' || p.kind === 'blog' ? 'image/jpeg' : 'image/png';

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
