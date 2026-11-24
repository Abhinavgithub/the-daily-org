---
title: Precomputing and scoping customer context for AI agents with Data 360 Data Graphs
original_title: "5 Lessons in AI Context Engineering: Why More Context Is Not Better"
url: https://engineering.salesforce.com/5-lessons-in-ai-context-engineering-why-more-context-is-not-better/
source: Salesforce Engineering
source_type: official
date: 2026-11-24
section: agentforce-and-ai
personas:
  - architect
  - developer
tags:
  - ai-context-engineering
  - data-360
  - data-graph
  - calculated-insight
  - agent-data-privacy
  - data-spaces
authors:
  - Akshay Sharma
why_read: You will learn how Salesforce's Help Agent gets fast, authorized customer context from Data 360 Data Graphs, and why precomputing entitlements, scoping graphs, and separating authorization from retrieval matter. The post gives latency figures and a validation approach you can adapt.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Customer context is prepared upstream, then retrieved by key at conversation time
  steps:
    - Authorize the signed-in user's permitted tenant
    - Precompute entitlements with calculated insights
    - Organize results into purpose-built data graphs
    - Retrieve the graph by key in one lookup
    - Fetch full case history only when needed
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/5-Lessons-in-AI-Context-Engineering-Why-More-Context-Is-Not-Better.png
figure_image: /figures/2026-11-24/02-sf-engineering-5-lessons-in-ai-context-engineering-why-more-context-is-not.png
---

Salesforce's engineering team describes the problem of giving an AI agent exact, authorized customer answers quickly when the underlying data is spread across orders, products, provisioning records and cases. Their earlier options, runtime calls to source systems, warehouse joins and retrieval-augmented generation, each carried latency or accuracy costs, and similarity search cannot reliably confirm that an entitlement is active. Their answer was a Data 360 Data Graph: a prejoined, per-customer JSON view built ahead of time and retrieved by key through the Data Graph API.

The post sets out five lessons. First, precompute customer context before the agent asks, using Calculated Insights to derive active products, filter cancelled orders and normalize product names, with freshness thresholds set for each source. Second, organize graphs around the questions agents ask, grouping information used together and keeping slower-changing scores separate. The team reports production median lookup latency below 200 milliseconds, and a storage comparison that cut average latency from 2.2 to 1.1 seconds at five concurrent callers.

Third, enforce privacy in the architecture rather than in the prompt: a customer-success Data Space, agents reading only Data Graphs, and an authorization service that supplies the permitted tenant key before retrieval. Fourth, supply relevant structured facts by default, such as entitlements and open-case counts, and retrieve full transcripts only when a question needs them. Fifth, package Data Graph definitions as Data 360 Data Kits, promote them through environments, and run reusable validation checks for keys, uniqueness, completeness and freshness. Those checks caught 2,765 tenants with missing or mismatched account IDs before release.

The authors are candid that their benchmarks come from different endpoints and workloads and are not one controlled experiment, so the figures should be read with that in mind.
