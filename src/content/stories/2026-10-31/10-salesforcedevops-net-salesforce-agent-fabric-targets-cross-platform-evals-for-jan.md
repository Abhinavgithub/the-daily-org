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

Salesforce is extending Agent Fabric, its agent control plane, with Agent Evals, API Evals and cost controls. The cost and kill-switch layer is generally available now. The evals, which are meant to cover agents, LLMs and MCP servers on any platform, target beta in November 2026 and general availability in January 2027. Agent Evals generates tests from requirements, runs them before deployment, and grades production agents against quality thresholds, with a predefined response up to quarantining an agent. API Evals generates functional and performance tests from API specifications to catch breaking changes early.

The author argues that enterprise agent sprawl, largely through software customers already buy, is what is driving the purchase of this kind of control layer. He notes the release does not say whether live traffic is scored directly, and that the Agent Fabric page still marks MCP server and LLM evaluations as coming soon. Salesforce's own Agentforce Testing Center only covers agents built inside Salesforce.

The piece also places this against existing tools such as Arize Phoenix, LangSmith, Langfuse, Braintrust and the evaluation services from AWS and Google Cloud, which already offer online scoring of production traces. Salesforce's portability pitch is a neutral test bench that compares a current agent against a cheaper model or another provider, though the release describes only a sequential version of that workflow.
