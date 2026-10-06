# Plan: better quality news

Goal: the paper is for one reader (the author). Fewer junk stories, fewer missed ones.
Budget: a few dollars a month at most; new features under about $0.25 a month unless optional.

Check a box when the step is built, tested and committed.

- [x] 1. **Feedback log.** Record by hand which printed stories were junk and which skipped ones should have run. The log doubles as test data for the later steps. Flag from the Logs page under `npm run dev` (Articles, "Your call" column), or with `npm run feedback`.
- [ ] 2. **Better judgement of what is already read.**
  - [x] 2a. **Replay.** `npm run replay` judges the flagged articles again, with controls, so a rule change can be measured.
  - [x] 2b. **Judge YouTube videos on their transcript.** Built 6 Oct. Still to do: after a week of daily runs, read the Logs page to see whether GitHub Actions is refused. A live event that has not been held is skipped until it has been.
    Original note: Today a video is scored on its description alone, which is often a few lines and some links. Read the transcript when one can be fetched and fall back to the description when it cannot. Transcripts come by an unofficial route that can fail, most likely on the daily run in GitHub Actions, so the fallback and a count of how often it is used both matter. Comes before 2c, since tuning rules against description-only scores would measure the wrong thing.
  - [x] 2c. **Tune prompts and rules** (`relevant`, `notRelevant`, the scoring prompt) against the feedback log. No new spend. First pass done 6 Oct on 3 flags: platform news now counts as relevant, pieces for business leaders do not, and the score weighs how much a story matters. 2 of 3 flags fixed, no control lost. Come back to it when there are 10 or more flags; `npm run replay -- --runs 2 --compare` measures any change.
- [ ] 3. ~~**Group repeat coverage.** One story with "also covered by..." links; the number of sources feeds the score.~~ **Skipped for now** (6 Oct). Of the 30 stories printed on 3 and 4 Oct, none was covered by two sources, so there was nothing to group. Look again once step 4 adds sources that discuss the same news as the blogs (release notes, Reddit, GitHub releases).
- [ ] 4. **New sources**, one at a time, each checked with `npm run try-source`:
  - [x] 4a. **Release dates, as a line on the latest edition.** The release notes have no feed and cannot be read, and the blogs cover what is in them, so 4a is the dates only, from Salesforce's Trust site. Built 6 Oct. Step 6 will use the same dates to know a release has arrived.
  - [ ] 4b. Reddit (r/salesforce), one line a post in a "From the community" section; only posts that report something to know. Stack Exchange is left out: it is nearly silent. Built last.
  - [x] 4c. **Tool releases** (Salesforce CLI, Code Analyzer, LWC). Every release gets one line in "In brief", and a full story when it scores well enough. Built 6 Oct. The CLI is read from its notes file and Code Analyzer from its notes page, since their feeds say nothing.
  - [x] 4d. **Alerts from Trust**, together in one box beside the lead story, so nothing is added above the stories. Security advisories and major incidents on 5 or more instances are always printed; other messages to all customers are printed unless the editor finds them beside the point. Built 6 Oct. None fell in the week it was built, so the first real one is still to be seen in an edition.
- [ ] 5. ~~**Second pass on borderline stories** with a stronger model.~~ **Skipped for now** (6 Oct). Three models were tried on the 23 replay articles, twice each: DeepSeek V4 Pro was less consistent than the current model, Gemini 3.8 Flash rejected both flagged misses, and Claude Haiku 4.5 was the most consistent but agreed with the current model on 2 of 3 flags and scored nearly everything 7 or 8. None was enough better to pay for. Results are in `data/replay/models/` on the machine that ran them. Worth another look if flip-flopping around the threshold becomes a visible problem.
- [ ] 6. **Release special.** Detect a new release from the release notes feed and flag it; build only after approval. Digest of the top changes per persona, plus a "what breaks" section (retirements, critical updates, deprecations). About $0.10 to $0.50 a release.

Out of scope for now: email, newsletters, sharing, subscriptions.

Working rule: build one step, stop for review, then the next.
