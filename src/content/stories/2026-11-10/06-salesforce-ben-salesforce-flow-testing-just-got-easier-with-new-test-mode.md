---
title: Flow Test Mode adds saved Test Scenarios, assertions and mock outputs to Flow Builder
original_title: Salesforce Flow Testing Just Got Easier With New Test Mode
url: https://www.salesforceben.com/salesforce-flow-testing-just-got-easier-with-new-test-mode/
source: Salesforce Ben
source_type: community
date: 2026-11-10
section: flow-and-admin
personas:
  - admin
  - developer
  - architect
tags:
  - flow-test-mode
  - flow-builder
  - test-scenarios
  - mock-outputs
  - winter-27
authors:
  - Ross Collie
why_read: You will learn how to create and save Flow test scenarios, add assertions and mock external action outputs, and why these tests are not yet enforced at deployment. The piece also notes that FlowTest is a separate metadata type to include when deploying.
interest_score: 8
depth_score: 8
novelty_score: 8
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a saved Test Scenario runs automatically with assertions
  steps:
    - Save Test Scenario with inputs
    - Enable Automated Test Scenario
    - Add assertions and mock outputs
    - Run All for coverage and results
image: https://www.salesforceben.com/wp-content/uploads/2026/11/ftm1.webp
figure_image: /figures/2026-11-10/06-salesforce-ben-salesforce-flow-testing-just-got-easier-with-new-test-mode.png
---

Winter '27 introduces Flow Test Mode, a dedicated testing view in Flow Builder for Autolaunched and Record-Triggered Flows. It is currently in beta and covered by Salesforce's Beta Terms of Use, and must be enabled from Process Automation Settings in Setup. Builders can save reusable Test Scenarios with input values, run them manually or automatically, and re-run them without reentering debug variables.

Automated scenarios can include assertions, such as checking that an element was visited or that a variable equals an expected value, and can be limited to chosen flow versions. Mock outputs let a test return a fabricated response from an external callout, so tests run consistently without contacting the endpoint and can force the success or fault path.

The author notes that FlowTest is its own metadata type, so tests must be packaged separately from the flow. Currently a flow can be deployed without its tests, which makes Test Scenarios a nice-to-have rather than an enforced requirement like Apex tests.
