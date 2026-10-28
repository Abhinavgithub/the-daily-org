---
title: Agent Fabric adds evals, kill switch and hard spending limits for agents
original_title: Salesforce Launches Agent Kill Switch and New Cost Controls
url: https://www.salesforceben.com/salesforce-launches-agent-kill-switch-and-new-cost-controls/
source: Salesforce Ben
source_type: community
date: 2026-10-28
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - agent-fabric
  - agent-evals
  - api-evals
  - cost-optimization
  - agent-kill-switch
authors:
  - Tom M
why_read: You will learn what Agent Evals, API Evals and the cost controls in Agent Fabric do, and how automated quarantine and budget caps are meant to work once an agent is in production. The article also notes that these checks are only as good as the tests and thresholds behind them.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How Agent Evals responds when an agent's quality drops after a model change
  steps:
    - Scheduled tests run on the agent
    - Quality issue flagged by Agent Evals
    - Approval requested to quarantine agent
    - Instructions revised and evaluation rerun
  icons:
    - test
    - warning
    - shield
    - gear
---

Salesforce is introducing Agent Evals, API Evals and advanced cost controls for Agent Fabric, its control plane for AI agents. The company says that problems in agents, such as changes in models, APIs or costs, can surface silently, and that resolving them today means finding the owner and getting approval to restrict an agent while it keeps producing bad results and spending tokens.

Agent Evals generates tests before deployment and then evaluates agents, LLMs and MCP servers in production. When results fall below the evaluation standards, predefined interventions such as the Agent Kill Switch are triggered, subject to approval where a team's policy requires it. API Evals creates functional and performance tests from API specifications so that breaking changes are caught before production. The FinOps Dashboard and Model Wallet show AI spending and enforce hard limits that can stop requests before a budget is exceeded, and Cost Optimization Policies are said to cut token usage by up to 75 percent in test scenarios through semantic caching, payload compression and response trimming.

The article gives a retailer example in which a switch to a cheaper model leads scheduled Agent Evals runs to find inaccurate delayed-order answers, after which the agent is quarantined with approval, its instructions are revised, and the evaluation is rerun before it returns to production. The author closes by noting that the Agent Kill Switch is the main takeaway, and that the value of these evaluations depends on the tests and thresholds behind them.
