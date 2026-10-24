import 'dotenv/config';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { articleText } from './extract';
import { addFigures } from './figure';
import { configFromEnv, LlmClient, modelsOrStop } from './llm';
import { RunLog } from './log';
import { STORIES_DIR } from './write';

// Adds a diagram to stories that have none, and the social card for
// each edition's top story. The pipeline does this for each new edition; this
// command does it for editions already published.
//
//   npm run figures                       every edition
//   npm run figures -- --day 2026-10-04   one edition
//   npm run figures -- --redo             draw them again, replacing what is there

const { values: args } = parseArgs({
  options: { day: { type: 'string' }, redo: { type: 'boolean', default: false }, model: { type: 'string' } },
});

const config = configFromEnv({ model: args.model });
const models = await modelsOrStop(config, {
  noKey: 'LLM_API_KEY is not set.',
  noModel: 'No usable model left. Run `npm run models` to pick a free one.',
});
const llm = new LlmClient({ ...config, models, log: (message) => console.warn(`      extra call, ${message}`) });

const days = args.day ? [args.day] : fs.readdirSync(STORIES_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
const total = { made: 0, cards: 0, none: 0, rejected: 0, skipped: 0 };
const runLog = new RunLog('figures', args.day ?? '');
for (const day of days) {
  console.log(day);
  const counts = await addFigures(llm, day, { redo: args.redo, readArticle: articleText, log: console.log, record: (entry) => runLog.figure(entry) });
  for (const key of Object.keys(total) as (keyof typeof total)[]) total[key] += counts[key];
}
runLog.save({ llm });
console.log(
  `\nDiagrams: ${total.made} drawn, ${total.cards} social cards, ${total.none} stories with nothing to draw, ${total.rejected} discarded, ${total.skipped} skipped. ${llm.calls} model calls.`,
);
