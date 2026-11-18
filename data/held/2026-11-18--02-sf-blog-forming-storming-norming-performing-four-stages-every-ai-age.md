---
title: Agent Optimizer guides Agentforce agents through build, test, fix and improve stages
original_title: "Forming, Storming, Norming, Performing: Four Stages Every AI Agent Goes Through"
url: https://www.salesforce.com/blog/improve-ai-agents/
source: Salesforce Blog
source_type: official
date: 2026-11-18
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - agent-optimizer
  - agentforce
  - agent-script
  - ai-agent-lifecycle
  - a-b-testing
authors:
  - Ishmehar Chawla
why_read: You will see how Agent Optimizer moves an Agentforce agent from first build through production monitoring, root-cause fixes and A/B testing. You will also learn which of these features are still in beta or coming soon.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: timeline
  caption: Agent Optimizer moves an agent through four repeating stages, not a single launch
  events:
    - when: Forming
      label: Build the agent and pass custom-scored tests
    - when: Storming
      label: Rank production problems across real sessions
    - when: Norming
      label: Trace root cause and draft a fix
    - when: Performing
      label: Prove the fix with A/B tests and keep it
  icons:
    - doc
    - warning
    - search
    - check
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/AdobeStock_1511565478.jpeg?strip=all&#038;quality=95
---

The post borrows Bruce Tuckman's model of forming, storming, norming and performing to describe how an AI agent matures. Forming covers building the agent and proving it is ready before it meets customers. Agent Optimizer drafts the agent in Agent Script from a plain-language description, combining deterministic business rules with Atlas Reasoning Engine planning, and builds on existing Salesforce data, Flows, Apex and permissions. Testing with custom scorers is described as coming soon.

Storming is the period after launch, when real customers expose gaps. Agent Optimizer reads production sessions one by one and ranks recurring problems behind escalations, abandonment and low satisfaction. With session tracing enabled, it reads the reasoning trace for each response, showing the topic chosen, actions called, knowledge retrieved and citations. The post says Agent Optimizer is included at no extra cost for standard use cases.

Norming means finding and fixing the cause. Agent Optimizer traces each issue to the exact step where it failed, classifies it as a broken action, knowledge gap or off-topic request, and recommends a fix such as a clearer instruction, a new topic or a knowledge article. It can build and, once testing arrives, test the fix, with the team choosing how much it acts on its own.

Performing covers proving improvements. A/B experimentation, also coming soon, runs a change on a slice of live traffic against the current agent, judged by the same custom scorers, before a winning version ramps to all traffic. Each proven fix stays in the agent's configuration, and the post says the cycle restarts whenever something changes. The post notes Agent Optimizer is in beta and points readers to their account executive and the help documentation.
