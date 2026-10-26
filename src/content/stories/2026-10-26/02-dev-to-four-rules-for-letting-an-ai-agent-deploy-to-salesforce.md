---
title: Four rules for constraining an AI agent that deploys to Salesforce
original_title: Four rules for letting an AI agent deploy to Salesforce
url: https://dev.to/madebyasking/four-rules-for-letting-an-ai-agent-deploy-to-salesforce-bh7
source: dev.to
source_type: community
date: 2026-10-26
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - ai-agents
  - metadata-deploy
  - sf-cli
  - validation-rules
  - approval-gates
authors:
  - Made by Asking
why_read: "You will learn a design for letting an AI agent handle Salesforce deploys safely: a fixed action menu, approval gates, org-checked results and logged, capped runs. The reader comes away with a concrete set of guardrails to consider."
interest_score: 6
depth_score: 6
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The agent works through three human approval gates before production changes
  steps:
    - Plan reviewed and approved
    - Check-only validation in production
    - Human clicks to deploy
    - Org queried to verify results
  icons:
    - doc
    - check
    - person
    - search
---

The author argues that the slow part of a Salesforce deploy is usually assembling the package, choosing tests and target org, and interpreting failures, which are language tasks suited to a model. Deployment itself is not, so the agent is designed around four rules.

First, the model never touches an org. It receives no credentials, shell or sf CLI access, only a fixed menu of actions such as validate, deploy, run tests, query and retrieve. Code checks its parameters and performs the action with the sf CLI and git.

Second, humans approve at three points: the plan, which shows components, target org, tests and risk; a changed plan, when a retry alters components or scope; and production, where a check-only validation runs before a human deploys, including destructive changes. Sandbox steps run automatically while everything stays green. Third, success is verified by querying the org, not taken from the model, and the summary is written from that evidence table. Fourth, every run is logged, with a cost cap and a limit of three retries.

The model's role is limited to turning a request into a reviewable plan and turning a failed deploy into a plain explanation, such as a test that does not set a new checkbox and so trips a new Validation Rule.
