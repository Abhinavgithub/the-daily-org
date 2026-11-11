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

Salesforce's Winter '27 release introduced Flow Test Mode, a dedicated testing canvas for Autolaunched and Record-Triggered Flows that is currently in beta. It is enabled through the Process Automation Settings page in Setup, and the author recommends trying it in a sandbox first. Within the new canvas, builders can debug by record Id or name, test primitive collection variables by separating values with semicolons, and save reusable Test Scenarios with labels, descriptions and run options such as rollback mode. Scenarios can be run manually or set to automatic, with assertions checking expected results, such as whether an element was visited or a field has a given value, and with the choice of which flow versions to test. Mock outputs let builders supply fabricated responses for external action elements, so tests can run without calling the endpoint and can force success or fault paths.

The author highlights practical uses: rerunning a scenario that reproduces a bug until it is fixed, using saved assertions for regression testing after org changes while watching coverage and results, and testing integrations without configuring live connections. He also explains deployment: FlowTest is its own metadata type, separate from the flow, so tests must be packaged and deployed individually. Currently a flow can be deployed without its tests, making them a nice-to-have rather than an enforced requirement as Apex tests are, and the author hopes enforcement will come once the feature reaches general availability.

The piece concludes that Flow Test Mode still falls well short of Apex testing, which requires at least 75% coverage before production deployment and cannot be bypassed, while flows can currently be built directly in production. Mock outputs are a point-and-click analogue of Apex's HttpCalloutMock approach, and the Test Discovery API can run Apex and flow tests together. Overall, the author sees the feature as a significant and promising step for Flow, though it is still in beta.
