---
title: Agent Fabric adds automated evals, kill switch and spending limits for agents
original_title: Salesforce Expands Agent Fabric to Automatically Stop Runaway Costs and AI Agent Failures Before They Impact Customers
url: https://www.salesforce.com/news/stories/agent-fabric-catch-failures-control-ai-costs/
source: Salesforce News
source_type: official
date: 2026-10-31
section: agentforce-and-ai
personas:
  - architect
  - admin
  - developer
tags:
  - agent-fabric
  - agent-evals
  - api-evals
  - agent-kill-switch
  - finops-dashboard
authors: []
why_read: You will learn what Agent Evals, API Evals and the new cost controls do, how automated intervention works, and when each piece reaches beta and general availability. The piece is a product announcement, so the claims are the vendor's own.
interest_score: 7
depth_score: 6
novelty_score: 8
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How Agent Evals responds when an agent's quality drops, as described in the retailer example
  steps:
    - Model swapped to lower cost
    - Scheduled tests detect wrong answers
    - Quarantine requested for approval
    - Instructions refined and rerun
image: https://www.salesforce.com/news/wp-content/uploads/sites/3/2026/10/Screenshot-2026-10-15-at-4.11.38-PM.png?w=1024
held_from: 2026-10-28
---

Salesforce has announced Agent Evals, API Evals and advanced cost controls for Agent Fabric, its control plane for managing and governing agents across platforms. Agent Evals generates tests before deployment and then evaluates agents, LLMs and MCP servers in production against quality thresholds. When results fall short, it triggers predefined interventions, including the Agent Kill Switch, with approval where policy requires it. API Evals generates functional and performance tests from API specifications to catch breaking changes before they reach production.

The cost side includes the FinOps Dashboard and Model Wallet, which give budget owners one view of AI spending and hard limits that stop requests before costs exceed budget. Cost Optimization Policies are said to cut token usage by up to 75% in test scenarios, using semantic caching, payload compression and response trimming. Two discovery updates are also covered: a Custom Agent Scanner for internal and third-party environments, and Open Policies for Federated API Gateways that apply policies such as IP allowlisting or rate limiting across Azure, Apigee and Kong gateways.

Availability is staggered. Agent Evals and API Evals enter beta in November 2026 and reach general availability in January 2027, as does the Triggered-Agent Kill Switch. The Custom Agent Scanner is in beta now. The Agent Kill Switch, the Open Policies for Federated API Gateways, and the FinOps Dashboard, Model Wallet and Cost Optimization Policies are generally available today.
