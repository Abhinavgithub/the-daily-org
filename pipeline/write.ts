import fs from 'node:fs';
import path from 'node:path';
import { parseDocument, stringify, type Document } from 'yaml';
import type { Curated } from './curate';
import type { FeedItem } from './fetch';

export const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');
export const BRIEFS_DIR = path.join(process.cwd(), 'src', 'content', 'briefs');
export const BULLETIN_DIR = path.join(process.cwd(), 'src', 'content', 'bulletin');

/** A story file's front matter, as a YAML document that can be changed, and the text under it exactly as it stands. */
export function openStory(text: string): { doc: Document; body: string } | null {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return match ? { doc: parseDocument(match[1]), body: match[2] } : null;
}

/** A story file again, from its front matter and the text under it. */
export const storyText = (doc: Document, body: string) => `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${body}`;

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
      ...(curated.figure ? { figure: curated.figure } : {}),
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
  const story = openStory(fs.readFileSync(file, 'utf8'));
  if (!story) return;
  const listed = (story.doc.toJS().also ?? []) as Also[];
  story.doc.set('also', [...listed, also]);
  fs.writeFileSync(file, storyText(story.doc, story.body));
}

/**
 * A story as it stands in the day's edition: enough to ask whether a later item tells it again,
 * and to print the two as one if it does.
 */
export interface Printed {
  file: string;
  /** The headline, as printed. */
  title: string;
  score: number;
  /** The piece itself, as the line it becomes under a better telling. */
  told: Also;
  also: Also[];
}

/** A story just written, as it stands in the edition. */
export function printed(file: string, { item, curated, also }: Publishable): Printed {
  return { file, title: curated.verdict.title, score: curated.verdict.interest_score, told: { title: item.title, url: item.url, source: item.source.name }, also: also ?? [] };
}

/** The story files in a folder, by name, each with its front matter. A file with none that can be read is left out. */
export function readStories(dir: string): { file: string; data: Record<string, unknown> }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .flatMap((f) => {
      const file = path.join(dir, f);
      const data = openStory(fs.readFileSync(file, 'utf8'))?.doc.toJS() as Record<string, unknown> | null | undefined;
      return data ? [{ file, data }] : [];
    });
}

/** The stories the day's edition already has, from earlier runs, in the order they were written. */
export function readEdition(day: string, storiesDir = STORIES_DIR): Printed[] {
  return readStories(path.join(storiesDir, day)).flatMap(({ file, data }) => {
    // A file that cannot be read as a story is left out: it is nothing an item can be the same as.
    if (typeof data.title !== 'string' || typeof data.url !== 'string' || typeof data.interest_score !== 'number') return [];
    const told = { title: typeof data.original_title === 'string' ? data.original_title : data.title, url: data.url, source: String(data.source ?? '') };
    return [{ file, title: data.title, score: data.interest_score, told, also: Array.isArray(data.also) ? (data.also as Also[]) : [] }];
  });
}

/** Take a story out of the edition, with the illustration drawn for it, when a better telling takes its place. */
export function removeStory(file: string, publicDir = path.join(process.cwd(), 'public')): void {
  const picture = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').match(/^figure_image: (\/figures\/\S+)$/m)?.[1] : undefined;
  if (picture) fs.rmSync(path.join(publicDir, picture), { force: true });
  fs.rmSync(file, { force: true });
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
