import fs from 'node:fs';
import path from 'node:path';
import { dateProblems, readSiteDates } from '../src/lib/bulletin';

// Checks that a built site's pages agree on the day: the Bulletin must be as of
// the front page's edition, or of its own newest item when that is newer. A
// Bulletin older than the front page means a stale page was built or served.
//
//   npm run check-site                          the site built in dist/
//   npm run check-site -- https://example.com   the live site, past any cache

const where = process.argv[2];

async function page(route: string): Promise<string> {
  if (where && /^https?:\/\//.test(where)) {
    // A query the cache has never seen, so the page comes from the host and not from a copy.
    const url = `${where.replace(/\/+$/, '')}/${route}?fresh=${Date.now()}`;
    const response = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    return response.text();
  }
  return fs.readFileSync(path.join(where ?? 'dist', route, 'index.html'), 'utf8');
}

const dates = readSiteDates(await page(''), await page('bulletin/'));
const problems = dateProblems(dates);
const site = where ?? 'dist/';
if (problems.length) {
  for (const problem of problems) console.error(`${site}: ${problem}`);
  process.exit(1);
}
console.log(`${site}: the Bulletin is as of ${dates.asOf}, the front page's edition is ${dates.edition}${dates.newestItem ? `, its newest item is of ${dates.newestItem}` : ''}.`);
