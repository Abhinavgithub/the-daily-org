import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { quoteLine, readQuote } from '../src/lib/quote';
import { closeFrom, updateQuote } from './quote';

// 14:30 UTC is the New York open: Thursday 1, Friday 2, Monday 5 and Tuesday 6 October 2026.
const at = (day: string) => Date.parse(`${day}T13:30:00Z`) / 1000;
const chart = (closes: (number | null)[]) => ({ chart: { result: [{ meta: { currency: 'USD', exchangeTimezoneName: 'America/New_York' }, timestamp: ['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06'].map(at), indicators: { quote: [{ close: closes }] } }] } });

test('the price printed is the last close, with its move from the close before', () => {
  const morning = new Date('2026-10-07T06:30:00Z');
  assert.deepEqual(closeFrom('CRM', chart([236.69, 234.69, 229.79, 223.4]), morning), { symbol: 'CRM', close: 223.4, change: -2.78, day: '2026-10-06', currency: 'USD' });
  assert.equal(closeFrom('CRM', chart([236.69, 234.69, 229.79, 223.4]), new Date('2026-10-06T15:00:00Z'))?.day, '2026-10-05', 'a day still being traded is not a close');
  assert.equal(closeFrom('CRM', chart([236.69, null, 229.79, 223.4]), morning)?.change, -2.78, 'a day with no price is passed over');
  assert.equal(closeFrom('CRM', chart([null, null, null, 223.4]), morning), undefined);
  assert.equal(closeFrom('CRM', {}, morning), undefined);
});

test('a price that cannot be read leaves the saved one in place', async () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'quote-')), 'quote.json');
  const now = new Date('2026-10-07T06:30:00Z');
  const answering = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
  assert.ok('quote' in (await updateQuote('CRM', { request: answering(chart([236.69, 234.69, 229.79, 223.4])), now, file })));
  assert.deepEqual(await updateQuote('CRM', { request: answering({}, 429), now, file }), { error: 'HTTP 429' });
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).close, 223.4);
});

test('a quote is printed while it is fresh, and said in full for those who do not see it', () => {
  const quote = { symbol: 'CRM', close: 223.4, change: -2.78, day: '2026-10-06', currency: 'USD' };
  assert.deepEqual(readQuote(quote, '2026-10-07'), quote);
  assert.equal(readQuote(quote, '2026-10-13'), undefined, 'a week-old price is not printed');
  assert.equal(readQuote({ symbol: 'CRM' }, '2026-10-07'), undefined);
  assert.deepEqual(quoteLine(quote, 'Salesforce'), { price: '$223.40', mark: '▼', change: '2.8%', says: 'Salesforce shares (CRM) closed at 223.40 USD on 6 Oct, down 2.8 per cent.' });
  assert.equal(quoteLine({ ...quote, change: 1.04 }, 'Salesforce').mark, '▲');
  assert.equal(quoteLine({ ...quote, change: 0.01 }, 'Salesforce').change, 'unch.');
});
