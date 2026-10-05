import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseReadership, type ReadershipDay } from '../src/lib/readership';

// Saves who read the paper, one line a day, to data/readership.jsonl, from
// which the Stats page is drawn. The figures come from a web analytics
// service's reporting API, which counts page views without cookies and leaves
// out bots.
//
//   npm run readership
//
// Needs READERSHIP_API_TOKEN (a token that can only read analytics),
// READERSHIP_ACCOUNT_ID and READERSHIP_SITE_ID. Without them it does nothing.
// Only whole days are saved: a day is asked for once it is over, in UTC.

const FILE = path.join(process.cwd(), 'data', 'readership.jsonl');
const ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
/** How far back the first run looks, and how far back a gap is filled. */
const LOOK_BACK_DAYS = 30;
/** The most rows kept for a day in each breakdown, so a line stays small. */
const KEEP = 60;

const { READERSHIP_API_TOKEN: token, READERSHIP_ACCOUNT_ID: account, READERSHIP_SITE_ID: site } = process.env;
if (!token || !account || !site) {
  console.log('Readership is not set up (READERSHIP_API_TOKEN, READERSHIP_ACCOUNT_ID, READERSHIP_SITE_ID), so none was fetched.');
  process.exit(0);
}

const day = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (n: number) => day(new Date(Date.now() - n * 24 * 60 * 60 * 1000));

const saved = fs.existsSync(FILE) ? parseReadership(fs.readFileSync(FILE, 'utf8')) : [];
const have = new Set(saved.map((d) => d.date));
// Yesterday is the latest whole day.
const until = daysAgo(1);
const since = daysAgo(LOOK_BACK_DAYS);

interface Row {
  count: number;
  sum: { visits: number };
  dimensions: Record<string, string>;
}

/** Views and visits for each day from `from` to `to`, split by one more dimension when given. */
async function rows(from: string, to: string, dimension?: string): Promise<Row[]> {
  const query = `query ($account: String!, $site: String!, $from: Date!, $to: Date!) {
    viewer { accounts(filter: { accountTag: $account }) {
      rows: rumPageloadEventsAdaptiveGroups(limit: 5000, filter: { siteTag: $site, date_geq: $from, date_leq: $to }, orderBy: [count_DESC]) {
        count sum { visits } dimensions { date ${dimension ?? ''} }
      }
    } }
  }`;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { account, site, from, to } }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = (await res.json().catch(() => ({}))) as { data?: { viewer?: { accounts?: { rows?: Row[] }[] } }; errors?: { message?: string }[] };
  if (!res.ok || body.errors?.length) throw new Error(`the analytics service answered ${res.status}: ${body.errors?.map((e) => e.message).join('; ') ?? 'no detail'}`);
  return body.data?.viewer?.accounts?.[0]?.rows ?? [];
}

/** For each day, the count against each value of a dimension, largest first and no more than KEEP of them. */
function split(found: Row[], dimension: string, measure: (row: Row) => number): Map<string, Record<string, number>> {
  const byDay = new Map<string, [string, number][]>();
  for (const row of found) {
    const n = measure(row);
    if (n > 0) byDay.set(row.dimensions.date, [...(byDay.get(row.dimensions.date) ?? []), [row.dimensions[dimension] ?? '', n]]);
  }
  return new Map([...byDay].map(([date, pairs]) => [date, Object.fromEntries(pairs.sort((a, b) => b[1] - a[1]).slice(0, KEEP))]));
}

try {
  // The service answers a long span from a thinner sample of its records, so its
  // figures for a month are rough. The month is asked for only to find which days
  // have readers; each of those days is then asked for alone, which is as exact as it gets.
  const wanted = [...new Set((await rows(since, until)).filter((row) => row.count > 0).map((row) => row.dimensions.date))].filter((date) => !have.has(date)).sort();

  const fresh: ReadershipDay[] = [];
  for (const date of wanted) {
    const [totals, byCountry, byPage, byReferrer, byDevice] = await Promise.all([
      rows(date, date),
      rows(date, date, 'countryName'),
      rows(date, date, 'requestPath'),
      rows(date, date, 'refererHost'),
      rows(date, date, 'deviceType'),
    ]);
    const total = totals.find((row) => row.dimensions.date === date);
    if (!total || total.count <= 0) continue;
    fresh.push({
      date,
      views: total.count,
      visits: total.sum.visits,
      countries: split(byCountry, 'countryName', (row) => row.count).get(date) ?? {},
      pages: split(byPage, 'requestPath', (row) => row.count).get(date) ?? {},
      // Where a reader came from matters at the moment they arrive, so referrers are counted in visits.
      referrers: split(byReferrer, 'refererHost', (row) => row.sum.visits).get(date) ?? {},
      devices: split(byDevice, 'deviceType', (row) => row.count).get(date) ?? {},
    });
  }

  if (fresh.length === 0) {
    console.log(`Readership: nothing new up to ${until}.`);
  } else {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.appendFileSync(FILE, fresh.map((d) => JSON.stringify(d)).join('\n') + '\n');
    for (const d of fresh) console.log(`Readership ${d.date}: ${d.views} views, ${d.visits} visits.`);
  }
} catch (err) {
  // The paper is published whether or not its readers could be counted.
  console.warn(`Readership could not be fetched: ${(err as Error).message}`);
  process.exitCode = 1;
}
