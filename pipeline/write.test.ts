import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { good, item } from './testing';
import { writeBriefs } from './write';

test('a brief is written as its headline and reason, with no summary', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-briefs-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const verdict = { ...good, title: 'A close call worth a glance', interest_score: 5, depth_score: 4, utility_score: 6, tags: [] };
  const brief = { item, curated: { verdict: verdict as never, model: 'm1', inputTokens: 0, outputTokens: 0 } };

  const [first] = writeBriefs('2026-10-05', [brief], dir);
  assert.equal(path.basename(first), '01-test-timing-eurostar-departures.md');
  const text = fs.readFileSync(first, 'utf8');
  assert.match(text, /^---\ntitle: A close call worth a glance\noriginal_title: Timing Eurostar departures\nurl: https:\/\/example\.com\/post\nsource: Test\ndate: 2026-10-05\n/);
  assert.match(text, /why_read: You will learn \*\*bulk\*\* patterns\.\ninterest_score: 5\n/);
  assert.ok(text.endsWith('---\n'), 'nothing after the front matter');
  assert.doesNotMatch(text, /First paragraph|tags:/);

  // A later run on the same day numbers on from what is there.
  const [second] = writeBriefs('2026-10-05', [brief], dir);
  assert.equal(path.basename(second), '02-test-timing-eurostar-departures.md');
});
