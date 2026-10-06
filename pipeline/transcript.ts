import { stripHtml } from './fetch';

// What is said in a YouTube video, so that it can be judged on that instead of
// on the few lines its uploader wrote under it. YouTube gives no official way
// to read another channel's captions; this asks as its Android app does, which
// needs no key. It can stop working without notice, so everything that uses it
// falls back to the description.

export type Transcript =
  | { status: 'ok'; text: string; /** Written by a person, as against generated from the sound. */ written: boolean }
  /** The video plays but has no captions, as a new upload often has not. */
  | { status: 'none' }
  /** A live event that has not been held yet, so nothing has been said in it. */
  | { status: 'upcoming' }
  /** It has captions, none of them in English. */
  | { status: 'other-language' }
  /** The request was refused or went wrong. */
  | { status: 'failed'; reason: string };

/** The most characters of a video sent to the model: its description and transcript together. */
export const VIDEO_CHARS = 24_000;
const DESCRIPTION_CHARS = 2_000;

/** The video's ID, from either form of its address. */
export function videoId(videoUrl: string): string | undefined {
  try {
    const url = new URL(videoUrl);
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    return id && /^[\w-]{6,20}$/.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

interface Track {
  baseUrl?: string;
  languageCode?: string;
  /** "asr" on a track generated from the sound. */
  kind?: string;
}

/** The English track to read: one a person wrote, else the generated one. */
export function chooseTrack(tracks: Track[]): Track | undefined {
  const english = tracks.filter((track) => track.baseUrl && /^en\b/i.test(track.languageCode ?? ''));
  return english.find((track) => track.kind !== 'asr') ?? english[0];
}

/** A caption file as running text. YouTube sends one of two shapes of XML; both are tags around the words. */
export function captionText(xml: string): string {
  // The words are escaped once for the XML and often once more inside it.
  return stripHtml(stripHtml(xml));
}

const ANDROID = { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34 };
const ANDROID_AGENT = `com.google.android.youtube/${ANDROID.clientVersion} (Linux; U; Android 14)`;
const TIMEOUT_MS = 20_000;

export async function fetchTranscript(id: string, request: typeof fetch = fetch): Promise<Transcript> {
  try {
    const res = await request('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_AGENT },
      body: JSON.stringify({ context: { client: ANDROID }, videoId: id }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { status: 'failed', reason: `HTTP ${res.status}` };
    // The reply can carry raw control characters inside its strings, which JSON does not allow.
    const player = JSON.parse((await res.text()).replace(/[\u0000-\u001f]/g, ' ')) as {
      playabilityStatus?: { status?: string; reason?: string };
      videoDetails?: { isUpcoming?: boolean };
      captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: Track[] } };
    };
    const playable = player.playabilityStatus;
    // Not a refusal: YouTube answered, and the answer is that the event is still to come.
    if (player.videoDetails?.isUpcoming || playable?.status === 'LIVE_STREAM_OFFLINE') return { status: 'upcoming' };
    // Refused for this caller, or the video cannot be played at all: either way nothing was learned about its captions.
    if (playable?.status !== 'OK') return { status: 'failed', reason: (playable?.reason ?? playable?.status ?? 'no answer about the video').slice(0, 120) };
    const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    if (tracks.length === 0) return { status: 'none' };
    const track = chooseTrack(tracks);
    if (!track) return { status: 'other-language' };
    const captions = await request(track.baseUrl!, { headers: { 'User-Agent': ANDROID_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!captions.ok) return { status: 'failed', reason: `captions: HTTP ${captions.status}` };
    const text = captionText(await captions.text());
    // The track is listed but came back empty, which is how YouTube turns away a caller it does not trust.
    if (!text) return { status: 'failed', reason: 'the captions came back empty' };
    return { status: 'ok', text, written: track.kind !== 'asr' };
  } catch (error) {
    return { status: 'failed', reason: (error as Error).message.slice(0, 120) };
  }
}

/**
 * What the model reads of a video: the description, which spells names
 * correctly, then the transcript. A transcript too long to send whole keeps
 * its first two thirds and its last third, where a talk sets out and sums up.
 */
export function videoText(description: string, transcript: string, written: boolean, cap = VIDEO_CHARS): string {
  const about = description.slice(0, DESCRIPTION_CHARS).trim();
  const head = `${about ? `Description:\n${about}\n\n` : ''}Transcript${written ? '' : ' (generated from the sound, so names may be misheard; trust the title and description for spellings)'}:\n`;
  const room = Math.max(0, cap - head.length);
  if (transcript.length <= room) return head + transcript;
  const gap = ' [...] ';
  const start = Math.floor(((room - gap.length) * 2) / 3);
  return head + transcript.slice(0, start) + gap + transcript.slice(transcript.length - (room - gap.length - start));
}

/**
 * Whether the way to transcripts is shut for this run: no video got one and at
 * least one was refused. A new upload without captions is not a refusal, so a
 * run of those alone says nothing about the route.
 */
export function routeDown(results: Transcript['status'][]): boolean {
  return !results.includes('ok') && results.includes('failed');
}
