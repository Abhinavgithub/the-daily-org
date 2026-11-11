import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { figureSchema } from '../src/lib/figure';
import { z } from 'zod';
import { pickIcons, wantsIcons } from './figure-icons';
import { configFromEnv, LlmClient, LlmError, modelsOrStop } from './llm';
import { RunLog } from './log';
import { openStory, STORIES_DIR, storyText } from './write';

// Gives pictograms to the diagrams printed before diagrams had them, keeping each diagram as it was.
//
//   npm run figure-icons                  every story whose diagram has none
//   npm run figure-icons -- --limit 5     the first five only, to see what it costs
//   npm run figure-icons -- --day 2026-10-04

const { values: args } = parseArgs({ options: { day: { type: 'string' }, limit: { type: 'string' }, model: { type: 'string' } } });
const limit = args.limit ? Number(args.limit) : Infinity;

const config = configFromEnv({ model: args.model });
const models = await modelsOrStop(config, { noKey: 'LLM_API_KEY is not set.', noModel: 'No usable model left. Run `npm run models` to pick a free one.' });
const llm = new LlmClient({ ...config, models, log: (message) => console.warn(`      extra call, ${message}`) });
const Schema = figureSchema(z);

const days = args.day ? [args.day] : fs.readdirSync(STORIES_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
const total = { given: 0, unfit: 0, skipped: 0 };
const runLog = new RunLog('figures', args.day ?? '');
outer: for (const day of days) {
  for (const name of fs.readdirSync(path.join(STORIES_DIR, day)).filter((f) => f.endsWith('.md')).sort()) {
    const file = path.join(STORIES_DIR, day, name);
    const story = openStory(fs.readFileSync(file, 'utf8'));
    const figure = story ? Schema.safeParse(story.doc.toJS().figure).data : undefined;
    if (!story || !wantsIcons(figure)) continue;
    if (total.given + total.unfit >= limit) break outer;
    const stop = llm.limitReached();
    if (stop) {
      total.skipped++;
      continue;
    }
    const title = String(story.doc.get('title'));
    try {
      const icons = await pickIcons(llm, figure);
      if (!icons) {
        total.unfit++;
        console.log(`  No pictograms fit: ${title}`);
        continue;
      }
      story.doc.setIn(['figure', 'icons'], icons);
      fs.writeFileSync(file, storyText(story.doc, `\n${story.body.trim()}\n`));
      total.given++;
      console.log(`  ${icons.join(', ')}: ${title}`);
      runLog.figure({ title, outcome: 'drawn', kind: figure.kind });
    } catch (err) {
      if (!(err instanceof LlmError)) throw err;
      total.skipped++;
      console.log(`  Skipped, the model was unavailable: ${title}`);
    }
  }
}
runLog.save({ llm });
const cost = llm.costReported ? `$${llm.cost.toFixed(4)}` : 'not reported';
console.log(`\nPictograms given to ${total.given} diagrams; ${total.unfit} had none that fit; ${total.skipped} skipped. ${llm.calls} model calls, cost ${cost}.`);
