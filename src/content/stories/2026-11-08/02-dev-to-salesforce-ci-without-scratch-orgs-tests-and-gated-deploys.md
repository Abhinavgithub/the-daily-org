---
title: Running Apex tests in CI without a Scratch Org, with gated deploys
original_title: "Salesforce CI without scratch orgs: tests and gated deploys"
url: https://dev.to/oblitus/salesforce-ci-without-scratch-orgs-tests-and-gated-deploys-4pl4
source: dev.to
source_type: community
date: 2026-11-08
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - apex-testing
  - ci-pipeline
  - scratch-orgs
  - local-runtime
  - gated-deploy
authors:
  - René Knierim
why_read: You will see how Apex tests can run on a CI runner against a local runtime, what a gated deploy with a check-only validation looks like, and the trade-offs of keeping the org only for the final deploy. The piece is also a product pitch for renmy, so weigh its benchmark claims accordingly.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The gated deploy sequence renmy deploy follows before any metadata reaches the org
  steps:
    - Run local runtime gates on the bundle
    - Check-only validation of the same bytes
    - Deploy to the target org
  icons:
    - test
    - shield
    - rocket
---

The author argues that most Salesforce CI pipelines spend their time provisioning a Scratch Org or sandbox just so Apex tests have somewhere to run. Creating orgs, waiting on deploys and test queues, and dealing with Dev Hub limits make these jobs slow and flaky, and they stall entirely during a Salesforce incident.

The piece describes renmy runtime, a local Apex runtime that executes Apex, SOQL, DML and Flows on the CI runner against an embedded PostgreSQL. The unit-test job then needs no org, no JWT certificate and no Scratch Org pool, and outputs JUnit XML and Cobertura coverage. The author claims a 45 times speed-up on a 837-test benchmark, with the figures published on the vendor's site.

For deployment, renmy deploy runs local gates, validates the same bytes in the target org with a check-only validation, and only then deploys. A two-step release flow writes an immutable receipt for approval. Much of this is vendor-specific, and the author states that CI runs require the Team tier.
