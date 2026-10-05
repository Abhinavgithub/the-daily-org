// What the tests share: a small paper of their own, so that they do not depend
// on whichever paper this project publishes, and stand-ins for a feed item and
// the model.

import { definePaper, type Paper } from '../src/paper';
import type { FeedItem } from './fetch';
import { LlmClient, type LlmConfig } from './llm';

// The names a paper about railways might always write one way. Between them they
// cover what the glossary has to handle: a term inside a longer one, plurals,
// a hyphenated term, brand names and initials.
const GLOSSARY = [
  'Signal Box Diagram',
  'Signal Box',
  'Goods Yard',
  'Branch Line',
  'Track Circuit Board',
  'Track Circuit',
  'Narrow-Gauge Line',
  'Main Line',
  'Diesel Multiple Unit',
  'RailOps Center',
  'Eurostar',
  'Amtrak',
  'ETCS',
  'TGV',
];

export const PAPER: Paper = definePaper({
  name: 'The Test Paper',
  tagline: 'A paper for the tests',
  description: 'A paper that exists only in the tests.',
  creator: { name: 'Tester', url: 'https://example.com' },
  timezone: 'UTC',
  topic: 'railways',
  readers: 'people who run and follow railways',
  relevant: 'teaches a practitioner something about running a railway',
  notRelevant: 'product marketing and hiring posts',
  sections: [
    { id: 'track-and-signals', label: 'Track and signals' },
    { id: 'trains-and-timetables', label: 'Trains and timetables' },
  ],
  personas: [
    { id: 'developer', label: 'Developers' },
    { id: 'admin', label: 'Admins' },
  ],
  sources: [{ id: 'test', name: 'Test', url: 'https://example.com/feed', type: 'community' }],
  keywords: ['eurostar', 'etcs', 'signalling', 'diesel multiple unit', 'branch line', String.raw`(spring|summer|winter) '?\d\d`],
  glossary: GLOSSARY,
  notAuthors: ['railway'],
  bot: { name: 'TestBot', contact: 'https://example.com' },
}) as Paper;

export const item: FeedItem = {
  source: { id: 'test', name: 'Test', url: 'https://example.com/feed', type: 'community' },
  title: 'Timing Eurostar departures',
  url: 'https://example.com/post',
  published: new Date(),
  authors: ['A. Writer'],
  feedText: '',
};

export const good = {
  relevant: true,
  section: 'track-and-signals',
  personas: ['developer'],
  tags: ['Eurostar', 'bulk patterns'],
  interest_score: 8,
  depth_score: '7',
  novelty_score: 5,
  utility_score: 12,
  why_read: 'You will learn **bulk** patterns.',
  summary: 'First paragraph with a [link](https://evil.example).\n\n<script>alert(1)</script>Second paragraph.',
};

export const ok = (content: string, model = 'm1') =>
  new Response(JSON.stringify({ model, choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }));

export function client(responses: (() => Response)[], models = ['m1']) {
  const calls: string[] = [];
  const config: LlmConfig = {
    baseUrl: 'https://llm.test/v1',
    apiKey: 'k',
    models,
    minIntervalMs: 0,
    maxRetries: 2,
    sleep: async () => {},
    fetch: (async (_url: unknown, init?: RequestInit) => {
      calls.push(JSON.parse(String(init?.body)).model);
      const next = responses.shift();
      if (!next) throw new Error('unexpected extra call');
      return next();
    }) as typeof fetch,
  };
  return { llm: new LlmClient(config), calls };
}

export const sampleFeed = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel><title>Blog</title>
<item><title>Timetable Test Mode</title><link>https://blog.example/timetable-test-mode/</link><pubDate>Tue, 29 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>Adam White</dc:creator><media:content url="https://cdn.example/timetable.png" medium="image"/>
  <content:encoded><![CDATA[<p>By Adam White and Mei Chen. ${'Timetable Test Mode lets planners run a timetable against saved days. '.repeat(40)}</p>]]></content:encoded></item>
<item><title>Monthly Retro</title><link>https://blog.example/retro/</link><pubDate>Mon, 28 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>jwriter@example.com</dc:creator><description><![CDATA[<img src="https://cdn.example/retro.jpg"> A short teaser.]]></description></item>
<item><title>Chunking</title><link>https://blog.example/chunking/</link><pubDate>Sun, 27 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>spatlori</dc:creator><description>Teaser.</description></item>
<item><title>Too old</title><link>https://blog.example/old/</link><pubDate>Mon, 01 Jun 2026 10:00:00 +0000</pubDate><description>Old.</description></item>
</channel></rss>`;
