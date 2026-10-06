import type { Source } from '../src/paper';
import type { FeedItem } from './fetch';
import { get } from './http';

// Release notes kept as one long document, a section to a version. Some tools
// publish no feed worth reading: the feed is empty builds, or each entry only
// points at the notes. So a source can say that its address is such a document
// (`changelog`), or that its feed's entries are explained in one (`notes`).

export interface Section {
  /** How deep the heading is: 1 for the document's title, 2 for the next level down. */
  level: number;
  title: string;
  /** The text under the heading, up to the next heading of any level. */
  body: string;
}

// Not held to a word's edge, since a version is often written with a v before it.
const VERSION = /(?<![\d.])\d+\.\d+\.\d+(?![\d.])/;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const plain = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|li|div|tr|h\d|pre)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

/** A document cut at its headings. Markdown is read by its `#` lines; a page by its heading elements. */
export function sections(text: string): Section[] {
  const page = /<(html|body|h[1-6]|doc-heading)[\s>]/i.test(text);
  // Every heading becomes a line of its own, marked with its depth, whichever way the document writes them.
  const marked = page
    ? text
        .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, title: string) => `\n\u0001${level} ${plain(title)}\n`)
        // Salesforce's documentation sets its headings as elements of its own, with the words in an attribute.
        .replace(/<doc-heading\b([^>]*)>(?:\s*<\/doc-heading>)?/gi, (_, attributes: string) => {
          const title = attributes.match(/\bheader="([^"]*)"/)?.[1] ?? '';
          const level = attributes.match(/\baria-level="(\d)"/)?.[1] ?? '2';
          return `\n\u0001${level} ${plain(title)}\n`;
        })
    : text.replace(/^(#{1,6})[ \t]+(.+)$/gm, (_, hashes: string, title: string) => `\u0001${hashes.length} ${title.trim()}`);
  return marked
    .split('\u0001')
    .slice(1)
    .map((part) => {
      const [first, ...rest] = part.split('\n');
      const body = rest.join('\n');
      return { level: Number(first[0]), title: first.slice(2).trim(), body: (page ? plain(body) : body).trim() };
    });
}

/** The day a heading names, as in "2.152.14 (September 30, 2026) [stable]" or "(Sept 2, 2026)". */
export function dateIn(title: string): Date | undefined {
  const match = title.match(/\b([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),\s*(\d{4})\b/);
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1;
  if (!match || month < 0) return undefined;
  const date = new Date(Date.UTC(Number(match[3]), month, Number(match[2]), 12));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** The notes of one version: its section, and any deeper ones that follow it. */
export function notesFor(version: string, all: Section[]): string | undefined {
  const start = all.findIndex((section) => section.title.includes(version));
  if (start < 0) return undefined;
  const parts = [all[start].body];
  for (const section of all.slice(start + 1)) {
    if (section.level <= all[start].level) break;
    parts.push(`${section.title}\n${section.body}`);
  }
  const text = parts.filter(Boolean).join('\n\n').trim();
  return text || undefined;
}

/** Where a person would read a file that the pipeline reads raw. */
export function readable(url: string): string {
  const raw = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
  return raw ? `https://github.com/${raw[1]}/${raw[2]}/blob/${raw[3]}/${raw[4]}` : url;
}

/**
 * The releases a changelog lists, as articles. A release is one section whose
 * heading gives a version and the day it came out. A day still to come is a
 * release candidate, and is left until it is released.
 */
export function changelogItems(text: string, source: Source, now: Date): FeedItem[] {
  const page = readable(source.url);
  return sections(text).flatMap((section) => {
    const version = section.title.match(VERSION)?.[0];
    const published = dateIn(section.title);
    if (!version || !published || published > now || !section.body) return [];
    // The address names the version, so each is met once however its heading is later reworded.
    const anchor = section.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    return [{ source, title: `${source.name} ${version}`, url: `${page}?v=${version}#${anchor}`, published, authors: [], feedText: section.body }];
  });
}

export async function readChangelog(source: Source, now: Date, getFn: typeof get = get): Promise<FeedItem[]> {
  const res = await getFn(source.url, 'text/markdown, text/plain, text/html;q=0.9, */*;q=0.5');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = changelogItems(await res.text(), source, now);
  if (items.length === 0) throw new Error('no release with a version and a date was found in the document');
  return items;
}

// A notes page is long and the same for every release of its tool, so it is fetched once in a run.
const pages = new Map<string, Promise<Section[]>>();

/** The notes for a feed's entry, from the document its source names. Nothing when the document has no section for it. */
export async function notesOf(item: FeedItem, getFn: typeof get = get): Promise<string | undefined> {
  const url = item.source.notes;
  const version = item.title.match(VERSION)?.[0];
  if (!url || !version) return undefined;
  if (!pages.has(url)) {
    pages.set(
      url,
      getFn(url, 'text/html, text/markdown;q=0.9, */*;q=0.5').then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return sections(await res.text());
      }),
    );
  }
  try {
    return notesFor(version, await pages.get(url)!);
  } catch {
    // Not kept, so that the next entry tries the page again.
    pages.delete(url);
    return undefined;
  }
}
