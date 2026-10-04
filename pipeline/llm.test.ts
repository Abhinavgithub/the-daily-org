import assert from 'node:assert/strict';
import { test } from 'node:test';
import { keepFreeModels, LlmError, type LlmConfig } from './llm';
import { client, ok } from './testing';

test('a 429 is retried on the same model', async () => {
  const { llm, calls } = client([() => new Response('slow down', { status: 429 }), () => ok('hello')]);
  const result = await llm.chat([{ role: 'user', content: 'hi' }]);
  assert.equal(result.text, 'hello');
  assert.deepEqual(calls, ['m1', 'm1']);
});

test('repeated 429s fall back to the next model', async () => {
  const limited = () => new Response('', { status: 429 });
  const { llm, calls } = client([limited, limited, limited, () => ok('from m2', 'm2')], ['m1', 'm2']);
  const result = await llm.chat([{ role: 'user', content: 'hi' }]);
  assert.equal(result.model, 'm2');
  assert.deepEqual(calls, ['m1', 'm1', 'm1', 'm2']);
  assert.deepEqual(llm.retries, { 'HTTP 429': 3 });
});

test('a 401 is not retried and moves to the next model', async () => {
  const { llm, calls } = client([() => new Response('bad key', { status: 401 }), () => ok('fine', 'm2')], ['m1', 'm2']);
  assert.equal((await llm.chat([{ role: 'user', content: 'hi' }])).text, 'fine');
  assert.deepEqual(calls, ['m1', 'm2']);
});

test('when every model fails the error says so', async () => {
  const limited = () => new Response('', { status: 429 });
  const { llm } = client([limited, limited, limited]);
  await assert.rejects(llm.chat([{ role: 'user', content: 'hi' }]), LlmError);
});

test('models that are no longer free are dropped', async () => {
  const catalogue = {
    data: [
      { id: 'free-one', pricing: { prompt: '0', completion: '0' } },
      { id: 'now-paid', pricing: { prompt: '0.000001', completion: '0.000002' } },
    ],
  };
  const config: LlmConfig = {
    baseUrl: 'https://llm.test/v1',
    apiKey: 'k',
    models: ['now-paid', 'free-one', 'gone'],
    minIntervalMs: 0,
    maxRetries: 0,
    fetch: (async () => new Response(JSON.stringify(catalogue))) as typeof fetch,
  };
  const { models, notes } = await keepFreeModels(config, false);
  assert.deepEqual(models, ['free-one']);
  assert.equal(notes.length, 2);
  assert.deepEqual((await keepFreeModels(config, true)).models, ['now-paid', 'free-one', 'gone']);
});

test('tokens are counted against the model that answered', async () => {
  const { llm } = client([() => new Response('', { status: 429 }), () => ok('{}', 'm2'), () => ok('{}', 'm2'), () => ok('{}', 'm1')], ['m1', 'm2']);
  llm.config.maxRetries = 0;
  await llm.chat([{ role: 'user', content: 'a' }]);
  assert.deepEqual(llm.usage, { m2: { input: 10, output: 5 } });
});

test('a run stops asking once it has spent its limit', async () => {
  const paid = () => new Response(JSON.stringify({ model: 'm1', choices: [{ message: { content: 'hi' } }], usage: { prompt_tokens: 1, completion_tokens: 1, cost: 0.004 } }));
  const { llm } = client([paid, paid]);
  llm.config.maxCostUsd = 0.005;
  assert.equal(llm.limitReached(10), null);
  await llm.chat([{ role: 'user', content: 'a' }]);
  assert.equal(llm.limitReached(10), null);
  await llm.chat([{ role: 'user', content: 'a' }]);
  assert.match(llm.limitReached(10) ?? '', /spending limit of \$0.005 was reached \(\$0.0080 spent\)/);
  assert.match(llm.limitReached(2) ?? '', /cap of 2 model calls/);
});

test('a reply that cannot be read is tried again, and a request every model refuses says so', async () => {
  const { llm } = client([() => new Response('<html>gateway hiccup</html>'), () => ok('fine')]);
  assert.equal((await llm.chat([{ role: 'user', content: 'a' }])).text, 'fine');
  assert.equal(llm.retries['unreadable response'], 1);

  const tooLong = () => new Response('context length exceeded', { status: 400 });
  const refused = client([tooLong, tooLong], ['m1', 'm2']);
  await assert.rejects(refused.llm.chat([{ role: 'user', content: 'a' }]), (err: LlmError) => err.refused === true);

  // A wrong key is not a refusal of the request, and neither is one model being down.
  const unauthorised = client([() => new Response('no', { status: 401 }), () => new Response('no', { status: 401 })], ['m1', 'm2']);
  await assert.rejects(unauthorised.llm.chat([{ role: 'user', content: 'a' }]), (err: LlmError) => err.refused === false);
  const mixed = client([tooLong, () => new Response('', { status: 500 })], ['m1', 'm2']);
  mixed.llm.config.maxRetries = 0;
  await assert.rejects(mixed.llm.chat([{ role: 'user', content: 'a' }]), (err: LlmError) => err.refused === false);
});
