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

The article argues that poor chunking, not the language model, is often the real cause when an Agentforce agent misses details from a PDF or misreads a conversation, because retrieved snippets lose their context before the model sees them. Native Data 360 chunking (section-aware and semantic passage extraction) works well for standard content, but it struggles with complex multipage PDFs, dense tables and multispeaker transcripts when character or token-based splitters are used. Code Extension functions let developers deploy sandboxed, stateless Python chunking logic inside the Salesforce trust boundary, authored with the Data Custom Code SDK, deployed via the Salesforce CLI or UI, and wired into search index creation. The authors caution that their regex and pattern-based examples are illustrative happy-path code, not production-grade, and can produce false positives and negatives.

The piece tests three scenarios, comparing native chunks with custom ones. In a quarterly financial report, native splitting left numbers stranded without their column headers, making a growth-rate question unanswerable; a structure-aware function that detects table boundaries and repeats headers in sub-chunks lets the agent give a precise segment comparison. In a recorded escalation call with five speakers, native chunking produced unattributed walls of text, while a sliding-window function over speaker turns (window of 6 turns, stride of 3, capped at 1,500 characters) kept questions with their answers and preserved speaker names and timestamps, so the agent could identify a contractual downtime commitment. In a regulated-sector document, native chunking exposed SSNs, card numbers, emails, phone numbers, medical record numbers and other identifiers in the vector index; a regex pass before chunking masked the standard formats, though proprietary identifiers such as medical record, payer member, case and token numbers passed through until organization-specific patterns were added. The conclusion is that Code Extension is an escalation path for complex data rather than a replacement for native chunking, and it points developers to the documentation, the Code Extension setup in Data 360 and a video playlist to get started.
