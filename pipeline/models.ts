import 'dotenv/config';
import { configFromEnv, listModels } from './llm';

// Lists the free models the provider offers right now, newest first.
const config = configFromEnv();
const catalogue = await listModels(config.baseUrl);
if (!catalogue) {
  console.error(`${config.baseUrl}/models did not return price data, so free models cannot be listed.`);
  process.exit(1);
}

// Chat models only: image and audio generators are free-listed too but cannot do this job.
const free = catalogue
  .filter((m) => m.free && m.contextLength >= 32_000 && !/image|lyria|seedream|flux|safety/i.test(m.id))
  .sort((a, b) => b.created - a.created);

console.log(`${free.length} free chat models at ${config.baseUrl}. Your current order is marked.\n`);
for (const m of free) {
  const position = config.models.indexOf(m.id);
  const mark = position === -1 ? '   ' : `[${position + 1}]`;
  const context = `${Math.round(m.contextLength / 1000)}K`.padStart(6);
  console.log(`${mark} ${m.id.padEnd(52)} ${context}  ${m.json ? 'JSON mode' : ''}`);
}
console.log(`\nUse one for a single run:   npm run pipeline -- --model <id>`);
console.log(`Make it the default:        set LLM_MODELS=<id>,<fallback id> in .env`);
console.log(`Usage rankings:             https://openrouter.ai/models?max_price=0&order=top-weekly`);
