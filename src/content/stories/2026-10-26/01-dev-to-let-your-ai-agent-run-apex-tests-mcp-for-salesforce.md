---
title: Running Apex tests locally so AI coding agents can iterate on them
original_title: "Let your AI agent run Apex tests: MCP for Salesforce"
url: https://dev.to/oblitus/let-your-ai-agent-run-apex-tests-mcp-for-salesforce-9f
source: dev.to
source_type: community
date: 2026-10-26
section: devops
personas:
  - developer
  - architect
  - admin
tags:
  - apex-testing
  - mcp
  - ai-agents
  - local-runtime
  - claude-code
  - devops
authors:
  - René Knierim
why_read: You will learn why coding agents stall on Apex when every test run needs a Salesforce org, and how a local Apex runtime exposed through an MCP server gives an agent a fast write-run-fix loop. You will also see the boundary the article draws around deployment.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Agent loop against a Salesforce org versus against a local Apex runtime
  left:
    heading: Against an org
    points:
      - Deploy class to an org
      - Wait, then start test run
      - Poll until finished
      - Minutes per cycle
  right:
    heading: Against a local runtime
    points:
      - Run tests on the machine
      - Read structured results
      - Fix and rerun
      - Seconds per cycle
  icons:
    - cloud
    - rocket
figure_image: /figures/2026-10-26/01-dev-to-let-your-ai-agent-run-apex-tests-mcp-for-salesforce.png
---

The article argues that AI coding agents stall on Salesforce Apex because Apex only runs inside a Salesforce org, so each test cycle means deploying, waiting, polling and parsing logs, which can take minutes and requires org credentials. Agents then either stop iterating and hand back untested code, or keep going at a high cost in time and tokens. The author's published benchmark puts four open-source Apex suites, 837 tests in total, at about 1 minute 46 seconds to deploy and run in an org, against 2.4 seconds locally. The piece also notes that Nimbus was renamed renmy runtime in October 2026, with the same binary and the MCP server name nimbus kept.

The proposed fix is renmy runtime, a local Apex runtime that executes classes, triggers, SOQL, DML and Salesforce Flows against an embedded PostgreSQL, with no org, sandbox, Docker or JVM. The author says it enforces governor limits and mirrors platform behaviour such as Test.startTest and Test.stopTest, and that it is not a mock or a transpiler, though it does not achieve perfect parity. Its renmy mcp command runs as a stdio child process of the agent, so no port or credential is needed. The exposed tools include run_apex_tests, explain_failure, get_coverage, get_execution_trace, execute_anonymous and list_test_classes, which return structured results rather than logs to parse. Setup is a one-line install, a test run in the project, and registration with Claude Code, Cursor or GitHub Copilot.

A worked example shows an agent adding a discount rule to an invoice service: it lists existing tests, writes a method and test, runs the suite, uses the failure explanation to find a status filter bug, fixes it, and uses coverage to add a boundary test, all within seconds and without touching an org. The author also connects this to Salesforce Headless 360, where Apex hooks such as InvocableMethod and RestResource become tools for Agentforce or external agents, and says the runtime can test that underlying Apex offline.

The article draws a firm boundary around deployment. A green local run is necessary but not sufficient, because the org holds Permission Sets, managed packages, Validation Rules and other teams' automation that a repository does not contain. The agent should not deploy on its own. renmy deploy runs local gates, then a real check-only validation in the org before deploying, while renmy release validate and renmy release deploy add a human approval step and an immutable receipt between the two. The Free tier covers unlimited local test runs, and the MCP server is a Pro feature that is free during the public beta.
