---
title: Data 360 connects to Snowflake through Zero Copy without moving data
original_title: "Data 360 × Snowflake: Powering the Agentic Enterprise with Zero Copy"
url: https://www.salesforce.com/blog/data360-snowflake/
source: Salesforce Blog
source_type: official
date: 2026-10-31
section: data-cloud
personas:
  - architect
  - admin
  - developer
tags:
  - data-360
  - snowflake
  - zero-copy
  - iceberg
  - horizon-catalog
  - agent-context-engine
authors:
  - James Nakashima
why_read: You will learn what the Zero Copy v2 connector exposes in Snowflake, which pieces are generally available versus in preview, and how governance and private connectivity are handled across the two platforms.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Data moves from enterprise data to action in four stages, as the article frames Data 360's role
  steps:
    - Connect enterprise data
    - Give it shared meaning
    - Turn it into trusted context
    - Act on it in agents
  icons:
    - database
    - layers
    - doc
    - robot
---

Salesforce describes Data 360 as a context layer for AI agents, and presents its Zero Copy partnership with Snowflake as the way to reach governed data where it already lives rather than copying it through ETL pipelines. The article reports more than 1,000 joint customers running workloads with native Zero Copy, and presents this as the basis for Agent Context Engine, which combines structured data, unstructured content, knowledge graphs and agent memory.

The technical changes are the substance here. The v2 Zero Copy connector presents Data 360 objects as native Apache Iceberg tables inside a customer's Snowflake account, queryable with SQL and usable with Streams and Dynamic Tables for near real-time change capture. OpenID Connect authentication secures access. Expanded Zero Copy with Horizon Catalog adds direct file federation with Snowflake-managed Iceberg tables, and Data 360 Private Connect Multicloud allows Data 360 on AWS to reach Snowflake on Azure without public internet traffic.

Availability is staged. The v2 connector and Private Connect for Snowflake on Azure are generally available, Expanded Zero Copy with Horizon Catalog and Snowflake Cortex Agents are in public preview, and the Salesforce and Informatica MCP servers in Cortex are in private preview. Tableau support for Snowflake semantic views is planned for general availability in early 2027.
