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

Nimbus has been renamed renmy runtime, with the same tool and the same binary. It is a local Salesforce Apex runtime that executes real Apex, SOQL, DML and Salesforce Flows on a developer's machine against an embedded PostgreSQL database. The runtime enforces platform rules such as governor limits, order of execution across triggers and flows, and per-test transaction isolation. It ships as a single binary for macOS, Linux and Windows and needs no org, Scratch Org, Docker or JVM.

The article's benchmark compares four open-source Apex suites containing 837 tests. Run in a Salesforce org, they took about 1 minute 46 seconds, and locally they took about 2.4 seconds, roughly 45 times faster, with every test passing in both places. Around the runtime sit a language server that serves editors such as VS Code, Cursor, Neovim, Zed and JetBrains IDEs, a live debugger that supports breakpoints and stepping, and line and branch coverage reporting. Pro adds mutation testing, which the author says is the first of its kind for Apex, and watch mode. The toolkit also includes failure explanation and triage tools, a browser-based Dev UI, and a flaky-test finder.

For AI coding agents, renmy provides an MCP server with tools for running tests, executing anonymous Apex, reading coverage and explaining failures, so agents can verify Apex locally before anything reaches an org. The deployment path is gated: renmy deploy is free and snapshots the source, runs local tests and coverage gates, validates the same bytes in the target org with a check-only validation, and then deploys. The Pro renmy release commands split validation from deployment and produce a receipt that records the bundle digest, Git revision, gate results and the validation job ID, so a team can approve and deploy the validated payload from another machine. The article stresses that Sandboxes remain useful for end-to-end checks and user-facing testing.

The Free tier costs nothing without a card and covers unlimited local test runs, gated deploys, Salesforce CLI pass-through and IDE integrations on one machine. Pro, which adds the daemon, parallel runs, debugger stepping, mutation testing and the MCP server across three machines, and Team are both free during the public beta. Their list prices are $19 per month and $49 per developer per month, and Enterprise starts at $20,000 per year.
