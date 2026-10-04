// What the tests share: a small paper of their own, so that they do not depend
// on whichever paper this project publishes, and stand-ins for a feed item and
// the model.

import { definePaper, type Paper } from '../src/paper';
import type { FeedItem } from './fetch';
import { LlmClient, type LlmConfig } from './llm';

const GLOSSARY = [
  'Custom Metadata Type',
  'Custom Metadata',
  'Custom Object',
  'Custom Setting',
  'Custom Field',
  'Custom Label',
  'Custom Permission',
  'Permission Set Group',
  'Permission Set',
  'Validation Rule',
  'Sharing Rule',
  'Formula Field',
  'Screen Flow',
  'Record-Triggered Flow',
  'Flow Builder',
  'Process Builder',
  'List View',
  'Related List',
  'Quick Action',
  'Lightning Web Component',
  'Lightning Record Page',
  'Lightning Experience',
  'Platform Event',
  'Named Credential',
  'Connected App',
  'External Client App',
  'Scratch Org',
  'Prompt Builder',
  'Prompt Template',
  'Agent Script',
  'Data Cloud',
  'Experience Cloud',
  'DevOps Center',
  'Salesforce CLI',
  'AppExchange',
  'Agentforce',
  'Visualforce',
  'Trailhead',
  'MuleSoft',
  'OmniStudio',
  'Salesforce',
  'Dreamforce',
  'Einstein',
  'Tableau',
  'Heroku',
  'Slack',
  'Apex',
  'SOQL',
  'SOSL',
  'LWC',
];

export const PAPER: Paper = definePaper({
  name: 'The Test Herald',
  tagline: 'A paper for the tests',
  description: 'A paper that exists only in the tests.',
  creator: { name: 'Tester', url: 'https://example.com' },
  timezone: 'UTC',
  topic: 'Salesforce technology',
  readers: 'Salesforce developers, admins and architects',
  relevant: 'teaches a practitioner something about Salesforce',
  notRelevant: 'product marketing and hiring posts',
  sections: [
    { id: 'apex-and-platform', label: 'Apex and platform' },
    { id: 'flow-and-admin', label: 'Flow and admin' },
  ],
  personas: [
    { id: 'developer', label: 'Developers' },
    { id: 'admin', label: 'Admins' },
  ],
  sources: [{ id: 'test', name: 'Test', url: 'https://example.com/feed', type: 'community' }],
  keywords: ['apex', 'soql', 'flow', 'lightning web component', 'data cloud', String.raw`(spring|summer|winter) '?\d\d`],
  glossary: GLOSSARY,
  notAuthors: ['salesforce'],
  bot: { name: 'TestBot', contact: 'https://example.com' },
}) as Paper;

export const item: FeedItem = {
  source: { id: 'test', name: 'Test', url: 'https://example.com/feed', type: 'community' },
  title: 'Bulkifying Apex triggers',
  url: 'https://example.com/post',
  published: new Date(),
  authors: ['A. Writer'],
  feedText: '',
};

export const good = {
  relevant: true,
  section: 'apex-and-platform',
  personas: ['developer'],
  tags: ['Apex', 'bulk patterns'],
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
<item><title>Flow Test Mode</title><link>https://blog.example/flow-test-mode/</link><pubDate>Tue, 29 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>Adam White</dc:creator><media:content url="https://cdn.example/flow.png" medium="image"/>
  <content:encoded><![CDATA[<p>By Adam White and Mei Chen. ${'Flow Test Mode lets admins run a flow against saved records. '.repeat(40)}</p>]]></content:encoded></item>
<item><title>Monthly Retro</title><link>https://blog.example/retro/</link><pubDate>Mon, 28 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>mgerholdt@salesforce.com</dc:creator><description><![CDATA[<img src="https://cdn.example/retro.jpg"> A short teaser.]]></description></item>
<item><title>Chunking</title><link>https://blog.example/chunking/</link><pubDate>Sun, 27 Sep 2026 10:00:00 +0000</pubDate>
  <dc:creator>spatlori</dc:creator><description>Teaser.</description></item>
<item><title>Too old</title><link>https://blog.example/old/</link><pubDate>Mon, 01 Jun 2026 10:00:00 +0000</pubDate><description>Old.</description></item>
</channel></rss>`;
