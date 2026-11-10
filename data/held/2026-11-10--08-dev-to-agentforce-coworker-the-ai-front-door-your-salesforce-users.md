---
title: Agentforce Coworker is switched on in some orgs, so check it before users ask
original_title: "Agentforce Coworker: The AI Front Door Your Salesforce Users Actually Need"
url: https://dev.to/rohanmehta/agentforce-coworker-the-ai-front-door-your-salesforce-users-actually-need-1hgl
source: dev.to
source_type: community
date: 2026-11-10
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - agentforce-coworker
  - agentforce
  - sharing-rules
  - permission-sets
  - ai-rollout
authors:
  - Rohan Mehta
why_read: The reader will learn what Agentforce Coworker does, how to find out whether it is already enabled in their org, and why sharing and permissions should be reviewed before rollout.
interest_score: 6
depth_score: 4
novelty_score: 5
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A suggested order for rolling out Agentforce Coworker in an org
  steps:
    - Check whether Coworker is already on
    - Review sharing and fix over-broad access
    - Build a few focused agents
    - Tell users what Coworker can do
  icons:
    - search
    - lock
    - robot
    - mail
---

Agentforce Coworker is described as Salesforce's AI assistant for employees, sitting in the search bar and routing user requests to specialist agents. Without well-built agents it can still answer questions from org data but can do little else. The article says it reached general availability at Dreamforce and that more than 185,000 people use it.

The article notes that from August 10, 2026, Salesforce automatically turned on Coworker for customers with unmetered user-based AI seats, which can be checked under Setup, Agentforce Coworker. HIPAA, health and life sciences, and government orgs were not auto-enabled, and Coworker is not covered by the HIPAA Business Associate Addendum. Pricing is said to depend on contract terms.

The main warning is that Coworker respects each user's existing permissions and Sharing Rules, so it will surface any over-broad access quickly. The suggested rollout is to check the enablement setting, review sharing first, build a few focused agents for common requests such as renewal risk and case status, and tell users what the assistant can and cannot do.
