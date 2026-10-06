# A newspaper on any subject

This project publishes a daily newspaper about one subject. A pipeline reads RSS feeds, asks a language model to score and summarise each new article, and writes the ones worth reading into an edition; a static Astro site displays the editions as a broadsheet.

The paper in this repository is **The Daily Org**. Everything that makes it that paper is in one file, `paper.config.ts`, so the same code can publish a paper about anything else.

## Quick start

Requires Node 22.12 or newer.

```bash
npm install
cp .env.example .env    # then set LLM_API_KEY
npm run pipeline        # fetch feeds, score and summarise new articles, write today's edition
npm run dev             # read it at http://localhost:4321
```

Any OpenAI-compatible provider works. `.env.example` sets the default endpoint (OpenRouter); get a key from that provider.

## Make your own paper

```bash
npm run new-paper       # removes this paper's editions and writes a starter paper.config.ts
```

It refuses to run with uncommitted changes and asks before deleting anything. Then:

1. Edit `paper.config.ts`. The starter is a small working paper with a comment on every field. `relevant` and `notRelevant` decide what gets printed more than anything else, so be specific.
2. `npm run check-paper` reads every source once, with no model calls, and says which answered.
3. `npm run pipeline -- --max-calls 6` makes a small first edition.

## Commands

| Command | What it does |
|---|---|
| `npm run pipeline` | Writes today's edition. An interrupted run keeps what it has done. |
| `npm run dev` | Serves the site locally. |
| `npm run build` / `npm run preview` | Builds the static site into `dist/` and serves that build. |
| `npm run daily` | The pipeline, then a build. |
| `npm run models` | Lists the models that are free at your provider now. |
| `npm run check-paper` | Checks `paper.config.ts` and every source. No model calls. |
| `npm run sources` | How each source has done (`-- --days 90` for a longer span), with a verdict on each. |
| `npm run try-source -- <feed address>` | What a new source would add. `--review 3` has the model score its latest three; `--youtube <channel ID>` tries a channel. |
| `npm run figures` | Adds missing diagrams to must-read stories. `-- --day YYYY-MM-DD` for one edition, `-- --redo` to draw them again. |
| `npm run readership` | Saves who read the paper, up to yesterday, for the Stats page. Needs the `READERSHIP_` settings. |
| `npm run revise -- --glossary-only` | Re-applies the glossary to every story, with no model calls. |
| `npm run feedback` | Records what the paper got wrong: `-- junk <address>` for a printed story that should not have run, `-- missed <address>` for one it skipped, `-- list` to review. Kept in `data/feedback.jsonl`. Under `npm run dev` the Logs page does the same with a button on each article. |
| `npm run replay` | Judges the flagged articles again, with some the paper got right, under the rules as they stand, to measure a change to them. `-- --prefilter-only` makes no model calls; `-- --compare` lists what changed since the last replay; `-- --runs 2` finds unstable verdicts. Publishes nothing. |
| `npm run favicon` | Redraws the icons from the paper's name and colours. |
| `npm run check` / `npm test` | Type-checks, and runs the tests. |

Pipeline options, passed after `--`:

| Option | Effect |
|---|---|
| `--dry-run` | Fetch and filter only. No model calls, nothing written. |
| `--day YYYY-MM-DD` | Write into this edition instead of today's. |
| `--model <id>` | Use this model for one run. |
| `--since-days 5` | How far back to look in every feed. |
| `--max-calls 40` | Cap on model calls for the run. |
| `--threshold 6` | Minimum interest score to publish. |

## Settings

All in `.env`; `.env.example` explains each.

| Setting | Purpose |
|---|---|
| `LLM_API_KEY` | Required. |
| `LLM_BASE_URL` | Any OpenAI-compatible endpoint. |
| `LLM_MODELS` | Ordered list: the first is used, the rest are fallbacks. |
| `LLM_ALLOW_PAID` | `1` allows models that cost money. Default `0`. |
| `LLM_MAX_COST_USD` | The most one run may spend. The run stops cleanly there. |
| `LLM_IMAGE_MODEL` | Optional. An image model that illustrates each edition's top story. |
| `LLM_MAX_CALLS`, `LLM_MIN_INTERVAL_MS` | Calls per run and the gap between them. |
| `SCORE_THRESHOLD` | Stories below this score (1 to 10) are not published. |
| `YOUTUBE_API_KEY` | Optional. Makes YouTube sources reliable; without it their feed fails at random. |
| `MONTHLY_BUDGET_USD` | Optional. The Logs page warns when the month is on pace to pass it. |
| `READERSHIP_API_TOKEN`, `READERSHIP_ACCOUNT_ID`, `READERSHIP_SITE_ID` | Optional. Read-only access to the site's web analytics, so the Stats page can show views, visits, countries and most-read pages. |
| `SITE_URL` | Optional. Takes the place of the paper's `address`. |

## Videos

A YouTube video is judged on its transcript, with the description its uploader wrote placed before it. English captions written by a person are used when the video has them, otherwise the generated ones.

- YouTube offers no official way to read another channel's captions. The pipeline asks as YouTube's own app does, with no key. This can stop working without notice, and may be refused on a hosted runner while it works on your machine.
- A video with no captions yet is left for up to two days, since they often come some hours after the upload. After that, or when every request in a run is refused, it is judged on its description alone.
- The Logs page says of each video which it was judged on, and warns when transcripts cannot be had.

## Cost

- With free models the paper costs nothing. Free tiers limit requests per day; `LLM_MAX_CALLS` keeps a run inside yours.
- Paid models need `LLM_ALLOW_PAID=1`. Set `LLM_MAX_COST_USD`, and a credit limit on the key as well.
- Pictures are the main cost: an image model is paid per picture, so check its price before setting `LLM_IMAGE_MODEL`.
- The words inside a picture cannot be checked by the pipeline, so look at new ones.

## Pages

| Address | What it is |
|---|---|
| `/` and `/YYYY-MM-DD/` | The latest edition, and any edition by date. |
| `/archive/`, `/search/` | Every edition, and search across them. |
| `/stats/` | For readers: who read the paper, stories published, articles reviewed, tokens by model. |
| `/logs/` | For whoever runs the paper: what needs attention, every run, and why each article was or was not published. |

`/logs/` is unlinked, not private: anyone with the address can read it. Put it behind your host's password protection if that matters.

## Going live

The site is static, so any static host will do: build command `npm run build`, output folder `dist`, Node 22 or newer.

A sample scheduled job is in `.github/workflows/daily.yml`: it runs the pipeline once a day and commits the new edition, and the host rebuilds on each commit. Give it the same settings as `.env`, with the keys as secrets and a monthly credit limit on the model key.

**Working locally once it is live.** Run `git pull` first, and avoid running the pipeline locally on the same day as the workflow: both write the same files in `data/`.

If the repository is public, so is `data/logs/`, with what each run rejected and spent.

## Good to know

- If new stories do not appear in `npm run dev` after a pipeline run, restart it (`npx astro dev stop`, then `npm run dev`).
- An article that scores one point under the threshold is printed as a one-line brief at the foot of the edition, and a day with only briefs is still an edition. Briefs can be searched, and the Stats page counts them apart from stories. They are files in `src/content/briefs/`.
- To remove a story, delete its file; it will not come back. To have it assessed again, also delete its entry in `data/seen.json`.
- Summaries are written by a language model and can be wrong. The site says so in its footer.

## Licence

The code is under the MIT licence (see `LICENSE`). The typefaces are under the SIL Open Font License. The stories are summaries of other people's articles, each linking to its source, and are not covered by the code's licence.
