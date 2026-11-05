/**
 * Prüft die externen Links im gebauten `dist/` auf Erreichbarkeit.
 *
 * Usage:   pnpm build && pnpm check:links
 *          pnpm check:links -- --all     (ignoriert den Cache)
 *
 * Warum nach dem Build und nicht gegen die Quelldateien: Im MDX stehen Links
 * teils in JSX-Attributen, teils in Markdown-Syntax, teils in Komponenten, die
 * ihre href erst zur Laufzeit setzen. Das gebaute HTML ist die einzige Fassung,
 * die alle drei Fälle gleich behandelt - und es ist das, was der Leser anklickt.
 *
 * Interne Links prüft dieses Skript NICHT: Die entstehen aus dem Content-Layer,
 * und ein Tippfehler im Pfad fällt bereits im Build oder in der Netlify-
 * Catch-all-Weiterleitung auf. Hier geht es um fremde Server, die ohne unser
 * Zutun umziehen - vor allem Studien-PDFs, die Verlage gern neu einsortieren.
 *
 * Ein 403 ist kein toter Link. hbr.org, gartner.com, forrester.com und
 * sciencedirect.com beantworten jeden automatisierten Request mit 403 oder 429,
 * auch aus dem Browser heraus funktionieren die Seiten. Solche Hosts stehen in
 * BOT_BLOCKED und werden als "geblockt" gemeldet, nicht als Fehler. Wer sie
 * trotzdem sehen will, ruft das Skript mit --strict auf.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const CACHE_FILE = resolve(process.cwd(), 'node_modules/.cache/check-links.json');
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // eine Woche
const TIMEOUT_MS = 15000;
const CONCURRENCY = 6;

/**
 * Hosts, die Bots grundsätzlich abweisen. Ein Eintrag hier heißt: "Der Link ist
 * von Hand geprüft, der Server mag nur keine Skripte." Beim Hinzufügen bitte
 * das Datum der manuellen Prüfung in den Kommentar schreiben.
 */
/** Die eigene Domain: Canonical-, OG- und Share-URLs zeigen auf Seiten, die
 * es erst nach dem Deploy gibt. Intern wird ohnehin nicht geprüft. */
const OWN_HOSTS = ['rocketbase.io', 'www.rocketbase.io'];

const BOT_BLOCKED = [
  'hbr.org', // 403 für jeden nicht-Browser-Request, geprüft 14.09.2026
  'www.gartner.com', // 403, geprüft 14.09.2026
  'www.forrester.com', // 403, geprüft 14.09.2026
  'www.sciencedirect.com', // 403 via Cloudflare
  'www.tandfonline.com', // 403 via Cloudflare
  'doi.org', // leitet auf die obigen weiter
  'www.mckinsey.com', // 403 bei HEAD, geprüft 14.09.2026
  'www.linkedin.com',
  'www.facebook.com', // 400 auf HEAD/GET ohne Browser, geprüft 14.09.2026
];

type CacheEntry = { status: number | 'blocked' | 'error'; checkedAt: number; note?: string };
type Cache = Record<string, CacheEntry>;

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Sammelt href-Werte samt der Seiten, auf denen sie stehen. */
async function collectLinks(files: string[]): Promise<Map<string, Set<string>>> {
  const links = new Map<string, Set<string>>();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const page = file.replace(DIST, '').replace(/\/index\.html$/, '/') || '/';
    // preconnect/dns-prefetch/preload sind Ressourcen-Hinweise, keine Ziele.
    const cleaned = html.replace(
      /<link\b[^>]*\brel="(?:preconnect|dns-prefetch|preload|modulepreload)"[^>]*>/g,
      ''
    );
    for (const match of cleaned.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      const url = match[1].replace(/&amp;/g, '&');
      const host = new URL(url).hostname;
      if (OWN_HOSTS.includes(host)) continue;
      if (!links.has(url)) links.set(url, new Set());
      links.get(url)!.add(page);
    }
  }
  return links;
}

async function loadCache(): Promise<Cache> {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8')) as Cache;
  } catch {
    return {};
  }
}

async function saveCache(cache: Cache): Promise<void> {
  await mkdir(resolve(process.cwd(), 'node_modules/.cache'), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * HEAD zuerst, GET als Rückfallebene: Manche Server (u.a. einige
 * Verlags-CDNs) beantworten HEAD mit 405, liefern aber auf GET sauber aus.
 */
async function probe(url: string): Promise<CacheEntry> {
  const host = new URL(url).hostname;
  if (BOT_BLOCKED.includes(host)) {
    return { status: 'blocked', checkedAt: Date.now(), note: 'Host weist Skripte ab' };
  }
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/pdf,*/*',
        },
      });
      if (response.ok || method === 'GET') {
        return { status: response.status, checkedAt: Date.now() };
      }
    } catch (error) {
      if (method === 'GET') {
        return {
          status: 'error',
          checkedAt: Date.now(),
          note: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }
  return { status: 'error', checkedAt: Date.now(), note: 'unerreichbar' };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const ignoreCache = args.includes('--all');
  const strict = args.includes('--strict');

  if (!existsSync(DIST)) {
    console.error('dist/ fehlt. Erst `pnpm build` laufen lassen.');
    process.exit(2);
  }

  const files = await htmlFiles(DIST);
  const links = await collectLinks(files);
  const cache = await loadCache();
  const urls = [...links.keys()].sort();

  console.log(`${urls.length} externe Links auf ${files.length} Seiten.`);

  const results = new Map<string, CacheEntry>();
  const queue = [...urls];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const cached = cache[url];
      if (!ignoreCache && cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
        results.set(url, cached);
        continue;
      }
      const entry = await probe(url);
      cache[url] = entry;
      results.set(url, entry);
    }
  });
  await Promise.all(workers);
  await saveCache(cache);

  const broken: string[] = [];
  const blocked: string[] = [];

  for (const url of urls) {
    const entry = results.get(url)!;
    const pages = [...links.get(url)!].join(', ');
    if (entry.status === 'blocked') {
      blocked.push(`  ${url}\n    auf: ${pages}`);
    } else if (
      entry.status === 'error' ||
      (typeof entry.status === 'number' && entry.status >= 400)
    ) {
      broken.push(
        `  ${entry.status} ${url}\n    auf: ${pages}${entry.note ? `\n    ${entry.note}` : ''}`
      );
    }
  }

  if (blocked.length) {
    console.log(`\n${blocked.length} Link(s) auf Hosts, die Skripte abweisen (von Hand geprüft):`);
    console.log(blocked.join('\n'));
  }

  if (broken.length) {
    console.error(`\n${broken.length} kaputte(r) Link(s):`);
    console.error(broken.join('\n'));
    process.exit(1);
  }

  if (strict && blocked.length) {
    console.error('\n--strict: geblockte Hosts zählen als Fehler.');
    process.exit(1);
  }

  console.log('\nAlle erreichbaren Links antworten.');
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
