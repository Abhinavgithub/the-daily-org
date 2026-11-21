---
title: Running Apex tests locally with Renmy Runtime, without an org
original_title: "Salesforce for Java developers: where did my test runner go?"
url: https://dev.to/oblitus/salesforce-for-java-developers-where-did-my-test-runner-go-1beo
source: dev.to
source_type: community
date: 2026-11-21
section: devops
personas:
  - developer
  - architect
tags:
  - apex
  - local-testing
  - junit
  - intellij-idea
  - ci-cd
  - governor-limits
authors:
  - René Knierim
why_read: You will learn why Apex has no local run loop, what a local Apex runtime changes for testing, debugging and CI, and which platform rules still apply locally. The article is a vendor-led introduction to a third-party tool, so weigh its claims accordingly.
interest_score: 6
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
---

The article explains that Apex looks like Java but only compiles, runs and tests inside a Salesforce org, so every iteration means deploying, waiting and reading logs. It argues that this deploy-to-run loop is slow, and that CI pipelines need an org and certificate just to run unit tests. Its benchmark claims four open-source Apex suites of 837 tests took about 1 min 46 s in an org versus 2.4 s locally, with every test passing in both.

The author presents Renmy Runtime, a single binary that executes Apex, SOQL, DML and Salesforce Flows on a developer's machine against an embedded PostgreSQL, with no org, Docker or JVM. Commands such as renmy test, renmy validate and renmy explain run tests, type-check changes and explain failures, and the tool reports line and branch coverage. A JetBrains plugin adds breakpoints in IntelliJ IDEA, a SOQL and Apex console, and mutation testing as a Pro feature. The CI example runs the suite and emits JUnit XML and Cobertura without an org.

The piece is candid that some differences remain: governor limits, order of execution and metadata-defined schemas still apply, and the runtime is not the platform itself. It recommends keeping sandboxes or Scratch Orgs for UI, integration and final validation, with renmy deploy checking the same bytes in the org before release.
