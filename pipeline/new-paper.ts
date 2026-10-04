import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

// Starts a paper of your own from this project: removes the editions, pictures
// and memory of the paper that is here, and puts a commented example in
// paper.config.ts for you to edit.
//
//   npm run new-paper
//   npm run new-paper -- --yes     do not ask first
//   npm run new-paper -- --force   go ahead although there are uncommitted changes

const { values: args } = parseArgs({ options: { yes: { type: 'boolean', default: false }, force: { type: 'boolean', default: false } } });
const root = process.cwd();
const at = (...parts: string[]) => path.join(root, ...parts);

if (!fs.existsSync(at('templates', 'paper.config.ts')) || !fs.existsSync(at('src', 'paper.ts'))) {
  console.error('Run this from the top of the project.');
  process.exit(1);
}

// Everything removed here is gone unless git has it, so insist that it does.
let uncommitted = '';
try {
  uncommitted = execFileSync('git', ['status', '--porcelain', '--', 'paper.config.ts', 'src/content/stories', 'public/figures', 'data'], { cwd: root, encoding: 'utf8' }).trim();
} catch {
  uncommitted = 'this folder is not a git repository';
}
if (uncommitted && !args.force) {
  console.error('The present paper has changes that are not committed, and this command deletes it:\n');
  console.error(uncommitted.split('\n').slice(0, 10).map((line) => `  ${line}`).join('\n'));
  console.error('\nCommit them first so they can be recovered, or run again with -- --force to delete them anyway.');
  process.exit(1);
}

const removals = [at('src', 'content', 'stories'), at('public', 'figures'), at('data')];
const count = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).length : 0);
console.log('This will delete:');
for (const dir of removals) console.log(`  ${path.relative(root, dir)}/  (${count(dir)} files and folders)`);
console.log('and replace paper.config.ts with a starter example.\n');

if (!args.yes) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question('Type "yes" to go ahead: ');
  prompt.close();
  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('Nothing was changed.');
    process.exit(0);
  }
}

for (const dir of removals) fs.rmSync(dir, { recursive: true, force: true });
// What was built from the old paper, so that a preview cannot show it.
for (const built of [at('dist'), at('.astro')]) fs.rmSync(built, { recursive: true, force: true });
fs.mkdirSync(at('src', 'content', 'stories'), { recursive: true });
fs.writeFileSync(at('src', 'content', 'stories', '.gitkeep'), '');
const starter = fs.readFileSync(at('templates', 'paper.config.ts'), 'utf8').replace("from '../src/paper'", "from './src/paper'");
fs.writeFileSync(at('paper.config.ts'), starter);

console.log(`
Done. Your paper is now the example in paper.config.ts. Next:

  1. Edit paper.config.ts: the name, what the paper covers, its sections and its sources.
  2. npm run check-paper              tries every source, with no model calls
  3. cp .env.example .env             and add a model API key, if you have not
  4. npm run pipeline -- --max-calls 6   a small first edition
  5. npm run dev                      read it at http://localhost:4321
`);
