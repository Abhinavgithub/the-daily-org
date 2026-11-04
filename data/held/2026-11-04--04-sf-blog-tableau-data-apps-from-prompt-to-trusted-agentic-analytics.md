---
title: Tableau Data Apps bring governed agentic analytics to vibe-coded apps
original_title: "Tableau Data Apps: From Prompt to Trusted Agentic Analytics"
url: https://www.salesforce.com/blog/tableau-data-apps-from-prompt-to-trusted-agentic-analytics/
source: Salesforce Blog
source_type: official
date: 2026-11-04
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - tableau-data-apps
  - tableau-mcp
  - tableau-next
  - agentic-analytics
  - tableau-semantics
  - vibe-coding
authors:
  - Dr. Anushka Anand
  - Joe Constantino
why_read: You will learn what a Tableau Data App is, where it can be built and published, and how it inherits Tableau's security, semantics and refresh model. The piece is a product overview in beta, so the detail on setup is thin.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The four steps to get a Tableau Data App from prompt to shared link
  steps:
    - Connect your agent via MCP
    - Prompt your intent
    - Preview, iterate and verify
    - Publish and share
  icons:
    - plug
    - code
    - test
    - rocket
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Data-Apps_creation-paths.png?strip=all&#038;quality=95
---

Tableau Data Apps, now in beta, are custom interactive analytical web apps hosted and powered by the Tableau platform. They separate the visual front end from the query engine, so builders can use AI agents to produce apps quickly while the apps still draw on Tableau's semantics, connectivity and governance. The article argues that visualization was never the hard part, and that without an analytics platform agent-built apps risk guessing at business definitions, running slow and costly query loops, and leaking credentials or data.

Apps can be built in Tableau Studio or with any third-party agent connected through the Tableau MCP server or Tableau Next MCP server. Apps built in Tableau Studio publish to Tableau Cloud or Server, while apps built with third-party agents can publish to Tableau Cloud, Server or Tableau Next. Inside Tableau Cloud and Server, apps sit in workbooks and query Published or Embedded Data Sources, and in Tableau Next they sit in workspaces and use Tableau Semantics.

Data freshness comes from live connections or scheduled extract refreshes, and federated queries let apps reach heterogeneous sources without copying data. Database credentials stay in Tableau, and object-level and row-level security apply to every user. The getting-started steps are to connect an agent, prompt the intent, preview and verify the logic, then publish and share.
