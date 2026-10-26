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

AI coding agents work well in Python and TypeScript because they can run code and read results in a second or two, dozens of times per task. With Apex, every test run requires deploying to a Salesforce org and waiting minutes for results, and agents respond by either stopping to iterate or spending a lot of time on each round trip.

The article presents renmy runtime, a local Apex runtime that executes Apex, SOQL, DML and Salesforce Flows on a developer's machine against an embedded PostgreSQL, without an org, sandbox or Docker. Its renmy mcp command runs as a stdio child process of the agent and exposes tools such as run_apex_tests, explain_failure, get_coverage, execute_anonymous and list_test_classes. The author describes a worked session in which an agent adds a discount rule, finds a failing assertion through the explain output, fixes it and adds a boundary test, all without touching an org. The article states that a typical Apex test runs in tens of milliseconds and that an 837-test benchmark ran in 2.4 seconds locally against roughly 1 minute 46 seconds in an org.

The author is explicit that a local pass is not sufficient for deployment, since orgs contain metadata and automation a repository does not. Deployment is routed through renmy deploy, which validates the same bytes in the org before deploying, or through renmy release validate and renmy release deploy, which keep a human approval step in between.
