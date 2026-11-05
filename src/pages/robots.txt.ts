import type { APIRoute } from 'astro';
import siteConfig from '@/config/site.config';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || siteConfig.url;

  // KI-Crawler bewusst erlaubt: Sie werden namentlich aufgeführt, damit die
  // Entscheidung dokumentiert ist und sich einzelne Bots später gezielt
  // ausschliessen lassen, ohne die Datei umzubauen.
  //
  // Zwei Arten sind zu unterscheiden:
  //  - Live-Abruf bei einer Nutzerfrage (ChatGPT-User, PerplexityBot,
  //    Claude-User, Google-Extended): Grundlage dafür, in Chat-Antworten
  //    zitiert und empfohlen zu werden.
  //  - Trainings-Crawler (GPTBot, ClaudeBot, CCBot, Applebot-Extended):
  //    Inhalte fliessen in künftige Modelle ein.
  const aiUserAgents = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'meta-externalagent',
    'Bytespider',
    'cohere-ai',
    'DuckAssistBot',
    'MistralAI-User',
  ];

  const aiBlock = aiUserAgents
    .map((ua) => `User-agent: ${ua}\nAllow: /\nDisallow: /api/\n`)
    .join('\n');

  const robotsTxt = `
User-agent: *
Allow: /

# Block API routes
Disallow: /api/

# ----------------------------------------------------------------------
# KI-Assistenten und Suchagenten: ausdrücklich erlaubt.
# Inhaltsübersicht für Sprachmodelle: ${siteUrl}llms.txt
# Volltexte aller Fachbeiträge:       ${siteUrl}llms-full.txt
# ----------------------------------------------------------------------

${aiBlock}
Sitemap: ${siteUrl}sitemap-index.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
