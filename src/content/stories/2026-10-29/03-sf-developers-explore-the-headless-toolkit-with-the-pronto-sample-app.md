---
title: Pronto sample App shows how to build Headless Agentforce experiences
original_title: Explore the Headless Toolkit with the Pronto Sample App
url: https://developer.salesforce.com/blogs/2026/10/explore-the-headless-toolkit-with-the-pronto-sample-app
source: Salesforce Developers Blog
source_type: official
date: 2026-10-29
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - headless-toolkit
  - hosted-mcp-servers
  - agentforce
  - headless-experience-layer
  - pronto-sample-app
authors:
  - Philippe Ozil
why_read: You will see how one sample app wires Agentforce agents, custom MCP servers and HXL widgets together, and which tool types and latency trade-offs to weigh when exposing Salesforce logic to external clients.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the Pronto employee assistant reaches users across surfaces
  steps:
    - Agentforce agents and actions in the org
    - Hosted MCP Servers expose the tools
    - External Client App connects the client
    - Third-party agent renders HXL widgets
  icons:
    - robot
    - server
    - plug
    - chart
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261027121345/SingleHeadshot-12-e1793128438212.png?w=1000
---

The Pronto sample app is an open-source example built on the Headless Toolkit, set around a fictional food delivery platform. It ships two Agentforce agents: an employee assistant and a customer service assistant. Both are orchestrator agents that share a storefront explorer assistant as a connected subagent, which shows how multi-agent orchestration can transfer conversations and reuse subagents without losing context.

The app also demonstrates exposing business logic through Salesforce Hosted MCP Servers. Its employee MCP server offers several tool types: Apex tools built from invocable actions, an Apex REST tool for storefront search registered through the API Catalog, and an Agentforce agent exposed as a custom MCP tool. The article notes that the agent-as-tool adds latency, because Agentforce makes further LLM calls after the first call to the MCP server.

Pronto is delivered to several surfaces from one codebase: an LWR Experience Cloud customer site, and external clients such as Claude, Slack and ChatGPT. Through the Headless Experience Layer Beta, the employee server can return rich HXL widgets, such as an order status card, which render the same way on each surface. Readers can create an External Client App, connect the server to a third-party agent, and deploy the source from GitHub to try it.
