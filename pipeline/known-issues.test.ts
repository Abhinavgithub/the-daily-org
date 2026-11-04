import assert from 'node:assert/strict';
import { test } from 'node:test';
import { issueFrom, readIssues, watch, type KnownIssue } from './known-issues';

const issue = (id: string, extra: Partial<KnownIssue> = {}): KnownIssue => ({ id, key: `a02${id}`, subject: `${id} breaks`, status: 'In Review', affected: 0, created: '2026-11-01', ...extra });

test('a row of the list becomes an issue, and one without its id, subject or date does not', () => {
  const row = { Id: 'a02x', Name: 'KI-1', Subject_c: ' Flows fail ', Status_c: 'In Review', Reporting_User_Count_c: 12, CreatedDate: '2026-11-03T06:10:10.000Z', Category_r: { Name: 'Flow', Cloud_c: 'Platform' } };
  assert.deepEqual(issueFrom(row), { id: 'KI-1', key: 'a02x', subject: 'Flows fail', product: 'Flow', cloud: 'Platform', status: 'In Review', affected: 12, created: '2026-11-03' });
  assert.equal(issueFrom({ ...row, Subject_c: undefined }), undefined);
  assert.equal(issueFrom({ Id: 'a02y', Name: 'KI-2', Subject_c: 'x', CreatedDate: '2026-11-03T00:00:00Z' })?.affected, 0);
});

test('a run records a figure only on a day it changed, and keeps the first day an issue was seen', () => {
  let record = watch({}, [issue('KI-1', { affected: 3 })], '2026-11-04');
  record = watch(record, [issue('KI-1', { affected: 3 })], '2026-11-05');
  record = watch(record, [issue('KI-1', { affected: 40, status: 'Solution Scheduled' })], '2026-11-06');
  assert.deepEqual(record['KI-1'].affected, { '2026-11-04': 3, '2026-11-06': 40 });
  assert.deepEqual(record['KI-1'].status, { '2026-11-04': 'In Review', '2026-11-06': 'Solution Scheduled' });
  assert.equal(record['KI-1'].firstSeen, '2026-11-04');
  assert.equal(record['KI-1'].lastSeen, '2026-11-06');
});

test('an issue unseen for 30 days is forgotten; one seen lately is kept though this run missed it', () => {
  const record = watch({}, [issue('KI-old'), issue('KI-recent')], '2026-10-01');
  const later = watch(watch(record, [issue('KI-recent')], '2026-10-20'), [], '2026-11-04');
  assert.deepEqual(Object.keys(later), ['KI-recent']);
});

test('a run reads new issues back a week, then the latest changed and the most reported, each issue once', async () => {
  const asked: string[] = [];
  const page = async (order: string, offset: number) => {
    asked.push(`${order}@${offset}`);
    if (order === 'CreatedDate') {
      const created = offset === 0 ? '2026-11-03' : '2026-10-20';
      return Array.from({ length: 25 }, (_, i) => issue(`KI-${offset + i}`, { created }));
    }
    return [issue('KI-0', { affected: 9 }), issue('KI-900', { affected: 500 })];
  };
  const issues = await readIssues(page, new Date('2026-11-04T06:30:00Z'));
  assert.deepEqual(asked, ['CreatedDate@0', 'CreatedDate@25', 'Last_Modified_Date_External__c@0', 'Reporting_User_Count__c@0']);
  assert.equal(issues.length, 26);
  assert.equal(issues.find((one) => one.id === 'KI-0')?.affected, 9);
});
