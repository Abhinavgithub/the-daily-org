import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import type { Curated } from './curate';
import type { FeedItem } from './fetch';

export const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');
export const BRIEFS_DIR = path.join(process.cwd(), 'src', 'content', 'briefs');

function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

export interface Publishable {
  item: FeedItem;
  curated: Curated;
  image?: string;
}

/** Write one markdown file per story into the day's folder, best first. Returns the paths written. */
export function writeStories(day: string, stories: Publishable[]): string[] {
  const dir = path.join(STORIES_DIR, day);
  fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  const ranked = [...stories].sort((a, b) => b.curated.verdict.interest_score - a.curated.verdict.interest_score);

  return ranked.map(({ item, curated, image }, i) => {
    const v = curated.verdict;
    const frontmatter = {
      title: v.title,
      original_title: item.title,
      url: item.url,
      source: item.source.name,
      source_type: item.source.type,
      date: day,
      section: v.section,
      personas: v.personas,
      tags: v.tags,
      authors: item.authors,
      why_read: v.why_read,
      interest_score: v.interest_score,
      depth_score: v.depth_score,
      novelty_score: v.novelty_score,
      utility_score: v.utility_score,
      model: curated.model,
      ...(image ? { image } : {}),
      // What it is flagged as, and what its source states for certain.
      ...(item.alert ? { alert: { label: item.alert.label, facts: item.alert.facts } } : {}),
    };
    const number = String(existing + i + 1).padStart(2, '0');
    const file = path.join(dir, `${number}-${item.source.id}-${slugify(item.title)}.md`);
    fs.writeFileSync(file, `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${v.summary}\n`);
    return file;
  });
}

/**
 * Write one file per brief into the day's folder: the headline, the one-line
 * reason to read and where it came from, with no summary. Returns the paths written.
 */
export function writeBriefs(day: string, briefs: Publishable[], briefsDir = BRIEFS_DIR): string[] {
  const dir = path.join(briefsDir, day);
  fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  return briefs.map(({ item, curated }, i) => {
    const v = curated.verdict;
    const frontmatter = {
      title: v.title,
      original_title: item.title,
      url: item.url,
      source: item.source.name,
      date: day,
      section: v.section,
      personas: v.personas,
      why_read: v.why_read,
      interest_score: v.interest_score,
      depth_score: v.depth_score,
      novelty_score: v.novelty_score,
      utility_score: v.utility_score,
      model: curated.model,
    };
    const number = String(existing + i + 1).padStart(2, '0');
    const file = path.join(dir, `${number}-${item.source.id}-${slugify(item.title)}.md`);
    fs.writeFileSync(file, `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n`);
    return file;
  });
}
