---
title: Testing Salesforce Flows locally with renmy runtime before activation
original_title: Test Salesforce Flows locally before you activate them
url: https://dev.to/oblitus/test-salesforce-flows-locally-before-you-activate-them-229n
source: dev.to
source_type: community
date: 2026-10-29
section: devops
personas:
  - admin
  - developer
tags:
  - flow-testing
  - local-runtime
  - renmy-runtime
  - order-of-execution
  - apex-triggers
authors:
  - René Knierim
why_read: You will learn how to run Record-Triggered Flows and Apex triggers on a local machine, catch order-of-execution overlaps before activation, and what the runtime does not cover.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A local test run replaces repeated sandbox rounds for checking flow and trigger behaviour
  steps:
    - Retrieve flow into project folder
    - Write test creating and closing record
    - Run renmy test locally
    - Fix overlap, rerun in seconds
    - Activate and review in sandbox
  icons:
    - flow
    - test
    - gear
    - clock
    - shield
figure_image: /figures/2026-10-29/01-dev-to-test-salesforce-flows-locally-before-you-activate-them.png
---

renmy runtime, formerly called Nimbus until its October 2026 rename, is a local Salesforce Apex runtime. It executes Apex, SOQL, DML and Salesforce Flows (Autolaunched, Record-Triggered and Screen Flows) on a developer's own computer against an embedded database, with no org, sandbox or Scratch Org involved. The article argues that testing flows in a shared sandbox is slow and risky: other people's automation fires alongside yours, test data disappears after refreshes, and overlaps between a flow and an Apex trigger on the same object often surface only after activation. Running locally, a Record-Triggered Flow fires together with the object's triggers in the platform's order of execution, so overlaps show up in milliseconds.

The article walks through an example: a Record-Triggered Flow that creates a follow-up Task when an Opportunity is set to Closed Won, alongside an older Apex trigger that also creates a Task. A developer retrieves the flow file into the project folder with the Salesforce CLI. They then write a short Apex test that creates an Account and an Opportunity, moves the stage to Closed Won, and asserts that exactly one Task exists with the expected subject. The admin can read that test as an acceptance criterion. Running renmy test with the test name, or with "" for every test, reports the result. If the trigger also creates a Task, the assertion fails with two Tasks, revealing the overlap. The fix is either to remove the trigger's logic or to add an entry condition to the flow, and the rerun takes about a second. Once the flow is ready, renmy deploy runs the local checks before anything reaches the org.

The same runtime is available through a browser-based Dev UI started with renmy dev, which offers a test runner, schema browser and coverage explorer. A VS Code extension adds run buttons above each test, and a JetBrains plugin does the same in IntelliJ IDEA, including its Community edition, and can display a flow as a graph. The article is clear about the limits. The runtime executes a Screen Flow's logic but does not render its screens, so layout, labels and conditional visibility must be checked in a sandbox with a user. It reproduces platform rules closely but is not Salesforce itself, and permissions, page layouts and user acceptance still require an org. The Free tier includes unlimited local test runs on one machine, with no account or card required.
