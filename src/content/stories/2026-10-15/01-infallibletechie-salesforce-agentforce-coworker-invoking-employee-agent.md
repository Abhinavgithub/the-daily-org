---
title: How Agentforce Coworker delegates requests to Employee Agents
original_title: Salesforce Agentforce Coworker Invoking Employee Agent
url: https://www.infallibletechie.com/2026/10/agentforce-coworker-invoking-employee-agent.html
source: InfallibleTechie
source_type: community
date: 2026-10-15
section: agentforce-and-ai
personas:
  - developer
  - admin
tags:
  - agentforce
  - coworker
  - employee-agent
  - agent-routing
  - agent-descriptions
authors:
  - Magulan Duraipandian
why_read: You will learn how Agentforce Coworker selects which agent handles a request and why only agent descriptions, not subagent instructions, control that decision. Readers can apply these rules to configure reliable multi-agent routing and avoid common delegation pitfalls.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.infallibletechie.com/wp-content/uploads/2026/10/Salesforce-Agentforce-Coworker-using-Employee-Agentforce-Agent-1024x689.png
figure:
  kind: steps
  caption: Agentforce Coworker routes incomplete requests by evaluating accessible agent descriptions against user queries
  steps:
    - User submits a request to Agentforce Coworker
    - Coworker cannot complete the request itself
    - Reads accessible agent and subagent descriptions
    - Compares request against agent capabilities
    - Delegates request to matching Employee Agent
figure_image: /figures/2026-10-15/01-infallibletechie-salesforce-agentforce-coworker-invoking-employee-agent.webp
---

Agentforce Coworker acts as a central entry point that delegates incomplete requests to specialized agents like Agentforce Employee Agents. The system evaluates the incoming request against the capabilities defined in each accessible agent and subagent description before making a routing decision.

A critical configuration detail is that Coworker ignores subagent instructions when determining routing. Builders must place all routing-relevant information directly in the agent descriptions to ensure accurate matching. User permissions also filter which agents are available for delegation.

Reliable delegation requires distinct capability statements across agents, explicit coverage of subagents, and verification of user access levels. Testing with varied phrasing helps confirm that the routing logic aligns with actual user requests.
