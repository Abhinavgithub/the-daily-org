---
title: Connecting Data Cloud to Agentforce Studio to build an agentic RAG pipeline
original_title: "Building Agentic RAG: Connecting Data Cloud to Agentforce Studio (Part 2)"
url: https://salesforcebreak.com/2026/10/22/agentic-rag-data-cloud-agentforce-studio/
source: Salesforce Break
source_type: community
date: 2026-10-23
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - agentforce
  - data-cloud
  - prompt-builder
  - rag
  - custom-retriever
authors:
  - Sinan Kırım
why_read: Readers will learn how to configure a custom retriever in Agentforce Studio, create a Flex Prompt Template in Prompt Builder, and deploy a subagent that grounds responses in live Data Cloud vector data.
interest_score: 6
depth_score: 7
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://salesforcebreak.com/wp-content/uploads/2026/10/Building-Agentic-RAG-Connecting-Data-Cloud-to-Agentforce-Studio-Part-2.png
---

The article explains how to configure a custom retriever in Agentforce Studio to fetch vectorized chunks from a Data Cloud data model object. It details setting result limits, mapping target fields, and activating the retriever so it can be referenced elsewhere.

Next, it walks through creating a Flex Prompt Template in Prompt Builder by modifying a standard knowledge template. The author shows how to add the retriever as an action, bind the query parameter, and write strict instructions that force verbatim source extraction and handle missing data gracefully.

Finally, the piece covers assembling an Agentforce Service Agent, keeping only essential routing subagents, and linking the custom Prompt Template as an action. The author validates the workflow by testing destination queries and confirming the agent returns accurate, grounded answers sourced directly from the live Data Cloud index.
