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

The piece argues that most Salesforce CI pipelines waste time and reliability on provisioning a Scratch Org or shared sandbox just so Apex tests have somewhere to run. Its proposed alternative is renmy runtime, a local Apex runtime that executes Apex, SOQL, DML and Salesforce Flows on the CI runner itself, backed by an embedded PostgreSQL database. The author says this removes the need for a JWT certificate, a Dev Hub allocation or a Scratch Org for the unit-test job, and that tests finish in seconds with JUnit XML and Cobertura coverage output. The runtime is presented as an interpreter that enforces governor limits and platform rules, not a mock framework or a transpiler. The piece includes a GitHub Actions example in which the only secret needed is a license key, and it notes that tests can keep running during a Salesforce incident even though deploys cannot.

The piece also describes a gated deploy command, renmy deploy. It snapshots the source into a content-addressed bundle, runs the local test and coverage gates against those exact bytes, then runs a real check-only validation of the same bytes in the target org, and deploys only after that succeeds. A coverage floor can be set with a minimum-coverage flag. For teams that need an approval step, a release command validates and writes a receipt containing the bundle digest, git revision, org fingerprint, gate results and validation job id. After approval, a deploy step quick-deploys the validated job within Salesforce's 10-day window, or resends the stored bundle, and rejects changed, expired or wrong-org receipts. The author also covers pinning the Salesforce CLI version and recovering deploys stuck in the org's Pending queue.

The author is candid that the org still matters for anything a person inspects, for integration tests against real endpoints, and for the final validation and deployment. The main claim to weigh carefully is the vendor's own benchmark: about 1 minute 46 seconds to deploy and run 837 tests in an org against 2.4 seconds locally, roughly 45 times faster, with all tests passing in both. The method is published by the vendor and has not been independently verified in the piece. Branch coverage is reported locally but not by the org, so the two coverage figures are not directly comparable. The piece also notes that the Team tier, which covers CI runner use, is free during the public beta, with a listed price of $49 per developer per month, and that an individual Free tier exists.
