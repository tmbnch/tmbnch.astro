/**
 * Split-Screen für die Funnel-Seiten: links live, rechts lokal, Scrollen läuft mit.
 *
 *   npx astro dev --port 4330
 *   node scripts/funnel-vergleich/server.mjs
 *   → http://localhost:4400
 *
 * rocketbase.io sendet X-Frame-Options: DENY, deshalb laufen beide Seiten durch einen kleinen
 * Proxy, der den Header entfernt und ein Skript für den Scroll-Abgleich einfügt. Die Seiten
 * unterscheiden sich in der Länge, also folgt der Abgleich gemeinsamen Ankern (Seitenanfang,
 * #heute, #ablauf, #kontakt, Seitenende) statt Prozenten: Scrollt man links durch einen
 * gestrichenen Abschnitt, bleibt die rechte Seite stehen.
 *
 * Der Proxy blockt jedes POST und über die CSP alle Analytics, Pixel und Lead-Aufrufe.
 * Das Quiz lässt sich also durchklicken, ohne dass ein Lead oder Ereignis entsteht.
 */
import http from 'node:http';
import net from 'node:net';
import { readFile } from 'node:fs/promises';

const SHELL = 4400;
const LIVE = 4401;
const LOKAL = 4402;
const LIVE_ZIEL = 'https://rocketbase.io';
const LOKAL_PORT = 4330;

const dir = new URL('.', import.meta.url);

const einfuegen = `<script>(() => {
  const ANKER = ['heute', 'ablauf', 'kontakt'];
  const q = new URLSearchParams(location.search);
  const seite = q.get('seite');
  const anker = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const a = [{ id: 'start', y: 0 }];
    for (const id of ANKER) {
      const el = document.getElementById(id);
      if (el && el.offsetHeight) a.push({ id, y: el.getBoundingClientRect().top + scrollY - 60 });
    }
    a.push({ id: 'ende', y: max });
    return a;
  };
  let fremd = 0;
  addEventListener('scroll', () => {
    if (performance.now() < fremd) return;
    const a = anker();
    let i = 0;
    while (i < a.length - 2 && scrollY >= a[i + 1].y) i++;
    const t = Math.min(1, Math.max(0, (scrollY - a[i].y) / Math.max(1, a[i + 1].y - a[i].y)));
    parent.postMessage({ typ: 'scroll', seite, von: a[i].id, nach: a[i + 1].id, t }, '*');
  }, { passive: true });
  addEventListener('message', (e) => {
    if (e.data?.typ === 'raus') {
      for (const s of document.querySelectorAll('section')) {
        const t = s.querySelector('h1,h2')?.innerText?.replace(/\\s+/g, ' ') ?? '';
        if (e.data.titel.some((r) => t.startsWith(r))) {
          s.style.outline = '3px dashed #dc2626'; s.style.outlineOffset = '-3px'; s.style.position = 'relative';
          const m = document.createElement('div');
          m.textContent = 'Fällt im Funnel weg';
          m.style.cssText = 'position:absolute;top:8px;left:8px;z-index:50;background:#dc2626;color:#fff;font:600 12px system-ui;padding:4px 8px;border-radius:6px';
          s.append(m);
        }
      }
    }
    if (e.data?.typ !== 'folge') return;
    const a = anker();
    const von = a.find((x) => x.id === e.data.von) ?? a[0];
    const nach = a.find((x) => x.id === e.data.nach) ?? a[a.length - 1];
    fremd = performance.now() + 150;
    scrollTo(0, von.y + (nach.y - von.y) * e.data.t);
  });
  addEventListener('load', () => parent.postMessage({ typ: 'bereit', seite }, '*'));
})();</script>`;

const CSP =
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: blob:";

function proxy(ziel, seite) {
  return async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(403, { 'content-type': 'application/json' });
      res.end('{"success":false,"errors":{"vergleich":["Im Vergleich wird nichts abgeschickt."]}}');
      return;
    }
    try {
      const antwort = await fetch(ziel + req.url, {
        headers: { accept: req.headers.accept ?? '*/*', 'user-agent': 'funnel-vergleich' },
        redirect: 'follow',
      });
      const kopf = {};
      for (const [k, v] of antwort.headers) {
        if (!/^(x-frame-options|content-security-policy|content-encoding|content-length|transfer-encoding|strict-transport-security|set-cookie)$/i.test(k)) kopf[k] = v;
      }
      if ((antwort.headers.get('content-type') ?? '').includes('text/html')) {
        const html = await antwort.text();
        kopf['content-security-policy'] = CSP;
        res.writeHead(antwort.status, kopf);
        res.end(html.replace('</head>', `${einfuegen}</head>`));
        return;
      }
      res.writeHead(antwort.status, kopf);
      res.end(Buffer.from(await antwort.arrayBuffer()));
    } catch (fehler) {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`${seite}: ${fehler.message}`);
    }
  };
}

http.createServer(proxy(LIVE_ZIEL, 'live')).listen(LIVE);

const lokal = http.createServer(proxy(`http://localhost:${LOKAL_PORT}`, 'lokal'));
// HMR des Dev-Servers durchreichen, damit Textänderungen rechts sofort erscheinen.
lokal.on('upgrade', (req, socket, kopf) => {
  const ziel = net.connect(LOKAL_PORT, 'localhost', () => {
    ziel.write(`${req.method} ${req.url} HTTP/1.1\r\n${Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\n\r\n`);
    ziel.write(kopf);
    socket.pipe(ziel).pipe(socket);
  });
  ziel.on('error', () => socket.destroy());
  socket.on('error', () => ziel.destroy());
});
lokal.listen(LOKAL);

http
  .createServer(async (req, res) => {
    const pfad = req.url.split('?')[0];
    const datei = pfad === '/konzept' ? 'konzept.html' : 'shell.html';
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(await readFile(new URL(datei, dir)));
  })
  .listen(SHELL, () => console.log(`Vergleich: http://localhost:${SHELL}`));
