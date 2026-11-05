/**
 * Format a date for display
 */
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Calculate reading time for MDX content. Strips JSX blocks, imports, and
 * code fences so only the actual prose is counted.
 */
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;

  const prose = content
    // Strip frontmatter (defensive - usually already removed before reaching here)
    .replace(/^---[\s\S]*?---\n/, '')
    // Strip import / export statements
    .replace(/^(import|export)\s+[^\n]*$/gm, '')
    // Strip fenced code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Strip multi-line JSX/HTML blocks - any top-level JSX element spanning multiple lines
    // (attributes, nested JSX and all). Matches conservatively: block-level tags only.
    .replace(/<([A-Za-z][A-Za-z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/g, '')
    // Strip self-closing JSX (e.g. <Image ... />)
    .replace(/<[A-Za-z][^>]*\/>/g, '')
    // Strip remaining inline HTML/JSX tags
    .replace(/<\/?[A-Za-z][^>]*>/g, '')
    // Strip Markdown link URLs, keep the label text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip images
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Strip markdown emphasis markers
    .replace(/[*_`~]+/g, ' ');

  const words = prose.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if a URL is external
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
