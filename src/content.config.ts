import fs from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SOURCE_TYPES } from './config';
import { figureSchema } from './lib/figure';

const score = z.number().int().min(1).max(10);

const stories = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    // The article's own title. `title` is the headline written for the paper.
    original_title: z.string().optional(),
    url: z.url(),
    source: z.string(),
    source_type: z.enum(SOURCE_TYPES),
    // YAML parses an unquoted 2026-10-03 as a Date, so accept both.
    date: z
      .union([z.string(), z.date()])
      .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    // Not held to the paper's present sections and personas, so that changing those does not break older editions.
    section: z.string(),
    personas: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    authors: z.array(z.string()).default([]),
    why_read: z.string(),
    interest_score: score,
    depth_score: score,
    novelty_score: score,
    utility_score: score,
    comments: z.url().optional(),
    image: z.url().optional(),
    // The diagram drawn on the story while it is a must-read.
    figure: figureSchema(z as never).optional(),
    // The same diagram as an illustration, a file under public/figures. Shown in place of the drawn one.
    figure_image: z.string().startsWith('/figures/').optional(),
    model: z.string().optional(),
  }),
});

// Close calls, printed as one line each. A brief has no summary, diagram or tags.
// Until the paper has printed its first brief there are no files, and the file loader warns about that on every build.
export const hasBriefs = fs.existsSync('./src/content/briefs') && fs.readdirSync('./src/content/briefs', { recursive: true }).some((file) => String(file).endsWith('.md'));

const briefs = defineCollection({
  loader: hasBriefs ? glob({ pattern: '*/*.md', base: './src/content/briefs' }) : () => [],
  schema: z.object({
    title: z.string(),
    original_title: z.string().optional(),
    url: z.url(),
    source: z.string(),
    date: z
      .union([z.string(), z.date()])
      .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    section: z.string(),
    personas: z.array(z.string()).default([]),
    why_read: z.string(),
    interest_score: score,
    depth_score: score,
    novelty_score: score,
    utility_score: score,
    model: z.string().optional(),
  }),
});

// The Bulletin: what the paper keeps apart from its stories. Like the briefs, it has no files until the first is printed.
export const hasBulletin = fs.existsSync('./src/content/bulletin') && fs.readdirSync('./src/content/bulletin', { recursive: true }).some((file) => String(file).endsWith('.md'));

const bulletin = defineCollection({
  loader: hasBulletin ? glob({ pattern: '*/*.md', base: './src/content/bulletin' }) : () => [],
  schema: z.object({
    // A notice printed whatever it scores, a tool's release, or a post from the community.
    kind: z.enum(['alert', 'release', 'community']),
    title: z.string(),
    original_title: z.string().optional(),
    url: z.url(),
    source: z.string(),
    date: z
      .union([z.string(), z.date()])
      .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    /** One sentence: what changed, or why it matters. */
    line: z.string(),
    // For an alert: the flag it goes under, and what its source states for certain.
    flag: z.string().optional(),
    facts: z.string().optional(),
    model: z.string().optional(),
  }),
});

export const collections = { stories, briefs, bulletin };
