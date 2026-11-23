---
title: Testing least-privilege write access for a Salesforce AI agent in five layers
original_title: "An AI Agent Has Salesforce Write Access: A Least-Privilege Test Plan"
url: https://dev.to/dhruvjoshi9/an-ai-agent-has-salesforce-write-access-a-least-privilege-test-plan-2e35
source: dev.to
source_type: community
date: 2026-11-23
section: agentforce-and-ai
personas:
  - architect
  - admin
  - developer
tags:
  - agentforce
  - least-privilege
  - prompt-injection
  - permission-sets
  - apex-user-mode
  - security-testing
authors:
  - Dhruv Joshi
why_read: You will learn a five-layer test plan for checking what a Salesforce AI agent can write, including negative tests and a prompt-injection scenario. You will also see why authorization must be enforced in the action rather than in the model prompt.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Each write must pass server-side checks before Salesforce data changes
  steps:
    - Load Case as the agent user
    - Check verified contact and status
    - Reject if any check fails
    - Update Case only when all pass
  icons:
    - database
    - shield
    - lock
    - check
---

The article opens with the SalesBleed research, in which a poisoned lead manipulated Agentforce. It argues that giving an AI agent write access creates a new security boundary between natural-language instructions and business data, and that a valid Permission Set does not authorize every change. It proposes testing five layers: identity, actions, fields, records and execution.

It then sets out a reference least-privilege matrix for a support agent that may move Cases from New to Working. The agent should run as a dedicated user with object and field limits, change only the Status field, act only on records linked to a verified customer, and be denied uncontrolled system-mode writes. The author labels this an illustrative test asset rather than measured results.

Six pre-production tests follow: verifying the runtime identity, auditing every write path including Apex, Flows and OAuth scopes, confirming field and record restrictions, validating business rules, and comparing record state before and after each test. The article suggests release criteria such as zero unauthorized CRM writes across negative tests and traceable authorization for every successful write.

The adversarial section simulates a lead carrying fake administrator instructions. The article argues that prompt injection must be blocked at the action boundary by checking identity, target record, fields and transitions server-side. A short pseudocode example shows a policy check using a verified contact ID. The piece closes with notes on Summer '26 user-mode defaults for Apex database operations and a final checklist.
