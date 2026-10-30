---
title: Running Apex tests locally lets new developers skip the sandbox wait
original_title: "Onboarding Salesforce developers: day one, without an org"
url: https://dev.to/oblitus/onboarding-salesforce-developers-day-one-without-an-org-53jd
source: dev.to
source_type: community
date: 2026-10-30
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - renmy-runtime
  - local-apex-testing
  - developer-onboarding
  - sfdx-project
  - ci-pipeline
authors:
  - René Knierim
why_read: You will learn how a committed renmy.properties file and a local Apex runtime let a new developer run the full Apex test suite on day one without an org. You will also see the same command reused in CI, with its trade-offs.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Day one with a local Apex runtime takes four steps, none of which needs an org
  steps:
    - Clone the repository
    - Install renmy runtime
    - Run renmy doctor
    - Run renmy test
---

The article argues that onboarding a Salesforce developer usually waits on a sandbox, a user, Permission Sets and VPN access before the first Apex test can run. renmy runtime, a local Apex runtime, executes Apex, SOQL, DML and Salesforce Flows on the developer's machine against an embedded PostgreSQL. A new hire can clone the repository, install one binary and run the test suite immediately, while org access remains necessary for deployment.

The author describes the setup as four steps: clone the repository, install the binary, run renmy doctor, and run renmy test "". Test environment settings such as org defaults, Custom Setting seeds and governor limit modes live in a renmy.properties file committed to the repository, and a ci profile reads the same file with stricter settings. Managed package dependencies can be handled by pulling stubs once with org access and committing them.

The piece also covers the same command running in a GitHub Actions workflow with no connected org, and the pricing tiers, with Team free during the public beta. It is vendor-authored, so the speed and parity figures come from the vendor's own published benchmark.
