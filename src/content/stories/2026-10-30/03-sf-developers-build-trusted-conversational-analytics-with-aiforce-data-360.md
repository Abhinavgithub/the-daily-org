---
title: Building a shared semantic model for conversational analytics with Data 360 and Tableau semantics
original_title: Build Trusted Conversational Analytics with AIforce, Data 360, and Tableau Semantics
url: https://developer.salesforce.com/blogs/2026/10/build-trusted-conversational-analytics-with-aiforce-data-360-and-tableau-semantics
source: Salesforce Developers Blog
source_type: official
date: 2026-10-30
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - data-360
  - tableau-semantics
  - osi-yaml
  - semantic-query-api
  - agentforce
  - mcp
authors:
  - Ravindra Varshney
why_read: You will learn the workflow for defining business metrics in OSI YAML, converting them to a Tableau SDM, validating and querying the model, and exposing it to Agentforce and MCP clients. The piece gives the concrete API commands needed to do this.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The workflow runs from ingested data through the OSI specification to a queryable semantic model
  steps:
    - Ingest CRM data into DLOs
    - Define metrics in OSI YAML
    - Convert to SDM JSON
    - Create and validate the model
    - Query via Semantic Query API
  icons:
    - database
    - doc
    - gear
    - check
    - search
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261028231000/Generic-B-7-1-e1793254214616.png?w=1000
figure_image: /figures/2026-10-30/03-sf-developers-build-trusted-conversational-analytics-with-aiforce-data-360.png
---

The post argues that AI agents need a shared semantic layer so that terms such as revenue and pipeline are defined once and reused across reports, applications and agent answers. Data 360 ingests CRM records into data lake objects, and a Tableau semantic data model adds relationships, metrics and calculations on top of them. Business context is captured first in an OSI YAML specification, which the Salesforce converter translates into an initial SDM JSON file.

The article walks through creating, validating and querying the model with Salesforce APIs, including the converter command, the model creation and validation requests, and a semantic gateway query. It also covers business preferences that steer agent terminology and scope, and verified questions created through Q&A Calibration to make answers more consistent. Agentforce and Claude connected through MCP are shown answering the same pipeline question from the same model.

The post notes that governance through Data 360 classifications, tags and policies can limit access to sensitive data. Its conclusion recommends starting from one business question, defining its terms, validating results, and then extending the shared foundation to more questions and agents.
