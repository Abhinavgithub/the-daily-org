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
figure_image: /figures/2026-10-29/01-dev-to-test-salesforce-flows-locally-before-you-activate-them.png
---

The article presents renmy runtime, a local Salesforce Apex runtime that executes Apex, SOQL, DML and autolaunched, record-triggered and Screen Flows against an embedded database on a developer's own computer. Triggers on the same object run in the same transaction in the platform's order of execution, so overlaps between a Flow and a trigger surface in milliseconds rather than after activation.

The author argues that testing Flows in a shared Sandbox is slow and risky: shared data, invisible order of execution and minutes per round trip. The worked example tests a Record-Triggered Flow that creates a follow-up Task when an Opportunity closes, alongside an older Apex trigger. A short Apex test creates the records, moves the Opportunity to Closed Won and asserts that exactly one Task exists. If both the Flow and the trigger create a Task, the assertion fails and the overlap is found before activation.

The runtime is run from a terminal with renmy test, or through a browser-based Dev UI, VS Code or IntelliJ IDEA. It does not render Screen Flow screens, does not fully replace Sandbox review, and is described as reproducing platform rules rather than being Salesforce itself. The Sandbox remains necessary for activation, user testing, permissions and sign-off.
