import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FULL_TEXT } from './extract';
import { fetchFeeds, parseFeed, stripHtml } from './fetch';
import { item, sampleFeed } from './testing';

test('a feed is parsed into items with people, text and pictures', async () => {
  const items = await parseFeed(sampleFeed, item.source, new Date('2026-09-20T00:00:00Z'));
  assert.deepEqual(items.map((i) => i.title), ['Timetable Test Mode', 'Monthly Retro', 'Chunking'], 'old items are left out');
  assert.deepEqual(items[0].authors, ['Adam White']);
  assert.equal(items[0].image, 'https://cdn.example/timetable.png');
  assert.ok(items[0].feedText.length > FULL_TEXT && !items[0].feedText.includes('<p>'));
  assert.deepEqual(items[1].authors, [], 'an email address is not a byline');
  assert.equal(items[1].image, 'https://cdn.example/retro.jpg', 'first image in the content');
  assert.deepEqual(items[2].authors, [], 'nor is an account name');
  await assert.rejects(parseFeed('<html><body>Checking your browser</body></html>', item.source, new Date(0)));
});

test('a failing feed is retried, moving between its addresses', async () => {
  const feedOk = () => new Response(sampleFeed);
  const run = async (replies: Record<string, (() => Response)[]>, alternatives?: string[]) => {
    const asked: string[] = [];
    const result = await fetchFeeds([{ ...item.source, alternatives }], new Date('2026-09-20T00:00:00Z'), {
      sleep: async () => {},
      attempts: 3,
      get: async (url) => {
        asked.push(url);
        const next = replies[url]?.shift();
        return next ? next() : new Response('', { status: 404 });
      },
    });
    return { asked, ...result };
  };
  const main = item.source.url;
  const other = 'https://example.com/other-feed';

  // Fails twice, then works: no failure is reported.
  let out = await run({ [main]: [() => new Response('', { status: 404 }), () => new Response('', { status: 500 }), feedOk] });
  assert.equal(out.items.length, 3);
  assert.equal(out.failures.length, 0);
  assert.deepEqual(out.asked, [main, main, main]);

  // The main address is down but the second address works.
  out = await run({ [other]: [feedOk] }, [other]);
  assert.equal(out.items.length, 3);
  assert.deepEqual(out.asked, [main, other]);

  // A page that is not a feed counts as a failure too; after three tries it is reported with every error.
  out = await run({ [main]: [() => new Response('<html>Checking your browser</html>')] }, [other]);
  assert.equal(out.items.length, 0);
  assert.deepEqual(out.asked, [main, other, main]);
  assert.match(out.failures[0].error, /HTTP 404 \(3 attempts: the response was not a feed, HTTP 404, HTTP 404\)/);
});

test('a YouTube source is read through the API when there is a key, and from its feed otherwise', async () => {
  const KEY = 'secret-key-value';
  const channel = { ...item.source, id: 'yt', name: 'Channel', type: 'video' as const, url: 'https://yt.example/feed', youtubeChannel: 'UCabc123' };
  const apiBody = {
    items: [
      {
        snippet: { title: 'Signalling in ten minutes', description: 'Line one.\n\nLine two.', thumbnails: { high: { url: 'https://i.ytimg.com/vi/vid1/hq.jpg' } } },
        contentDetails: { videoId: 'vid1', videoPublishedAt: '2026-09-28T10:00:00Z' },
      },
      { snippet: { title: 'An old video' }, contentDetails: { videoId: 'vid0', videoPublishedAt: '2026-01-01T10:00:00Z' } },
      { snippet: { title: 'Private video' }, contentDetails: { videoId: 'vid2' } },
    ],
  };
  const since = new Date('2026-09-20T00:00:00Z');
  const run = async (youtubeKey: string, api: () => Response) => {
    const asked: { url: string; headers: Record<string, string> }[] = [];
    const result = await fetchFeeds([channel], since, {
      youtubeKey,
      sleep: async () => {},
      attempts: 2,
      get: async (url, _accept, _timeout, headers = {}) => {
        asked.push({ url, headers });
        return url.includes('googleapis.com') ? api() : new Response(sampleFeed);
      },
    });
    return { asked, ...result };
  };

  // With a key: one API request, to the uploads playlist, with the key in a header and not in the address.
  let out = await run(KEY, () => new Response(JSON.stringify(apiBody)));
  assert.equal(out.asked.length, 1);
  assert.match(out.asked[0].url, /playlistItems.*playlistId=UUabc123/);
  assert.ok(!out.asked[0].url.includes(KEY));
  assert.equal(out.asked[0].headers['X-goog-api-key'], KEY);
  assert.deepEqual(out.items.map((i) => [i.title, i.url, i.feedText, i.image]), [
    ['Signalling in ten minutes', 'https://www.youtube.com/watch?v=vid1', 'Line one. Line two.', 'https://i.ytimg.com/vi/vid1/hq.jpg'],
  ]);
  assert.deepEqual(out.notes, ['Channel: read through the YouTube API']);

  // The API refuses the key: the feed is used instead, and the key appears nowhere in what is reported.
  const refused = () => new Response(JSON.stringify({ error: { errors: [{ reason: 'keyInvalid' }], message: `Bad key ${KEY}` } }), { status: 400 });
  out = await run(KEY, refused);
  assert.equal(out.items.length, 3, 'items from the feed');
  assert.equal(out.failures.length, 0);
  assert.deepEqual(out.notes, ['Channel: YouTube API HTTP 400 (keyInvalid), so the RSS feed was used instead']);
  assert.ok(!JSON.stringify([out.notes, out.failures]).includes(KEY));

  // Without a key the API is never called.
  out = await run('', () => { throw new Error('the API must not be called'); });
  assert.deepEqual(out.asked.map((a) => a.url), ['https://yt.example/feed']);
  assert.deepEqual(out.notes, []);
});

test('feed text loses its markup and has its entities decoded', () => {
  assert.equal(stripHtml('<p>Tom &amp; Ann&#8217;s &quot;plan&quot; &#x2014; 5&nbsp;&lt;&nbsp;7 &hellip; &copy;</p><script>x()</script>'), 'Tom & Ann\'s "plan" - 5 < 7 ... &copy;');
});

test('a feed that says to slow down is not asked again in the same run', async () => {
  let asked = 0;
  const { failures } = await fetchFeeds([item.source], new Date('2026-09-20T00:00:00Z'), {
    sleep: async () => {},
    attempts: 5,
    get: async () => {
      asked++;
      return new Response('', { status: 429 });
    },
  });
  assert.equal(asked, 1);
  assert.match(failures[0].error, /HTTP 429 \(1 attempt: HTTP 429\)/);
});
