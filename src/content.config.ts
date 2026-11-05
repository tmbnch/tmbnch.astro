import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { tuerIds } from './data/tueren';

// Blog collection with Content Layer API
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      seoTitle: z.string().max(60).optional(),
      description: z.string().max(200),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default('Team'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      // Zu welcher Tür der Artikel gehört (max. 2). Steuert die Querverweise, siehe data/tueren.ts.
      doors: z.array(z.enum(tuerIds)).max(2).default([]),
      locale: z.enum(['de']).default('de'),
      cta: z
        .object({
          eyebrow: z.string().optional(),
          headline: z.string().optional(),
          body: z.string().optional(),
        })
        .optional(),
    }),
});

// Pages collection for static pages
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedAt: z.coerce.date().optional(),
    locale: z.enum(['de']).default('de'),
  }),
});

// Authors collection
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      avatar: image().optional(),
      social: z
        .object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
        })
        .optional(),
    }),
});

// FAQs collection (for JSON-LD FAQ schema)
const faqs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    answer: z.string().optional(),
    summary: z.string().optional(),
    details: z.string().optional(),
    category: z.string().optional(),
    order: z.number().default(0),
    locale: z.enum(['de']).default('de'),
  }),
});

export const collections = {
  blog,
  pages,
  authors,
  faqs,
};
