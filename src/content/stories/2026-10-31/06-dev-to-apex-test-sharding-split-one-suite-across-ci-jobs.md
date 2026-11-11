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

The article explains how to split one Apex test suite into parallel slices across CI runners using renmy runtime, a local Salesforce Apex runtime from Renmy UG that runs tests on the CI machine against an embedded PostgreSQL instead of in a Scratch Org or sandbox. The author argues that sharding was impossible in an org-based workflow, because every extra runner would need its own org, deploy and place in the org's test queue. With a local runtime, the command renmy test --shard N/M runs one slice of the suite, and the wall-clock time falls to roughly the slowest shard plus setup, though total compute rises slightly. The runtime was previously called Nimbus, and the author notes that this is the same tool under a new name.

Sharding works at the level of whole test classes, so each class's @testSetup runs once and its records remain consistent with an unsharded run. Classes are balanced using durations recorded in .nimbus/test-durations.json, and projects without that history fall back to an even split by class name. Because each shard computes the partition independently, every job must see the same durations file, which the author recommends committing or restoring from a cache. The article supplies a GitHub Actions matrix with fail-fast disabled, a per-shard JUnit file, and an always-run publishing step. It also shows how to merge results either through the shard attribute that the JUnit XML carries or by uploading artifacts and publishing them from a job that runs after the matrix.

The piece also covers coverage and caching. A shard measures coverage only for the tests it runs, so whole-suite coverage needs a single process, and the article points to renmy deploy --min-coverage and renmy coverage diff for gating. Shards can share a cache of parsed ASTs and the binary to reduce cold-start time.

Finally, the author warns that sharding is not worth its overhead for suites that finish within about a minute, since each shard repeats checkout, installation and database startup. Alternatives suggested first are parallel workers within one job, caching, and an external PostgreSQL service container. Sharding is recommended when the test step alone runs for several minutes. A slow class sets a floor on its shard's time, and order-dependent tests can surface when classes move between shards. Running on a CI runner belongs to the Team tier, which is free during the public beta, and JUnit and Cobertura output are Pro features.
