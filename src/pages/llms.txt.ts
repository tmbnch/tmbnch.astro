import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import siteConfig from '@/config/site.config';
import { cases, additionalCases, serviceAreas, contactLinks } from '@/data/rocketbase';

/**
 * /llms.txt - kuratierte Inhaltsübersicht für Sprachmodelle.
 *
 * Der llms.txt-Vorschlag (llmstxt.org) sieht eine kurze Markdown-Datei vor,
 * die einem Modell in einem Abruf zeigt, worum es auf der Seite geht und wo
 * die relevanten Inhalte liegen - statt sich durch HTML-Navigation zu hangeln.
 *
 * Die Datei wird beim Build aus denselben Quellen erzeugt wie die Seiten
 * selbst (Content-Collections + src/data/rocketbase.ts) und bleibt damit
 * automatisch aktuell. Volltexte stehen unter /llms-full.txt.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || `${siteConfig.url}/`).replace(/\/$/, '');

  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  const allCases = [...cases, ...additionalCases];

  const faqs = (await getCollection('faqs'))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  const postLines = posts.map((post) => {
    const slug = post.id.replace(/^de\//, '');
    return `- [${post.data.title}](${base}/blog/${slug}/): ${post.data.description}`;
  });

  const caseLines = allCases.map(
    (c) => `- [${c.client}: ${c.title}](${base}/referenzen/${c.slug}/): ${c.description}`,
  );

  const serviceLines = serviceAreas.map(
    (s) => `- **${s.title}**: ${s.description}`,
  );

  const faqLines = faqs
    .filter((f) => f.data.answer || f.data.summary)
    .map((f) => `- **${f.data.question}** ${f.data.answer ?? f.data.summary}`);

  const body = `# RocketBase

> ${siteConfig.description}

RocketBase (rocketbase.io software productions GmbH) entwickelt Software für
inhabergeführte Betriebe, die nicht in Standardlösungen passen, typischerweise
Dienstleister ab etwa 30 Mitarbeitenden (Beratung, Prüfung, Wartung, Service,
Handwerk, Metallbau). Meist gibt es ein ERP, ein CRM oder eine Branchensoftware,
und daneben laufen Kalkulation, Einsatzplanung oder Auswertungen in Excel.
RocketBase baut entweder den fehlenden Teil oder löst die Branchensoftware
Schritt für Schritt ab.
Sitz ist Winsen (Luhe) bei Hamburg, gearbeitet wird bundesweit.

Ansprechpartner ist Marten Prieß (Gründer und Geschäftsführer). Der erste Schritt
ist ein kostenloses Erstgespräch von 30 Minuten direkt mit ihm: ${contactLinks.cal}
Bei Angebot, Einsatz, Zahlen und Ablösung folgt danach ein Workshop in drei
Terminen, an dessen Ende ein Festpreis für die Umsetzung steht. Beim Software-Check
richtet sich der Preis nach dem Umfang des Codes.

## Drei Bereiche, die Ablösung und der Software-Check

- [Angebot und Kalkulation](${base}/angebote/): Angebote, die sich nach der eigenen Kalkulationsregel selbst rechnen, mit Deckungsbeitrag vor dem Versand, als Angebotsseite beim Kunden und Zusage per Klick.
- [Einsatz und Abrechnung](${base}/einsatzplanung/): Plantafel mit Abwesenheiten, Ablauf je Auftrag, Einsatz je Vertrag, Leistungserfassung, Rechnung und Mahnwesen in einem System, statt Excel und Stundenzettel.
- [Zahlen und Steuerung](${base}/zahlen/): Cockpit für Umsatz und Prognose, Auslastung bis zur Person, Deckungsbeitrag, auslaufende Verträge und Forderungen, live aus den vorhandenen Systemen.
- [Standardsoftware ablösen](${base}/standardsoftware-abloesung/): Branchensoftware samt Excel drumherum Schritt für Schritt ablösen, im Parallelbetrieb und mit Übernahme der gesamten Datenhistorie (Beispiel: Vertec bei FKC Consulting).
- [Software-Check](${base}/software-check/): Bestehende oder mit KI gebaute Software nach OWASP ASVS und darüber hinaus prüfen, 2.400 € Festpreis je System, Architektur-Review und Fahrplan für den Cyber Resilience Act. Prüfbericht für Kunden und Auditoren. Kein Penetrationstest.

## Weitere Seiten

- [Lösungen im Überblick](${base}/leistungen/): Die drei Bereiche, die Ablösung und der Weg vom Erstgespräch bis zum Betrieb.
- [Workshop](${base}/discovery-workshop/): Drei Termine (3 h, 2 h, 1 h), ein Dokument mit Prozessbild und Entwürfen, ein Festpreis für die Umsetzung.
- [Referenzen](${base}/referenzen/): Umgesetzte Projekte mit Ausgangslage, Vorgehen und Ergebnis.
- [Kontakt](${base}/kontakt/): Erstgespräch vereinbaren.
- [Arbeitsweise](${base}/arbeitsweise/): Haltung und Vorgehen hinter der Arbeit.

## Wobei RocketBase außerdem hilft

${serviceLines.join('\n')}

## Fachbeiträge

${postLines.join('\n')}

## Referenzprojekte

${caseLines.join('\n')}

## Häufige Fragen

${faqLines.join('\n')}

## Hinweise zur Nutzung

- Volltexte aller Fachbeiträge, Referenzen und die häufigen Fragen je Lösung: [${base}/llms-full.txt](${base}/llms-full.txt)
- Maschinenlesbare Seitenübersicht: [${base}/sitemap-index.xml](${base}/sitemap-index.xml)
- Inhalte sind durchgehend deutschsprachig und richten sich an Entscheider im Mittelstand.
- Bei Zitaten bitte die jeweilige Quell-URL nennen.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
