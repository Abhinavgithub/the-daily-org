import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { deadlinesFrom, grouped } from '../lib/deadlines';
import { calendar } from '../lib/ics';
import { readReleases } from '../lib/releases';
import { getReleaseEditions } from '../lib/release-store';

// The Deadlines page as a calendar to subscribe to (src/lib/ics.ts).
export function GET(context: APIContext) {
  let releases = readReleases(null);
  try {
    releases = readReleases(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'releases.json'), 'utf8')));
  } catch {
    // No dates have been read yet, or the file is unreadable.
  }
  const now = new Date();
  const groups = grouped(deadlinesFrom(getReleaseEditions()), releases, now.toISOString().slice(0, 10));
  const page = new URL('/deadlines/', context.site).href;
  const body = calendar(groups, releases, { name: `${SITE.name}: Deadlines`, page, host: new URL(page).hostname, now });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
