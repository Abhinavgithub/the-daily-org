---
title: Updated Agentforce Memory policy roughly doubles recall of changing facts
original_title: "Double recall: Inside the Agentforce Memory update"
url: https://www.salesforce.com/news/linked-content/double-recall-inside-the-agentforce-memory-update/
source: Salesforce News
source_type: official
date: 2026-11-08
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - agentforce-memory
  - agent-memory-evaluation
  - memory-policy
  - convomem
  - agentforce
authors:
  - Itai Asseo
  - Egor Pakhomov
why_read: You will learn how Salesforce AI Research measured Agentforce Memory end to end and how a change to the memory policy, not the architecture, raised recall of stated and updated facts. You will also see why an update should replace an existing fact rather than sit beside it.
interest_score: 6
depth_score: 4
novelty_score: 6
utility_score: 5
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The updated memory policy compared with the policy it replaced, on the live evaluation
  left:
    heading: Previous policy
    points:
      - Stated facts recalled at baseline
      - Changed facts recalled at baseline
      - Updates filed as extra facts
  right:
    heading: Updated policy
    points:
      - 1.8 times as many stated facts
      - 2.2 times as many changed facts
      - Updates treated as corrections
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/image-18.png
held_from: 2026-11-05
---

Salesforce AI Research built an evaluation framework that generates long, multi-session conversations with specific facts planted along the way, runs them through the live Agentforce system, and then asks questions that depend on those facts. Testing the full path, from the moment a customer mentions something to the moment the agent acts on it, is the basis for the results. The conversations come from ConvoMem, a public benchmark released in 2025.

The framework was used to improve Agentforce Memory, which became generally available in September. The gain came from an updated memory policy that keeps more of what a customer says and treats an update as a correction to an existing fact rather than an extra fact filed alongside it. The underlying architecture is unchanged. On the live evaluation, the new policy recalls 1.8 times as many stated facts and 2.2 times as many facts that change over time compared with the policy it replaced.

The article argues that measuring in production matters because memory only shows its behavior under real conditions, and that the evaluation separates failure to save a fact from failure to use it. A travel platform customer is cited as using the improved memory in an employee-facing agent that summarizes cases, drafts emails and updates CRM records.
