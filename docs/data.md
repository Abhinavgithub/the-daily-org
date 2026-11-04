# Data files

What is in `data/` and `src/content/`, what writes each file, and the type that gives its shape. Read the type before parsing a file by hand. "Committed" files are pushed by the daily job, so the newest copy is on `origin/main` (`git show origin/main:<path>`), not always on this machine.

| Path | Written by | Type | In git |
|---|---|---|---|
| `data/logs/<run start>.json` | every run (`pipeline/log.ts`) | `RunLogData` in `src/lib/logs.ts` | committed |
| `data/stats.jsonl` | every run, one line each (`pipeline/run.ts`) | `Run` in `src/lib/stats.ts` | committed |
| `data/seen.json` | every run (`pipeline/dedupe.ts`): article address → edition day | `Seen` in `pipeline/dedupe.ts` | committed |
| `data/pending.json` | videos waiting for captions or a live event (`pipeline/dedupe.ts`) | `Pending` in `pipeline/dedupe.ts` | committed |
| `data/sources.json` | each feed's last success and failures in a row (`pipeline/state.ts`) | `State` in `pipeline/state.ts` | committed |
| `data/held/*.md` | a full day's surplus, as story files (`pipeline/hold.ts`) | story front matter, `src/content.config.ts` | committed |
| `data/releases.json` | release dates from Trust (`pipeline/releases.ts`) | `Release` in `src/lib/releases.ts` | committed |
| `data/release-editions/<release>.json` | `npm run release-edition` (`pipeline/release-edition.ts`) | `Edition` in `src/lib/release-edition.ts` | committed |
| `data/release-edition-status.json` | the last release-edition check (`pipeline/release-edition-cli.ts`) | `ReleaseStatus` in `src/lib/logs.ts` | committed |
| `data/quote.json` | the share price at the last close (`pipeline/quote.ts`) | `Quote` in `src/lib/quote.ts` | committed |
| `data/readership.jsonl` | `npm run readership`, one line a day | `ReadershipDay` in `src/lib/readership.ts` | committed |
| `data/reader-totals.jsonl` | `npm run reader-totals` / `reader-feedback`: counts only | `ReaderTotalsDay` in `src/lib/reader-totals.ts` | committed |
| `data/feedback.jsonl` | the editor's flags: `npm run feedback`, or the Logs page under `npm run dev` | `Feedback` in `pipeline/feedback.ts` | tracked when present; absent now |
| `data/reader-feedback.jsonl` | readers' votes and reports, from D1 (`npm run reader-feedback`) or the dev server | `VoteRow`, `ReportRow` in `src/lib/verdict.ts` | ignored: private |
| `data/replay/` | `npm run replay` | `pipeline/replay-lib.ts` | ignored |
| `data/logs/rejected/` | pictures the image model drew that were turned down | — | ignored |
| `src/content/stories/<day>/*.md` | every run (`pipeline/write.ts`) | `stories` in `src/content.config.ts` | committed |
| `src/content/briefs/<day>/*.md` | every run: stories one point under the bar | `briefs` in `src/content.config.ts` | committed |
| `src/content/bulletin/<day>/*.md` | every run: alerts, tool releases, forum lines | `bulletin` in `src/content.config.ts` | committed |
| `public/figures/` | `pipeline/figures.ts`: social cards | — | committed |

## Reviewing a daily run

1. `gh run list --workflow daily.yml --limit 5`, then `gh run view <id> --log` for the job's output.
2. `git fetch -q && git ls-tree --name-only origin/main data/logs/ | tail -1` gives the newest run log; `git show origin/main:<that path>` prints it. Its `articles` say why each was or was not printed, `feeds` say which sources answered.
3. The same, read and judged: `npm run dev` after `git pull`, then `/logs/` (`src/lib/insights.ts` makes its findings).
