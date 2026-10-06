import assert from 'node:assert/strict';
import { test } from 'node:test';
import { captionText, chooseTrack, fetchTranscript, routeDown, videoId, videoText, VIDEO_CHARS } from './transcript';

test('a video is known by its ID, from either form of its address', () => {
  assert.equal(videoId('https://www.youtube.com/watch?v=2px3xYEwsHc&t=10'), '2px3xYEwsHc');
  assert.equal(videoId('https://youtu.be/2px3xYEwsHc'), '2px3xYEwsHc');
  assert.equal(videoId('https://example.com/watch'), undefined);
  assert.equal(videoId('not an address'), undefined);
});

test('an English track written by a person is read before a generated one, and no other language is', () => {
  const auto = { baseUrl: 'https://c/auto', languageCode: 'en', kind: 'asr' };
  const written = { baseUrl: 'https://c/written', languageCode: 'en-US' };
  const hindi = { baseUrl: 'https://c/hi', languageCode: 'hi' };
  assert.equal(chooseTrack([auto, hindi, written]), written);
  assert.equal(chooseTrack([hindi, auto]), auto);
  assert.equal(chooseTrack([hindi]), undefined);
  assert.equal(chooseTrack([{ languageCode: 'en' }]), undefined, 'a track with no address cannot be read');
});

test('both shapes of caption file become running text', () => {
  assert.equal(captionText('<transcript><text start="0" dur="2">Hey, I&amp;#39;m Jason.</text><text start="2" dur="2">Agents  call\nAPIs</text></transcript>'), "Hey, I'm Jason. Agents call APIs");
  assert.equal(captionText('<timedtext format="3"><body><p t="0" d="900"><s>AI</s><s t="200"> agents</s></p><p t="900" d="500">call &amp;amp; wait</p></body></timedtext>'), 'AI agents call & wait');
});

const reply = (body: unknown, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
const player = (tracks: unknown[] | undefined, playability: object = { status: 'OK' }) => ({ playabilityStatus: playability, ...(tracks ? { captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } } } : {}) });
/** Answers the player request, then the caption request, and notes what was asked. */
const youtube = (answers: Response[]) => {
  const asked: string[] = [];
  const request = (async (url: unknown) => {
    asked.push(String(url));
    const next = answers.shift();
    if (!next) throw new Error('unexpected request');
    return next;
  }) as typeof fetch;
  return { request, asked };
};

test('a transcript is read through the player request and the track it lists', async () => {
  const { request, asked } = youtube([reply(player([{ baseUrl: 'https://c/auto', languageCode: 'en', kind: 'asr' }])), reply('<transcript><text>Agents call APIs.</text></transcript>')]);
  assert.deepEqual(await fetchTranscript('abc123xyz', request), { status: 'ok', text: 'Agents call APIs.', written: false });
  assert.deepEqual(asked, ['https://www.youtube.com/youtubei/v1/player?prettyPrint=false', 'https://c/auto']);
});

test('a reply with raw line breaks inside its strings is still read', async () => {
  const raw = JSON.stringify(player([])).replace('"OK"', '"OK", "note": "line one\nline two"');
  assert.deepEqual(await fetchTranscript('abc123xyz', youtube([reply(raw)]).request), { status: 'none' });
});

test('no captions, captions in another language and a refusal are told apart', async () => {
  assert.deepEqual(await fetchTranscript('v', youtube([reply(player(undefined))]).request), { status: 'none' });
  assert.deepEqual(await fetchTranscript('v', youtube([reply(player([{ baseUrl: 'https://c/hi', languageCode: 'hi' }]))]).request), { status: 'other-language' });
  assert.deepEqual(await fetchTranscript('v', youtube([reply(player(undefined, { status: 'LOGIN_REQUIRED', reason: 'Sign in to confirm you are not a bot' }))]).request), { status: 'failed', reason: 'Sign in to confirm you are not a bot' });
  assert.deepEqual(await fetchTranscript('v', youtube([reply('', 429)]).request), { status: 'failed', reason: 'HTTP 429' });
  assert.deepEqual(await fetchTranscript('v', youtube([reply(player(undefined, { status: 'LIVE_STREAM_OFFLINE', reason: 'This live event will begin in 22 days.' }))]).request), { status: 'upcoming' }, 'an event still to come is not a refusal');
  assert.deepEqual(await fetchTranscript('v', youtube([reply(player([{ baseUrl: 'https://c/en', languageCode: 'en' }])), reply('<transcript></transcript>')]).request), { status: 'failed', reason: 'the captions came back empty' });
  assert.equal((await fetchTranscript('v', youtube([]).request)).status, 'failed', 'an error is a failure, not a crash');
});

test('the model reads the description, then the transcript, with a warning when it was generated', () => {
  const text = videoText('Koa and AIforce explained.', 'Hello and welcome.', false);
  assert.match(text, /^Description:\nKoa and AIforce explained\.\n\nTranscript \(generated from the sound, so names may be misheard; .*\):\nHello and welcome\.$/);
  assert.equal(videoText('', 'Hello.', true), 'Transcript:\nHello.');
  assert.ok(videoText('d'.repeat(5000), 'Hello.', true).startsWith(`Description:\n${'d'.repeat(2000)}\n\n`), 'a long description is cut');
});

test('a transcript too long to send keeps its start and its end', () => {
  const transcript = `${'a'.repeat(30_000)}${'z'.repeat(30_000)}`;
  const text = videoText('About it.', transcript, true);
  assert.equal(text.length, VIDEO_CHARS);
  const body = text.slice(text.indexOf('Transcript:\n') + 12);
  const [start, end] = body.split(' [...] ');
  assert.match(start, /^a+$/);
  assert.match(end, /^z+$/);
  assert.ok(Math.abs(start.length - 2 * end.length) <= 2, 'two thirds from the start, a third from the end');
  assert.equal(videoText('', 'short', true, 100), 'Transcript:\nshort', 'one that fits is sent whole');
});

test('the route is taken to be shut only when a request was refused and none succeeded', () => {
  assert.equal(routeDown(['failed', 'failed']), true);
  assert.equal(routeDown(['failed', 'none']), true);
  assert.equal(routeDown(['failed', 'ok']), false, 'one refusal among successes is passing trouble');
  assert.equal(routeDown(['upcoming', 'upcoming']), false);
  assert.equal(routeDown(['none', 'other-language']), false, 'new uploads without captions say nothing about the route');
  assert.equal(routeDown([]), false);
});
