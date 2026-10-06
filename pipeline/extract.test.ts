import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import { extractContent, imageFromDocument, youtubeThumbnail } from './extract';
import type { Transcript } from './transcript';
import { parseFeed } from './fetch';
import { item, sampleFeed } from './testing';

test('a feed with the whole article is used without requesting the page', async () => {
  const [full, teaser] = await parseFeed(sampleFeed, item.source, new Date('2026-09-20T00:00:00Z'));
  const requested: string[] = [];
  const readPage = async (url: string) => {
    requested.push(url);
    return { text: 'The full article from the page. '.repeat(100), image: 'https://cdn.example/page.png', authors: ['Page Writer'] };
  };

  const fromFeed = await extractContent(full, readPage);
  assert.deepEqual(requested, [], 'no page request');
  assert.ok(fromFeed.text.startsWith('By Adam White and Mei Chen'));
  assert.deepEqual(fromFeed.authors, ['Adam White', 'Mei Chen'], 'byline in the feed text');
  assert.equal(fromFeed.image, 'https://cdn.example/timetable.png');

  const fromPage = await extractContent(teaser, readPage);
  assert.deepEqual(requested, ['https://blog.example/retro/']);
  assert.ok(fromPage.text.startsWith('The full article from the page.'));
  assert.deepEqual(fromPage.authors, ['Page Writer']);

  // A page that cannot be read leaves the feed's teaser in place.
  const failing = await extractContent(teaser, async () => { throw new Error('HTTP 403'); });
  assert.equal(failing.text, 'A short teaser.');
  assert.equal(failing.image, 'https://cdn.example/retro.jpg');
});

test('preview images', () => {
  const doc = (html: string) => parseHTML(`<html><head>${html}</head><body></body></html>`).document as unknown as Document;
  const page = 'https://blog.example/post/';
  assert.equal(imageFromDocument(doc('<meta property="og:image" content="https://cdn.example/a.png">'), page), 'https://cdn.example/a.png');
  assert.equal(imageFromDocument(doc('<meta name="twitter:image" content="/img/b.jpg">'), page), 'https://blog.example/img/b.jpg');
  assert.equal(imageFromDocument(doc('<meta property="og:image" content="http://cdn.example/insecure.png">'), page), undefined);
  assert.equal(imageFromDocument(doc('<meta property="og:image" content="javascript:alert(1)">'), page), undefined);
  assert.equal(imageFromDocument(doc(''), page), undefined);
  assert.equal(youtubeThumbnail('https://www.youtube.com/watch?v=abc123XYZ_-'), 'https://i.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg');
  assert.equal(youtubeThumbnail('https://example.com/watch'), undefined);
});

test('an article whose page cannot be read is marked, so it can be tried again', async () => {
  const short = { ...item, feedText: 'A short teaser.' };
  const failed = await extractContent(short, async () => {
    throw new Error('HTTP 503');
  });
  assert.equal(failed.pageFailed, true);
  assert.equal(failed.text, 'A short teaser.');
  const read = await extractContent(short, async () => ({ text: 'The whole article. '.repeat(100), authors: [] }));
  assert.equal(read.pageFailed, undefined);
});

test('a video is read from its transcript, and from its description when there is none', async () => {
  const video = { ...item, source: { ...item.source, type: 'video' as const }, url: 'https://www.youtube.com/watch?v=2px3xYEwsHc', feedText: 'Three APIs to learn first.' };
  const noPage = async (): Promise<never> => { throw new Error('a video has no page to read'); };
  const says = (transcript: Transcript) => async () => transcript;

  const heard = await extractContent(video, noPage, says({ status: 'ok', text: 'Agents call APIs.', written: true }));
  assert.equal(heard.basis, 'transcript');
  assert.equal(heard.text, 'Description:\nThree APIs to learn first.\n\nTranscript:\nAgents call APIs.');
  assert.equal(heard.image, 'https://i.ytimg.com/vi/2px3xYEwsHc/hqdefault.jpg');

  const long = await extractContent(video, noPage, says({ status: 'ok', text: 'word '.repeat(10_000), written: false }));
  assert.equal(long.text.length, 24_000, 'a video may send twice what an article may');

  const refused = await extractContent(video, noPage, says({ status: 'failed', reason: 'HTTP 429' }));
  assert.deepEqual([refused.basis, refused.text, refused.transcript, refused.transcriptReason], ['description', 'Three APIs to learn first.', 'failed', 'HTTP 429']);
  assert.equal((await extractContent(video, noPage, says({ status: 'none' }))).transcript, 'none');

  const elsewhere = await extractContent({ ...video, url: 'https://vimeo.com/123' }, noPage, async () => { throw new Error('not asked for'); });
  assert.deepEqual([elsewhere.basis, elsewhere.transcript], ['description', undefined]);
});
