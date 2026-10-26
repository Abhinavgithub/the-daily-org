---
title: Running Apex tests on a local runtime, without an Org round trip
original_title: "renmy runtime explained: Apex tests, flows and deploys"
url: https://dev.to/oblitus/renmy-runtime-explained-apex-tests-flows-and-deploys-2ff1
source: dev.to
source_type: community
date: 2026-10-26
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - apex-testing
  - local-runtime
  - sfdx
  - mcp-server
  - deployment
authors:
  - René Knierim
why_read: You will learn what renmy runtime does, how it runs Apex and Flows locally against an embedded PostgreSQL, and which commands cover testing, debugging, AI agent integration and gated deploys. You will also see what the benchmark claims and what sits behind the Pro tier.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The gated deploy path from local source to the Salesforce org
  steps:
    - Snapshot selected source into a bundle
    - Run local validation and test gates
    - Check-only validation in the target org
    - Deploy the validated bundle
  icons:
    - doc
    - test
    - shield
    - rocket
---

renmy runtime, formerly Nimbus, is a local Salesforce Apex runtime and developer toolchain. It executes Apex, SOQL, DML and Flows on the developer's machine against an embedded PostgreSQL, enforcing platform rules such as governor limits and order of execution. The article claims a typical Apex test finishes in tens of milliseconds. In a published benchmark, four open-source suites with 837 tests took about 1 min 46 s to run in an org and 2.4 s locally, with every test passing in both places.

The tool ships as one binary for macOS, Linux and Windows and needs no org, Scratch Org, Docker or JVM. It includes a language server with editor integrations for VS Code, Cursor, Neovim and JetBrains IDEs, plus coverage reporting with line and branch metrics, mutation testing, a live debugger over the Debug Adapter Protocol, and a browser-based Dev UI. An MCP server lets AI coding agents run and verify Apex locally.

For deployment, renmy deploy snapshots the source, runs local gates, validates the same bytes with a Salesforce check-only validation and then deploys. The Pro tier, free during the public beta, adds the daemon, debugger stepping, mutation testing, the MCP server and split validate-and-release workflows with immutable receipts.
