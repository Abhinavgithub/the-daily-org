---
title: Staging an AI agent's Salesforce access in three permission levels
original_title: "Read, propose, write: three permission levels for an AI agent working on Salesforce opportunities"
url: https://dev.to/juanma_garrido_1974/read-propose-write-three-permission-levels-for-an-ai-agent-working-on-salesforce-opportunities-1fcm
source: dev.to
source_type: community
date: 2026-11-18
section: agentforce-and-ai
personas:
  - architect
  - admin
  - developer
tags:
  - ai-agents
  - permission-sets
  - opportunity
  - field-level-security
  - mcp
  - data-quality
authors:
  - Juan Manuel Garrido
why_read: "You will learn a staged way to grant an AI agent access to Opportunity data: read first, then propose tasks, then write a few fields. You will also see how the staging exposes data gaps and undocumented exceptions before any record changes."
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The agent gains write access only after each lower level works
  steps:
    - "Level 1: read Opportunity and activities"
    - "Level 2: propose Tasks for the owner"
    - "Level 3: write a few fields"
  icons:
    - search
    - check
    - database
---

The author describes an AI agent that reviews Salesforce Opportunities with no activity for 30 days, checks recent interactions and prepares follow-up actions. The design question is what the agent is allowed to do, and the author splits this into three permission levels that the agent moves through only once the level below works.

At level 1 the agent only reads Opportunity, its activities and OpportunityHistory. It runs under its own integration user with a Permission Set limited to the objects and fields it needs, and any tool layer such as MCP exposes read tools only. Every query is logged with its filter. This level shows whether no movement is defined well, since LastActivityDate, stage changes in OpportunityHistory and LastModifiedDate give different lists, and LastModifiedDate also moves when a Flow, integration or bulk load touches a record.

At level 2 the agent proposes rather than edits, creating a Task for the Opportunity owner with the suggested next step, WhatId set to the Opportunity, OwnerId set to the owner and a subject prefix that marks it as agent-written. A person decides what happens. This level reveals exceptions, such as deals deliberately paused, which the agent cannot know unless they are stored in a field, and data gaps, such as calls logged outside Salesforce. The author suggests counting open Opportunities with no LastActivityDate and fixing the data before moving on.

At level 3 the agent writes a few fields, such as a next step or follow-up date, with field-level security keeping the rest read-only. Exceptions are encoded in the query, for example skipping records with a future resume date, and changes are tested in a sandbox with realistic data. Because the agent has its own user, LastModifiedById and field history separate its changes from people's. The author's point is that a wrong filter at level 3 corrupts every matching record at once, so the staging keeps mistakes cheap.
