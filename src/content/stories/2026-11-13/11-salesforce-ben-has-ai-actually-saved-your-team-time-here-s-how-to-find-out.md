---
title: Measure AI's effect on Salesforce delivery with DORA metrics, not output counts
original_title: Has AI Actually Saved Your Team Time? Here’s How to Find Out
url: https://www.salesforceben.com/has-ai-actually-saved-your-team-time-heres-how-to-find-out/
source: Salesforce Ben
source_type: community
date: 2026-11-13
section: devops
personas:
  - admin
  - developer
  - architect
tags:
  - dora-metrics
  - ai-assisted-development
  - rework-rate
  - change-failure-rate
  - devops-metrics
authors:
  - Ross Collie
why_read: You will learn why output measures such as tickets closed and pull requests merged can mislead when judging AI-assisted development, and which DORA metrics, including the newer rework rate, show whether AI is saving time. The article also covers the human signals to watch alongside them.
interest_score: 6
depth_score: 5
novelty_score: 4
utility_score: 6
model: anthropic/claude-haiku-5.5
held_from: 2026-11-10
figure:
  kind: steps
  caption: The four DORA metrics plus rework rate, used together to test whether faster delivery costs stability
  steps:
    - Deployment frequency
    - Lead time to change
    - Change failure rate
    - Time to recover
    - Rework rate
  icons:
    - rocket
    - clock
    - warning
    - check
    - flow
---

The article argues that organisations judge AI-assisted development by activity such as lines of code, tickets closed and pull requests merged, which are easy to game and say little about whether the work is valuable. It cites Google's DORA research finding that rising AI use correlates with greater org instability, and that the rework this creates can consume the time AI was meant to save.

The author recommends returning to the four DORA metrics: deployment frequency, lead time to change, change failure rate and time to recover, together with the rework rate metric DORA added in 2024. Taken together, these show whether faster delivery is coming at the cost of stability. The author also stresses that the numbers show what is happening but not why, so teams should track human signals such as trust in AI output, verification load and user adoption.

The piece closes with a promotional section for Gearset's AI agent Cam and its DevOps performance dashboard, which tracks DORA metrics from a pipeline. The promotional content is brief and the general guidance stands apart from it.
