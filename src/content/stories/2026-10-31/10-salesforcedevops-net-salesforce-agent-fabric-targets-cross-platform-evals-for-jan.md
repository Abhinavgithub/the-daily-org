---
title: Salesforce Agent Fabric adds cross-platform evals, due January 2027
original_title: Salesforce Agent Fabric Targets Cross-Platform Evals for January 2027. Rivals Already Ship Them.
url: https://salesforcedevops.net/index.php/2026/10/27/salesforce-agent-fabric-evals-2027/
source: SalesforceDevOps.net
source_type: community
date: 2026-10-31
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - agent-evals
  - agent-fabric
  - api-evals
  - mcp-servers
  - agent-observability
authors:
  - Vernon Keenan
why_read: You will learn what Salesforce's planned Agent Evals and API Evals do, how the availability timeline looks, and how they compare with evaluation tools already on the market. You will also see where the promised features are still only roadmap.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Agent Evals workflow as described for the January 2027 general availability
  steps:
    - Define what the agent should and should not do
    - Generate a test set from requirements
    - Grade results with an LLM judge and data checks
    - Quarantine the agent if quality thresholds fail
  icons:
    - doc
    - test
    - search
    - shield
image: https://salesforcedevops.net/wp-content/uploads/2026/10/image-5-1024x590.png
held_from: 2026-10-28
---

Vernon Keenan, writing for SalesforceDevops.net, reviews Salesforce's Agent Fabric update, which adds Agent Evals and API Evals to its agent control plane. Agent Evals is pitched as working across any platform: it generates tests before deployment, scores production agents against quality thresholds, and can trigger a kill switch. API Evals generates functional and performance tests from API specifications so breaking changes are caught early. Salesforce's earlier Agentforce Testing Center, generally available in February 2025, covered only Agentforce agents.

The availability timeline matters. Agent Evals and API Evals target beta in November 2026 and general availability in January 2027, and the triggered kill switch also targets January 2027. What is generally available today is the defensive layer: a manual kill switch, a FinOps dashboard, Model Wallet budget limits, cost optimization policies, and federated gateway policies. Salesforce says the policies cut token usage by up to 75% in test scenarios, which Keenan treats as a best case. Cross-platform LLM and MCP server evals are still labeled "coming soon," and Salesforce has not confirmed live-traffic scoring. Keenan argues that enterprises are buying the control plane mainly to manage sprawl, while orchestration features wait on customers' workflows.

Keenan compares the offering with tools already on the market, including Arize Phoenix, LangSmith, Langfuse and Braintrust, which offer evals and tracing, some with online scoring. He also cites AWS AgentCore Evaluations, Google Cloud agent evaluation, IBM watsonx Orchestrate and ServiceNow AI Control Tower, which has a kill switch that revokes credentials. Developer tools instrument the agent's own build, while Agent Fabric governs agents its customers did not build and can pause them. A key unanswered question is whether Agent Evals will show step-level traces for third-party agents, since a failing score without a trace explains little.

In his closing section, Keenan urges Salesforce to make evals the centerpiece. His recommendations include shipping a versioned test suite with each context pack, making eval libraries exportable in open formats, grading live traffic with linked traces, and bringing Testing Center customers into Agent Evals. He also asks Salesforce to publish a reproducible benchmark before the January general availability, comparing a frontier model alone, the same model with equivalent data access, and the model using the Enterprise AI Harness.
