import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changelogItems, dateIn, notesFor, readable, sections } from './notes';
import { item } from './testing';

const markdown = `# Tool Release Notes

Here are the changes.

## 2.153.6 (October 7, 2026) [stable-rc]

* NEW: Something for next week.

## 2.152.14 (September 30, 2026) [stable]

* NEW: The \`apex run\` command has two new flags.

## Sept 9 and 16, 2026

No release these weeks.

## 2.150.6 (Sept 2, 2026)

* FIX: A crash on Windows.
`;

test('a document is cut at its headings, whether it is markdown or a page', () => {
  assert.deepEqual(
    sections(markdown).map((section) => [section.level, section.title]),
    [
      [1, 'Tool Release Notes'],
      [2, '2.153.6 (October 7, 2026) [stable-rc]'],
      [2, '2.152.14 (September 30, 2026) [stable]'],
      [2, 'Sept 9 and 16, 2026'],
      [2, '2.150.6 (Sept 2, 2026)'],
    ],
  );
  const page = `<html><body><h1>Release Notes</h1><p>Intro.</p>
    <doc-heading header="August 2026 Release" hash="a" aria-level="2"></doc-heading>
    <doc-heading header="Code Analyzer v5.16.0" hash="b" aria-level="3"></doc-heading><ul><li><p>NEW: ApexGuru &amp; more.</p></li></ul>
    <h4>Fixes</h4><p>One fix.</p>
    <doc-heading header="July 2026 Release" hash="c" aria-level="2"></doc-heading>
    <doc-heading header="Code Analyzer v5.15.0" hash="d" aria-level="3"></doc-heading><p>Small things.</p></body></html>`;
  const cut = sections(page);
  assert.deepEqual(cut.map((section) => [section.level, section.title]), [[1, 'Release Notes'], [2, 'August 2026 Release'], [3, 'Code Analyzer v5.16.0'], [4, 'Fixes'], [2, 'July 2026 Release'], [3, 'Code Analyzer v5.15.0']]);
  assert.equal(notesFor('5.16.0', cut), 'NEW: ApexGuru & more.\n\nFixes\nOne fix.', 'a version takes the deeper sections under it, and stops at the next release');
  assert.equal(notesFor('5.15.0', cut), 'Small things.');
  assert.equal(notesFor('9.9.9', cut), undefined);
});

test('the day a heading names is read however the month is written', () => {
  assert.equal(dateIn('2.152.14 (September 30, 2026) [stable]')?.toISOString().slice(0, 10), '2026-09-30');
  assert.equal(dateIn('2.150.6 (Sept 2, 2026)')?.toISOString().slice(0, 10), '2026-09-02');
  assert.equal(dateIn('2.149.9 (Aug. 26, 2026)')?.toISOString().slice(0, 10), '2026-08-26');
  assert.equal(dateIn('Code Analyzer v5.16.0'), undefined);
});

test('a changelog gives its dated releases, and leaves a release candidate until it is out', () => {
  const source = { ...item.source, id: 'tool', name: 'Tool', type: 'code' as const, changelog: true, url: 'https://raw.githubusercontent.com/org/repo/main/notes/README.md' };
  const found = changelogItems(markdown, source, new Date('2026-10-06T12:00:00Z'));
  assert.deepEqual(found.map((release) => release.title), ['Tool 2.152.14', 'Tool 2.150.6']);
  assert.equal(found[0].url, 'https://github.com/org/repo/blob/main/notes/README.md?v=2.152.14#215214-september-30-2026-stable');
  assert.equal(found[0].published.toISOString().slice(0, 10), '2026-09-30');
  assert.match(found[0].feedText, /apex run/);
  // A week on, the candidate has been released, and the older one's heading has lost its label: it is still the same address but for its anchor.
  assert.deepEqual(changelogItems(markdown, source, new Date('2026-10-08T12:00:00Z')).map((release) => release.title), ['Tool 2.153.6', 'Tool 2.152.14', 'Tool 2.150.6']);
  assert.equal(readable('https://example.com/notes.md'), 'https://example.com/notes.md');
});
