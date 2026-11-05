import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
// satori bleibt auf der 0.28-Linie: ab 0.60 rechnet es Prozentbreiten in gepolsterten
// Containern anders, und die Fußzeile (Logo links, Domain rechts) läuft rechts aus dem Bild.
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import siteConfig from '@/config/site.config';

export interface OGImageOptions {
  title: string;
  description?: string;
  type?: 'website' | 'article';
}

export interface CaseOGImageOptions {
  /** Absolute path to the case teaser image (e.g. imported via ImageMetadata.src) */
  teaserPath: string;
  client: string;
  title: string;
  description?: string;
}

export interface BlogOGImageOptions {
  /** Absolute path to the blog post's hero image */
  teaserPath: string;
  title: string;
  description?: string;
  /** Author name shown next to "Blog" badge */
  author?: string;
}

const fontCaches = new Map<string, ArrayBuffer>();
const logoCache = new Map<string, string>();

const siteHostname = new URL(siteConfig.url).hostname;

/**
 * satori-html escapes interpolated strings (`&` -> `&amp;`), but satori renders text
 * nodes verbatim, so a title like "Einsatz & Abrechnung" showed up as "&amp;".
 * Decode the few entities the escaper produces, in every text node of the tree.
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

function loadFontFile(filename: string): ArrayBuffer {
  if (!fontCaches.has(filename)) {
    const fontPath = resolve(process.cwd(), 'public/fonts', filename);
    fontCaches.set(filename, readFileSync(fontPath).buffer as ArrayBuffer);
  }
  return fontCaches.get(filename)!;
}

/** Load the logomark, optionally recolored (e.g. "#fff" for dark backgrounds). */
async function loadLogo(color = '#000'): Promise<string> {
  if (!logoCache.has(color)) {
    const svgPath = resolve(process.cwd(), 'src/assets/branding/logomark.svg');
    let svg = readFileSync(svgPath, 'utf-8');
    if (color !== '#000') {
      svg = svg.replace(/fill="#000"/g, `fill="${color}"`);
    }
    const pngBuffer = await sharp(Buffer.from(svg)).resize(54, 61).png().toBuffer();
    logoCache.set(color, `data:image/png;base64,${pngBuffer.toString('base64')}`);
  }
  return logoCache.get(color)!;
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const { title, description, type = 'website' } = options;

  const fontData = loadFontFile('inter-latin-400-normal.ttf');
  const fontBoldData = loadFontFile('inter-latin-700-normal.ttf');
  const logoDataUri = await loadLogo('#fff');

  const truncatedDescription = description
    ? description.length > 120
      ? description.slice(0, 117) + '...'
      : description
    : '';

  const badgeLabel = type === 'article' ? 'Artikel' : 'Seite';

  const markup = decodeEntities(html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #0d0f14 0%, #161a24 50%, #0d0f14 100%); padding: 60px 80px; font-family: 'Inter'; position: relative;">
      <!-- Left accent bar -->
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, #6372A5 0%, #8b9bd4 50%, #6372A5 100%);"></div>
      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding-left: 20px;">
        <!-- Top: type badge -->
        <div style="display: flex; align-items: center;">
          <div style="display: flex; padding: 8px 18px; background: rgba(99, 114, 165, 0.12); border: 1px solid rgba(99, 114, 165, 0.35); border-radius: 9999px; color: #8b9bd4; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;">${badgeLabel}</div>
        </div>
        <!-- Middle: title + description -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; font-size: ${title.length > 50 ? '48px' : '60px'}; font-weight: 700; color: #f4f4f5; line-height: 1.15; letter-spacing: -0.025em;">${title}</div>
          <div style="display: ${truncatedDescription ? 'flex' : 'none'}; font-size: 22px; font-weight: 400; color: #8b9bd4; line-height: 1.5; max-width: 820px;">${truncatedDescription}</div>
        </div>
        <!-- Bottom: logo + site name + domain -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${logoDataUri}" style="width: 32px; height: 36px;" />
            <span style="font-size: 20px; font-weight: 700; color: #f4f4f5; letter-spacing: -0.01em;">${siteConfig.name}</span>
          </div>
          <span style="font-size: 15px; font-weight: 400; color: #52525b;">${siteHostname}</span>
        </div>
      </div>
    </div>
  `);

  // @ts-expect-error satori-html VNode is compatible with satori
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: fontBoldData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  return Buffer.from(
    await sharp(Buffer.from(svg)).resize(1200).png().toBuffer()
  );
}

/**
 * Reference / case-study OG image: uses the case teaser image as background
 * with a darkening gradient overlay and a text layer (client, title, description).
 */
export async function generateCaseOGImage(options: CaseOGImageOptions): Promise<Buffer> {
  const { teaserPath, client, title, description } = options;

  const fontData = loadFontFile('inter-latin-400-normal.ttf');
  const fontBoldData = loadFontFile('inter-latin-700-normal.ttf');
  const logoDataUri = await loadLogo('#fff');

  const truncatedDescription = description
    ? description.length > 140
      ? description.slice(0, 137) + '...'
      : description
    : '';

  // 1. Background: teaser image, cover-resized to 1200x630, slightly darkened.
  const teaserBuffer = readFileSync(teaserPath);
  const backgroundBuffer = await sharp(teaserBuffer)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.55 })
    .toBuffer();

  // 2. Foreground: gradient overlay + text via satori SVG.
  const markup = decodeEntities(html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 60px 80px; font-family: 'Inter'; background: linear-gradient(135deg, rgba(13,15,20,0.82) 0%, rgba(22,26,36,0.55) 55%, rgba(13,15,20,0.82) 100%); position: relative;">
      <!-- Left accent bar -->
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, #6372A5 0%, #8b9bd4 50%, #6372A5 100%);"></div>

      <!-- Top: kicker / client badge -->
      <div style="display: flex; align-items: center;">
        <div style="display: flex; padding: 8px 18px; background: rgba(99, 114, 165, 0.22); border: 1px solid rgba(139, 155, 212, 0.45); border-radius: 9999px; color: #e5e7eb; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em;">Referenz · ${client}</div>
      </div>

      <!-- Middle: title + description -->
      <div style="display: flex; flex-direction: column; gap: 18px; max-width: 960px;">
        <div style="display: flex; font-size: ${title.length > 60 ? '44px' : '54px'}; font-weight: 700; color: #f4f4f5; line-height: 1.12; letter-spacing: -0.025em; text-shadow: 0 2px 20px rgba(0,0,0,0.45);">${title}</div>
        <div style="display: ${truncatedDescription ? 'flex' : 'none'}; font-size: 20px; font-weight: 400; color: #d4d4d8; line-height: 1.5; max-width: 880px; text-shadow: 0 1px 8px rgba(0,0,0,0.6);">${truncatedDescription}</div>
      </div>

      <!-- Bottom: logo + site name + domain -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${logoDataUri}" style="width: 32px; height: 36px;" />
          <span style="font-size: 20px; font-weight: 700; color: #f4f4f5; letter-spacing: -0.01em;">${siteConfig.name}</span>
        </div>
        <span style="font-size: 15px; font-weight: 400; color: #d4d4d8;">${siteHostname}</span>
      </div>
    </div>
  `);

  // @ts-expect-error satori-html VNode is compatible with satori
  const overlaySvg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fontData, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontBoldData, weight: 700, style: 'normal' },
    ],
  });

  const overlayPng = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  // 3. Composite: overlay on top of the darkened background.
  //    JPEG is much smaller than PNG for photographic content; quality 82
  //    with mozjpeg keeps text crisp and blob size under ~120KB.
  return await sharp(backgroundBuffer)
    .composite([{ input: overlayPng, blend: 'over' }])
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();
}

/**
 * Blog OG image: same photographic-background + overlay pattern as case images,
 * but with a "Blog" kicker (optionally prefixed with author name).
 */
export async function generateBlogOGImage(options: BlogOGImageOptions): Promise<Buffer> {
  const { teaserPath, title, description, author } = options;

  const fontData = loadFontFile('inter-latin-400-normal.ttf');
  const fontBoldData = loadFontFile('inter-latin-700-normal.ttf');
  const logoDataUri = await loadLogo('#fff');

  const truncatedDescription = description
    ? description.length > 140
      ? description.slice(0, 137) + '...'
      : description
    : '';

  const kicker = author ? `Blog · ${author}` : 'Blog';

  const teaserBuffer = readFileSync(teaserPath);
  const backgroundBuffer = await sharp(teaserBuffer)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.55 })
    .toBuffer();

  const markup = decodeEntities(html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 60px 80px; font-family: 'Inter'; background: linear-gradient(135deg, rgba(13,15,20,0.82) 0%, rgba(22,26,36,0.55) 55%, rgba(13,15,20,0.82) 100%); position: relative;">
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, #6372A5 0%, #8b9bd4 50%, #6372A5 100%);"></div>

      <div style="display: flex; align-items: center;">
        <div style="display: flex; padding: 8px 18px; background: rgba(99, 114, 165, 0.22); border: 1px solid rgba(139, 155, 212, 0.45); border-radius: 9999px; color: #e5e7eb; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em;">${kicker}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px; max-width: 960px;">
        <div style="display: flex; font-size: ${title.length > 60 ? '44px' : '54px'}; font-weight: 700; color: #f4f4f5; line-height: 1.12; letter-spacing: -0.025em; text-shadow: 0 2px 20px rgba(0,0,0,0.45);">${title}</div>
        <div style="display: ${truncatedDescription ? 'flex' : 'none'}; font-size: 20px; font-weight: 400; color: #d4d4d8; line-height: 1.5; max-width: 880px; text-shadow: 0 1px 8px rgba(0,0,0,0.6);">${truncatedDescription}</div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${logoDataUri}" style="width: 32px; height: 36px;" />
          <span style="font-size: 20px; font-weight: 700; color: #f4f4f5; letter-spacing: -0.01em;">${siteConfig.name}</span>
        </div>
        <span style="font-size: 15px; font-weight: 400; color: #d4d4d8;">${siteHostname}</span>
      </div>
    </div>
  `);

  // @ts-expect-error satori-html VNode is compatible with satori
  const overlaySvg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fontData, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontBoldData, weight: 700, style: 'normal' },
    ],
  });

  const overlayPng = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  return await sharp(backgroundBuffer)
    .composite([{ input: overlayPng, blend: 'over' }])
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();
}
