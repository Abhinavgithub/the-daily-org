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
| `npm run release-edition` | Builds the release edition when one is owed, and does nothing otherwise. The daily run calls it. `-- --dry-run` says what is owed; `-- --release 264` builds that release's edition now. |
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
| `LLM_REASONING_TOKENS` | Optional. The most a model may think before each answer; `0` is none. Empty leaves it to the model. |
| `LLM_IMAGE_MODEL` | Optional. An image model that illustrates each edition's top story. |
| `LLM_MAX_CALLS`, `LLM_MIN_INTERVAL_MS` | Calls per run and the gap between them. |
| `SCORE_THRESHOLD` | Stories below this score (1 to 10) are not published. |
| `YOUTUBE_API_KEY` | Optional. Makes YouTube sources reliable; without it their feed fails at random. |
| `MONTHLY_BUDGET_USD` | Optional. The Logs page warns when the month is on pace to pass it. |
| `READERSHIP_API_TOKEN`, `READERSHIP_ACCOUNT_ID`, `READERSHIP_SITE_ID` | Optional. Read-only access to the site's web analytics, so the Stats page can show views, visits, countries and most-read pages. |
| `SITE_URL` | Optional. Takes the place of the paper's `address`. |

## The Bulletin

The paper has two tabs. **News** is its stories. **Bulletin** (`/bulletin/`) holds what is worth knowing and is not a story, so that none of it takes room from the stories. It is one page showing the picture as it stands, not one a day, and each kind of item stays on it for a while. The tab says how many of its items a reader has not yet seen, which their browser remembers: incidents in red, other alerts in the paper's accent. A tool's release is not counted.

| Section | What it holds | Stays for | Switched on by |
|---|---|---|---|
| Releases | Where each coming release stands, and its dates | Until the release is out | `releases` in `paper.config.ts` |
| Alerts | Notices printed whatever they score | 14 days | `alerts` in `paper.config.ts` |
| Tools | Every release of the tools the paper follows, one line each | 30 days | a source of type `code` |
| Community | Posts from a forum that report something worth knowing, one line each | 7 days | a source of type `discussion` |

**Releases.** `releases: 'salesforce-trust'` reads the dates of Salesforce's releases from its Trust site into `data/releases.json` on each run. If they cannot be read, the dates already known are kept.

**Alerts.** `alerts: 'salesforce-trust'` reads Trust for security advisories and for incidents marked major on 5 or more instances, which are always printed, and for other messages to all customers, which are printed unless the editor judges them not about a fault, outage or change a reader may meet. The model writes the headline and a short summary; the line of facts is Trust's own.

**Tools.** A source of type `code` is a tool, and every release of it is printed, as one line saying what the version changed. Release candidates and nightly builds are left out.

- A feed of releases, such as a GitHub repository's `releases.atom`, is read like any other feed.
- `changelog: true` is for a tool whose notes are one long document with a dated section a version: the source's address is that document.
- `notes: '<address>'` is for a feed whose entries only point at the notes: each entry's version is looked up in that document.

**Community.** A source of type `discussion` is a forum. A post is never a story: one the editor finds relevant is a line in the Bulletin. A forum is mostly questions and opinion, so such a source should carry its own `relevant` and `notRelevant`, which stand in for the paper's when its posts are judged. Put it last among the sources, so that on a run that reaches its cap on calls the articles have been judged first.

Bulletin items are kept in `src/content/bulletin`, apart from the stories, so they do not appear among them, in a section's page or in the feed. Search finds the ones the Bulletin is showing.

## The release edition

A release of the paper's subject gets an edition of its own, made from the official release notes and not from the daily news: `/releases/<release>/`, listed in the Archive apart from the daily editions. It is switched on by `releaseNotes` in `paper.config.ts`, which names where the notes are read, the areas of them the paper covers, and the score a feature needs to be printed.

The page opens short: the headlines by name, what the release enforces in every org, and the notes' areas, closed. An area opens to its products and features, and one box searches all of it.

An edition is built twice and no more. The first time is when the notes of a new release appear. The second is on the day the release has reached the last of production, by when the notes have been filled out; that date comes from `releases`. The notes are revised all through a release, and the edition does not follow them day by day. While no release is awaited and no second build is owed, the notes are not asked at all.

The notes are read the way Salesforce's help site reads them, which is not a published service and can change. If it does, the day's paper is written as usual and the edition already saved stays.

## Videos

A YouTube video is judged on its transcript, with the description its uploader wrote placed before it. English captions written by a person are used when the video has them, otherwise the generated ones.

- YouTube offers no official way to read another channel's captions. The pipeline asks as YouTube's own app does, with no key. This can stop working without notice, and may be refused on a hosted runner while it works on your machine.
- A video with no captions yet is left for up to two days, since they often come some hours after the upload. After that, or when every request in a run is refused, it is judged on its description alone.
- A live event that has not been held yet is not judged until it has been. It is waited for up to 45 days.
- The Logs page says of each video which it was judged on, and warns when transcripts cannot be had.

## Cost

- With free models the paper costs nothing. Free tiers limit requests per day; `LLM_MAX_CALLS` keeps a run inside yours.
- Paid models need `LLM_ALLOW_PAID=1`. Set `LLM_MAX_COST_USD`, and a credit limit on the key as well.
- A release edition is about $0.02 a build on a cheap paid model, and is built twice a release.
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
- With `shares` set in `paper.config.ts`, the top of the page prints that company's share price at the last close, read once a day from Yahoo Finance. It is not a live price. The source asks for no key but is not a published service: if it stops answering, the last price is kept, and a price more than six days old is not printed.
- Summaries are written by a language model and can be wrong. The site says so in its footer.

## Licence

The code is under the MIT licence (see `LICENSE`). The typefaces are under the SIL Open Font License. The stories are summaries of other people's articles, each linking to its source, and are not covered by the code's licence.
