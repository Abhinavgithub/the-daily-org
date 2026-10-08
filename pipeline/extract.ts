import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { authorsFromLeadingByline, cleanAuthors, findAuthors } from './authors';
import type { FeedItem } from './fetch';
import { get } from './http';
import { notesOf } from './notes';
import { fetchTranscript, VIDEO_CHARS, videoId, videoText, type Transcript } from './transcript';

const MAX_CHARS = 12_000;
/** With this much text in the feed, the article page adds nothing and is not requested. */
export const FULL_TEXT = 1500;
const IMAGE_META = [
  'meta[property="og:image"]',
  'meta[name="og:image"]',
  'meta[name="twitter:image"]',
  'meta[property="twitter:image"]',
];

export interface Extracted {
  text: string;
  /** The article's preview image, when the page declares one. */
  image?: string;
  /** The people who wrote it, when the page says. Empty when it does not. */
  authors: string[];
  /** The article's page was wanted and could not be read, so `text` is only the feed's excerpt. */
  pageFailed?: boolean;
  /** For a video: whether `text` holds what is said in it, or only what its uploader wrote under it. */
  basis?: 'transcript' | 'description';
  /** For a video with no transcript: why not. */
  transcript?: Exclude<Transcript['status'], 'ok'>;
  transcriptReason?: string;
}

/** The page's declared preview image as an absolute https URL. */
export function imageFromDocument(document: Document, pageUrl: string): string | undefined {
  for (const selector of IMAGE_META) {
    const content = document.querySelector(selector)?.getAttribute('content')?.trim();
    if (!content) continue;
    try {
      const url = new URL(content, pageUrl);
      if (url.protocol === 'https:') return url.toString();
    } catch {
      // Try the next tag.
    }
  }
  return undefined;
}

export function youtubeThumbnail(videoUrl: string): string | undefined {
  const id = videoId(videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

// Pages -------------------------------------------------------------------

async function fetchDocument(url: string): Promise<Document> {
  const res = await get(url, 'text/html', 15_000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseHTML(await res.text()).document as unknown as Document;
}

/** Everything read from an article page. Throws when the page cannot be fetched. */
export async function extractPage(url: string): Promise<Extracted> {
  const document = await fetchDocument(url);
  // Readability rewrites the document, so read the metadata first.
  const image = imageFromDocument(document, url);
  const declared = findAuthors(document, '');
  const article = new Readability(document).parse();
  const text = (article?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const inText = authorsFromLeadingByline(text);
  const authors = inText.length ? inText : declared.length ? declared : cleanAuthors(article?.byline ?? '');
  return { text, image, authors };
}

/** Just the preview image for a URL, used to backfill existing stories. */
export async function extractImage(url: string): Promise<string | undefined> {
  const thumbnail = youtubeThumbnail(url);
  if (thumbnail) return thumbnail;
  try {
    return (await extractPage(url)).image;
  } catch {
    return undefined;
  }
}

/** An article's text as the model reads it, for a story already published. Nothing for a video or a page that cannot be read. */
export async function articleText(url: string): Promise<string | undefined> {
  if (youtubeThumbnail(url)) return undefined;
  try {
    return (await extractPage(url)).text.slice(0, MAX_CHARS) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * The text the model will read, the story's image and its writers. A feed that
 * carries the whole article is used as it is; the article page is requested
 * only when the feed gives a short excerpt. A video is read from its
 * transcript, with the feed's description before it; when there is no
 * transcript the description stands alone, and the caller is told why.
 */
export async function extractContent(
  item: FeedItem,
  readPage: typeof extractPage = extractPage,
  readTranscript: (id: string) => Promise<Transcript> = fetchTranscript,
  readNotes: (item: FeedItem) => Promise<string | undefined> = notesOf,
): Promise<Extracted> {
  let text = item.feedText;
  // A release whose entry only points at its notes is read from the notes.
  if (item.source.notes) {
    const notes = await readNotes(item);
    if (notes) return { text: notes.slice(0, MAX_CHARS), image: item.image, authors: [] };
  }
  let image = item.image;
  let authors = authorsFromLeadingByline(text);

  if (item.source.type === 'video') {
    image = youtubeThumbnail(item.url) ?? image;
    const id = videoId(item.url);
    // A video that is not on YouTube has only what its feed says of it.
    if (!id) return { text: text.slice(0, MAX_CHARS), image, authors, basis: 'description' };
    const said = await readTranscript(id);
    if (said.status === 'ok') return { text: videoText(text, said.text, said.written, VIDEO_CHARS), image, authors, basis: 'transcript' };
    return { text: text.slice(0, MAX_CHARS), image, authors, basis: 'description', transcript: said.status, ...(said.status === 'failed' ? { transcriptReason: said.reason } : {}) };
  } else if (item.source.type === 'discussion') {
    // A forum's feed carries the whole of each post. A short one is short, and its page has no more of it to
    // give; asked for, the page is refused, and the post would be put down as unread and tried again for days.
  } else if (text.length < FULL_TEXT) {
    try {
      const page = await readPage(item.url);
      image = page.image ?? image;
      if (page.authors.length) authors = page.authors;
      if (page.text.length > text.length) text = page.text;
    } catch {
      // Keep the feed text, and say so: the page may be readable next time.
      return { text: text.slice(0, MAX_CHARS), image, authors, pageFailed: true };
    }
  }
  return { text: text.slice(0, MAX_CHARS), image, authors };
}
