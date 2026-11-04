// The Deadlines page as a calendar a reader subscribes to once (/deadlines.ics):
// an all-day event for each update on the page, on the day the page gives it,
// and one for each stage of each release, on Trust's days. A calendar program
// asks for the file again each day, so a date that moves on the page moves in
// the calendar too. An update with no day to give it, because its release has
// no dates yet or the notes name no release, is left out until it has one.

import { dueOf, isoDay, type Group } from './deadlines';
import type { Release } from './releases';

export interface CalendarOptions {
  /** The calendar's name, as a calendar program lists it. */
  name: string;
  /** The Deadlines page's full address, which every event links back to. */
  page: string;
  /** The site's host name, which makes each event's id unique to this paper. */
  host: string;
  /** When the file was made. */
  now: Date;
}

/** Text as a calendar line holds it: backslashes, commas, semicolons and line breaks escaped. */
export function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** A line cut into pieces of at most 75 bytes, each after the first starting with a space, as calendars require. */
export function fold(line: string): string {
  const pieces: string[] = [];
  let piece = '';
  let bytes = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char);
    // A continued piece starts with a space, which counts against its 75.
    if (bytes + size > (pieces.length ? 74 : 75)) {
      pieces.push(piece);
      piece = '';
      bytes = 0;
    }
    piece += char;
    bytes += size;
  }
  pieces.push(piece);
  return pieces.join('\r\n ');
}

/** YYYY-MM-DD as a calendar day, YYYYMMDD. */
const day = (iso: string) => iso.replace(/-/g, '');
/** The day after, since an all-day event ends on the day after its last. */
const after = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
/** Letters and digits only, for an event's id. */
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

interface Event {
  uid: string;
  from: string;
  /** The last day, inclusive. */
  to: string;
  summary: string;
  description: string;
  url: string;
}

/** The updates, each on its own day if the notes name one, otherwise on its group's. */
function updateEvents(groups: Group[], options: CalendarOptions): Event[] {
  return groups.flatMap((group) => {
    if (group.kind === 'unknown') return [];
    return group.items.flatMap((item) => {
      const due = isoDay(item.deadline) ?? dueOf(group.kind === 'before' ? 'before' : 'in', group.dates);
      if (!due) return [];
      const when = group.kind === 'before' ? `Due any time before ${group.release} arrives.` : `Comes with ${group.release}.`;
      const description = [item.says, item.action ? `What to do: ${item.action}` : '', when, `Release note: ${item.link}`, `Deadlines: ${options.page}`].filter(Boolean).join('\n\n');
      return [{ uid: `update-${slug(item.topic)}@${options.host}`, from: due, to: due, summary: item.name, description, url: options.page }];
    });
  });
}

/** Each stage of each release: "Spring '27 reaches production". Stages in the same place are told apart by their order. */
function releaseEvents(releases: Release[], options: CalendarOptions): Event[] {
  return releases.flatMap((release) => {
    const seen = new Map<string, number>();
    return release.stages.map((stage) => {
      const nth = (seen.get(stage.place) ?? 0) + 1;
      seen.set(stage.place, nth);
      return {
        uid: `release-${slug(release.name)}-${slug(stage.place)}-${nth}@${options.host}`,
        from: stage.from,
        to: stage.to,
        summary: `${release.name} reaches ${stage.place}`,
        description: `Deadlines: ${options.page}`,
        url: options.page,
      };
    });
  });
}

/** The calendar file: its lines joined with CRLF, as the format asks. */
export function calendar(groups: Group[], releases: Release[], options: CalendarOptions): string {
  const stamp = options.now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const events = [...releaseEvents(releases, options), ...updateEvents(groups, options)].sort((a, b) => a.from.localeCompare(b.from) || a.uid.localeCompare(b.uid));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${options.host}//Deadlines//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.name)}`,
    // Asked again once a day, which is as often as the paper changes.
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
    ...events.flatMap((event) => [
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(event.from)}`,
      `DTEND;VALUE=DATE:${day(after(event.to))}`,
      `SUMMARY:${escapeText(event.summary)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `URL:${event.url}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
