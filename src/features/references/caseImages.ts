import type { ImageMetadata } from 'astro';
import bonprixCaseImage from '@/assets/references/teaser-bonprix.jpeg';
import statistaCaseImage from '@/assets/references/teaser-statista.jpeg';
import fkcCaseImage from '@/assets/references/teaser-fkc.jpeg';
import schlossereiCaseImage from '@/assets/references/teaser-schlosserei.jpeg';
import statistaCanvaCaseImage from '@/assets/references/teaser-statista-canva.jpeg';
import stageCmlCaseImage from '@/assets/references/teaser-stage-cml.jpeg';
import samVorteilsguruCaseImage from '@/assets/references/teaser-sam-vorteilsguru.jpeg';
import mavoxCaseImage from '@/assets/references/teaser-mavox-winterdienst.jpeg';
import bonprixCollectionCaseImage from '@/assets/references/teaser-bonprix-collection-planning.jpeg';

/**
 * Teaser-Bilder je Case-Slug.
 *
 * Statische Imports statt `import.meta.glob`, damit Astro sie optimieren kann.
 * Extrahiert aus `ReferencesIndex.astro`, weil die Brief-Landingpages (/b/)
 * dieselben Bilder brauchen — zwei Kopien der Map würden auseinanderlaufen,
 * sobald ein Case dazukommt.
 */
export const caseTeaserImages: Record<string, ImageMetadata> = {
  bonprix: bonprixCaseImage,
  statista: statistaCaseImage,
  'fkc-consulting': fkcCaseImage,
  'schlosserei-diezinger': schlossereiCaseImage,
  'statista-canva': statistaCanvaCaseImage,
  'stage-cml': stageCmlCaseImage,
  'sam-vorteilsguru': samVorteilsguruCaseImage,
  'mavox-winterdienst': mavoxCaseImage,
  'bonprix-collection-planning': bonprixCollectionCaseImage,
};
