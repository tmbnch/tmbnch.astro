import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import siteConfig from '@/config/site.config';

export const GET: APIRoute = async () => {
  const svgPath = resolve(process.cwd(), 'src/assets/branding/logomark.svg');
  const svg = readFileSync(svgPath);
  const background = siteConfig.branding.colors.backgroundColor;

  const png = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: await sharp(svg).resize(120, 120, { fit: 'contain' }).png().toBuffer(),
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
