---
title: Preparing your org for the Claudeforce partnership and new billing model
original_title: "Claudeforce by Salesforce and Anthropic: What Ships, How It Works, and How to Prepare"
url: https://cloudodyssey.com/blog/claudeforce-by-salesforce-and-anthropic-what-ships-how-it-works-and-how-to-prepare/
source: Cloud Odyssey
source_type: community
date: 2026-10-09
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - claudeforce
  - agentforce
  - mcp-server
  - flex-credits
  - aiforce
  - salesforce-in-claude
authors:
  - Cloud Odyssey
why_read: Readers will learn how to configure the Salesforce in Claude plugin, audit permissions for agentic access, and prepare for the November billing model using Flex Credits and agent registration.
interest_score: 8
depth_score: 8
novelty_score: 9
utility_score: 7
model: qwen/qwen3.7-flash
image: https://cloudodyssey.com/wp-content/uploads/2026/10/Salesforce-Multi-Cloud-Implementation-Strategy-Guide-3.png
figure:
  kind: steps
  caption: Five checks to prepare your Salesforce org for Claudeforce and AIforce billing
  steps:
    - Audit Permission Sets and profiles
    - Clean the fields the skills read
    - Keep approvals on
    - Pilot in a sandbox
    - Name an owner for connections
figure_image: /figures/2026-10-09/07-cloud-odyssey-claudeforce-by-salesforce-and-anthropic-what-ships-how-it-wo.webp
---

The Claudeforce partnership expands the collaboration between Salesforce and Anthropic by embedding Claude into Agentforce and Slack while introducing a Salesforce plugin for Claude that includes thirty-seven prebuilt sales skills. The plugin operates under existing Salesforce permissions and requires seller approval before writing changes, with data remaining within the Salesforce Trust Boundary.

Administrators must configure an External Client App to enable the Salesforce MCP server, since standard Connected Apps are not supported. The setup process involves requesting beta access through AgentExchange, configuring organization settings in Claude, and ensuring each user signs in with their own credentials. Default security controls keep actions routed through Salesforce to enforce business rules.

A new billing and identity framework called AIforce, originally announced as Headless 360, introduces agent registration and metering through Flex Credits starting in November. Every successful call over MCP or direct APIs counts as a Headless Platform Interaction, though sandboxes and Scratch Orgs are exempt. Traditional integrations retain their current pricing and security models.

Teams should conduct a permission audit, clean critical fields like opportunity stages and close dates, and run a controlled sandbox pilot before production rollout. Planning an owner for MCP connections and evaluating model selection across workflows will help manage consumption and ensure consistent agent behavior.
