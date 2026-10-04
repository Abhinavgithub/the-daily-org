---
title: Salesforce engineers use Agent Graph to keep AI-drafted Prompt Templates reliable
url: https://engineering.salesforce.com/how-deterministic-controls-turn-ai-output-into-reliable-prompt-templates/
source: Salesforce Engineering
source_type: official
date: 2026-10-03
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - agent-graph
  - prompt-builder
  - llm-orchestration
  - grounding
  - structured-output
  - human-in-the-loop
authors:
  - Vaibhav Raizada
  - Kumar Kasimala
why_read: "This explains how Salesforce keeps LLM-assisted prompt creation deterministic: graph-controlled routing, server-side record identity mapping, and sentinel-tagged structured output. It is useful if you are designing any AI feature where model output must remain safe and schema-valid."
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 7
model: inclusionai/ling-3.1-flash
image: "https://engineering.salesforce.com/wp-content/uploads/2026/10/image.png"
original_title: How Deterministic Controls Turn AI Output Into Reliable Prompt Templates
---

Salesforce engineers describe building Assistive Authoring for Prompt Builder, which turns a plain-English requirement into a working Prompt Template in under a minute instead of the roughly 25 minutes an experienced admin needs today. The core risk they targeted was not obviously bad output but plausible-looking templates that break at runtime because the model invented a field, corrupted a record ID, or returned malformed metadata.

The solution uses Agent Graph to split the work into a router node and three specialized sub-agents for generating, refining, and clarifying requests. State variables carry client-supplied and runtime context, bound inputs pass only what each tool needs, and four backend tools run in a fixed sequence with a beforeReasoning hook that fetches grounding before the model loop starts, cutting latency by removing a model decision from the critical path.

Deterministic boundaries protect the three failure points. The model can signal intent through a state variable, but the graph evaluates guards before changing nodes. The model never touches record IDs; it writes stable developer names and a server-side transpose layer maps them back to real records and IDs. Template metadata is wrapped in sentinel tags, the client extracts and parses only that payload, and parse failures return errors rather than guesses.

Grounding is handled by a discovery service that normalizes SObject fields, flows, Apex-backed providers, and search retrievers into one consistent shape, runs in the current user's context with field-level readability filtering, and reduces the result to an allowlist the model must select from. Safety is enforced by making output a draft only: the agent has no tool to save, publish, or execute, content becomes typed editor blocks with escaped interpolation, and the admin accepts or rejects a diff before anything is saved.
