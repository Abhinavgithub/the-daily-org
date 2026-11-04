# Code map

Which file does what. Every source file opens with a comment saying what it is for; this page is the index to those comments. README.md is for whoever runs the paper; this is for whoever changes it.

## The paper

- `paper.config.ts`: the paper itself (name, sections, sources, rules). Nothing else names a subject.
- `src/paper.ts`: the shape of that config. `src/config.ts` exports `PAPER`, the config as the code reads it. Tests use their own small paper, `PAPER` in `pipeline/testing.ts`.

## The daily run (`npm run pipeline`, `pipeline/run.ts`)

`run.ts` is the script that does each step in order. These files hold the steps:

| Step | File | What it does |
|---|---|---|
| 1. Read the feeds | `fetch.ts`, `sources.ts`, `youtube.ts`, `notes.ts`, `http.ts` | Every source in the config, back to its last success (`state.ts`). |
| 2. Side feeds | `alerts.ts`, `releases.ts`, `quote.ts`, `known-issues.ts` | Trust alerts, release dates, the share price, Known Issues (recorded, not printed yet). `release-notes.ts` has `apexAction`, the help site's request, shared with Known Issues. |
| 3. Set aside what was seen | `dedupe.ts` | `data/seen.json`, and `data/pending.json` for videos waiting on captions. |
| 4. Read the article | `extract.ts`, `authors.ts`, `transcript.ts` | The article's text, its writers, a video's transcript. |
| 5. Cheap rules, then the model | `curate.ts` | Keyword rules, then the model scores and writes the story. Forum posts get `firstLook` first. |
| 6. Decide | `decide.ts`, `hold.ts` | Published, held for a quieter day, brief, or dropped. Pure functions. |
| 7. Proof-read | `curate.ts` (`proofread`, `proofreadAll`), `style.ts` | The model proof-reads; `style.ts` then applies the house style in code. |
| 8. Write | `write.ts` | Story Markdown into `src/content/`. |
| 9. Diagrams | `figure.ts`, `figures.ts` | One diagram per story, and the edition's social card. |
| 10. Record | `log.ts` | One file per run in `data/logs/`, plus a line in `data/stats.jsonl`. |
| 11. Release edition | `release-edition-cli.ts` → `release-due.ts`, `release-notes.ts`, `release-edition.ts` | Only when one is owed. |

`llm.ts` is the model client (retries, fallbacks, cost cap). `settings.ts` reads numbers from options or `.env`.

## Where each prompt is

| Prompt | File and function |
|---|---|
| Score and write a story | `pipeline/curate.ts`: `editorPrompt`, `userPrompt` |
| A forum post's first look | `pipeline/curate.ts`: `firstLook`, `firstLooks` |
| Proof-read | `pipeline/curate.ts`: `proofSystem` |
| Diagram | `pipeline/figure.ts`: `system` |
| Release edition | `pipeline/release-edition.ts`: `prompt` and the two inline system messages |
| Fix a reported mistake | `pipeline/correct.ts`: `fixSystem` |

Read the prompt before blaming it: a limit or rule may already be there.

## Other commands

Each `npm run` script in package.json maps to one file in `pipeline/` (e.g. `replay` → `replay.ts` + `replay-lib.ts`). The `*-dev.ts` files are dev-server endpoints, wired in `astro.config.mjs`, and are never part of the built site.

## The site

- Data for pages: `src/lib/`. Each page has a pure module that turns files into figures and a page that draws them.

| Page | Logic | Page and components | Styles |
|---|---|---|---|
| Edition (`/`, `/[day]/`) | `stories.ts`, `editions.ts`, `signal.ts`, `layout.ts`, `pack.ts` | `pages/index.astro`, `pages/[day]/`, `pages/section/`, `pages/tag/`, `EditionPage`, `StoryGrid`, `StoryCard`, `BriefList` | `_sheet`, `_stories`, `_briefs`, `_page-turn` |
| Diagram | `figure.ts`, `diagram.ts`, `icons.ts` | `StoryFigure` | `_figure` |
| Masthead | `quote.ts`, `quote-store.ts`, `releases.ts`, `theme.ts` | `Masthead`, `Tabs`, `FilterBar` | `_masthead`, `_filter-bar` |
| Bulletin | `bulletin.ts` | `pages/bulletin/` | `_masthead` (the `bulletin__` rules), `_release-edition` |
| Deadlines | `deadlines.ts`, `ics.ts` (the calendar) | `pages/deadlines/`, `pages/deadlines.ics.ts` | `_masthead` (reuses `bulletin__`), `_release-edition` |
| Release edition | `release-edition.ts`, `release-store.ts` | `pages/releases/[slug]/` | `_release-edition` |
| Archive, search | `calendar.ts` | `pages/archive/`, `pages/search/` | `_archive`, `_archive-and-search` |
| Stats | `stats.ts`, `trend.ts`, `readership.ts`, `reader-totals.ts` | `pages/stats/`, `Stat*`, `TokenBars`, `ReadershipTrend` | `_stats` |
| Logs (dev only for flags and readers) | `logs.ts`, `insights.ts`, `sources.ts` | `pages/logs/`, `Log*` | `_logs` |
| Reader votes | `verdict.ts` | `Verdict` | `_feedback` |

- Styles: `src/styles/main.scss` only lists the partials, in cascade order; `_tokens.scss` holds the colours and sizes; `_narrow.scss` (last) holds the narrow-screen rules.
- Content collections (stories, briefs, bulletin): `src/content.config.ts`.
- Cloudflare Worker for votes and reports: `worker/index.ts`, configured in `wrangler.jsonc`.
- Data files: [data.md](data.md).
