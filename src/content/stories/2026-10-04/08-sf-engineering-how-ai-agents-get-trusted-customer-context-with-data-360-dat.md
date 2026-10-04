---
title: How Data 360 data graphs deliver trusted customer context to Agentforce
original_title: How AI Agents Get Trusted Customer Context with Data 360 Data Graphs
url: https://engineering.salesforce.com/how-ai-agents-get-trusted-customer-context-with-data-360-data-graphs/
source: Salesforce Engineering
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - architect
  - developer
tags:
  - data-360
  - data-graphs
  - agentforce
  - identity-resolution
  - performance-optimization
authors:
  - Scott Nyberg
why_read: Readers will learn how the engineering team partitions and indexes Data 360 data graphs to resolve complex customer identities while maintaining strict data isolation. You will also see the architectural tradeoffs used to achieve sub-two-hundred millisecond response times for Agentforce interactions.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 6
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/09/image_dfb7b3.png
---

The engineering team built Data 360 data graphs to solve the context gap for Agentforce by unifying fragmented customer data across accounts, entitlements, and products. Instead of running multiple queries at runtime, the system pre-aggregates relationships into cohesive data products that agents can call directly.

Resolving customer identity required a partitioned architecture that keeps the broader identity graph separate from customer success views. This ensures that prospect data and information belonging to different tenants remain strictly isolated while still supporting complex many-to-many relationships.

Performance was optimized by analyzing access patterns, designing smaller multi-graphs, and building targeted indices to avoid full table scans. The team shifted from static data models to flexible structures that support semantic search and unpredictable agent queries, ultimately achieving median response times under two hundred milliseconds without dedicated autoscaling infrastructure.
