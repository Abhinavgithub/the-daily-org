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

The JetBrains plugin formerly listed as "Nimbus - Local Apex Runtime" is now Renmy Runtime - Salesforce IDE, version 1.15.1, following the October 2026 rename of the underlying runtime to renmy runtime. The article presents it as a way to bring a local Apex runtime into IntelliJ IDEA Community or Ultimate. The runtime executes Apex, SOQL, DML and Salesforce Flows on the developer's machine against an embedded PostgreSQL, without needing a Salesforce org, Scratch Org, Docker or a separate JVM. The author argues that Apex developers have never had the gutter run icons, breakpoints and local consoles that Java developers take for granted.

Setup is short. The plugin installs from the JetBrains Marketplace, and on first open of a project containing sfdx-project.json it installs its runtime into ~/.nimbus/bin. The Free tier needs no account. Each @IsTest class and method gets a run icon and Run, Debug, Coverage and Trace lenses, and results stream into IntelliJ's test tree with time and SOQL and DML counts per method. The plugin uses the same backends as the CLI, so a test that passes in the IDE should pass under renmy test in a terminal or CI. Debugging uses a native session with breakpoints in .cls and .trigger files, and a replay mode that can step backwards through a recorded run. Recording is free, while stepping is Pro and free during the public beta. The article points to a public parity record and a benchmark, which reports 837 tests running in about 2.4 seconds locally against roughly 1 minute 46 seconds in an org.

The tool window groups features into six workspaces: Home, Develop, Org, Verify, Release and Admin. Develop holds Apex and SOQL consoles that can target the local runtime or any org the CLI is logged into, along with Run and Compare and Find in All Orgs. Org covers browsing, drift detection, debug-log replay and a Data Loader that simulates CSV loads locally and reports rejected rows before any upload. Editing adds sixteen inspections, refactorings, generators, live templates and metadata shown as forms. Previews render React, LWC and Visualforce, though only 25 of 77 Apex: components are drawn fully.

The plugin is described as working alongside Illuminated Cloud. Its shortcuts sit in the Alt+Shift namespace to avoid collisions, and a Tools → Renmy setting decides which Apex file types it keeps when Illuminated Cloud is installed. The article presents the local loop as complementing a sandbox rather than replacing it, with renmy deploy validating the same code in the org before deploying. The Free tier is $0 for one machine, while Pro is free during the beta and listed at $19 a month afterwards.
