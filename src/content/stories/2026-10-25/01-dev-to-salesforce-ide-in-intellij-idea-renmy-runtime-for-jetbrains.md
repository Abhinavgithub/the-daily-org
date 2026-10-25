---
title: A local Apex runtime and debugger now runs inside IntelliJ IDEA
original_title: "Salesforce IDE in IntelliJ IDEA: renmy runtime for JetBrains"
url: https://dev.to/oblitus/salesforce-ide-in-intellij-idea-renmy-runtime-for-jetbrains-3bp2
source: dev.to
source_type: community
date: 2026-10-25
section: devops
personas:
  - developer
  - architect
tags:
  - local-apex-runtime
  - intellij-idea
  - apex-testing
  - apex-debugging
  - jetbrains-plugin
authors:
  - René Knierim
why_read: You will learn how the renmy runtime JetBrains plugin runs Apex tests and debugs Apex locally in IntelliJ IDEA, what it needs, and how it fits alongside an org-based workflow and Illuminated Cloud.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Apex work with and without a local runtime in IntelliJ IDEA
  left:
    heading: Org-based workflow
    points:
      - Save and deploy to an org
      - Wait for the test to run
      - Download and read a debug log
      - No breakpoints to stop on
  right:
    heading: Local runtime workflow
    points:
      - Run icon beside each test
      - Tests run locally in under a second
      - Native debugger with breakpoints
      - Consoles run against local data
  icons:
    - cloud
    - rocket
figure_image: /figures/2026-10-25/01-dev-to-salesforce-ide-in-intellij-idea-renmy-runtime-for-jetbrains.png
---

The renmy runtime, formerly Nimbus, is a local Apex runtime that executes Apex, SOQL, DML and Salesforce Flows on a developer's machine against an embedded PostgreSQL database, without needing a Salesforce org, Scratch Org or Docker. Its JetBrains plugin, version 1.15.1, brings this into IntelliJ IDEA Community or Ultimate, adding a run icon beside each Apex test, a native debugger with breakpoints, Apex and SOQL consoles, and a tool window with six workspaces.

The article argues that Apex developers have lacked the fast local test and debug loop that Java developers take for granted, since the compiler, database and test runner all live in an org. The plugin installs its runtime on first open of a Salesforce DX project and the Free tier needs no account. It coexists with Illuminated Cloud, and the article states that tests run through the plugin behave the same as under the renmy test command in a terminal or CI.

The article also covers the tool window's workspaces, data loading that simulates loads locally before writing to an org, org drift and retrieval, editing aids such as inspections and refactorings, and the pricing tiers, with Pro features free during the public beta. The author cites a public parity record and a benchmark for the claims made.
