import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import siteConfig from '@/config/site.config';
import { cases, additionalCases } from '@/data/rocketbase';
import { preisFrage } from '@/data/funnelSchlank';
import { tueren, type TuerId } from '@/data/tueren';
import { angeboteFaqs } from '@/components/angebote/faqs';
import { einsatzFaqs } from '@/components/einsatz/faqs';
import { zahlenFaqs } from '@/components/zahlen/faqs';
import { abloesungFaqs } from '@/components/abloesung/faqs';
import { softwareCheckFaqs } from '@/components/check/faqs';

/**
 * /llms-full.txt - Volltexte aller Fachbeiträge und Referenzen als Markdown,
 * dazu die häufigen Fragen je Tür.
 *
 * Ergänzt /llms.txt (dort nur der Index): Ein Modell kann hier den kompletten
 * fachlichen Inhalt in einem Abruf erfassen, ohne jede Seite einzeln zu laden
 * und aus HTML zu extrahieren.
 *
 * Wird beim Build aus den Content-Collections und src/data/rocketbase.ts
 * erzeugt und bleibt damit automatisch synchron zum Seiteninhalt.
 */

/**
 * Reduziert MDX auf lesbaren Fließtext: Import-Zeilen, JSX-Blöcke und
 * Markdown-Auszeichnung fallen weg, die inhaltlich relevanten Texte aus
 * JSX-Karten bleiben erhalten.
 */
function mdxToPlainText(body: string): string {
  let text = body;

  // Import-Anweisungen am Dateianfang
  text = text.replace(/^import\s+.*$/gm, '');

  // Text aus JSX-Elementen ziehen, bevor die Tags entfernt werden -
  // in den Karten steckt echter Inhalt, nicht nur Layout.
  text = text.replace(/<[^>]+>/g, (tag) => (tag.startsWith('</') ? ' ' : ' '));

  // Markdown-Auszeichnung entfernen, Linktexte behalten
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  // HTML-Entities, die in JSX-Attributen stehen können
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // Artikel-interne Überschriften eine Ebene tiefer setzen: In dieser Datei ist
  // der Artikeltitel bereits "##", die Abschnitte darunter müssen "###" sein.
  text = text.replace(/^(#{2,5}) /gm, (_m, hashes) => `${hashes}# `);

  // Leerraum normalisieren, Absatzstruktur erhalten
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

// Dieselbe Preisfrage wie auf den Seiten (pages/*.astro).
const mitPreis = (faqs: { q: string; a: string }[]) => faqs.map((f) => (f.q === preisFrage.q ? preisFrage : f));
const tuerFaqs: [TuerId, { q: string; a: string }[]][] = [
  ['angebot', mitPreis(angeboteFaqs)],
  ['einsatz', mitPreis(einsatzFaqs)],
  ['zahlen', mitPreis(zahlenFaqs)],
  ['abloesung', abloesungFaqs],
  ['check', softwareCheckFaqs],
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || `${siteConfig.url}/`).replace(/\/$/, '');

  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  const allCases = [...cases, ...additionalCases];

  const postSections = posts.map((post) => {
    const slug = post.id.replace(/^de\//, '');
    const published = post.data.publishedAt.toISOString().slice(0, 10);
    const tags = post.data.tags?.length ? `\nSchlagworte: ${post.data.tags.join(', ')}` : '';
    const content = mdxToPlainText(post.body ?? '');

    return `## ${post.data.title}

Quelle: ${base}/blog/${slug}/
Veröffentlicht: ${published}
Autor: ${post.data.author}${tags}

${post.data.description}

${content}`;
  });

  const caseSections = allCases.map((c) => {
    const parts = [
      `## Referenz: ${c.client} - ${c.title}`,
      '',
      `Quelle: ${base}/referenzen/${c.slug}/`,
      '',
      c.description,
    ];

    if (c.challenge) parts.push('', 'Ausgangslage', c.challenge);
    if (c.approach) parts.push('', 'Vorgehen', c.approach);
    if (c.impact) parts.push('', 'Wirkung', c.impact);
    if (c.outcomes?.length) parts.push('', 'Ergebnisse', ...c.outcomes.map((o) => `- ${o}`));
    if (c.services?.length) parts.push('', 'Leistungen', ...c.services.map((s) => `- ${s}`));
    if (c.testimonial?.quote) {
      const { quote, author, position } = c.testimonial;
      parts.push('', `Kundenstimme: "${quote}" - ${author}${position ? `, ${position}` : ''}`);
    }

    return parts.join('\n');
  });

  const tuerSections = tuerFaqs.map(([id, faqs]) => {
    const { titel, href, text } = tueren[id];
    return `## ${titel}

Quelle: ${base}${href}

${text}

${faqs.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}`;
  });

  const body = `# RocketBase - Volltexte

> ${siteConfig.description}

Diese Datei enthält die häufigen Fragen je Lösung, die vollständigen Fachbeiträge
und Referenzbeschreibungen von ${base} als Fließtext. Der Index mit allen Seiten steht unter
${base}/llms.txt.

Anbieter: rocketbase.io software productions GmbH, ${siteConfig.address?.street}, ${siteConfig.address?.zip} ${siteConfig.address?.city}
Ansprechpartner: ${siteConfig.author}
Stand: automatisch beim Seiten-Build erzeugt

Bei Zitaten bitte die bei jedem Abschnitt angegebene Quell-URL nennen.

---

# Lösungen und häufige Fragen

${tuerSections.join('\n\n---\n\n')}

---

# Fachbeiträge

${postSections.join('\n\n---\n\n')}

---

# Referenzprojekte

${caseSections.join('\n\n---\n\n')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
