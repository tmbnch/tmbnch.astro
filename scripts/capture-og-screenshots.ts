/**
 * Nur lokal: nimmt 1200×630-Screenshots der Seiten als OG-Bilder auf.
 *
 * Aufruf:  pnpm og:capture            (alle Seiten)
 *          pnpm og:capture index      (nur einzelne Slugs)
 *
 * Übernommen aus rcktbs.astro. Startet einen eigenen `astro dev` auf einem freien Port
 * (oder nutzt einen laufenden), fotografiert jede statische Seite und legt sie als
 * public/og-screenshots/<slug>.jpg ab. SEO.astro nimmt diese Bilder automatisch vor dem
 * generierten Template (/og/<slug>.png). Die Bilder werden eingecheckt.
 */
import { chromium } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const OUT_DIR = resolve(process.cwd(), 'public/og-screenshots');

// Etwas breiter aufnehmen (gleiches Seitenverhältnis) und herunterrechnen: Der Inhalt
// (.wrap, max. 1200 px) bekommt so links und rechts etwas Luft.
const CAPTURE_WIDTH = 1440;
const CAPTURE_HEIGHT = 756; // 1440 * 630/1200
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Wartezeit nach dem Laden. Die Schnelleingabe auf /projektzeiterfassung/ tippt sich beim
 * ersten Sichtbarwerden selbst vor (gut 4 s); fotografiert wird der Endzustand mit
 * laufendem Timer.
 */
const SETTLE_MS = 5000;

// Rechtstexte bekommen das generierte Bild mit Titel; ein Screenshot zeigte nur Fließtext.
const SKIP_PAGES = new Set(['impressum', 'datenschutz']);
const SKIP_DIRS = new Set(['og']);
const PAGES_DIR = resolve(process.cwd(), 'src/pages');

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
    if (SKIP_PAGES.has(`${prefix}${base}`)) continue;
    // Mit Schrägstrich am Ende: trailingSlash 'always' beantwortet die Form ohne mit 404.
    out.push(base === 'index' ? `/${prefix}` : `/${prefix}${base}/`);
  }
  return out;
}

async function collectTargets(): Promise<Array<{ path: string; slug: string }>> {
  const all = (await collectStaticPages(PAGES_DIR))
    .sort()
    .map((path) => ({ path, slug: path.replace(/^\/|\/$/g, '') || 'index' }));
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
        rej(new Error('Port nicht ermittelbar'));
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
      // noch nicht oben
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Dev-Server unter ${url} nach ${timeoutMs} ms nicht erreichbar`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const targets = await collectTargets();
  console.log(`→ ${targets.length} Seiten: ${targets.map((t) => t.path).join(' ')}`);

  const port = await findFreePort();
  let baseUrl = `http://127.0.0.1:${port}`;
  console.log(`→ starte astro dev auf Port ${port}`);

  // --ignore-lock: Astro 7 schickt den Dev-Server sonst in den Hintergrund, wenn es eine
  // Agenten-Umgebung erkennt, und der Kindprozess wäre sofort beendet.
  const child: ChildProcess = spawn(
    'pnpm',
    ['exec', 'astro', 'dev', '--port', String(port), '--host', '127.0.0.1', '--ignore-lock'],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

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

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      // 2× aufnehmen und herunterrechnen: deutlich schärfere Schrift.
      deviceScaleFactor: 2,
      colorScheme: 'light',
    });
    // Keine Zählung in Plausible und kein Meta-Pixel durch die Aufnahmen.
    await context.route(/plausible\.io|connect\.facebook\.net/, (r) => r.abort());
    const page = await context.newPage();

    await page.addInitScript(() => {
      // Gespeicherte Ablehnung: kein Banner. Format wie in ConsentBanner.astro (getStored),
      // Schlüssel und Version aus src/config/consent.config.ts.
      try {
        localStorage.setItem(
          'timebench-consent',
          JSON.stringify({
            version: 1,
            timestamp: new Date().toISOString(),
            categories: { necessary: true, marketing: false },
          }),
        );
      } catch {
        // dann greift das CSS unten
      }
      // Mit gespeicherter Wahl blendet der Banner den Wiederöffnen-Knopf ein; der säße sonst
      // in der Ecke jedes Bildes. Dev-Toolbar ebenso.
      const style = document.createElement('style');
      style.textContent =
        '#consent-banner, .consent-reopener, .consent-mini, astro-dev-toolbar, astro-dev-overlay { display: none !important; }';
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    });

    for (const { path, slug } of targets) {
      const url = `${baseUrl}${path}`;
      console.log(`→ ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        await page.evaluate(() =>
          document.querySelectorAll('astro-dev-toolbar, astro-dev-overlay').forEach((el) => el.remove()),
        );
        await page.waitForTimeout(SETTLE_MS);
        const outPath = resolve(OUT_DIR, `${slug}.jpg`);
        await mkdir(dirname(outPath), { recursive: true });
        const raw = await page.screenshot({
          type: 'png',
          clip: { x: 0, y: 0, width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
        });
        await sharp(raw)
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
