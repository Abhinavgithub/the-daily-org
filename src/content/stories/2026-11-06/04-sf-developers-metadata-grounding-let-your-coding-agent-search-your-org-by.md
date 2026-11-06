---
title: Metadata Grounding lets coding agents search your org's Metadata by intent
original_title: "Metadata Grounding: Let Your Coding Agent Search Your Org by Intent"
url: https://developer.salesforce.com/blogs/2026/11/metadata-grounding-let-your-coding-agent-search-your-org-by-intent
source: Salesforce Developers Blog
source_type: official
date: 2026-11-06
section: architecture
personas:
  - developer
  - architect
  - admin
tags:
  - metadata-grounding
  - mcp-server
  - salesforce-catalog
  - coding-agents
  - data-360
authors:
  - Gonzalo Gambino
why_read: You will learn how the Metadata Grounding MCP Server indexes org metadata, how to connect it, and how to use describe, search and query so agents reuse existing components instead of rebuilding them.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The three Metadata Grounding tools run in order, so the agent checks the org before writing code
  steps:
    - "describe_metadata: list types and schemas"
    - "search_metadata: find items by intent"
    - "query_metadata: read the full record"
  icons:
    - layers
    - search
    - doc
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261104084827/Generic-A-11-e1793810926525.png?w=1000
figure_image: /figures/2026-11-06/04-sf-developers-metadata-grounding-let-your-coding-agent-search-your-org-by.png
---

Coding agents working through a local project only see the metadata that has been retrieved, so they can miss components that already exist in the org and build duplicates. The Metadata Grounding MCP Server (Beta) addresses this by searching a pre-indexed catalog of org metadata, covering more than 70 types, by natural-language intent rather than by name.

The server exposes three read-only tools: describe_metadata to list types and schemas, search_metadata to find items by meaning with type filters, and query_metadata to return full records. It runs on Salesforce Catalog, which combines a vector index with a keyword index and returns only what the authenticated user may access. The post recommends a describe, search, then query pattern, and notes that search finds candidates while query confirms them.

The post walks through two examples in a sample food delivery org. In the first, a bug report with no field or class name leads the agent to a controller and a Lightning Web Component. In the second, the agent finds an existing review-summary Apex class and extends it instead of writing a new one. It also covers setup requirements, Beta status, and how the standalone server differs from the Headless 360 MCP Server, where the same capability arrives through Discover and Dispatch tools.
