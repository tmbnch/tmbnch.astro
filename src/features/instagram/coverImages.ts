import type { ImageMetadata } from 'astro';
import angebotFunkstille from '@/assets/instagram/angebot-funkstille.jpg';
import eRechnung2027 from '@/assets/instagram/e-rechnung-2027.jpg';
import kundenAusDemKopf from '@/assets/instagram/kunden-aus-dem-kopf.jpg';
import quartalsberichtExcel from '@/assets/instagram/quartalsbericht-excel.jpg';
import serverSchrankRechenzentrum from '@/assets/instagram/server-schrank-rechenzentrum.jpg';
import toolsNullUeberblick from '@/assets/instagram/tools-null-ueberblick.jpg';

/**
 * Kachelbilder je Instagram-Post, adressiert über den Shortcode aus der
 * Post-URL (`code` in src/data/instagram.ts).
 *
 * Statische Imports statt `import.meta.glob`, damit Astro sie optimieren kann
 * — dasselbe Muster wie `src/features/references/caseImages.ts`.
 *
 * Die Map darf Lücken haben: Wofür hier nichts steht, zeigt die Bio-Seite das
 * Hero-Bild des verlinkten Blogbeitrags. Gedacht ist das für ältere Posts —
 * die Seite wird fast nur für den jeweils aktuellen benutzt, und dafür lohnt
 * der Wiedererkennungswert der echten Kachel.
 *
 * **Format: 4:5 (1080×1350), wie Instagram es ausliefert.** Die Kacheln auf
 * der Seite sind auf dieses Verhältnis gesetzt. Ein quadratischer Zuschnitt
 * würde oben die Marke und unten den Screenshot anschneiden — deshalb bleibt
 * das Bild so, wie es gepostet wurde. Kommt später ein 1:1-Post dazu, ist das
 * kein Problem (`object-cover` fängt es ab), aber ein einheitliches Verhältnis
 * hält das zweispaltige Raster ruhig.
 *
 * Neues Cover hinzufügen:
 *   1. Bild aus dem Post nach `src/assets/instagram/` legen (4:5, 1080×1350),
 *      benannt nach dem Thema — nicht nach dem Shortcode, der ist im
 *      Dateisystem nicht lesbar.
 *   2. Hier importieren und unter dem Shortcode eintragen.
 */
export const instagramCovers: Record<string, ImageMetadata> = {
  // Vorläufige Schlüssel bis zum Veröffentlichen, siehe src/data/instagram.ts.
  'e-rechnung-2027-5-fragen-an-euch': eRechnung2027,
  'ein-tag-mit-dem-server-im-bueroschrank': serverSchrankRechenzentrum,
  'rate-mal-17-gegen-494': kundenAusDemKopf,
  DdJekmNFtUk: angebotFunkstille,
  // Vorläufiger Schlüssel bis zum Veröffentlichen, siehe src/data/instagram.ts.
  'quartalsbericht-3-leute-2-wochen': quartalsberichtExcel,
  // Vorläufiger Schlüssel bis zum Veröffentlichen, siehe src/data/instagram.ts.
  'hot-take-gute-tools-machen-blind': toolsNullUeberblick,
  // Rubrik „Angebotsbaustein": Bild kommt aus dem Instagram-Post, sobald er steht.
  // Bis dahin zeigt instagram.astro einen Platzhalter.
};
