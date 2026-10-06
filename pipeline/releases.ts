import fs from 'node:fs';
import path from 'node:path';
import type { Release, Stage } from '../src/lib/releases';
import type { Calendar } from '../src/paper';
import { USER_AGENT } from './http';

// When the next release arrives, for the line the paper prints ahead of it.
// This is the one place that knows where a subject publishes its release
// dates; a paper names the calendar it wants in paper.config.ts. The page
// knows only a release, its stages and their days.

export const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');

/** A maintenance window as Salesforce's Trust site lists it. Only what is read here. */
export interface TrustMaintenance {
  name?: string;
  status?: string;
  plannedStartTime?: string;
  message?: { maintenanceType?: string };
}

const DAY = 86_400_000;
const SEASON = /(Spring|Summer|Winter) '\d\d/;

/**
 * Releases from Trust's maintenance windows. A release is listed once for each
 * product and instance, hundreds of times over, on a handful of weekends. The
 * first is the sandbox preview and the rest are production, in waves. Days next
 * to each other are one wave: the same night falls on two dates across the world.
 */
export function releasesFromTrust(entries: TrustMaintenance[]): Release[] {
  const days = new Map<string, Set<string>>();
  for (const entry of entries) {
    const name = entry.name?.match(SEASON)?.[0];
    const day = entry.plannedStartTime?.slice(0, 10);
    if (!name || !day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    if (entry.message?.maintenanceType !== 'release' || entry.status === 'Canceled') continue;
    if (!days.has(name)) days.set(name, new Set());
    days.get(name)!.add(day);
  }
  return [...days.entries()]
    .map(([name, found]) => {
      const stages: Stage[] = [];
      for (const day of [...found].sort()) {
        const last = stages.at(-1);
        if (last && Date.parse(day) - Date.parse(last.to) <= DAY) last.to = day;
        else stages.push({ place: stages.length === 0 ? 'sandboxes' : 'production', from: day, to: day });
      }
      return { name, who: 'orgs', stages };
    })
    .sort((a, b) => a.stages[0].from.localeCompare(b.stages[0].from));
}

/** The calendars a paper can name, each a way of reading releases from somewhere. */
export const CALENDARS: Record<Calendar, (request: typeof fetch, now: Date) => Promise<Release[]>> = {
  'salesforce-trust': async (request: typeof fetch, now: Date): Promise<Release[]> => {
    // From a while back, so a release part-way through still has its earlier dates.
    const since = new Date(now.getTime() - 60 * DAY).toISOString();
    const res = await request(`https://api.status.salesforce.com/v1/maintenances?limit=1000&startTime=${encodeURIComponent(since)}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(40_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return releasesFromTrust((await res.json()) as TrustMaintenance[]);
  },
};

/**
 * Read the calendar and save what it says. A calendar that cannot be read, or
 * that has nothing in it, leaves the file as it was: an edition is never held
 * up for this, and dates already known are better than none.
 */
export async function updateReleases(calendar: Calendar, options: { request?: typeof fetch; now?: Date; file?: string } = {}): Promise<{ releases: Release[] } | { error: string }> {
  try {
    const releases = await CALENDARS[calendar](options.request ?? fetch, options.now ?? new Date());
    if (releases.length === 0) return { error: 'the calendar listed no release' };
    const file = options.file ?? RELEASES_PATH;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(releases, null, 2) + '\n');
    return { releases };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
