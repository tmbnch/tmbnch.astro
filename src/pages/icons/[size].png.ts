import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import siteConfig from '@/config/site.config';

const SUPPORTED_SIZES = [192, 512] as const;
type SupportedSize = (typeof SUPPORTED_SIZES)[number];

export function getStaticPaths() {
  return SUPPORTED_SIZES.map((size) => ({ params: { size: String(size) } }));
}

export const GET: APIRoute = async ({ params }) => {
  const size = Number(params.size) as SupportedSize;
  if (!SUPPORTED_SIZES.includes(size)) {
    return new Response('Not found', { status: 404 });
  }

  const svgPath = resolve(process.cwd(), 'src/assets/branding/logomark.svg');
  const svg = readFileSync(svgPath);
  const background = siteConfig.branding.colors.backgroundColor;
  const inner = Math.round(size * 0.66);

  const png = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: await sharp(svg).resize(inner, inner, { fit: 'contain' }).png().toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toBuffer();

  return new Response(png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
};
