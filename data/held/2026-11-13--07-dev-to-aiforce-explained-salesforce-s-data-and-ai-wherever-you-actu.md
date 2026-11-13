---
title: AIforce brings Salesforce data into Claude, Slack and Lightning through MCP
original_title: "AIforce Explained: Salesforce's Data and AI, Wherever You Actually Work"
url: https://dev.to/rohanmehta/aiforce-explained-salesforces-data-and-ai-wherever-you-actually-work-2j58
source: dev.to
source_type: community
date: 2026-11-13
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - aiforce
  - agentforce
  - headless-toolkit
  - mcp
  - agentforce-coworker
  - einstein-trust-layer
authors:
  - Rohan Mehta
why_read: You will learn how AIforce differs from Agentforce, which products it launched with, and why a user's existing permissions decide what their AI tools can see. Useful framing before you plan AI work on an org.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 5
model: anthropic/claude-haiku-5.5
---

AIforce is an official Salesforce term announced at Dreamforce in September 2026, and it is not a typo for Agentforce. Salesforce describes it as an approach rather than a single product: it brings Salesforce context into the tools people already use, such as Slack, a Salesforce org, or an agentic tool like Claude. Agentforce is Salesforce's product for building and running AI agents, while AIforce is the wider idea of putting Salesforce data and AI, Agentforce included, into everyday tools.

AIforce launched with three pieces. Claudeforce extends the Salesforce and Anthropic partnership through Salesforce in Claude, a prebuilt MCP server that includes 37 sales skills and is in beta. Slackforce brings Salesforce into Slack through Slackbot, Slack CRM and Slackforce Surfaces, which provides live views of Salesforce data. Agentforce Coworker is an AI teammate in the Lightning interface that can call existing Agentforce agents and can be switched on without a migration or a new permissions model.

Underneath, the Headless Toolkit separates Salesforce data and business logic from the browser screen so that AI tools and apps can use them directly. It includes MCP servers, skills and Agentic Setup, and Salesforce cites more than 60 new MCP tools and more than 30 coding skills. Salesforce says every request runs on existing permissions and business rules, and that the Einstein Trust Layer protects the data, though these are its own design claims to check in your environment.

For teams, the article's practical points are that more work will move into chat and AI assistants, so the state and organization of Salesforce data matters more, and that AI tools inherit each user's access, so overly broad sharing becomes more visible. Some pieces are still new, including Salesforce in Claude and the Headless 360 and Headless Toolkit names, so confirm current availability before planning around a feature.
