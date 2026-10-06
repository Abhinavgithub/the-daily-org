# Plan: better quality news

Goal: the paper is for one reader (the author). Fewer junk stories, fewer missed ones.
Budget: a few dollars a month at most; new features under about $0.25 a month unless optional.

Check a box when the step is built, tested and committed.

- [x] 1. **Feedback log.** Record by hand which printed stories were junk and which skipped ones should have run. The log doubles as test data for the later steps. Flag from the Logs page under `npm run dev` (Articles, "Your call" column), or with `npm run feedback`.
- [ ] 2. **Tune prompts and rules** (`relevant`, `notRelevant`, the scoring prompt) against that log. No new spend.
- [ ] 3. **Group repeat coverage.** One story with "also covered by..." links; the number of sources feeds the score.
- [ ] 4. **New sources**, one at a time, each checked with `npm run try-source`:
  - [ ] 4a. Official release notes and release dates
  - [ ] 4b. Reddit (r/salesforce) and Salesforce Stack Exchange, as a separate "From the community" section with a high threshold
  - [ ] 4c. GitHub releases (Salesforce CLI, Code Analyzer, LWC)
  - [ ] 4d. Trust status incidents and security advisories
- [ ] 5. **Second pass on borderline stories** with a stronger model (the cheap model stays for the first pass).
- [ ] 6. **Release special.** Detect a new release from the release notes feed and flag it; build only after approval. Digest of the top changes per persona, plus a "what breaks" section (retirements, critical updates, deprecations). About $0.10 to $0.50 a release.

Out of scope for now: email, newsletters, sharing, subscriptions.

Working rule: build one step, stop for review, then the next.
