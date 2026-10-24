import type { AlertFeed, Source } from '../src/paper';
import type { FeedItem } from './fetch';
import { USER_AGENT } from './http';

// Notices the paper prints whatever their score: a security advisory, or a
// failure that reaches many of the subject's users at once. This is the one
// place that knows where a subject publishes them; a paper names the feed it
// wants in paper.config.ts. To the rest of the pipeline an alert is an article
// with a label on it.

/** What marks an article as an alert. */
export interface Alert {
  /** The flag it is printed under: "Security advisory", "Incident". */
  label: string;
  /** What is known for certain, as the source states it: "Resolved · began 16 Sep 2026 · 595 instances". */
  facts: string;
  /** Printed even if the editor thinks it off the paper's subject. Otherwise only the score is waived. */
  always: boolean;
}

// Salesforce Trust ----------------------------------------------------------

/** An incident as Trust lists it. Only what is read here. */
export interface TrustIncident {
  id?: number;
  status?: string;
  createdAt?: string;
  affectsAll?: boolean;
  instanceKeys?: string[];
  serviceKeys?: string[];
  IncidentImpacts?: { type?: string; severity?: string; startTime?: string; endTime?: string | null }[];
  IncidentEvents?: { createdAt?: string; message?: string }[];
}

/** A message to all customers, as Trust lists it. */
export interface TrustMessage {
  id?: number;
  subject?: string;
  body?: string;
  status?: string;
  startDate?: string;
  isVisible?: boolean;
  InformationalMessageUpdates?: { createdAt?: string; message?: string }[];
}

const TRUST: Source = { id: 'salesforce-trust', name: 'Salesforce Trust', url: 'https://status.salesforce.com', type: 'official' };
/** An incident is news for everyone once it is marked major and reaches this many instances, or all of them. */
export const WIDE = 5;
const SERIOUS = new Set(['major', 'critical']);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const said = (date: Date) => `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
const words = (text: string) => text.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
const newestFirst = (a: { createdAt?: string }, b: { createdAt?: string }) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

const isSerious = (incident: TrustIncident) => (incident.IncidentImpacts ?? []).some((impact) => SERIOUS.has(impact.severity ?? ''));

/** Whether a failure, reported as one incident or several, is one the whole paper should hear of: serious, and wide. */
export function isWide(...pieces: TrustIncident[]): boolean {
  const instances = new Set(pieces.flatMap((incident) => incident.instanceKeys ?? [])).size;
  return pieces.some(isSerious) && (pieces.some((incident) => incident.affectsAll === true) || instances >= WIDE);
}

/** How far apart two incidents may begin and still be the same failure, reported in pieces. */
const SAME_FAILURE_HOURS = 6;

const startOf = (incident: TrustIncident) => new Date((incident.IncidentImpacts ?? []).map((impact) => impact.startTime).filter(Boolean).sort()[0] ?? incident.createdAt ?? '');

/**
 * Trust often reports one failure as several incidents, a few instances each.
 * Incidents of the same services and the same kind that began within a few
 * hours of each other are taken to be one, and are printed as one.
 */
export function sameFailures(incidents: TrustIncident[]): TrustIncident[][] {
  const kindOf = (incident: TrustIncident) => [[...(incident.serviceKeys ?? [])].sort().join(','), incident.IncidentImpacts?.[0]?.type ?? ''].join(' ');
  const groups: TrustIncident[][] = [];
  for (const incident of [...incidents].sort((a, b) => startOf(a).getTime() - startOf(b).getTime())) {
    const group = groups.find((one) => kindOf(one[0]) === kindOf(incident) && startOf(incident).getTime() - startOf(one[0]).getTime() <= SAME_FAILURE_HOURS * 3_600_000);
    if (group) group.push(incident);
    else groups.push([incident]);
  }
  return groups;
}

/** The incidents worth an alert, as articles, one for each failure. `since` is the earliest start that still counts as new. */
export function incidentAlerts(incidents: TrustIncident[], since: Date): FeedItem[] {
  const serious = incidents.filter((incident) => incident.id && !Number.isNaN(startOf(incident).getTime()) && startOf(incident) >= since && isSerious(incident));
  // Pieces too narrow alone may be wide together.
  return sameFailures(serious).filter((group) => isWide(...group)).map((group) => {
    // The first incident reported stands for the failure: its page is linked, so the failure keeps one address however many pieces join it later.
    const [first] = [...group].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const began = startOf(group[0]);
    const instances = new Set(group.flatMap((incident) => incident.instanceKeys ?? [])).size;
    const reach = group.some((incident) => incident.affectsAll) ? 'all instances' : `${instances} instances`;
    const service = words((first.serviceKeys ?? []).join(', ')).replace(/^./, (letter) => letter.toUpperCase());
    const kind = words(first.IncidentImpacts?.[0]?.type ?? 'disruption').toLowerCase();
    const resolved = group.every((incident) => incident.status === 'Resolved');
    // What Salesforce said, newest first, since the latest word is what matters most. The same words posted to each piece are said once.
    const updates = [...new Set(group.flatMap((incident) => incident.IncidentEvents ?? []).sort(newestFirst).map((event) => event.message?.trim()).filter(Boolean))];
    const pieces = group.length > 1 ? ` Salesforce reported it as ${group.length} incidents.` : '';
    return {
      source: TRUST,
      title: `${service || 'Salesforce'}: ${kind} on ${reach}`,
      url: `https://status.salesforce.com/incidents/${first.id}`,
      published: began,
      authors: [],
      feedText: [`A ${kind} affecting ${reach}${service ? ` of ${service}` : ''}, which began on ${said(began)}. It is ${resolved ? 'resolved' : 'not yet resolved'}.${pieces}`, ...updates].join('\n\n'),
      alert: { label: 'Incident', facts: [resolved ? 'Resolved' : 'Ongoing when this edition was written', `began ${said(began)}`, reach].join(' · '), always: true },
    };
  });
}

/** Messages to all customers, as articles. One about security is always printed; any other is left to the editor. */
export function messageAlerts(messages: TrustMessage[], since: Date): FeedItem[] {
  return messages.flatMap((message) => {
    const began = new Date(message.startDate ?? '');
    const subject = message.subject?.trim();
    if (!message.id || !subject || message.isVisible === false || Number.isNaN(began.getTime()) || began < since) return [];
    const security = /^security\b/i.test(subject);
    const updates = [...(message.InformationalMessageUpdates ?? [])].sort(newestFirst).map((update) => update.message?.trim()).filter(Boolean);
    // An update often repeats the message word for word.
    const text = [...new Set([message.body?.trim(), ...updates].filter(Boolean))].join('\n\n');
    return [
      {
        source: TRUST,
        title: subject,
        url: `https://status.salesforce.com/generalmessages/${message.id}`,
        published: began,
        authors: [],
        feedText: text,
        alert: { label: security ? 'Security advisory' : 'Service notice', facts: [message.status === 'Resolved' ? 'Resolved' : 'Open', `began ${said(began)}`].join(' · '), always: security },
      },
    ];
  });
}

async function json<T>(request: typeof fetch, url: string): Promise<T> {
  const res = await request(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(40_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** The feeds a paper can name, each a way of reading alerts from somewhere. */
export const ALERT_FEEDS: Record<AlertFeed, { source: Source; read: (since: Date, request: typeof fetch) => Promise<FeedItem[]> }> = {
  'salesforce-trust': {
    source: TRUST,
    read: async (since, request) => {
      const [incidents, messages] = await Promise.all([
        json<TrustIncident[]>(request, `https://api.status.salesforce.com/v1/incidents?limit=500&startTime=${encodeURIComponent(since.toISOString())}`),
        json<TrustMessage[]>(request, 'https://api.status.salesforce.com/v1/generalMessages'),
      ]);
      return [...messageAlerts(messages, since), ...incidentAlerts(incidents, since)];
    },
  },
};

/** The alerts since a day, or why they could not be read. An edition is never held up for this. */
export async function readAlerts(feed: AlertFeed, since: Date, request: typeof fetch = fetch): Promise<{ items: FeedItem[] } | { error: string }> {
  try {
    return { items: await ALERT_FEEDS[feed].read(since, request) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
