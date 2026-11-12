---
title: Salesforce Koa, a reasoning model trained on CRM work, is in pilot
original_title: "Salesforce Koa Explained: A CRM Reasoning Model Built for Agentforce"
url: https://dev.to/rohanmehta/salesforce-koa-explained-a-crm-reasoning-model-built-for-agentforce-nk0
source: dev.to
source_type: community
date: 2026-11-12
section: agentforce-and-ai
personas:
  - architect
  - admin
  - developer
tags:
  - koa
  - agentforce
  - reasoning-model
  - agent-model-selection
  - crm-benchmarks
authors:
  - Rohan Mehta
why_read: You will learn what Koa is, the role a reasoning model plays inside an Agentforce agent, and how Salesforce's own benchmark results compare it with GPT-4.1 and GPT-5.5. You will also see why those results need independent confirmation before you rely on them.
interest_score: 6
depth_score: 5
novelty_score: 7
utility_score: 5
model: anthropic/claude-haiku-5.5
figure:
  kind: numbers
  caption: Koa's results on Salesforce's own internal CRM benchmark, reported in the paper
  numbers:
    - value: 87%
      label: Koa multi-step CRM tasks completed
    - value: 82%
      label: GPT-4.1 multi-step CRM tasks completed
    - value: 91%
      label: GPT-5.5 multi-step CRM tasks completed
---

Salesforce announced Koa at Dreamforce 2026 as its first AI reasoning model built specifically for CRM work. Inside an agent, the reasoning model decides which steps to take, in what order, and which tools to use, while the rest of the agent carries them out. Koa runs behind the scenes, and admins choose it for an agent the same way they choose any other model.

Salesforce argues that general-purpose models reason from scratch on every task and may not behave the same way twice, whereas CRM work is largely repetitive and rule-based. It claims a model trained on that work will be steadier, and that it should be better at recognising its own limits and saying when it cannot do a job. The article notes that Salesforce claims three times fewer errors on CRM tasks, but does not say which models it was compared against, and the paper does not contain that figure.

The paper's own numbers are more mixed. On multi-step CRM tasks Koa completed 87%, against 82% for GPT-4.1 and 91% for GPT-5.5. On a single-step CRM score it reached 0.87, against 0.81 and 0.90. Koa beats GPT-4.1 but trails GPT-5.5 slightly, and all results come from Salesforce testing its own model, with no independent evaluation yet.

Salesforce says Koa was trained on simulated and public data only, and it does not replace other models, which stay available for each agent. Koa is still in pilot, so most orgs cannot switch to it yet. The article suggests building a small test set of real agent tasks with known-good outcomes now, so Koa can be compared fairly when it arrives, and it stresses that clean data matters more than the model.
