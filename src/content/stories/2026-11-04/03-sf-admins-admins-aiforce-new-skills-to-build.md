---
title: Skills admins need to build with AIforce's MCPs, Skills and Plugins
original_title: "Admins & AIforce: New Skills to Build"
url: https://admin.salesforce.com/blog/2026/admins-aiforce-new-skills-to-build
source: Salesforce Admins Blog
source_type: official
date: 2026-11-04
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - aiforce
  - mcp
  - agent-skills
  - plugins
  - agentforce-studio
  - agent-script
authors:
  - Kate Lessard
why_read: You will learn how MCPs, Skills and Plugins fit together in the AIforce extensibility stack and which new admin skills to pick up first. It gives a roadmap and the training trails to follow.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the AIforce building blocks work together when a user acts
  steps:
    - User triggers a Plugin
    - Skill fires
    - MCP executes
    - Output returns to user
  icons:
    - person
    - doc
    - plug
    - check
---

The post introduces AIforce as a new layer of the AI extensibility stack and explains three building blocks. MCP, the Model Context Protocol, is a standard bridge between an AI interface and live systems, data and APIs, so admins can expose flows, APIs and Apex without writing custom code for each system. Skills define the exact steps, rules and formatting an AI needs to complete a task consistently, and Plugins package MCP connectors, Skills and interfaces into a single installable product. It describes a flow in which a user triggers a Plugin, a Skill fires, an MCP executes and the output returns to the user.

The author lists the new admin skills to develop: MCP management, including centralised org-wide connections and Agentic Identity; building deterministic agent logic with Super Agents and Subagents; lifecycle management of Plugins mapped to user roles; and using Agentforce Coworker, Agent Script, Builder Central and Agentforce Vibes for AI-assisted building. The roadmap moves from AI Trust, Security and Governance trails through hands-on work with Agentforce Studio to advanced building and packaging, then ongoing change management.

The article is largely an overview with links to trails, workshops and resources rather than technical implementation detail, so practitioners will get orientation more than hands-on specifics.
