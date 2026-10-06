import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { releasesFromTrust, updateReleases, type TrustMaintenance } from './releases';

const window = (name: string, plannedStartTime: string, over: Partial<TrustMaintenance> = {}): TrustMaintenance => ({ name, plannedStartTime, status: 'Confirmed', message: { maintenanceType: 'release' }, ...over });
const listed = [
  window("Health Cloud - Winter '27 - Major Release", '2026-10-09T21:30:00.000Z'),
  window("Financial Services Cloud - Winter '27 - Major Release", '2026-10-10T04:00:00.000Z'),
  window("Omnistudio - Winter '27 - Major Release", '2026-09-05T03:00:00.000Z'),
  window("Omnistudio - Winter '27 - Major Release", '2026-10-03T00:30:00.000Z'),
  window("Health Cloud - Winter '27 - Major Release", '2026-10-03T05:00:00.000Z'),
  window("Life Sciences Cloud - Spring '27 - Major Release", '2027-02-06T03:00:00.000Z'),
  window("Health Cloud - Spring '27 - Major Release", '2027-01-09T02:00:00.000Z'),
  window("Health Cloud - Spring '27 - Major Release", '2027-02-19T19:00:00.000Z'),
  window("Health Cloud - Spring '27 - Major Release", '2027-02-20T00:00:00.000Z'),
  // None of these is a date of a release.
  window("Health Cloud - Winter '27 - Major Release", '2026-10-17T04:00:00.000Z', { status: 'Canceled' }),
  window('Database maintenance', '2026-10-20T04:00:00.000Z', { message: { maintenanceType: 'scheduledMaintenance' } }),
  window("Winter '27 patch", '2026-11-01T04:00:00.000Z', { message: { maintenanceType: 'scheduledMaintenance' } }),
  { name: "Health Cloud - Winter '27 - Major Release" },
];

test('hundreds of windows come down to each release, its preview and its waves', () => {
  assert.deepEqual(releasesFromTrust(listed), [
    {
      name: "Winter '27",
      stages: [
        { place: 'sandboxes', from: '2026-09-05', to: '2026-09-05' },
        { place: 'production', from: '2026-10-03', to: '2026-10-03' },
        { place: 'production', from: '2026-10-09', to: '2026-10-10' },
      ],
    },
    {
      name: "Spring '27",
      stages: [
        { place: 'sandboxes', from: '2027-01-09', to: '2027-01-09' },
        { place: 'production', from: '2027-02-06', to: '2027-02-06' },
        { place: 'production', from: '2027-02-19', to: '2027-02-20' },
      ],
    },
  ]);
  assert.deepEqual(releasesFromTrust([]), []);
});

test('a calendar that cannot be read leaves the dates already known', async () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'releases-')), 'releases.json');
  const answer = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

  const read = await updateReleases('salesforce-trust', { request: answer(listed), file });
  assert.equal('releases' in read && read.releases.length, 2);
  const saved = fs.readFileSync(file, 'utf8');

  assert.deepEqual(await updateReleases('salesforce-trust', { request: answer({}, 503), file }), { error: 'HTTP 503' });
  assert.deepEqual(await updateReleases('salesforce-trust', { request: answer([]), file }), { error: 'the calendar listed no release' });
  assert.equal(fs.readFileSync(file, 'utf8'), saved);
});
