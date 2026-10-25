import fs from 'node:fs';
import path from 'node:path';
import { readerTotals, readerTotalsText, type CountedReport, type CountedVote, type StoryFacts } from '../src/lib/reader-totals';
import { readStories, STORIES_DIR } from './write';

// Writes data/reader-totals.jsonl, the counts the Stats page shows (PLAN.md, step 8d).
// Only counts go in it, by edition, section and model, so it is committed with
// the paper; the votes and notes they come from stay out of git.

export const TOTALS_FILE = path.join(process.cwd(), 'data', 'reader-totals.jsonl');

/** Each printed story's section and the model that wrote it, by story id. */
export function storyFacts(storiesDir = STORIES_DIR): StoryFacts {
  const facts: StoryFacts = new Map();
  if (!fs.existsSync(storiesDir)) return facts;
  for (const day of fs.readdirSync(storiesDir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))) {
    for (const { file, data } of readStories(path.join(storiesDir, day))) {
      if (typeof data.section !== 'string') continue;
      facts.set(`${day}/${path.basename(file, '.md')}`, { section: data.section, model: typeof data.model === 'string' ? data.model : undefined });
    }
  }
  return facts;
}

/** Replaces the totals with these, counted from every vote and report there is. Returns how many editions they cover. */
export function saveReaderTotals(votes: CountedVote[], reports: CountedReport[], file = TOTALS_FILE, storiesDir = STORIES_DIR): number {
  const days = readerTotals(votes, reports, storyFacts(storiesDir));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, readerTotalsText(days));
  return days.length;
}
