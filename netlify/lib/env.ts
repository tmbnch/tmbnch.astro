/**
 * Liest eine Server-Variable. Lokal kommt sie aus `.env.local` (über `pnpm dev:netlify`),
 * auf Netlify aus Site configuration → Environment variables.
 *
 * Secrets nie mit `PUBLIC_` benennen: diese Variablen baut Astro in den Browser-Code ein.
 */
export function env(name: string): string | undefined {
  return process.env[name] || undefined;
}

/** Wie `env`, wirft aber, wenn die Variable fehlt. Für Werte, ohne die eine Function nicht arbeiten kann. */
export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`Umgebungsvariable ${name} fehlt (lokal in .env.local, sonst im Netlify-Projekt setzen).`);
  return value;
}
