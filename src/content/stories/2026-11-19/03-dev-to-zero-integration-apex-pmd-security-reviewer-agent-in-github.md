---
title: Building a read-only Apex PMD and security reviewer agent in GitHub Copilot
original_title: Zero-Integration Apex PMD & Security Reviewer Agent in GitHub Copilot
url: https://dev.to/anigitsource/zero-integration-apex-pmd-security-reviewer-agent-in-github-copilot-5ahm
source: dev.to
source_type: community
date: 2026-11-19
section: devops
personas:
  - developer
  - architect
tags:
  - apex
  - pmd
  - github-copilot
  - code-review
  - security
  - custom-agents
authors:
  - AninditaSFCode
why_read: You will learn how to define a Copilot custom agent that audits Apex for PMD and OWASP-style security issues inside the IDE, without external integrations. You will also see the review output format and the tool restrictions that keep the reviewer read-only.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
---

The article argues that static analysis of Apex usually runs too late, in a CI pipeline that fails a pull request after the developer has finished the work. In locked-down enterprise orgs, adding external AI review bots or webhooks is often blocked by security approval, so the author proposes a review agent that stays inside the existing GitHub Copilot boundary.

The agent is a declarative Markdown file, a .agent.md, stored in .github/agents/ for team sharing or in ~/.copilot/agents/ for personal use. It has a YAML header that gives its name, description and permitted tools, here restricted to search and fetch so the agent cannot modify files. The body is a system prompt that lists the rules to check, such as ApexCRUDViolation, ApexSOQLInjection, OperationWithLimitsInLoop and AvoidHardcodingId, grouped by security, performance, architecture and test quality.

The author gives a sample service class with a concatenated dynamic SOQL string, no sharing keyword, no user-mode enforcement and a DML statement inside a loop. The agent reports each issue with a severity, the rule name, the file and line, a short explanation and a compliant fix. The article closes with three team practices: keep shared conventions in copilot-instructions.md, restrict reviewer tools to read and search, and keep deterministic Salesforce Code Analyzer runs in the pull-request pipeline for audit trails.
