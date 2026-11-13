---
title: AIforce exposes Salesforce configuration to outside agents through MCP and the Headless Toolkit
original_title: Introduction to AIforce for Admins
url: https://admin.salesforce.com/blog/2026/introduction-to-aiforce-for-admins
source: Salesforce Admins Blog
source_type: official
date: 2026-11-13
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - aiforce
  - headless-toolkit
  - mcp
  - agentforce
  - agent-script
  - salesforce-guardian
authors:
  - Joshua Birk
why_read: You will learn what AIforce and the Headless Toolkit expose from your org, the five tools that make it up, and how the security model applies to agents acting as users. You will also see what admins should review before opening the org to external agents.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: parts
  caption: The Headless Toolkit has five parts that expose org configuration outward
  whole: Headless Toolkit
  parts:
    - MCP servers
    - APIs
    - Skills
    - Plugins
    - Developer tools
  icons:
    - plug
    - code
    - doc
    - layers
    - gear
---

Salesforce's AIforce strategy lets people work with Salesforce from the tools they already use, such as Slack, Claude and other AI clients, rather than only from the Salesforce UI. The article places AIforce as the interface layer above Data 360, Customer 360 and Agentforce. It stresses that the Lightning UI, Reports and Dashboards are not going away.

The Headless Toolkit, formerly called Headless 360, is the set of technologies that makes this work. It has five parts: MCP servers, which use OAuth and may be Salesforce-hosted or custom; APIs, including the Agent API and the platform data APIs; skills, which are instruction folders that AI clients load for a task; plugins, which package skills with commands and MCP connections; and developer tools such as the Salesforce CLI, Agentforce Vibes and the declarative Agent Script format. The article says this is an umbrella over existing capabilities rather than a new product, citing 60+ MCP tools, 4,000+ APIs and 220+ CLI commands.

For developers building external applications, there are two routes: the Headless Experience Layer, which renders workflows natively in channels such as Slack, WhatsApp, voice or mobile, or direct calls to the APIs and MCP tools with a custom UI. Either way, the flows, data models and guardrails configured in the org are what they build on.

On security, the article says Sharing Rules, field-level security and Permission Sets are respected however data is accessed, and that calls pass through the Trust Layer. Every call carries identity, access, capability and governance controls, so Validation Rules, triggers and governor limits still apply. Because an agent can do anything the acting user can do, the article advises reviewing profiles and Permission Sets before exposing the org. Agentic Identity, where agents have their own permissions and credentials, is described as planned for the near future.
