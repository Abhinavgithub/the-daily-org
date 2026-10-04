import assert from 'node:assert/strict';
import { test } from 'node:test';
import { storySpans } from './layout';

test('a story earns its width from its score', () => {
  assert.deepEqual(storySpans([9, 8, 7, 6]), [3, 2, 1, 1]);
  assert.deepEqual(storySpans([10, 9]), [3, 3]);
  assert.deepEqual(storySpans([8, 8, 7, 7, 7]), [2, 2, 1, 1, 1], 'two standouts, two wide boxes');
});

test('with no standout, the top story of a full edition leads', () => {
  assert.deepEqual(storySpans([7, 7, 7, 7]), [2, 1, 1, 1]);
  assert.deepEqual(storySpans([7, 7, 7, 6, 6, 6, 6, 6, 6]), [2, 1, 1, 1, 1, 1, 1, 1, 1], 'only one story is widened this way');
  // A real standout further down means the top story is not widened as well.
  assert.deepEqual(storySpans([7, 7, 7, 8]), [1, 1, 1, 2]);
});

test('a small edition is left as single columns', () => {
  assert.deepEqual(storySpans([7, 7, 7]), [1, 1, 1]);
  assert.deepEqual(storySpans([7]), [1]);
  assert.deepEqual(storySpans([]), []);
  assert.deepEqual(storySpans([8, 7]), [2, 1], 'but a standout is still wide');
});
