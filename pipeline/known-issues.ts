import fs from 'node:fs';
import path from 'node:path';
import type { KnownIssueList } from '../src/paper';
import { apexAction, helpContext, type HelpContext } from './release-notes';

// Salesforce's Known Issues: bugs Salesforce has confirmed, each with how many
// people have said it affects them. Read as the list on its help site reads
// them (help.salesforce.com/s/issues), which is not a published service and can
// change without notice, so it is never a reason to stop.
//
// For now the paper only watches (PLAN.md, step 9c): each run records the new
// issues, those changed lately and the most reported, with their counts and
// status by day, in data/known-issues.json. How fast counts grow decides which
// issues the Bulletin will print.

export const KNOWN_ISSUES_PATH = path.join(process.cwd(), 'data', 'known-issues.json');
/** The most the server returns in one go: a page of 50 fails on its side. */
const PAGE = 25;
/** How far back new issues are read. */
const NEW_DAYS = 7;
/** An issue not met for this long is forgotten. */
const FORGET_DAYS = 30;

/** One issue as the list gives it. */
export interface KnownIssue {
  /** "KI-77412". */
  id: string;
  /** The record id, for its page. */
  key: string;
  subject: string;
  /** The product it is filed under, and the cloud that product is part of. */
  product?: string;
  cloud?: string;
  status: string;
  /** How many people have said it affects them. */
  affected: number;
  /** YYYY-MM-DD. */
  created: string;
}

/** What has been seen of an issue, run by run. Days are YYYY-MM-DD; a day is recorded only when the figure changed. */
export interface Watched {
  key: string;
  subject: string;
  product?: string;
  cloud?: string;
  created: string;
  firstSeen: string;
  lastSeen: string;
  status: Record<string, string>;
  affected: Record<string, number>;
}

export type Watch = Record<string, Watched>;

/** The issue's own page. */
export const issueLink = (key: string) => `https://help.salesforce.com/s/issue?id=${key}`;

interface Row {
  Id?: string;
  Name?: string;
  Subject_c?: string;
  Status_c?: string;
  Reporting_User_Count_c?: number;
  CreatedDate?: string;
  Category_r?: { Name?: string; Cloud_c?: string };
}

/** An issue from a row of the list, or nothing when the row lacks what makes it one. */
export function issueFrom(row: Row): KnownIssue | undefined {
  if (!row.Id || !row.Name || !row.Subject_c || !row.CreatedDate) return undefined;
  return {
    id: row.Name,
    key: row.Id,
    subject: row.Subject_c.trim(),
    ...(row.Category_r?.Name ? { product: row.Category_r.Name } : {}),
    ...(row.Category_r?.Cloud_c ? { cloud: row.Category_r.Cloud_c } : {}),
    status: row.Status_c ?? 'Unknown',
    affected: typeof row.Reporting_User_Count_c === 'number' ? row.Reporting_User_Count_c : 0,
    created: row.CreatedDate.slice(0, 10),
  };
}

/** The last value of a by-day record. */
const latest = <T>(byDay: Record<string, T>): T | undefined => Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).at(-1)?.[1];

/** The record with what one run saw added: a figure only on a day it changed, and issues long unseen forgotten. */
export function watch(before: Watch, issues: KnownIssue[], day: string): Watch {
  const after: Watch = {};
  const cutoff = new Date(Date.parse(day) - FORGET_DAYS * 86_400_000).toISOString().slice(0, 10);
  for (const [id, watched] of Object.entries(before)) if (watched.lastSeen >= cutoff) after[id] = watched;
  for (const issue of issues) {
    const known = after[issue.id];
    const watched: Watched = known
      ? { ...known, subject: issue.subject, product: issue.product, cloud: issue.cloud, lastSeen: day, status: { ...known.status }, affected: { ...known.affected } }
      : { key: issue.key, subject: issue.subject, product: issue.product, cloud: issue.cloud, created: issue.created, firstSeen: day, lastSeen: day, status: {}, affected: {} };
    if (latest(watched.status) !== issue.status) watched.status[day] = issue.status;
    if (latest(watched.affected) !== issue.affected) watched.affected[day] = issue.affected;
    if (!watched.product) delete watched.product;
    if (!watched.cloud) delete watched.cloud;
    after[issue.id] = watched;
  }
  return after;
}

type Page = (order: string, offset: number) => Promise<KnownIssue[]>;

/**
 * What one run reads: every issue created in the last week, newest first, until
 * one older is met; the 100 changed most lately; and the 100 most reported.
 */
export async function readIssues(page: Page, now: Date): Promise<KnownIssue[]> {
  const found = new Map<string, KnownIssue>();
  const since = new Date(now.getTime() - NEW_DAYS * 86_400_000).toISOString().slice(0, 10);
  for (let offset = 0; offset < 40 * PAGE; offset += PAGE) {
    const issues = await page('CreatedDate', offset);
    for (const issue of issues) if (issue.created >= since) found.set(issue.id, issue);
    if (issues.length < PAGE || issues.some((issue) => issue.created < since)) break;
  }
  for (const order of ['Last_Modified_Date_External__c', 'Reporting_User_Count__c']) {
    for (let offset = 0; offset < 4 * PAGE; offset += PAGE) {
      const issues = await page(order, offset);
      for (const issue of issues) found.set(issue.id, issue);
      if (issues.length < PAGE) break;
    }
  }
  return [...found.values()];
}

const LISTS: Record<KnownIssueList, (request: typeof fetch) => Page> = {
  'salesforce-help': (request) => {
    let context: Promise<HelpContext> | undefined;
    return async (order, offset) => {
      context ??= helpContext(request);
      const params = { myKnownIssuesChecked: false, offset, pageSize: PAGE, orderByField: order, sortDirection: 'DESC', searchKeyword: '', parentCategoryFilters: [], childCategoryFilters: [], statusFilters: [], foundInReleaseFilters: [] };
      const reply = await apexAction<{ records?: Row[] }>('HC_KILandingPageController', 'fetchKnownIssuesList', params, '/s/issues', await context, request);
      if (!Array.isArray(reply.records)) throw new Error('the list came back without its records');
      return reply.records.map(issueFrom).filter((issue): issue is KnownIssue => issue !== undefined);
    };
  },
};

/** Read the list and add what it says to the record. A list that cannot be read leaves the record as it was. */
export async function updateKnownIssues(
  list: KnownIssueList,
  day: string,
  options: { request?: typeof fetch; now?: Date; file?: string } = {},
): Promise<{ read: number; added: number } | { error: string }> {
  const file = options.file ?? KNOWN_ISSUES_PATH;
  try {
    const issues = await readIssues(LISTS[list](options.request ?? fetch), options.now ?? new Date());
    if (issues.length === 0) return { error: 'the list was empty' };
    let before: Watch = {};
    try {
      before = JSON.parse(fs.readFileSync(file, 'utf8')) as Watch;
    } catch {
      // Nothing watched yet.
    }
    const after = watch(before, issues, day);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(after, null, 1) + '\n');
    return { read: issues.length, added: Object.keys(after).filter((id) => !before[id]).length };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
