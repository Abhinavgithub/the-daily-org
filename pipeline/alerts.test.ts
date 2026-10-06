import assert from 'node:assert/strict';
import { test } from 'node:test';
import { incidentAlerts, isWide, messageAlerts, readAlerts, type TrustIncident, type TrustMessage } from './alerts';

const since = new Date('2026-09-10T00:00:00Z');
const incident = (over: Partial<TrustIncident> = {}): TrustIncident => ({
  id: 20004433,
  status: 'Resolved',
  createdAt: '2026-09-16T14:20:00.000Z',
  instanceKeys: ['NA1', 'NA2', 'NA3', 'NA4', 'NA5'],
  serviceKeys: ['coreService'],
  IncidentImpacts: [{ type: 'serviceDisruption', severity: 'major', startTime: '2026-09-16T14:05:00.000Z' }],
  IncidentEvents: [
    { createdAt: '2026-09-16T14:30:00.000Z', message: 'We are investigating.' },
    { createdAt: '2026-09-16T16:10:00.000Z', message: 'The issue is resolved.' },
  ],
  ...over,
});

test('an incident is an alert only when it is serious and wide', () => {
  assert.equal(isWide(incident()), true);
  assert.equal(isWide(incident({ instanceKeys: ['NA1', 'NA2', 'NA3', 'NA4'] })), false, 'four instances is not wide');
  assert.equal(isWide(incident({ instanceKeys: ['NA1'], affectsAll: true })), true, 'all of them is');
  assert.equal(isWide(incident({ IncidentImpacts: [{ type: 'performanceDegradation', severity: 'minor' }] })), false, 'minor, however wide');
  assert.equal(isWide(incident({ IncidentImpacts: [{ severity: 'critical' }] })), true);
  assert.equal(isWide({}), false);
});

test('a wide incident becomes an article with its flag, its facts and what was said, newest first', () => {
  const [item, ...rest] = incidentAlerts([incident(), incident({ id: 2, instanceKeys: ['NA1'] }), incident({ id: 3, IncidentImpacts: [{ severity: 'major', startTime: '2026-09-01T00:00:00Z' }] })], since);
  assert.equal(rest.length, 0, 'one too narrow, one too old');
  assert.equal(item.title, 'Core Service: service disruption on 5 instances');
  assert.equal(item.url, 'https://status.salesforce.com/incidents/20004433');
  assert.equal(item.published.toISOString(), '2026-09-16T14:05:00.000Z', 'when it began, not when it was listed');
  assert.deepEqual(item.alert, { label: 'Incident', facts: 'Resolved · began 16 Sep 2026 · 5 instances', always: true });
  assert.ok(item.feedText.indexOf('The issue is resolved.') < item.feedText.indexOf('We are investigating.'));

  const open = incidentAlerts([incident({ status: 'Investigating', affectsAll: true })], since)[0];
  assert.equal(open.alert?.facts, 'Ongoing when this edition was written · began 16 Sep 2026 · all instances');
});

const message = (over: Partial<TrustMessage> = {}): TrustMessage => ({
  id: 20000244,
  subject: 'Security Advisory: Protecting Experience Cloud Sites ',
  body: 'Review your guest user settings.',
  status: 'Active',
  startDate: '2026-09-12T04:00:00.000Z',
  isVisible: true,
  InformationalMessageUpdates: [{ createdAt: '2026-09-13T00:00:00Z', message: 'Review your guest user settings.' }, { createdAt: '2026-09-14T00:00:00Z', message: 'A blog post has the steps.' }],
  ...over,
});

test('a message about security is always printed, and any other is left to the editor', () => {
  const [advisory, notice, ...rest] = messageAlerts(
    [message(), message({ id: 7, subject: 'Intermittent UI Freezing in Chrome 153', status: 'Resolved' }), message({ id: 8, startDate: '2026-03-08T04:00:00Z' }), message({ id: 9, isVisible: false }), message({ id: 10, subject: ' ' })],
    since,
  );
  assert.equal(rest.length, 0, 'one too old, one hidden, one with no subject');
  assert.deepEqual(advisory.alert, { label: 'Security advisory', facts: 'Open · began 12 Sep 2026', always: true });
  assert.equal(advisory.title, 'Security Advisory: Protecting Experience Cloud Sites');
  assert.equal(advisory.url, 'https://status.salesforce.com/generalmessages/20000244');
  assert.equal(advisory.feedText, 'Review your guest user settings.\n\nA blog post has the steps.', 'an update that repeats the message is said once');
  assert.deepEqual(notice.alert, { label: 'Service notice', facts: 'Resolved · began 12 Sep 2026', always: false });
});

test('alerts that cannot be read are an error to report, not a crash', async () => {
  const answers = (bodies: Record<string, unknown>, status = 200) =>
    (async (url: unknown) => new Response(JSON.stringify(String(url).includes('incidents') ? bodies.incidents : bodies.messages), { status })) as typeof fetch;
  const read = await readAlerts('salesforce-trust', since, answers({ incidents: [incident()], messages: [message()] }));
  assert.deepEqual('items' in read && read.items.map((item) => item.alert?.label), ['Security advisory', 'Incident']);
  assert.deepEqual(await readAlerts('salesforce-trust', since, answers({}, 503)), { error: 'HTTP 503' });
});
