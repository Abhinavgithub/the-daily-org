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

Coding agents working on a Salesforce org often build new components because they only see the part of the org that has been retrieved into a local project. The Metadata Grounding MCP Server (Beta) addresses this by searching a pre-indexed catalog of the whole org's metadata, so an agent can check what already exists before writing code. It is one of three pieces in the Headless Toolkit, alongside Skills, which teach patterns, and the Headless 360 MCP Server, which lets the agent act. Metadata Grounding answers the question of what is currently in the org. It is read-only, runs as the authenticated user so it returns only what that user may access, and covers more than 70 core metadata types, though not Data 360 metadata.

The server exposes three tools: describe_metadata lists available types and their schemas, search_metadata finds components by natural-language intent with optional type and subtype filters, and query_metadata returns the full record for a result. The recommended workflow is describe, then search, then query. Behind it, Salesforce Catalog extracts metadata from the org, stores it in a Data 360 data lake object mapped to a Catalog data model, and indexes it with a hybrid of vector and keyword search. Catalog updates supported types incrementally and runs a full refresh every 24 hours, so very recent deployments may take time to appear.

The article illustrates two uses in Pronto, a sample food delivery org. In the first, a vague bug report about a non-working menu category was traced to an Apex controller and a Lightning Web Component found by describing the symptom, with the type filter narrowing noisy results. In the second, an agent found an existing Apex class with a summarize-reviews action and extended it rather than building a duplicate. The article advises adding a project rule telling agents to search the org first. It also covers setup: an org with a supported Data 360 edition, Salesforce Catalog enabled, and admin activation of the server, with the server available either standalone for any MCP client or inside the Headless 360 MCP Server, which will later be renamed the Salesforce MCP Server. Caveats include that search only finds candidates, which should be confirmed by query; the server does not return source code; and usage is metered in production but not in pre-production orgs. Planned additions are AI-generated metadata descriptions and a Metadata Graph for dependency analysis.
