---
title: Sharding Apex tests across CI jobs with renmy runtime
original_title: "Apex test sharding: split one suite across CI jobs"
url: https://dev.to/oblitus/apex-test-sharding-split-one-suite-across-ci-jobs-18la
source: dev.to
source_type: community
date: 2026-10-31
section: devops
personas:
  - developer
  - architect
tags:
  - apex-testing
  - test-sharding
  - github-actions
  - ci-cd
  - local-runtime
authors:
  - René Knierim
why_read: You will learn how to split one Apex test suite into parallel slices across CI runners, how classes are balanced by recorded duration, and when sharding is not worth the overhead. The article gives a working GitHub Actions matrix and explains how to merge the JUnit results.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Sharding assigns each test class to exactly one runner, then the results are merged
  steps:
    - Balance classes by recorded duration
    - Run each slice on its own CI job
    - Merge the shard JUnit XML results
held_from: 2026-10-28
---

Test sharding splits one test suite into slices that run at the same time in separate CI jobs, so a suite that takes twelve minutes on one runner can finish in about three, plus setup, on four. The article presents renmy runtime, a local Apex runtime that executes tests on the CI runner against an embedded PostgreSQL with no org. That removes the constraint that made Apex tests impossible to shard, because adding runners previously meant adding orgs and deploys. The command renmy test --shard 2/4 runs the second of four slices.

Each slice is made of whole test classes, so @testSetup stays correct. Classes are balanced using durations recorded in .nimbus/test-durations.json, and every shard must read the same file, which is why the article recommends committing it or restoring it from a cache. With --results-xml, each shard's JUnit output carries a shard attribute so the results can be merged into one report. The article gives a full GitHub Actions matrix with fail-fast turned off, a secret for the license key, and a separate job that publishes merged results.

The piece is candid that sharding only pays off for large suites. For a suite finishing in under a couple of minutes on one runner, the checkout and install dominate, and the article suggests trying parallel workers within one job, caching, and an external PostgreSQL service container first. It also warns that sharding hides slow test classes rather than speeding them up, and that a test whose result depends on its shard is an order-dependent test.
