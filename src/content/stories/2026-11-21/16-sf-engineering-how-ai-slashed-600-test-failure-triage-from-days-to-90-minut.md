---
title: How an MCP tool cut triage of 600 test failures to about 90 minutes
original_title: How AI Slashed 600-Test-Failure Triage From Days to 90 Minutes
url: https://engineering.salesforce.com/how-ai-slashed-600-test-failure-triage-from-days-to-90-minutes/
source: Salesforce Engineering
source_type: official
date: 2026-11-21
section: devops
personas:
  - developer
  - architect
tags:
  - test-failure-triage
  - mcp
  - fastmcp
  - claude-code
  - soap-login-retirement
  - gus
authors:
  - Shireen Nagdive
  - Riya Suri
why_read: You will learn how Salesforce engineers split deterministic code from AI reasoning in an MCP workflow that clusters and reassigns test failures, and which guardrails prevented duplicate work items and misrouting. The reasoning is useful even if you never touch the GUS internals.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The workflow runs through four stages, from retrieval to reassignment
  steps:
    - Retrieve failures
    - Gather context from stack traces
    - Detect patterns or apply categories
    - Reassign individually, in bulk or by team
  icons:
    - search
    - code
    - layers
    - flow
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/image-ab61eade.png
held_from: 2026-11-18
---

Salesforce's engineering team faced over 600 test failures triggered by the retirement of the SOAP API login mechanism. Expected failures and genuine regressions could produce similar exceptions and span several scrum teams, so a wrong classification could hide a real defect or send engineers chasing the wrong problem for days. The existing process required manual stack trace reading and reassignment through an interface limited to 50 failures at a time, and it could create duplicate work items or misroute failures.

The team built AI-Assisted Test Failure Buddy as a Python and FastMCP process exposing eight tools to Claude Code or Cursor, connected to the APIs behind GUS, Salesforce's internal work item system. The design separates an interface layer of typed MCP tools, a core logic layer that controls API calls, identifiers, parsing, validation, batching, clustering and reassignment, and a support layer for authentication and tokens. The workflow runs in four stages: retrieve failures, gather context from stack traces, detect patterns or apply categories, and reassign failures individually, in bulk or by team.

Grouping was the hardest part. Stack traces offer no stable key for root cause, and the same exception type could mean an expected SOAP login failure in one context and an unrelated bug in another. The team combined deterministic processing, such as regular-expression matching and a preset recognizing strings like INSUFFICIENT_ACCESS, with AI reasoning reserved for novel traces, unmatched clusters and ambiguous ownership. To avoid duplicates, the tool assigns related failures to one existing work item and uses explicit failure IDs in place of the broader interface action that had caused misrouting.

The estimated two or three days of manual triage for one 600-failure work item fell to roughly one to one and a half hours for a single engineer. The tool has since been used by three or four teams, though it has no adoption telemetry yet. The article also notes that Claude Code helped build the tool, starting from a markdown design document with human review throughout.
