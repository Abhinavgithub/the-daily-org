---
title: AIforce is a separate Layer from Agentforce, and developers shift to design and review
original_title: "AIforce vs Agentforce and the new Salesforce developer role: notes from Dreamforce 2026"
url: https://dev.to/juanma_garrido_1974/aiforce-vs-agentforce-and-the-new-salesforce-developer-role-notes-from-dreamforce-2026-k78
source: dev.to
source_type: community
date: 2026-11-06
section: agentforce-and-ai
personas:
  - developer
  - architect
  - admin
tags:
  - aiforce
  - agentforce
  - mcp
  - headless-toolkit
  - agent-skills
authors:
  - Juan Manuel Garrido
why_read: You will learn how the Headless Toolkit and AIforce differ from Agentforce, and how the developer role is shifting toward guidelines, review and guardrails. The piece is a session recap rather than a technical guide.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: parts
  caption: The Headless Toolkit has three pieces that together open Salesforce to any agent
  whole: Headless Toolkit
  parts:
    - MCP Servers
    - Headless Experience Layer
    - Multi framework support
  icons:
    - server
    - layers
    - code
---

The author writes that AIforce does not replace Agentforce. Agentforce remains Salesforce's own AI, while AIforce is the layer that opens Salesforce to any MCP client or agent, together with partnerships with agent vendors. He lists the Headless Toolkit's parts: MCP Servers that expose business logic to any agent, a Headless Experience Layer that renders interfaces dynamically inside agents, and support for frameworks such as Angular and React alongside Lightning Web Components.

According to Alba Rivas of Salesforce, as cited in the piece, the classic workflow of creating objects, writing queries, classes, tests and deploying has less time left. The developer's work moves to design (asking an agent for a solution that follows your guidelines), review (checking that output matches the request), and guardrails (giving the agent knowledge and limits). Building an app that works in a production enterprise environment is the hard part.

The piece also notes that the Claude relationship continues with an existing Salesforce plugin, while OpenAI and NVIDIA also appeared on stage. It describes MCP as becoming a universal protocol used by business users too, and skills as Markdown files that can be shared across a team.
