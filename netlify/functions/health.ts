import type { Config } from '@netlify/functions';
import { env } from '../lib/env';

/**
 * Lebenszeichen unter /api/health. Zeigt, dass Functions laufen und in welchem
 * Netlify-Kontext (dev, deploy-preview, production). Gibt keine Werte von Variablen aus.
 */
export default async () =>
  Response.json({ ok: true, context: env('CONTEXT') ?? 'unbekannt' }, { headers: { 'Cache-Control': 'no-store' } });

export const config: Config = { path: '/api/health' };
