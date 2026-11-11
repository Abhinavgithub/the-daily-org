---
title: Salesforce Catalog gives AI assistants a live index of your org's metadata
original_title: With Salesforce Catalog, agents stop guessing how your org works
url: https://www.salesforce.com/blog/salesforce-catalog-ai-agents/
source: Salesforce Blog
source_type: official
date: 2026-11-11
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - salesforce-catalog
  - metadata-grounding
  - data-360
  - mcp-server
  - agentforce
authors:
  - Rekha Srivatsan
  - Upwan Chachra
why_read: You will learn what Salesforce Catalog indexes, how it grounds AI answers and code generation in your org's real object and field names, and how an admin enables it and connects an AI assistant or the Data 360 MCP server.
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Catalog lets an agent check the org's real names before it answers or writes code
  left:
    heading: Without Catalog
    points:
      - Agent guesses field names
      - Deploy fails on unused field
      - Engineer or Setup review needed
  right:
    heading: With Catalog
    points:
      - Agent searches the live index
      - Returns closest real matches
      - Answers only what user may see
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/image1_ee0631.png?strip=all&#038;quality=95
---

Salesforce Catalog is an index of how an org is built, covering Objects, Fields, Flows, Apex, Permission Sets, users, and Data 360 components such as data streams, calculated insights and segments. It updates as teams deploy changes, so no separate documentation has to be written or maintained. An AI assistant or agent consults the Catalog before answering, and every question runs as the signed-in user, so answers are limited to what that user may see.

The article gives examples from a service operations manager tracing a CSAT figure back to its source, a data owner checking what depends on a field before changing it, and a developer who avoids using an unused field name. Catalog matches questions by meaning as well as by name, returns a short ranked list of candidates, and lets the agent read details only for those, which the article says keeps responses fast in large orgs and reduces failed deploys.

An admin enables Catalog in Data Cloud Setup and turns on the MCP Server, then connects an AI assistant such as Claude, ChatGPT or Cursor, or Agentforce Vibes, which comes preconfigured. Teams building their own agents can use the Data 360 MCP Server, and Agent Context Engine uses Catalog to supply context. The article notes that Catalog is available in every edition that supports Data 360 and points to a setup guide for steps and permissions.
