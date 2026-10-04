import Parser from 'rss-parser';
import { cleanAuthors } from './authors';
import { get } from './http';
import type { Source } from './sources';
import { fetchUploads } from './youtube';

export interface FeedItem {
  source: Source;
  title: string;
  url: string;
  published: Date;
  /** People only: email addresses and account names from the feed are dropped. */
  authors: string[];
  /** Whatever text the feed itself carried, HTML stripped. Often the whole article. */
  feedText: string;
  /** A picture the feed attached to the item, as an https address. */
  image?: string;
}

type Media = { $?: { url?: string; medium?: string; type?: string } };
type Extra = {
  'content:encoded'?: string;
  mediaGroup?: { 'media:description'?: string[]; 'media:thumbnail'?: Media[] };
  mediaContent?: Media;
  mediaThumbnail?: Media;
  author?: string;
};

const parser = new Parser<object, Extra>({
  customFields: {
    item: [
      'content:encoded',
      ['media:group', 'mediaGroup'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: '-', mdash: '-', hellip: '...',
};

/** The character an HTML entity stands for, or undefined for one that is not known. */
function entity(name: string): string | undefined {
  if (name[0] !== '#') return ENTITIES[name.toLowerCase()];
  const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
  // Curly quotes and dashes are flattened, as the named ones are.
  const flat: Record<number, string> = { 160: ' ', 8216: "'", 8217: "'", 8220: '"', 8221: '"', 8211: '-', 8212: '-', 8230: '...' };
  if (flat[code]) return flat[code];
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : undefined;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => entity(name) ?? whole)
    .replace(/\s+/g, ' ')
    .trim();
}

const https = (url?: string) => (url?.startsWith('https://') ? url : undefined);

/** The item's picture: what the feed declares, else the first image in its content. */
function feedImage(entry: Parser.Item & Extra, html: string): string | undefined {
  const enclosure = entry.enclosure?.type?.startsWith('image/') ? entry.enclosure.url : undefined;
  return (
    https(entry.mediaContent?.$?.url) ??
    https(entry.mediaThumbnail?.$?.url) ??
    https(entry.mediaGroup?.['media:thumbnail']?.[0]?.$?.url) ??
    https(enclosure) ??
    https(html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1])
  );
}

/** The items of one feed published on or after `since`. Throws when the text is not a feed. */
export async function parseFeed(xml: string, source: Source, since: Date): Promise<FeedItem[]> {
  const feed = await parser.parseString(xml);
  const items: FeedItem[] = [];
  for (const entry of feed.items) {
    if (!entry.link || !entry.title || !entry.isoDate) continue;
    const published = new Date(entry.isoDate);
    if (Number.isNaN(published.getTime()) || published < since) continue;
    const html = String(
      entry['content:encoded'] ?? entry.mediaGroup?.['media:description']?.[0] ?? entry.content ?? entry.contentSnippet ?? '',
    );
    items.push({
      source,
      title: entry.title.trim(),
      url: entry.link.trim(),
      published,
      authors: cleanAuthors(String(entry.creator ?? entry.author ?? '')),
      feedText: stripHtml(html),
      image: feedImage(entry, html),
    });
  }
  return items;
}

export interface FetchResult {
  items: FeedItem[];
  failures: { source: Source; error: string }[];
  /** Things worth telling the person running it, such as which route a YouTube source took. */
  notes: string[];
  /** When each feed's newest post was published, by source id, however far back that is. */
  newest: Record<string, Date>;
}

// YouTube's feeds were seen to fail about two requests in three, so three tries are not enough.
const ATTEMPTS = 5;

export interface FetchOptions {
  /** Injectable for tests. */
  get?: typeof get;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  /** Defaults to YOUTUBE_API_KEY. An empty string turns the API off. */
  youtubeKey?: string;
}

async function readFeed(url: string, source: Source, since: Date, getFn: typeof get): Promise<FeedItem[]> {
  const res = await getFn(url, 'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.text();
  // A challenge or error page served with status 200 is not a feed.
  if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(body.slice(0, 3000))) throw new Error('the response was not a feed');
  return parseFeed(body, source, since);
}

/**
 * One feed, tried several times, moving between its addresses. Some feeds fail
 * and succeed within seconds of each other, so even a 404 is worth retrying.
 */
async function fetchFeed(source: Source, since: Date, options: FetchOptions): Promise<{ items: FeedItem[]; note?: string; newest?: Date }> {
  const getFn = options.get ?? get;
  // The whole feed is read, so that its newest post is known even when it is older than the span wanted.
  const within = (all: FeedItem[]) => ({
    items: all.filter((item) => item.published >= since),
    newest: all.reduce<Date | undefined>((latest, item) => (!latest || item.published > latest ? item.published : latest), undefined),
  });
  const whole = new Date(0);

  // A YouTube channel is read through the API when there is a key; the feed is the fallback.
  const key = options.youtubeKey ?? process.env.YOUTUBE_API_KEY ?? '';
  let apiProblem = '';
  if (source.youtubeChannel && key) {
    try {
      const all = await fetchUploads(source, source.youtubeChannel, key, whole, getFn);
      return { ...within(all), note: `${source.name}: read through the YouTube API` };
    } catch (err) {
      apiProblem = (err as Error).message;
    }
  }
  const viaFeed = (all: FeedItem[]) => ({
    ...within(all),
    note: apiProblem ? `${source.name}: ${apiProblem}, so the RSS feed was used instead` : undefined,
  });

  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const addresses = [source.url, ...(source.alternatives ?? [])];
  const attempts = options.attempts ?? ATTEMPTS;
  const errors: string[] = [];
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(2000 * attempt);
    try {
      return viaFeed(await readFeed(addresses[attempt % addresses.length], source, whole, getFn));
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  throw new Error(`${apiProblem ? `${apiProblem}; then ` : ''}${errors.at(-1)} (${attempts} attempt${attempts === 1 ? '' : 's'}: ${errors.join(', ')})`);
}

/**
 * Pull every feed and keep the items published on or after `since`, which may
 * differ per source. A failing feed is reported, not fatal.
 */
export async function fetchFeeds(
  sources: Source[],
  since: Date | ((source: Source) => Date),
  options: FetchOptions = {},
): Promise<FetchResult> {
  const sinceFor = typeof since === 'function' ? since : () => since;
  const results = await Promise.allSettled(sources.map((source) => fetchFeed(source, sinceFor(source), options)));
  const items: FeedItem[] = [];
  const failures: FetchResult['failures'] = [];
  const notes: string[] = [];
  const newest: FetchResult['newest'] = {};

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      items.push(...result.value.items);
      if (result.value.newest) newest[sources[i].id] = result.value.newest;
      if (result.value.note) notes.push(result.value.note);
    }
    else failures.push({ source: sources[i], error: String(result.reason?.message ?? result.reason) });
  });

  items.sort((a, b) => b.published.getTime() - a.published.getTime());
  return { items, failures, notes, newest };
}
