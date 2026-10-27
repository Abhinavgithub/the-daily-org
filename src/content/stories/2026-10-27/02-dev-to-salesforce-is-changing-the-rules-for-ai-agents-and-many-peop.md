---
title: Salesforce plans agent identities and metered billing for Agentic API calls
original_title: Salesforce Is Changing the Rules for AI Agents [And Many People Haven't Realized It Yet]
url: https://dev.to/juanma_garrido_1974/salesforce-is-changing-the-rules-for-ai-agents-and-many-people-havent-realized-it-yet-2o4d
source: dev.to
source_type: community
date: 2026-10-27
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - agentic-identity
  - headless-platform-interactions
  - flex-credits
  - agentforce
  - headless-toolkit
authors:
  - Juan Manuel Garrido
why_read: You will learn what Agentic Identity and Headless Platform Interactions are, which calls count toward Flex Credits, and when the transition deadlines and production-only billing rules apply. The exact multiplier is still unannounced.
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Traditional integrations keep existing terms, while agentic interactions move to the new HPI model
  left:
    heading: Traditional integrations
    points:
      - Existing pricing kept
      - Existing security kept
  right:
    heading: Registered agents
    points:
      - Counted as HPIs
      - Drawn from Flex Credits
---

Salesforce has described upcoming changes to AIforce and the Headless Toolkit in its help documentation. The main changes are agent-specific security features, agent registration, and a consumption-based billing model. Agentic Identity would give AI agents their own identity rather than having them act under the identity of the human they assist, allowing separate credentials, finer permissions and better oversight.

Successful calls by registered agents, whether through MCP or direct APIs, will be counted as Headless Platform Interactions and drawn from Flex Credits, monitored through Digital Wallet. The author stresses that the Flex Credits multiplier has not been announced, agentic consumption is not yet metered, and Salesforce will give 30 days' notice before metering begins. Traditional integrations keep their existing pricing and security arrangements.

Transition timing differs by customer type: new customers must register agents via APIs within three months of the Agentic Identity availability notice, existing API customers migrate at renewal, and MCP server users have three months from notice. Sandboxes, Scratch Orgs and Developer Edition orgs will not consume Flex Credits for HPIs. The author argues architects will need to plan for call volumes, permissions, monitoring and cost forecasting for multi-call agent tasks.
