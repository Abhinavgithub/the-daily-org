import fs from 'node:fs';
import path from 'node:path';
import { parseDocument, stringify } from 'yaml';
import type { Curated } from './curate';
import type { FeedItem } from './fetch';

export const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');
export const BRIEFS_DIR = path.join(process.cwd(), 'src', 'content', 'briefs');
export const BULLETIN_DIR = path.join(process.cwd(), 'src', 'content', 'bulletin');

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

/** Another source's telling of a story the paper prints once: a line under it, linking to the piece. */
export interface Also {
  title: string;
  url: string;
  source: string;
}

export interface Publishable {
  item: FeedItem;
  curated: Curated;
  image?: string;
  also?: Also[];
}

/** Write one markdown file per story into the day's folder, best first. Returns the paths written. */
export function writeStories(day: string, stories: Publishable[]): string[] {
  const dir = path.join(STORIES_DIR, day);
  fs.mkdirSync(dir, { recursive: true });
  // Numbered on from the highest number in the folder, not from how many files it holds: a story may have been taken out.
  const existing = Math.max(0, ...fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => parseInt(f, 10) || 0));
  const ranked = [...stories].sort((a, b) => b.curated.verdict.interest_score - a.curated.verdict.interest_score);

  return ranked.map(({ item, curated, image, also }, i) => {
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
      ...(also?.length ? { also } : {}),
    };
    const number = String(existing + i + 1).padStart(2, '0');
    const file = path.join(dir, `${number}-${item.source.id}-${slugify(item.title)}.md`);
    fs.writeFileSync(file, `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${v.summary}\n`);
    return file;
  });
}

/** Add a line under a story already written: another source that tells the same story. */
export function addAlso(file: string, also: Also): void {
  const match = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return;
  const doc = parseDocument(match[1]);
  const listed = (doc.toJS().also ?? []) as Also[];
  doc.set('also', [...listed, also]);
  fs.writeFileSync(file, `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${match[2]}`);
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

/** What a Bulletin item is: a notice printed whatever it scores, a tool's release, or a post from the community. */
export type BulletinKind = 'alert' | 'release' | 'community';

/**
 * Write one file per item into the day's folder of the Bulletin: what the paper
 * keeps apart from its stories. Each is a headline, one line, and for an alert
 * its flag and what its source states for certain. Returns the paths written.
 */
export function writeBulletin(day: string, kind: BulletinKind, items: Publishable[], bulletinDir = BULLETIN_DIR): string[] {
  const dir = path.join(bulletinDir, day);
  fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  return items.map(({ item, curated }, i) => {
    const v = curated.verdict;
    const frontmatter = {
      kind,
      title: v.title,
      original_title: item.title,
      url: item.url,
      source: item.source.name,
      date: day,
      line: v.why_read,
      ...(item.alert ? { flag: item.alert.label, facts: item.alert.facts } : {}),
      model: curated.model,
    };
    const number = String(existing + i + 1).padStart(2, '0');
    const file = path.join(dir, `${number}-${item.source.id}-${slugify(item.title)}.md`);
    // An alert keeps the short account written of it; a release or a post is its one line.
    fs.writeFileSync(file, `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n${kind === 'alert' ? `\n${v.summary}\n` : ''}`);
    return file;
  });
}
