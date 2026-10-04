# A newspaper on any subject

This project publishes a daily newspaper about one subject. A pipeline reads RSS feeds, asks a language model to score and summarise each new article, and writes the ones worth reading into an edition; a static Astro site displays the editions as a broadsheet.

The paper in this repository is **The Daily Org**, for Salesforce developers, admins and architects. Everything that makes it that paper is in one file, `paper.config.ts`, so the same code can publish a paper about anything else: see "Make your own paper".

## Setup

Requires Node 22.12 or newer.

```bash
npm install
cp .env.example .env
```

Put an API key in `.env` as `LLM_API_KEY`. The default provider is OpenRouter, where a free account works; create a key at https://openrouter.ai/keys. Any OpenAI-compatible endpoint works through `LLM_BASE_URL`.

## Make your own paper

```bash
npm run new-paper      # removes this paper's editions and memory, and writes a starter paper.config.ts
```

It refuses to run while the present paper has uncommitted changes, and asks before deleting anything. Then:

1. **Edit `paper.config.ts`.** The starter is a small working paper about space science, with a comment on every field. Replace it with your subject.
2. **`npm run check-paper`** reads every source once, with no model calls, and says which answered, how many recent items each has and which failed.
3. **`npm run pipeline -- --max-calls 6`** makes a small first edition, and `npm run dev` shows it.

What the file holds:

| Field | What it is |
|---|---|
| `name`, `tagline`, `description`, `creator` | The nameplate, the line under it, the sentence for search engines and the RSS feed, and the "Curated by" link. |
| `timezone` | Which day an edition belongs to, for example `Europe/London`. |
| `topic`, `readers` | The subject and the audience, as the model is told them: "a newspaper about `topic`", "a daily newspaper for `readers`". |
| `relevant`, `notRelevant` | What earns an article its place and what is turned away. These decide what the paper prints more than anything else here, so be specific. |
| `disclaimer` | Optional. Printed in the footer: "`name` is an independent project, `disclaimer`." |
| `sections` | The sections stories are filed under. Each has an `id` (lower case, hyphens) and a `label`. |
| `personas` | Optional kinds of reader a story can be marked for, which readers can filter by. Use `[]` to do without. |
| `sources` | The feeds: an `id`, a `name`, the feed's `url` and a `type` (`official`, `community`, `code`, `discussion` or `video`). `noisy: true` keeps only items that mention one of `keywords`. A YouTube channel is `...youtube('<channel ID>')` in place of `url`. |
| `keywords` | Optional. Words that show an item from a noisy source is on topic. |
| `glossary` | Optional. Names the paper always writes one way, applied by code after the model has written. |
| `houseStyle` | Optional. Extra rules for the writer, one sentence each. |
| `notAuthors` | Optional. Words that mark a byline as an organisation, not a person. |
| `bot` | The name and contact address the pipeline gives to the sites it reads. Some sites refuse readers that do not say who they are. |

A mistake in the file, such as two sources with the same id or a source naming a persona the paper does not have, stops every command with a message saying what to fix.

Finding a feed: most blogs have one at `/feed`, `/rss` or `/rss.xml`, and the page's source names it in a `<link rel="alternate" type="application/rss+xml">` tag. The address must be the feed itself, not the site's home page.

The paper's three main colours can be set there too, with the optional `colours: { paper, ink, accent }` (hex colours); they set the light theme and the colours illustrations are asked for in. The dark theme's shades and the typefaces are variables at the top of `src/styles/main.scss`. The paper is written in English; the pre-filter drops articles in other scripts.

Stories record the section they were filed under, so adding a section later is safe, while renaming an id leaves older stories showing the old id as their section.

## Daily use

```bash
npm run pipeline    # fetch feeds, score and summarise new items, write today's edition
npm run dev         # read it at http://localhost:4321
```

`npm run daily` runs the pipeline and then a production build; `npm run preview` serves that build.

If the dev server is already running and new stories do not appear after a pipeline run, restart it (`npx astro dev stop`, then `npm run dev`). It can stop noticing new story files after it has restarted itself, for example when `.env` changes. The Logs page says when the site is out of date.

Pipeline options, passed after `--`:

| Option | Effect |
|---|---|
| `--dry-run` | Fetch, deduplicate and pre-filter only. No model calls, nothing written. |
| `--day 2026-10-03` | Write into this edition instead of today's. |
| `--model <id>` | Use this model for one run. |
| `--since-days 5` | How far back to look in every feed. By default each feed is read back to its own last success (see "Feed reliability"). |
| `--max-calls 40` | Cap on model calls for the run. |

A run writes each story as soon as it has been assessed and proof-read, so one that is interrupted keeps what it has done and the next run carries on from there. An interrupted run also writes its record (its line in `data/stats.jsonl` and its log), marked as unfinished.

Articles a run met but could not deal with, because the page could not be read or the call cap was reached, are kept in `data/pending.json`. They are tried again by later runs, counted once in the figures, and their feed is not marked as read in full while they wait. A page that still cannot be read after 3 days is dropped, and anything is let go after 7. The edition's date is today's in the paper's `timezone`.
| `--threshold 6` | Minimum interest score to publish. |

## Reading the site

- Each story is printed in full on the page, in a box as tall as its own text. Only the headline is a link: it opens the original article in a new tab.
- The page is three newspaper columns (two on a tablet, one on a phone). A story is one, two or three columns wide and as tall as its own text, so sizes and lengths vary as they do in print.
- The one-column stories are divided among the columns so that the columns end as close together as possible, leaving little of the sheet blank. Within a column they stay in rank order. Where it clearly helps, one story at the foot of the page is set across two columns, and small leftovers are shared into the gaps between boxes. The rules are in `src/lib/pack.ts`.
- Width comes from the story: a score of 9 or more takes the full width, a score of 8 takes two columns, and everything else takes one. When an edition of four or more stories has no such standout, its top story takes two columns. The rule is in `src/lib/layout.ts`. A story's text always runs as one block across the full width of its box.
- The info icon after the writer's name shows why the story is worth reading. It opens on hover, on a tap, or from the keyboard, and Esc closes it.
- The section and tags at the foot of each story open every story with that section or tag, across all editions. On those pages the selection shows as a pill above the site title; click it to remove it and go back.
- Two groups of words under the header filter an edition: Show (all, recommended, must-read) and For (everyone, then each of the paper's personas; the group is left out when the paper has none). The selection is kept in the address, so it survives a reload.
- Recommended and Must-read go by rank within the edition, not by fixed scores, so every edition has both. Must-read is the top two stories (never more than a third of the edition, always at least one); Recommended is the top half and includes them. Stories are ranked by interest score, then by depth, novelty and utility together. The rule is in `src/lib/signal.ts`.
- Every story has its own link (`/2026-10-04/#<story>`), which scrolls to it and outlines it. Search results use these.
- Moving from one edition to another, by the arrows beside the date or the browser's back and forward buttons, turns the sheet like a page. Chrome, Edge and Safari do this; other browsers, and anyone who has asked their system to reduce motion, get an instant change. The animation is in the "Page turn" section of `src/styles/main.scss`, and the direction is set by a short script in `src/layouts/Layout.astro`.
- The search box covers every edition. Press `/` to jump to it.
- A story whose headline you have followed is shown with a dimmed headline. That is stored in your browser only.

Arranging the boxes needs a small script, because CSS cannot yet do it for boxes of mixed widths in every browser. Without the script the boxes sit in ordinary rows, with gaps under the shorter ones.

## Choosing a model

`npm run models` lists the models that are free on OpenRouter right now and marks the ones you have configured. Set `LLM_MODELS` in `.env` to an ordered, comma-separated list: the first is used, and the rest are fallbacks when it is rate limited or down.

The pipeline checks live prices before each run and drops any configured model that is no longer free. To use a paid model, set `LLM_ALLOW_PAID=1` and put its ID in `LLM_MODELS`. Any OpenAI-compatible endpoint works through `LLM_BASE_URL`.

OpenRouter's free tier allows 20 requests a minute and 50 a day (1000 a day once the account has bought $10 of credits). The defaults, 40 calls per run spaced 3.5 seconds apart, stay inside that. Items over the cap are picked up by the next run.

With paid models, set `LLM_MAX_COST_USD` to the most one run may spend. The run stops cleanly at that amount and leaves the rest for the next run. It depends on the provider reporting the cost of each call, which OpenRouter does; set a credit limit on the key as well. As a guide, The Daily Org's 4 October edition (29 articles assessed, 21 published, one illustration) cost 7.5 cents with `qwen/qwen3.7-flash` and `openai/gpt-5-image-mini`.

## Illustrated diagrams

Each must-read story carries a diagram of its main idea. A text model reads the article and picks the idea out as a few short labels, which the page draws. Every number in a diagram must appear in the article or the summary, or the diagram is discarded.

Set `LLM_IMAGE_MODEL` in `.env` (for example `openai/gpt-5-image-mini`) to have an image model draw the labels of each edition's top story as an illustration, saved under `public/figures/` and shown in place of the drawn diagram. Image models are paid, about five cents a picture with that model, so this needs `LLM_ALLOW_PAID=1` and credit on the account. The picture is made for the box it will sit in: the brief gives the box's proportions (4:3 for a one-column story, 16:9 for a wider one) and asks for small sentence-case lettering to match. Whatever comes back, the blank paper around the drawing is cut away and a thin even margin put back. A drawing that runs off the edge of its picture is asked for once more and then given up, so no more than two pictures are paid for per story; the ones turned down are kept in `data/logs/rejected/` to look at. When a picture cannot be made, the drawn diagram stays. On the page, clicking a picture opens it large; Esc or a click outside closes it. The words inside a picture cannot be checked, so look at new ones; `npm run figures -- --day 2026-10-04 --redo` draws an edition's diagrams again, and without `--redo` it only fills in what is missing.

## How it works

1. `pipeline/fetch.ts` reads every source in `paper.config.ts`. A failing feed is reported and skipped. Requests identify themselves as a declared bot with a contact address (the paper's `bot`); some sites, Salesforce's among them, refuse clients that pose as a browser but accept this.
2. `pipeline/dedupe.ts` drops URLs already recorded in `data/seen.json`.
3. `pipeline/extract.ts` takes each article's text. Most feeds carry the whole article, and then the feed's text is used and the article page is not requested at all. The page is fetched only when the feed gives a short excerpt.
4. `pipeline/curate.ts` drops items that are too short, not in English, or, for noisy feeds, lacking the paper's keywords. Each remaining item gets one model call that returns its relevance, section, audience, four scores, a headline written for the paper, a one-line reason to read it and a summary. The article's own title is kept in the story file as `original_title`; it is not shown, but search matches on it.
5. Each story that will be published gets one more call that proof-reads it. See "Proof-reading" below.
6. `pipeline/write.ts` writes one markdown file per published story to `src/content/stories/YYYY-MM-DD/`.
7. `pipeline/figure.ts` gives each must-read story of the edition a diagram. See "Diagrams" below.

Each story also records the address of the article's preview image (its `og:image`, or the thumbnail for a video). The site does not display images at present; the address is kept so they can be added later. `npm run backfill-images` adds images to older stories that lack one, without calling the model.

The writer's name is taken from a "By …" line at the top of the article text when there is one, because feeds often name whoever published the post rather than who wrote it. Otherwise it comes from the feed, or from the page's structured data and author tags when the page is read. Email addresses and account names are not treated as bylines; such a story shows the blog's name instead. `npm run backfill-authors` re-checks the stories already published.

Each run, including one that finds nothing new, appends a line to `data/stats.jsonl` with its counts, models and token usage. When a call has to be repeated, the run prints the cause under the item (a rate limit, a provider error, or a reply that failed validation) and totals the extra calls by cause at the end and in the stats line.

## Looking after the sources

The paper is only as good as its sources, so each run records how every source did: how many items it offered, how many were new, how many were dropped or could not be read, how many were reviewed and published, the scores they got and the tokens they cost. This goes in the run's line of `data/stats.jsonl`.

```bash
npm run sources                 # how each source has done over the last 60 days, with a verdict on each
npm run sources -- --days 90
npm run try-source -- https://example.com/feed/              # what a new source would add: no model calls
npm run try-source -- https://example.com/feed/ --review 3   # and have the editor score its 3 latest
npm run try-source -- --youtube UCxxxxxxxxxxxxxxxxxxxxxx
```

`npm run sources` reads files only. Its verdicts are prompts to look, and nothing is ever removed for you:

| Verdict | Meaning |
|---|---|
| Keep: strong | At least 5 articles reviewed and 60% or more of them published. |
| Keep | Nothing wrong with it. |
| Too new to say | Fewer than 5 articles reviewed so far. |
| Watch: low yield | At least 8 reviewed and under a quarter published: it costs tokens and gives little. Remove it, or mark it `noisy: true` so only on-topic items are reviewed. |
| Quiet | No post in 60 days. |
| Unreadable | Most of its items never reach review, because the page cannot be read or the text is too short. |
| Failing | The feed itself has failed three runs in a row. |

The rules are in `src/lib/sources.ts`. The same table is on the Logs page, and a pipeline run ends with a line naming any source that needs a look.

`npm run try-source` reads a feed as the pipeline would, says how often it posts and whether its articles can be read, and with `--review` has the model score its latest articles with the paper's own editor prompt. It writes nothing and marks nothing as seen. It ends with the line to paste into `paper.config.ts`.

A routine that works: once a month, run `npm run sources`, remove what is unreadable, failing or long quiet (leaving a dated comment in `paper.config.ts` saying why), and try one or two new candidates.

Yield measures what this paper's editor likes. A source can score badly because `relevant` in `paper.config.ts` is worded too narrowly, not because the source is poor.

## YouTube

A YouTube channel can be a source (The Daily Org has one, the Salesforce Developers channel). It can be read two ways:

- **Without a key (the default):** from YouTube's RSS feed, which fails at random and is retried.
- **With `YOUTUBE_API_KEY` in `.env`:** through the YouTube Data API, which is reliable. If the API refuses the request, the run says so and falls back to the feed.

To get a key: at https://console.cloud.google.com/ create a project, enable "YouTube Data API v3" under APIs & Services > Library, then create an API key under Credentials and restrict it to that API. It is free (a run uses 1 of 10,000 daily units) and reads public data only; it gives no access to your Google account. The key is sent in a request header and never printed.

Videos are judged from their title and description, since there is no transcript. To add a channel, add a source to `paper.config.ts` using `...youtube('<channel ID>')`; the ID is the `externalId` in the channel page's source.

## Feed reliability

`data/sources.json` records, for each feed, when it was last read in full and how many runs in a row it has failed.

- **Look-back.** Each feed is read back to its own last success, plus a day's margin, with a 2-day minimum. A feed that was down for three weeks is read back three weeks when it returns. A feed with no record yet, such as one just added, gets 7 days.
- **Success** means the feed was fetched and the run got through all its items. A run that stops early or hits the call cap does not move the date, so nothing left over is skipped.
- **Retries.** A feed that fails is tried five times within the run. YouTube sources have two addresses (the channel feed and its uploads playlist) and the tries alternate between them, because YouTube's feed endpoint fails at random.
- **Warnings.** A failure is printed with its count. After three failed runs in a row, the run ends with a WARNING naming the feed, its last error and its last success. That means the address in `paper.config.ts` needs checking, or the feed should be removed.

## Proof-reading

Published text goes through three checks:

1. The writing prompt states the house style: US spelling, sentence-case headlines, and the paper's own `houseStyle` rules (for The Daily Org, feature names capitalised: Custom Object, Permission Set, Screen Flow).
2. A proof-reading call corrects grammar, spelling, punctuation and capitalisation. Its result is checked field by field and thrown away if it re-divides paragraphs, changes or drops a number or a name, or alters more than a few words, so it can correct a story but not rewrite it. The run reports anything it discarded. If the call cap is reached, remaining stories are published without this pass.
3. The paper's `glossary` is applied by code last (`pipeline/style.ts`), so capitalisation is consistent whatever the model does. Add a term to it to enforce it everywhere. Only unambiguous terms belong in it: a bare "flow" or "trigger" is usually ordinary English.

`npm run revise` gives already-published stories a headline and a proof-read (one model call each, for stories without `original_title`). `npm run revise -- --glossary-only` re-applies the glossary and sentence case to every story with no model calls; run it after adding a glossary term.

## Diagrams

Each must-read story carries a small diagram between its headline and its text. It is not a picture: the model picks out the story's main idea as a few short labels, and the page draws them in the paper's own ink, rules and fonts, so it follows light and dark mode.

- There are four kinds: steps in order, two things compared, the figures a story turns on, and one thing with its parts. The model chooses one, or none when nothing fits.
- A diagram is refused if it is the wrong shape, if a label is too long, or if it states a number that is not in the story. A refused diagram is simply left out.
- It is stored as a `figure:` entry in the story's file and shown only while the story is a must-read.
- The pipeline adds diagrams after writing an edition, with one model call per must-read story, inside the call cap. `npm run figures` adds any that are missing in editions already published; `-- --day 2026-10-04` limits it to one edition and `-- --redo` draws them again.
- To remove a poor one, delete the `figure:` lines from the story's file. To have it drawn again, delete them and run `npm run figures`.

The shape is in `src/lib/figure.ts`, the prompt and checks in `pipeline/figure.ts`, and the drawing in `src/components/StoryFigure.astro`.

## Stats

`/stats/`, linked at the foot of every page, is for readers. It shows stories published, articles reviewed and tokens used, with tokens broken down by model (input and output), and stories by section, source and audience. It has three views (one edition, this month, all time), and the choice is kept in the address.

The figures are worked out when the site is built, from `data/stats.jsonl` (one line per `npm run pipeline`) and from the story files. Each run records its tokens per model, counting every reply including proof-reading and diagrams. Runs made before that was recorded gave one total: where such a run used a single model the total is that model's, and where it used several the total is shown in one row naming those models ("… and …, combined") and not divided by guesswork. Tokens spent by `npm run revise` and `npm run figures` are not recorded.

## Logs

`/logs/` is for whoever runs the paper. It is part of the site, locally and live, but nothing links to it and it is left out of the sitemap and marked `noindex`; you reach it by typing the address. Under `npm run dev` it is read fresh from `data/` on every load. On the built site it shows what was recorded when the site was built, says when that was, and works out anything said in terms of "now" (how long ago the last run was, whether the pipeline has gone too long without running) in the browser.

Unlinked is not private: anyone with the address can read what the paper spends, which models it uses, what it rejected and why, and which sources are judged weak. If that matters, put the page behind your host's password protection, or serve it at an address that cannot be guessed.

The page puts what the records mean before the records themselves:

- **Needs attention:** plain findings, most pressing first, each with what to do. It says when the site is out of date, the pipeline has not run lately, a run stopped early, a feed keeps failing, many model calls were repeats, the call cap left articles behind, replies came back unusable, proof-reads or diagrams were thrown away, few reviewed articles were published, sources need a look, or the month's spending is on pace to pass `MONTHLY_BUDGET_USD`. A last line says what is fine, so a short list is not mistaken for nothing having been checked. The rules and their thresholds are in `src/lib/insights.ts`.
- **At a glance:** when the last run was and how it ended, stories published, articles reviewed, model calls and how many were repeats, tokens, and the month's recorded cost.
- **How runs went:** one column per run for what became of its articles, and one for its model calls with repeats in a second shade.
- **Sources:** the scorecard described under "Looking after the sources".
- **Articles:** every article from every run that kept its articles, with its outcome, score and reason. Search by title or source, or narrow by outcome. This answers "why was this not published?".
- **Runs:** each run on one line (edition, a small bar of outcomes, published of reviewed, calls, time, cost), opening to its problems, failed feeds, proof-reading, diagrams and model use.

The 7 days, 30 days and All switch at the top applies to everything but Sources, and the choices are kept in the address.

Each `npm run pipeline` and `npm run figures` writes one file to `data/logs/`, keeping the newest 60. The folder is committed with the stories, so the live page has each run's articles; a scheduled run must commit `data/logs/` along with `data/stats.jsonl` and the stories. `MONTHLY_BUDGET_USD` and `LLM_MAX_CALLS` are read when the site is built, so set them on the host as well as in `.env` if the page should show the budget and the cap. A dry run writes none. Runs made before logs were kept are not listed, but their totals, taken from `data/stats.jsonl`, are still counted in the figures and charts. Cost is shown for runs made since the pipeline began recording it.

## Going live

The site is static, so any static host will do. This is how The Daily Org is set up: the repository on GitHub, a GitHub workflow that writes each day's edition, and Cloudflare Pages building the site from every commit.

**The daily run.** `.github/workflows/daily.yml` runs at 06:30 UTC (12:00 in India) and can be started by hand from the Actions tab. It runs the tests and the pipeline, then commits the new stories, pictures and `data/` and pushes. If it fails, GitHub emails the repository's owner; the next run picks up what was missed. Set these under Settings > Secrets and variables > Actions:

| Kind | Name | Value |
|---|---|---|
| Secret | `LLM_API_KEY` | An OpenRouter key made for this workflow, with a monthly credit limit set on OpenRouter. |
| Secret | `YOUTUBE_API_KEY` | The YouTube Data API key. |
| Variable | `LLM_MODELS`, `LLM_IMAGE_MODEL`, `LLM_ALLOW_PAID`, `LLM_MAX_CALLS`, `SCORE_THRESHOLD` | As in `.env`. |
| Variable | `LLM_MAX_COST_USD` | The most one run may spend, in US dollars. |

**Spending.** Three limits apply to an unattended run: `LLM_MAX_COST_USD` stops a run; the credit limit on the workflow's OpenRouter key stops the month, whatever the code does; and `MONTHLY_BUDGET_USD` makes the Logs page warn when the month is on pace to pass it.

**The host.** On Cloudflare Pages, connect the repository with build command `npm run build` and output folder `dist`, and set these for the build: `NODE_VERSION` to `22`, `SITE_URL` to the site's address (for example `https://thedailyorg.com`), and `MONTHLY_BUDGET_USD` and `LLM_MAX_CALLS` if the Logs page should show them. `SITE_URL` is what the RSS feed, sitemap, `robots.txt` and link previews use; without it they point at `localhost`. `public/_headers` sets caching and is read by Cloudflare Pages. If Cloudflare sets the project up as a Worker instead (its "import a repository" flow does), `wrangler.jsonc` tells it to build the site and serve `dist`; set the same variables under the Worker's build settings, and make sure the `name` in that file matches the Worker's name.

**Icons.** `npm run favicon` draws the tab icon and the phone icons from the nameplate's typeface and the paper's colours. Run it again after changing the paper's name or colours; `npm run favicon -- H` picks another letter.

**Working locally once it is live.** Run `git pull` first, because the workflow commits every day, and avoid running the pipeline locally on the same day as the workflow: both write the same files in `data/`.

Everything in the repository is public if the repository is, including `data/logs/` with what each run rejected and spent. `/logs/` on the live site shows the same and is unlinked, not private.

## Editing content

- Remove a story: delete its file. Its URL stays in `data/seen.json`, so it will not come back.
- Reassess a story: delete its file and its entry in `data/seen.json`, then run the pipeline.
- Add a source: add an entry to `sources` in `paper.config.ts` and confirm it with `npm run check-paper`.
- Rename the paper, change the tagline or creator link, or change sections: edit `paper.config.ts`.

The three stories dated 2026-10-03 with `model: hand-written sample` were written by hand so the site has something to show before the first pipeline run.

## Fonts

The look follows a broadsheet newspaper, using open-licensed typefaces rather than any newspaper's own:

- Nameplate: Chomsky, a blackletter face under the SIL Open Font License, served from `public/fonts/` with its licence alongside.
- Headlines and reading text: Newsreader, a typeface drawn for news that uses a sharper cut at headline sizes and a sturdier one at text sizes. Labels and navigation: Libre Franklin. Both are served from `public/fonts/` too, with their licences, so reading the paper asks nothing of anyone else's servers. Only Latin and extended Latin characters are included.
- All are open-licensed; none is any newspaper's own typeface.

All three are set as variables at the top of `src/styles/main.scss`, along with the colours and the shadow scale. There are three layers: a darker desk behind everything, the newsprint sheet that holds the whole newspaper (bordered, with page edges and a deep shadow beneath it), and a lighter paper for the story blocks on the sheet.

## Tests

`npm run check` type-checks the site and the pipeline. `npm test` runs against a small paper of its own (`pipeline/testing.ts`), so it passes whatever `paper.config.ts` says. It covers the paper's settings and what is said when they are wrong, a paper on another subject, the edition layout and column-balancing rules, the diagram checks, the stats totals, the run log, headline and proof-reading checks, the glossary, the model client's retry and fallback behaviour, the handling of malformed model replies, the free-model check, preview-image and author extraction, URL canonicalisation and the pre-filter.

## Licence

The code is under the MIT licence (see `LICENSE`). The typefaces are under the SIL Open Font License. The stories are summaries of other people's articles, each linking to its source, and are not covered by the code's licence.

## Known gaps

The first four are about The Daily Org's own sources.

- Without a YouTube API key, the video source depends on YouTube's feed endpoint, where a request for a valid channel can return 404 or 500 and succeed seconds later. Retries cover most of it; a key removes the problem (see "YouTube").
- Apex Hours has no coverage: its YouTube channel was removed to keep a single video source, and its blog feed is not readable.
- Two sources are not included: the Apex Hours blog answers with a challenge page instead of its feed, and Salesforce Stack Exchange refuses automated readers (its API is the right way in).
- Medium is not a source: its tag feed carries only teasers and its article pages refuse to be read, so nothing from it could be reviewed.
- Summaries come from a language model and can be wrong. The site says so in its footer.
