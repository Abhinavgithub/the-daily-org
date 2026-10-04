---
title: Use Agentforce Vibes to audit and update field descriptions for agents
original_title: Use Agentforce Vibes to Find and Fix Metadata Gaps
url: https://admin.salesforce.com/blog/2026/use-agentforce-vibes-to-find-and-fix-metadata-gaps
source: Salesforce Admins Blog
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - agentforce
  - vibes-ide
  - metadata-management
  - field-descriptions
  - ai-assisted-workflows
authors: []
why_read: Readers will learn how to use the Agentforce Vibes IDE to automatically inspect Custom Field metadata, identify missing or conflicting descriptions, and apply approved updates without navigating Setup pages.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20260908152324/Screenshot-2026-09-08-at-5.22.56%E2%80%AFPM-300x148.png
---

Preparing metadata for an Agentforce agent requires reviewing objects, fields, and flows rather than cleaning up the entire org. The article introduces the Agentforce Vibes IDE as a conversational workspace where administrators can query and evaluate configuration data efficiently.

By running targeted prompts in plan mode, Vibes retrieves field metadata and flags Custom Fields with ambiguous labels, missing descriptions, or mismatched business concepts. The system generates evidence-based findings and drafts proposed descriptions while strictly avoiding unsupervised modifications.

Administrators review the AI suggestions, approve valid updates through the interface, and separate genuine cleanup candidates from fields that simply require business clarification. The workflow concludes with bulk updates via CSV attachment or individual conversational commands, allowing teams to maintain human oversight while accelerating metadata preparation.
