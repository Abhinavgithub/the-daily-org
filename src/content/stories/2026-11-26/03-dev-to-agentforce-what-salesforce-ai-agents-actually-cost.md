---
title: What Agentforce costs per action, and why agent design sets the bill
original_title: "Agentforce: What Salesforce AI Agents Actually Cost"
url: https://dev.to/mecanik-dev/agentforce-what-salesforce-ai-agents-actually-cost-1fhc
source: dev.to
source_type: community
date: 2026-11-26
section: agentforce-and-ai
personas:
  - architect
  - admin
tags:
  - agentforce
  - flex-credits
  - pricing
  - agent-design
  - data-cloud
  - compliance
authors:
  - Norbert E. Boros
why_read: You will learn how Flex Credits and per-conversation pricing compare, the break-even point of about 20 actions per conversation, and how grounding quality and action design drive consumption. You will also see the budget traps around Data 360, testing and month-three invoices.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Flex Credits and Conversations break even at 20 actions per conversation
  left:
    heading: Flex Credits
    points:
      - 20 credits per standard action
      - GBP 0.08 per action in production
      - Three to five actions per conversation typical
  right:
    heading: Conversations
    points:
      - Flat GBP 1.60 per conversation
      - Cheaper only above 20 actions
      - Fixed, forecastable unit cost
---

Agentforce is priced by consumption rather than per seat, so the cost depends on how many actions the agent takes. The article explains the two options: Flex Credits at USD 500 or GBP 400 per 100,000 credits, with a standard action consuming 20 credits, and Conversations at a flat USD 2 or GBP 1.60 each. At GBP 0.08 per standard action, the two models break even at 20 actions per conversation, so Flex Credits are cheaper for almost any well-designed agent that needs three to five actions.

The author describes the reasoning loop behind an agent, which classifies a message against subagents, runs actions, checks results and may loop up to seven times. Because the path is chosen at runtime, weak grounding and narrow actions raise the number of actions and therefore the bill. A worked UK retail example shows the same work costing GBP 288 a month on Flex Credits against GBP 1,920 on Conversations, and roughly doubling when the design averages six actions instead of three.

The piece also flags costs outside the agent: Data 360 processing, speech metering for voice, and testing runs that consume credits in a sandbox. It covers guardrails, escalation design and common failures such as deflection measured by session end and surprise bills after pilot credits run out. It closes with the Agentforce versus custom build decision, compliance points under the EU AI Act and UK GDPR, and indicative implementation costs.
