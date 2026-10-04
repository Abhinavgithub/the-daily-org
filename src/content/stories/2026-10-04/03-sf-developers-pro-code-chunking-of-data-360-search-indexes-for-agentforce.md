---
title: Use custom Python chunking to improve Agentforce retrieval accuracy in Data 360
original_title: Pro-Code Chunking of Data 360 Search Indexes for Agentforce
url: https://developer.salesforce.com/blogs/2026/09/pro-code-chunking-of-data-360-search-indexes-for-agentforce
source: Salesforce Developers Blog
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - data-360
  - agentforce
  - rag
  - vector-search
  - code-extension
  - chunking
authors: []
why_read: You will learn how to deploy Python-based Code Extension functions to override default chunking in Data 360 search indexes. The guide demonstrates how structure-aware splitting preserves table headers and speaker labels, resulting in more accurate Agentforce responses.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20260923153645/Generic-A-9-e1790203022778.png?w=1000
---

Default character or token splitters fracture complex enterprise documents like financial reports and call transcripts, causing Agentforce to retrieve contextless chunks. The article explains how Data 360 Code Extension functions allow developers to run custom Python scripts within the Salesforce trust boundary to implement tailored chunking logic.

For fragmented data tables, standard chunking strips column headers, leaving raw numbers meaningless to the model. A custom function detects table boundaries and repeats header rows across sub-chunks, enabling the agent to correctly map values to metrics like revenue and operating margins.

Multispeaker dialogues suffer when speaker turns merge into massive unstructured blocks. By applying a sliding window approach with defined turn counts and character limits, adjacent chunks overlap to preserve conversational context. The author validates these techniques by querying both native and custom vector indexes and comparing the resulting Agentforce answers against identical user prompts.
