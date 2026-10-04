import type { FeedItem } from './fetch';
import { get } from './http';
import type { Source } from './sources';

// A channel's recent videos through the YouTube Data API. It needs an API key
// but, unlike YouTube's RSS endpoint, it does not fail at random.

interface PlaylistItem {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
}

/** A channel's uploads playlist has the channel's ID with UU in place of UC. */
export const uploadsPlaylist = (channelId: string) => `UU${channelId.slice(2)}`;

/**
 * The channel's 25 most recent videos published on or after `since`, in the
 * same shape as items read from a feed. Costs one unit of the API's daily quota.
 */
export async function fetchUploads(
  source: Source,
  channelId: string,
  key: string,
  since: Date,
  getFn: typeof get = get,
): Promise<FeedItem[]> {
  const url =
    'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=25' +
    `&playlistId=${encodeURIComponent(uploadsPlaylist(channelId))}`;
  // The key travels in a header, never in the address, so it cannot end up in an error message or a log.
  const res = await getFn(url, 'application/json', 20_000, { 'X-goog-api-key': key });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { errors?: { reason?: string }[] } } | null;
    const reason = body?.error?.errors?.[0]?.reason;
    throw new Error(`YouTube API HTTP ${res.status}${reason ? ` (${reason})` : ''}`);
  }

  const body = (await res.json()) as { items?: PlaylistItem[] };
  const items: FeedItem[] = [];
  for (const { snippet, contentDetails } of body.items ?? []) {
    const id = contentDetails?.videoId;
    const title = snippet?.title?.trim();
    const published = new Date(contentDetails?.videoPublishedAt ?? snippet?.publishedAt ?? '');
    // Removed and private videos stay in the playlist as placeholders with no publish time.
    if (!id || !title || Number.isNaN(published.getTime()) || published < since) continue;
    const thumbnails = snippet?.thumbnails ?? {};
    const image = (thumbnails.high ?? thumbnails.medium ?? thumbnails.default)?.url;
    items.push({
      source,
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
      published,
      authors: [],
      feedText: (snippet?.description ?? '').replace(/\s+/g, ' ').trim(),
      image: image?.startsWith('https://') ? image : undefined,
    });
  }
  return items;
}
