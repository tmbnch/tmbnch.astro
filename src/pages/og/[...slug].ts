import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOGImage } from '@/lib/og';

/** Ein OG-Bild pro Seite; der Slug entspricht dem Pfad (siehe components/seo/SEO.astro). */
const PAGES = [
  {
    slug: 'index',
    title: 'Am Freitag ist die Woche schon gebucht.',
    description: 'Projektzeit, Arbeitszeit und Urlaub in einer App. Der Desktop-Tracker schlägt dir offene Stunden zum Buchen vor.',
  },
  {
    slug: 'projektzeiterfassung',
    eyebrow: 'Projektzeiterfassung',
    title: 'Jede Stunde beim richtigen Kunden.',
    description: 'Timer, Kalender oder Stundenzettel. Mit Stundensätzen, Rundung und Export für die Rechnung.',
  },
  {
    slug: 'arbeitszeiterfassung',
    eyebrow: 'Arbeitszeiterfassung',
    title: 'Die Arbeitszeit fällt beim Buchen mit ab.',
    description: 'ArbZG-Prüfung, Überstundenkonto, Urlaub und Freigaben aus denselben Einträgen wie die Projektzeit.',
  },
  { slug: 'impressum', title: 'Impressum' },
  { slug: 'datenschutz', title: 'Datenschutz' },
  { slug: '404', title: 'Seite nicht gefunden' },
];

export const getStaticPaths: GetStaticPaths = () =>
  PAGES.map((p) => ({ params: { slug: `${p.slug}.png` }, props: p }));

export const GET: APIRoute = async ({ props }) => {
  const p = props as (typeof PAGES)[number];
  const buffer = await generateOGImage({ title: p.title, description: p.description, eyebrow: p.eyebrow });
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
