// A release the paper's subject is about to have, and the line that announces
// it. This runs at build time and again in the browser, since the site is only
// rebuilt when an edition is written and the line depends on today's date.

/** One step of a release: where it arrives, and the day or days it does. Days are YYYY-MM-DD. */
export interface Stage {
  /** Where it arrives, as it reads in "reaches ...": "sandboxes", "production". */
  place: string;
  from: string;
  to: string;
}

export interface Release {
  name: string;
  /** In order of date. */
  stages: Stage[];
}

/** Days before a release's first date that the paper starts to announce it. */
export const ANNOUNCE_DAYS = 30;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = 86_400_000;
const time = (day: string) => Date.parse(`${day}T00:00:00Z`);
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "9 Jan", "19 to 20 Feb", "30 Jan to 1 Feb", with the year when it is not this one. */
function when(stage: Stage, today: string): string {
  const [fromYear, fromMonth, fromDay] = stage.from.split('-').map(Number);
  const [toYear, toMonth, toDay] = stage.to.split('-').map(Number);
  const year = toYear === Number(today.slice(0, 4)) ? '' : ` ${toYear}`;
  const end = `${toDay} ${MONTHS[toMonth - 1]}${year}`;
  if (stage.from === stage.to) return end;
  return fromMonth === toMonth && fromYear === toYear ? `${fromDay} to ${end}` : `${fromDay} ${MONTHS[fromMonth - 1]} to ${end}`;
}

const list = (parts: string[]) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`);

/** What is still to come, said place by place: "Production: 6 Feb and 19 to 20 Feb." */
function ahead(stages: Stage[], today: string): string {
  const places = [...new Set(stages.map((stage) => stage.place))];
  return places.map((place) => ` ${capital(place)}: ${list(stages.filter((stage) => stage.place === place).map((stage) => when(stage, today)))}.`).join('');
}

/** The line for one release on a given day. */
export function sentence(release: Release, today: string): string {
  const { name, stages } = release;
  const begun = stages.filter((stage) => stage.from <= today);
  const coming = stages.filter((stage) => stage.from > today);
  if (begun.length === 0) return `${name} reaches ${stages[0].place} on ${when(stages[0], today)}.${ahead(stages.slice(1), today)}`;
  const place = begun.at(-1)!.place;
  if (coming.length === 0) return `${name} is arriving in ${place}. Last wave: ${when(begun.at(-1)!, today)}.`;
  // Still to come in the same place: the release is part-way through it.
  if (coming[0].place === place) return `${name} is arriving in ${place}. Still to come: ${list(coming.map((stage) => when(stage, today)))}.`;
  return `${name} is in ${place}.${ahead(coming, today)}`;
}

/**
 * The release to announce today, with its line, or nothing. A release is
 * announced from `ANNOUNCE_DAYS` before its first date until its last has passed.
 */
export function bannerFor(releases: Release[], today: string): { release: Release; says: string } | undefined {
  const release = [...releases]
    .filter((candidate) => candidate.stages.length > 0)
    .sort((a, b) => a.stages[0].from.localeCompare(b.stages[0].from))
    .find((candidate) => time(today) >= time(candidate.stages[0].from) - ANNOUNCE_DAYS * DAY && today <= candidate.stages.at(-1)!.to);
  return release && { release, says: sentence(release, today) };
}

/** Whatever was saved, read as releases; anything misshapen is left out. */
export function readReleases(raw: unknown): Release[] {
  if (!Array.isArray(raw)) return [];
  const isDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  return raw.flatMap((entry) => {
    if (!entry || typeof entry.name !== 'string' || !Array.isArray(entry.stages)) return [];
    const stages = (entry.stages as Stage[]).filter((stage) => stage && typeof stage.place === 'string' && isDay(stage.from) && isDay(stage.to));
    return stages.length ? [{ name: entry.name, stages }] : [];
  });
}
