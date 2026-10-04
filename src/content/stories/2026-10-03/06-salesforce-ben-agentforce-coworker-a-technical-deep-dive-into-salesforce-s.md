---
title: "Agentforce Coworker setup, security and routing within AIforce"
url: https://www.salesforceben.com/agentforce-coworker-a-technical-deep-dive-into-salesforces-new-ai-teammate/
source: Salesforce Ben
source_type: community
date: 2026-10-03
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - agentforce-coworker
  - aiforce
  - data-360
  - agent-orchestration
  - security-model
  - salesforce-go
authors:
  - Ross Collie
why_read: It explains how Agentforce Coworker fits into the AIforce stack, how its routing and security model work, and gives a concrete setup path via Data 360 and Salesforce Go.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 7
model: inclusionai/ling-3.1-flash
image: "https://www.salesforceben.com/wp-content/uploads/2026/09/Agentforce-Coworker_-A-Technical-Deep-Dive-into-Salesforces-New-AI-Teammate-1024x576.png"
original_title: "Agentforce Coworker: A Technical Deep Dive into Salesforce’s New AI Teammate"
---

Agentforce Coworker is presented as one of three pillars of AIforce, the interface layer announced at Dreamforce '26 that sits on top of Agentforce, Customer 360 and Data 360. Its purpose is to reduce swivel-chairing between applications and to act as a router for a growing agentic workforce, so users do not have to know which agent handles which task. It offers three interaction modes: Find for natural-language queries across CRM, Slack, files, knowledge bases and 270+ connected sources; Catch Up for proactively surfacing changes that occurred while the user was away; and Plan and Act for outcome-level instructions that Coworker orchestrates across agents.

The article describes the trust model as reusing the existing Salesforce metadata-driven security: Profiles, Permission Sets and Sharing Rules still apply, so the agent operates under the same least-privilege constraints as users. Setup requires Data 360 to be enabled first, since it indexes CRM data and enforces governance, then assigning the Agentforce Coworker Admin Permission Set, enabling the feature through Salesforce Go, optionally granting additional data sources under Manage Data, and finally assigning the Agentforce Coworker User Permission Set to end users. The author cautions that orgs need clean data and properly configured permissions before enabling it, and notes the user-facing entry point is a new Ask button next to global search in Lightning Experience, with availability also in Microsoft Teams.
