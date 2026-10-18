import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jsonLines } from './jsonl';

test('a JSON Lines text is read as its objects, and a line that is not one is skipped', () => {
  const text = ['{"a":1}', '', '  ', 'not json', 'null', '[1,2]', '3', '{"b":"two"}', ''].join('\n');
  assert.deepEqual(jsonLines(text), [{ a: 1 }, { b: 'two' }]);
});
