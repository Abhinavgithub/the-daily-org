import { parseHTML } from 'linkedom';
import { USER_AGENT } from './http';

// Salesforce's release notes, read as its help site reads them. The site is
// drawn by script: a page asks the server for one topic at a time, and the same
// request works without a browser. It is not a published API and can change
// without notice, so everything that uses it has to live without it.
//
// The notes are a tree. The front page lists areas (Automation, Platform, ...).
// An area lists its products, or, where features come out monthly, the features
// themselves under the month they were added. A topic's page is known by its
// name, such as "release-notes.rn_automate.htm".

const HELP = 'https://help.salesforce.com';
export const FRONT_PAGE = 'release-notes.salesforce_release_notes.htm';
const TIMEOUT_MS = 40_000;

/** What the help site wants sent back with every request: which build of itself the caller claims to be. */
export interface HelpContext {
  fwuid: string;
  app: string;
}

/** A topic of the notes, as the help site returns it. */
export interface Topic {
  /** False when the release has no such topic, or no notes at all yet. */
  found: boolean;
  title: string;
  html: string;
  /** When Salesforce last published this topic. */
  published?: string;
  /** The newest release that has notes, such as "264.0.0", whatever release was asked for. */
  latest?: string;
}

/** The two values in the help site's page that its requests must carry. */
export function contextIn(shell: string): HelpContext | undefined {
  const text = decodeURIComponent(shell.replace(/%(?![0-9A-Fa-f]{2})/g, '%25'));
  const fwuid = text.match(/"fwuid":"([^"]+)"/)?.[1];
  const app = text.match(/"APPLICATION@markup:\/\/siteforce:communityApp":"([^"]+)"/)?.[1];
  return fwuid && app ? { fwuid, app } : undefined;
}

export async function helpContext(request: typeof fetch = fetch): Promise<HelpContext> {
  const res = await request(`${HELP}/s/articleView?id=${FRONT_PAGE}&type=5`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`the help site answered HTTP ${res.status}`);
  const context = contextIn(await res.text());
  if (!context) throw new Error('the help site no longer carries the values its requests need');
  return context;
}

/** One topic of one release's notes. `release` is Salesforce's number for it, such as "264.0.0". */
export async function helpTopic(name: string, release: string, context: HelpContext, request: typeof fetch = fetch): Promise<Topic> {
  const message = {
    actions: [
      {
        id: '1;a',
        descriptor: 'aura://ApexActionController/ACTION$execute',
        callingDescriptor: 'UNKNOWN',
        params: {
          namespace: '',
          classname: 'Help_ArticleDataController',
          method: 'getData',
          params: { articleParameters: { urlName: name, language: 'en_US', release, requestedArticleType: 'HelpDocs', requestedArticleTypeNumber: '5' } },
          cacheable: false,
          isContinuation: false,
        },
      },
    ],
  };
  const body = new URLSearchParams({
    message: JSON.stringify(message),
    'aura.context': JSON.stringify({ mode: 'PROD', fwuid: context.fwuid, app: 'siteforce:communityApp', loaded: { 'APPLICATION@markup://siteforce:communityApp': context.app }, dn: [], globals: {}, uad: true }),
    'aura.pageURI': `/s/articleView?id=${name}&type=5`,
    'aura.token': 'null',
  });
  const res = await request(`${HELP}/s/sfsites/aura?r=1&aura.ApexAction.execute=1`, {
    method: 'POST',
    headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reply = (await res.json()) as { actions?: { state?: string; returnValue?: { returnValue?: Reply } & Reply; error?: unknown[] }[] };
  const action = reply.actions?.[0];
  if (action?.state !== 'SUCCESS') throw new Error(`the help site refused the request (${action?.state ?? 'no answer'})`);
  const value: Reply = action.returnValue?.returnValue ?? action.returnValue ?? {};
  const record = value.record;
  const html = record?.Content__c ?? '';
  // A topic too long for the site to hand over comes back as one line saying so.
  const usable = value.type === 'HelpDocs' && html.includes('<');
  return { found: usable, title: record?.Title__c ?? '', html: usable ? html : '', published: record?.Published_Date__c, latest: value.latestRNVersion };
}

interface Reply {
  type?: string;
  latestRNVersion?: string;
  record?: { Content__c?: string; Title__c?: string; Published_Date__c?: string };
}

/** Something a page of the notes points at: a product, a group of features, or one feature. */
export interface Entry {
  /** The topic it leads to, such as "release-notes.rn_automate_flow.htm". */
  topic: string;
  title: string;
  /** What the page says of it: a sentence or a short paragraph. */
  text: string;
  /** What it is filed under on this page: a product's name, or a section such as "Enforced with This Release". */
  group?: string;
  /** How the page presents it. A `child` is a page of its own listed at the top; a `feature` is named in a list of what changed; a `term` has its own paragraph. */
  kind: 'child' | 'feature' | 'term';
}

const tidy = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
const topicOf = (href: string | null) => href?.match(/[?&]id=([^&#"]+\.htm)/)?.[1];

/** A page's first paragraph: what Salesforce says the area or product is about. */
export function introOf(html: string): string {
  const { document } = parseHTML(html.replace(/^<\?xml[^>]*\?>/, ''));
  return tidy(document.querySelector('h1 ~ p')?.textContent);
}

/**
 * Everything a page of the notes points at. A page lists its children at the
 * top; some list features under the month they were added, or as terms with a
 * paragraph each. Links out of the notes, and to the notes' own front matter, are left.
 */
export function entriesIn(html: string): Entry[] {
  const { document } = parseHTML(html.replace(/^<\?xml[^>]*\?>/, ''));
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const add = (entry: Entry) => {
    const key = `${entry.kind}:${entry.topic}`;
    if (!entry.title || seen.has(key) || /archived release notes/i.test(entry.title)) return;
    seen.add(key);
    entries.push(entry);
  };
  const heading = (element: Element) => {
    // The nearest heading above, in the order of the page.
    for (let node: Element | null = element; node; node = node.parentElement) {
      for (let before = node.previousElementSibling; before; before = before.previousElementSibling) {
        if (/^H[2-4]$/.test(before.tagName)) return tidy(before.textContent);
      }
    }
    return undefined;
  };

  for (const item of document.querySelectorAll('li')) {
    const strong = item.querySelector(':scope > strong');
    if (!strong) continue;
    const own = strong.querySelector('a');
    if (own) {
      // A child of this page: its name in bold, then what it holds.
      const topic = topicOf(own.getAttribute('href'));
      if (!topic) continue;
      const rest = item.cloneNode(true) as Element;
      rest.querySelector('strong')?.remove();
      add({ topic, title: tidy(own.textContent), text: tidy(rest.textContent), kind: 'child' });
      continue;
    }
    // A feature in a list of changes: the product in bold, then the feature's name as a link that carries its description.
    const link = item.querySelector(':scope > a');
    const topic = topicOf(link?.getAttribute('href') ?? null);
    if (!link || !topic) continue;
    add({ topic, title: tidy(link.textContent), text: tidy(link.getAttribute('title')), group: tidy(strong.textContent), kind: 'feature' });
  }
  for (const term of document.querySelectorAll('dt')) {
    const link = term.querySelector('a');
    const topic = topicOf(link?.getAttribute('href') ?? null);
    if (!link || !topic) continue;
    const said = term.nextElementSibling?.tagName === 'DD' ? tidy(term.nextElementSibling.textContent) : '';
    add({ topic, title: tidy(link.textContent), text: tidy(link.getAttribute('title')) || said, group: heading(term), kind: 'term' });
  }
  return entries;
}

/** Where a person reads a topic of a release's notes. */
export const topicUrl = (topic: string, release: string) => `${HELP}/s/articleView?id=${topic}&release=${release.split('.')[0]}&type=5`;

/** The release a set of notes is for, from its title: "Salesforce Winter '27 Release Notes" is "Winter '27". */
export function releaseNamed(title: string): string | undefined {
  const match = title.match(/(Spring|Summer|Winter)\s*['’]\s*(\d\d)/);
  return match ? `${match[1]} '${match[2]}` : undefined;
}
