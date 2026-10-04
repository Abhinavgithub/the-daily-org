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

Enterprises face a significant context problem when feeding AI agents because loading all enterprise data into prompts wastes tokens, increases latency, and risks exposing sensitive information. Salesforce addresses this with Data 360, which acts as a shared runtime foundation to compile current, relevant, and authorized evidence without duplicating the entire data estate across platforms.

The Agent Context Engine operates bidirectionally to assemble token-fit Context Packs for outbound agent turns while returning typed interaction traces for auditing on the inbound path. It manages four distinct memory states, separating temporary working context and short-term traces from approved long-term memory and distilled learnings to ensure only validated facts persist across sessions.

The platform supports a distributed enterprise model where data remains authoritative in external systems like Databricks and Snowflake while participating through ingestion or Zero Copy federation. Pro-code agents can integrate via SDKs and API adapters, while third-party assistants connect through standard protocols, all unified under the Enterprise AI Harness for consistent governance, security, and observability.
