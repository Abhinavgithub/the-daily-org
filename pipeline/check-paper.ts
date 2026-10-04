import 'dotenv/config';
import { PAPER } from '../src/config';
import { fetchFeeds } from './fetch';
import { SOURCES } from './sources';

// Tries every source in paper.config.ts once and says what came back. It makes
// no model calls and writes nothing, so it is the first thing to run after
// changing the paper.
//
//   npm run check-paper

const DAYS = 30;
const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

console.log(`${PAPER.name}: ${PAPER.sections.length} sections, ${PAPER.personas.length} personas, ${SOURCES.length} sources.`);
console.log(`Reading each source for items from the last ${DAYS} days.\n`);

const { items, failures, notes } = await fetchFeeds(SOURCES, since, { attempts: 2 });
const width = Math.max(...SOURCES.map((source) => source.name.length));
for (const source of SOURCES) {
  const failure = failures.find((f) => f.source.id === source.id);
  const own = items.filter((item) => item.source.id === source.id);
  const name = source.name.padEnd(width);
  if (failure) console.log(`  FAILED  ${name}  ${failure.error}\n          ${source.url}`);
  else if (own.length === 0) console.log(`  empty   ${name}  the feed answered but has nothing from the last ${DAYS} days`);
  else console.log(`  ok      ${name}  ${String(own.length).padStart(3)} item${own.length === 1 ? ' ' : 's'}, newest ${own[0].published.toISOString().slice(0, 10)}`);
}
for (const note of notes) console.log(`\n  ${note}`);

if (failures.length) {
  console.log(
    `\n${failures.length} source${failures.length === 1 ? '' : 's'} could not be read. Check that the address is the feed itself (it usually ends in /feed, /rss or .xml) and opens in a browser. Some sites refuse automated readers altogether.`,
  );
  process.exit(1);
}
console.log('\nEvery source answered. Next: npm run pipeline -- --dry-run');
