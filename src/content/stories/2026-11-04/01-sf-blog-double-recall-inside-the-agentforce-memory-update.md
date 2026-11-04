---
title: Agentforce Memory policy update roughly doubles recall of stated and changing facts
original_title: "Double recall: Inside the Agentforce Memory update"
url: https://www.salesforce.com/blog/agentforce-memory-update/
source: Salesforce Blog
source_type: official
date: 2026-11-04
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - agentforce-memory
  - agent-memory-policy
  - end-to-end-evaluation
  - convomem
  - agentforce
authors:
  - Itai Asseo
  - Egor Pakhomov
why_read: You will learn how Salesforce AI Research measured agent memory end to end and that a revised memory policy, not an architecture change, roughly doubled recall in Agentforce. You will also see how a policy that treats updates as corrections differs from one that files them as new facts.
interest_score: 6
depth_score: 4
novelty_score: 6
utility_score: 5
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The updated memory policy compared with the one it replaced
  left:
    heading: Previous policy
    points:
      - Keeps less of what customers say
      - Files an update as an extra fact
  right:
    heading: Updated policy
    points:
      - Keeps more of what customers say
      - Treats an update as a correction
---

Salesforce AI Research built an evaluation framework that generates long, multi-session conversations with specific facts planted along the way, runs them through the live Agentforce system, and then asks questions that depend on those facts. Testing the full path, from the moment a customer mentions something to the moment an agent acts on it, is presented as what makes the result trustworthy. The conversations come from ConvoMem, a public benchmark released in 2025.

The framework was used to improve Agentforce Memory, which became generally available in September. The updated memory policy holds on to more of what a customer says and treats an update as a correction to something the agent already knows, rather than as an additional fact stored alongside the first. According to the article, the policy recalls 1.8 times as many explicitly stated facts and 2.2 times as many facts that change over time compared with the policy it replaced. The underlying architecture is unchanged.

The authors argue that measuring in production matters because memory only behaves like memory under real conditions, and they cite a travel platform customer whose employee-facing agent now carries context across conversations. The article is largely promotional and gives few methodological details beyond the headline ratios.
