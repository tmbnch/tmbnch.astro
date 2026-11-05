import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
// satori bleibt auf der 0.28-Linie: ab 0.60 rechnet es Prozentbreiten in gepolsterten
// Containern anders, und die Fußzeile läuft rechts aus dem Bild.
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import siteConfig from '@/config/site.config';

export interface OGImageOptions {
  title: string;
  description?: string;
  eyebrow?: string;
}

const fontCache = new Map<string, ArrayBuffer>();
let logoDataUri: string | undefined;
const siteHostname = new URL(siteConfig.url).hostname;

/**
 * satori-html escaped interpolierte Strings (`&` -> `&amp;`), satori rendert Textknoten aber
 * wörtlich. Deshalb die Entities in jedem Textknoten zurückwandeln.
 */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
};

function decodeEntities<T>(node: T): T {
  if (typeof node === 'string') {
    return node.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (m) => ENTITIES[m]) as T;
  }
  if (Array.isArray(node)) return node.map(decodeEntities) as T;
  if (node && typeof node === 'object' && 'props' in node) {
    const n = node as { props?: { children?: unknown } };
    if (n.props && n.props.children !== undefined) {
      n.props.children = decodeEntities(n.props.children);
    }
  }
  return node;
}

function loadFont(filename: string): ArrayBuffer {
  if (!fontCache.has(filename)) {
    fontCache.set(filename, readFileSync(resolve(process.cwd(), 'public/fonts', filename)).buffer as ArrayBuffer);
  }
  return fontCache.get(filename)!;
}

async function loadLogo(): Promise<string> {
  if (!logoDataUri) {
    const svg = readFileSync(resolve(process.cwd(), 'src/assets/branding/logomark.svg'));
    const png = await sharp(svg).resize(96, 96).png().toBuffer();
    logoDataUri = `data:image/png;base64,${png.toString('base64')}`;
  }
  return logoDataUri;
}

/** OG-Bild im timebench-Stil: Ink-Fläche, Sprout/Bloom-Akzent, Bildmarke unten links. */
export async function generateOGImage({ title, description, eyebrow }: OGImageOptions): Promise<Buffer> {
  const logo = await loadLogo();
  const desc = description && description.length > 130 ? description.slice(0, 127) + '…' : description ?? '';

  const markup = decodeEntities(html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: space-between; background: #17160f; padding: 64px 80px; font-family: 'Inter'; position: relative;">
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #7ac62f 0%, #f5b700 50%, #ea3d92 100%);"></div>
      <div style="display: flex; position: absolute; right: -160px; top: -160px; width: 520px; height: 520px; border-radius: 9999px; background: #5ea01f; opacity: 0.18;"></div>
      <div style="display: flex; color: #b4e97c; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">${eyebrow ?? 'Zeiterfassung für Projektteams'}</div>
      <div style="display: flex; flex-direction: column; gap: 22px;">
        <div style="display: flex; font-size: ${title.length > 48 ? '56px' : '68px'}; font-weight: 700; color: #fbfaf4; line-height: 1.08; letter-spacing: -0.03em; max-width: 960px;">${title}</div>
        <div style="display: ${desc ? 'flex' : 'none'}; font-size: 24px; color: #c9c6ba; line-height: 1.45; max-width: 900px;">${desc}</div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${logo}" style="width: 48px; height: 48px;" />
          <span style="font-size: 30px; font-weight: 700; color: #fbfaf4; letter-spacing: -0.03em;">time</span><span style="font-size: 30px; font-weight: 700; color: #ea3d92; letter-spacing: -0.03em; margin-left: -14px;">bench</span>
        </div>
        <span style="font-size: 20px; color: #9a968a;">${siteHostname}</span>
      </div>
    </div>
  `);

  // @ts-expect-error satori-html VNode ist mit satori kompatibel
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: loadFont('inter-latin-400-normal.ttf'), weight: 400, style: 'normal' },
      { name: 'Inter', data: loadFont('inter-latin-700-normal.ttf'), weight: 700, style: 'normal' },
    ],
  });

  return Buffer.from(await sharp(Buffer.from(svg)).png().toBuffer());
}
