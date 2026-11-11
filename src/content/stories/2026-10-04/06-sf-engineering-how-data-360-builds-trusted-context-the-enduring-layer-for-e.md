---
title: How Data 360 compiles governed context for artificial intelligence agents at production scale
original_title: "How Data 360 Builds Trusted Context: The Enduring Layer for Enterprise AI"
url: https://engineering.salesforce.com/how-data-360-builds-trusted-context-the-enduring-layer-for-enterprise-ai/
source: Salesforce Engineering
source_type: official
date: 2026-10-04
section: data-cloud
personas:
  - developer
  - architect
tags:
  - data-360
  - trusted-context
  - agent-context-engine
  - enterprise-ai-harness
  - ai-memory
  - zero-copy
authors:
  - Raveendrnathan Loganathan
  - Tobias Muehlbauer
why_read: Readers will understand how the Agent Context Engine retrieves, reconciles, and packages authorized evidence into token-efficient Context Packs for AI agents. The piece also explains how Data 360 separates runtime state from durable memory to maintain governance across models and channels.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 6
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/09/How-Data-360-Builds-Trusted-Context-The-Enduring-Layer-for-Enterprise-AI.png?w=1024
---

Salesforce Engineering describes how Data 360 assembles governed, authorized context for AI agents without loading an entire enterprise data estate into every prompt. The core challenge is identifying the requester, purpose, authority and freshness needs, retrieving evidence from structured and unstructured sources, reconciling conflicts, and applying access, masking, residency, consent and purpose controls, all within token, latency, freshness and cost budgets. Data 360 serves as a shared runtime foundation across Salesforce, platforms such as Databricks and Snowflake, operational systems and knowledge bases, with data kept authoritative where it lives through ingestion and Zero Copy. The article cites Q2 FY27 production usage of 104.3 trillion connected records, including 81.5 trillion Zero Copy rows.

The Agent Context Engine works in two directions. On the outbound path it moves through six runtime stages: Resolve (identify requester, agent, purpose, authority, entities and freshness), Plan (choose access paths such as relational, search, graph, RAG, streaming and federated), Reconcile (rank evidence while keeping conflicts visible), Govern (apply controls before retrieval or action), Compile (fit evidence, working state, memory and citations into a token-fit Context Pack and action contract), and Learn selectively (return typed interaction traces and decide what to promote, update or expire). On the inbound path, conversations, tool calls, decisions and outcomes return as traces for audit and evaluation. Only approved facts move into durable memory, and only validated outcomes become learnings.

Data 360 separates runtime state into four forms: working context for the current reasoning step, short-term memory for the active trace across turns, long-term memory for approved facts and commitments that belong to the enterprise, and learnings distilled from validated outcomes and corrections. The article stresses that a transcript is not automatically enterprise memory. Trusted Context sits within Salesforce's Enterprise AI Harness, alongside Trusted Models, Agency, Actions, Governance and Security, and the same governed context reaches Agentforce, custom and partner agents, and SaaS assistants through SDKs, API adapters, MCP and APIs. The authors also report performance results across production retrieval, high-concurrency queries, analytical SQL, ClickBench, TPC-derived and LDBC graph workloads, while noting these are not directly comparable. They propose an Agentic Context Benchmark, which would count a result only when the resulting action is both authorized and completed. New capabilities are planned to begin rolling out in early FY28, with availability varying by product, region and agreement.
