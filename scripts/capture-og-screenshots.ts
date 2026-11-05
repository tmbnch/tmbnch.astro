/**
 * Local-only script: capture 1200x630 screenshots of pages for use as OG images.
 *
 * Usage:   pnpm og:capture
 *
 * The script starts its own `astro dev` server on a free port, waits for it
 * to be reachable, takes screenshots, and tears the server down. No other
 * shells/preview processes needed.
 *
 * Outputs PNGs to public/og-screenshots/<slug>.png. Screenshots present there
 * are automatically preferred over the generated OG template (SEO.astro).
 */
import { chromium } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const OUT_DIR = resolve(process.cwd(), 'public/og-screenshots');

// Capture at a slightly larger desktop viewport (keeps OG aspect ratio
// 1200:630) and downsample to the OG target size. 1440 keeps empty margins
// small (container max-width is 1280px) while giving the hero content a
// bit more breathing room than capturing at 1200 directly.
const CAPTURE_WIDTH = 1440;
const CAPTURE_HEIGHT = 756; // 1440 * 630/1200
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Jeder Pfad MIT Schrägstrich am Ende: Seit `trailingSlash: 'always'` in der
// astro.config.mjs beantwortet der Dev-Server die Form ohne Slash mit einer
// 404 — der Screenshot wäre dann stillschweigend die Astro-Fehlerseite.
//
// Die Ziele werden automatisch gesammelt (seit 2026-10-07, vorher eine feste
// Liste, auf der neue Seiten wie /zahlen/ oder die Funnels unter /f/ fehlten):
//   1. jede statische .astro-Datei unter src/pages (ohne [dynamische], 404, [lang])
//   2. die Funnel-Slugs aus src/data/funnels.ts         -> /f/<slug>/
//   3. die Brief-Slugs aus src/data/briefLandings.ts     -> /b/<slug>/
//   4. die Referenz-Slugs aus src/data/rocketbase.ts     -> /referenzen/<slug>/
// /f/ und /b/ sind noindex, werden aber weitergeleitet (Angebot an den Chef,
// Link per WhatsApp), und dann zeigt die Vorschau genau dieses Bild.
// Referenzen seit 2026-11-02: Der Hero zeigt Logo, Überschrift und das echte
// Produkt, das generierte Bild hatte den alten Titel über abgedunkeltem Teaser.
// Der Blog (auch die Übersicht) bleibt beim generierten Bild mit Titel (/og/...).
// Der Slug entspricht dem in SEO.astro: Pfad ohne Rand-Schrägstriche, also
// /f/zahlen/ -> public/og-screenshots/f/zahlen.jpg.
//
// Nur einzelne Seiten aufnehmen:  pnpm og:capture zahlen f/zahlen
const PAGES_DIR = resolve(process.cwd(), 'src/pages');
// blog: Übersicht und Beiträge behalten das generierte Template mit Titel (/og/...).
const SKIP_DIRS = new Set(['og', 'blog']);

async function collectStaticPages(dir: string, prefix = ''): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('[') || entry.name.startsWith('_')) continue;
    if (entry.isDirectory()) {
      if (prefix === '' && SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await collectStaticPages(join(dir, entry.name), `${prefix}${entry.name}/`)));
      continue;
    }
    if (!entry.name.endsWith('.astro') || entry.name === '404.astro') continue;
    const base = entry.name.replace(/\.astro$/, '');
    out.push(base === 'index' ? `/${prefix}` : `/${prefix}${base}/`);
  }
  return out;
}

async function slugsFrom(file: string): Promise<string[]> {
  const src = await readFile(resolve(process.cwd(), file), 'utf8');
  // Nur Slugs auf oberster Objektebene (4 Leerzeichen Einzug), keine verschachtelten.
  return [...src.matchAll(/^ {4}slug: '([^']+)'/gm)].map((m) => m[1]);
}

async function collectTargets(): Promise<Array<{ path: string; slug: string }>> {
  const paths = new Set(await collectStaticPages(PAGES_DIR));
  for (const s of await slugsFrom('src/data/funnels.ts')) paths.add(`/f/${s}/`);
  for (const s of await slugsFrom('src/data/briefLandings.ts')) paths.add(`/b/${s}/`);
  for (const s of await slugsFrom('src/data/rocketbase.ts')) paths.add(`/referenzen/${s}/`);
  const all = [...paths].sort().map((path) => ({ path, slug: path.replace(/^\/|\/$/g, '') || 'index' }));
  const only = process.argv.slice(2).map((a) => a.replace(/^\/|\/$/g, '') || 'index');
  return only.length ? all.filter((t) => only.includes(t.slug)) : all;
}

function findFreePort(): Promise<number> {
  return new Promise((res, rej) => {
    const server = createServer();
    server.unref();
    server.on('error', rej);
    server.listen(0, () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr) {
        const port = addr.port;
        server.close(() => res(port));
      } else {
        rej(new Error('could not determine port'));
      }
    });
  });
}

async function waitForReady(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`dev server not reachable at ${url} within ${timeoutMs}ms`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const TARGETS = await collectTargets();
  console.log(`→ ${TARGETS.length} Seiten: ${TARGETS.map((t) => t.path).join(' ')}`);

  const port = await findFreePort();
  // gleiche Adresse wie --host; „localhost“ löst je nach System auf ::1 auf
  let baseUrl = `http://127.0.0.1:${port}`;
  console.log(`→ starting astro dev on port ${port}`);

  const child: ChildProcess = spawn(
    'pnpm',
    ['exec', 'astro', 'dev', '--port', String(port), '--host', '127.0.0.1'],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  // Astro startet keinen zweiten Dev-Server im selben Projekt („Dev server already
  // running at …“). Dann nehmen wir einfach den, der schon läuft.
  let reuse: (url: string) => void = () => {};
  const alreadyRunning = new Promise<string>((res) => (reuse = res));
  const onOutput = (b: Buffer) => {
    const text = b.toString();
    process.stdout.write(`  [dev] ${text}`);
    const m = text.match(/already running at (https?:\/\/[^\s"\\]+)/);
    if (m) reuse(m[1].replace(/\/$/, ''));
  };
  child.stdout?.on('data', onOutput);
  child.stderr?.on('data', onOutput);

  const cleanup = () => {
    if (!child.killed) child.kill('SIGTERM');
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    const running = await Promise.race([alreadyRunning, waitForReady(baseUrl).then(() => null)]);
    if (running) {
      baseUrl = running;
      console.log(`→ nutze laufenden Dev-Server ${baseUrl}`);
      await waitForReady(baseUrl);
    }
    console.log(`→ dev server ready`);

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      // 2x aufnehmen und herunterrechnen: deutlich schärfere Schrift im OG-Bild.
      deviceScaleFactor: 2,
      colorScheme: 'light',
    });
    const page = await context.newPage();

    // Hide Astro's dev toolbar on every page before screenshotting.
    await page.addStyleTag({
      content: 'astro-dev-toolbar, astro-dev-overlay { display: none !important; }',
    });
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent =
        'astro-dev-toolbar, astro-dev-overlay { display: none !important; }';
      document.head.appendChild(style);
    });

    // Consent-Banner aus den OG-Bildern heraushalten. Zwei Schritte, weil eine
    // gespeicherte Entscheidung zwar das Banner unterdrückt, aber stattdessen
    // den kleinen Wiederöffnen-Knopf einblendet (`init()` in ConsentBanner.astro:
    // entschieden -> showReopener()) - der säße sonst in der Ecke jedes Bildes.
    //
    // Gespeichert wird "alles abgelehnt": Das Format muss zu `getStored()`
    // passen (gleiche `version`, sonst gilt die Einwilligung als nicht erteilt),
    // und nichts ausser den notwendigen Cookies zu setzen hält Plausible und
    // Meta aus den Aufnahmen heraus.
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          'velocity-consent',
          JSON.stringify({
            version: 1,
            timestamp: new Date().toISOString(),
            categories: {
              necessary: true,
              analytics: false,
              marketing: false,
              preferences: false,
            },
          }),
        );
      } catch {
        // Private-Mode o. Ä. - dann greift wenigstens das CSS unten.
      }

      // Einblend-Animationen (data-reveal, af-rise) im Endzustand festhalten. Sonst
      // landet der Hero mitten in der Animation im Bild: Eyebrow noch unsichtbar,
      // Überschrift nach oben verschoben und gequetscht unter der Navigation.
      const style = document.createElement('style');
      style.textContent =
        '#consent-banner, .consent-reopener { display: none !important; }' +
        '[data-reveal], .af-rise { opacity: 1 !important; transform: none !important; transition: none !important; }';
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    });

    for (const { path, slug } of TARGETS) {
      const url = `${baseUrl}${path}`;
      console.log(`→ ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        // Remove the dev toolbar element if Astro injected it after load.
        await page.evaluate(() => {
          document
            .querySelectorAll('astro-dev-toolbar, astro-dev-overlay')
            .forEach((el) => el.remove());
        });
        await page.waitForTimeout(800);
        const outPath = resolve(OUT_DIR, `${slug}.jpg`);
        await mkdir(dirname(outPath), { recursive: true });
        const rawBuffer = await page.screenshot({
          type: 'png',
          clip: { x: 0, y: 0, width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
        });
        await sharp(rawBuffer)
          .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', kernel: 'lanczos3' })
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toFile(outPath);
        console.log(`  ✓ ${outPath}`);
      } catch (err) {
        console.warn(`  ✗ ${url}: ${(err as Error).message}`);
      }
    }

    await browser.close();
  } finally {
    cleanup();
    await new Promise((r) => setTimeout(r, 200));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
