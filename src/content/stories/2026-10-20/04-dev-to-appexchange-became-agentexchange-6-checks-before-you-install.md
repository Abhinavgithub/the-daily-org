---
title: Six checks to vet agents and MCP tools before installing from AgentExchange
original_title: "AppExchange Became AgentExchange: 6 Checks Before You Install an Agent or MCP Tool"
url: https://dev.to/ashapurasoftechinc/appexchange-became-agentexchange-6-checks-before-you-install-an-agent-or-mcp-tool-16no
source: dev.to
source_type: community
date: 2026-10-20
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - agent-exchange
  - mcp-tools
  - agentforce
  - permission-sets
  - security-review
  - flex-credits
authors: []
why_read: Readers will learn a structured six-point checklist for evaluating the security, permissions and costs of agents and MCP tools before they reach production. The guide explains how to test these integrations safely and establish ongoing monitoring.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
---

The article outlines the transition of AppExchange to AgentExchange, noting that the marketplace now hosts agents, subagents and MCP servers alongside traditional managed packages. It emphasizes that these newer components operate at runtime rather than just adding static metadata, which changes how administrators must assess their impact.

Authors provide a six-step verification process covering security review status, profile access limits, data flow mapping, agent user permissions, pricing structures using Flex Credits, and publisher reputation. They stress that passed security reviews set a baseline but do not guarantee safe runtime behavior.

The piece recommends a Sandbox evaluation workflow that includes testing under different user states, allowing only necessary MCP tools, enabling logging, and modeling costs at projected volumes. It concludes with operational rules such as enforcing least privilege, requiring weekly transcript reviews during pilots, and defining offboarding procedures before deployment.
