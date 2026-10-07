import fs from 'node:fs';
import path from 'node:path';
import type { LogArticle, LogCheck, LogFeed, LogFigure, LogProof, RunLogData } from '../src/lib/logs';
import type { LlmClient } from './llm';

// Keeps what a run did, article by article, so it can be read afterwards on
// the Logs page. One file per run in data/logs/.

export const LOGS_DIR = path.join(process.cwd(), 'data', 'logs');
/** Older logs are removed once there are more than this many. */
export const KEEP = 60;

export class RunLog {
  private readonly startedAt: Date;
  private readonly data: RunLogData;

  constructor(kind: RunLogData['kind'], day: string, startedAt = new Date()) {
    this.startedAt = startedAt;
    this.data = {
      kind,
      ranAt: startedAt.toISOString(),
      day,
      seconds: 0,
      finished: true,
      feeds: [],
      articles: [],
      proofread: [],
      figures: [],
      model: { calls: 0, retries: {}, usage: {} },
    };
  }

  feed(entry: LogFeed): void {
    this.data.feeds.push(entry);
  }

  article(entry: LogArticle): void {
    this.data.articles.push(entry);
  }

  /** Change what was recorded of an article, when what was done to it is undone. */
  amend(url: string, change: Partial<LogArticle>): void {
    const entry = this.data.articles.findLast((article) => article.url === url);
    if (entry) Object.assign(entry, change);
  }

  proofread(entry: LogProof): void {
    this.data.proofread.push(entry);
  }

  figure(entry: LogFigure): void {
    this.data.figures.push(entry);
  }

  /** Something read from outside that is not a feed: whether it answered, and why not when it did not. */
  check(entry: LogCheck): void {
    (this.data.checks ??= []).push(entry);
  }

  /** No video's transcript could be fetched, so the run's videos were judged on their descriptions. */
  transcriptsDown(reason: string): void {
    this.data.transcriptsDown = reason;
  }

  /** The run did not get through everything. The first reason given is kept. */
  stop(reason: string): void {
    this.data.finished = false;
    this.data.stopped ??= reason;
  }

  /** Write the log and drop the oldest beyond `KEEP`. Returns the file written. */
  save(options: { llm?: LlmClient; statsAt?: string; dir?: string; now?: Date } = {}): string {
    const dir = options.dir ?? LOGS_DIR;
    this.data.seconds = Math.round(((options.now ?? new Date()).getTime() - this.startedAt.getTime()) / 1000);
    this.data.statsAt = options.statsAt;
    if (options.llm) this.data.model = { calls: options.llm.calls, retries: { ...options.llm.retries }, usage: { ...options.llm.usage } };

    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${this.data.ranAt.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(this.data, null, 2) + '\n');

    // File names begin with the time, so sorting by name sorts by age.
    const logs = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    for (const old of logs.slice(0, Math.max(0, logs.length - KEEP))) fs.unlinkSync(path.join(dir, old));
    return file;
  }
}
