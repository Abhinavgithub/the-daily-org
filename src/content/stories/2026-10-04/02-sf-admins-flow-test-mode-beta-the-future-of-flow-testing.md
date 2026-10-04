---
title: Salesforce introduces beta Test Mode for Flow debugging and regression testing
original_title: "Flow Test Mode (Beta): The Future of Flow Testing"
url: https://admin.salesforce.com/blog/2026/flow-test-mode-beta-the-future-of-flow-testing
source: Salesforce Admins Blog
source_type: official
date: 2026-10-04
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - flow-testing
  - test-mode
  - regression-testing
  - mock-data
  - agentforce
authors:
  - Adam White
why_read: You will learn how to enable and use the new Test Mode beta to save, reuse, and automate Flow validation without leaving the builder. You will also understand upcoming capabilities like element mocking, test coverage tracking, and Agentforce powered troubleshooting.
interest_score: 8
depth_score: 6
novelty_score: 8
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20260928102907/Screenshot-2026-09-28-at-12.28.48%E2%80%AFPM-235x300.png
figure:
  kind: compare
  caption: How Test Mode consolidates Flow debugging and automated testing
  left:
    heading: Traditional Approach
    points:
      - Debug button only for troubleshooting
      - Testing and debugging require separate actions
      - Manual checks lack reusable configurations
      - Cluttered design canvas during validation
  right:
    heading: Test Mode Workspace
    points:
      - Dedicated view replaces Debug button
      - Merges debugging and automated testing
      - Saves runs as reusable manual test scenarios
      - Converts manual tests to regression tests with assertions
---

Salesforce has released a beta version of Test Mode, a dedicated workspace that replaces the traditional Debug button in Flow Builder. This update merges debugging and automated testing into a single interface, requiring administrators to enable the feature through Process Automation Settings before it becomes available for Record-triggered and autolaunched flows.

The new workspace allows builders to save execution runs as reusable manual test scenarios. These saved configurations preserve triggering records, input variables, and mocked outputs. Administrators can now supply static record identifiers for poorly searchable objects and populate primitive collections directly in the test panel. Once validated, these manual scenarios can be transformed into permanent regression tests by attaching expected results.

Test Mode also introduces element mocking, which simulates outputs for subflows and external actions to keep testing isolated from live endpoints. The roadmap includes Winter '27 enhancements such as visual test coverage tracking on the canvas and Agentforce powered capabilities. These future features will synthesize transaction context to diagnose cross automation failures and automatically generate comprehensive test scenarios with isolated data silos.
