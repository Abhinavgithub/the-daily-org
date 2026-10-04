---
title: Agent Designer automates multi-agent AI team design, verification, testing, and repair
url: https://engineering.salesforce.com/engineering-multi-agent-ai-teams-that-build-and-test-themselves/
source: Salesforce Engineering
source_type: official
date: 2026-10-03
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - multi-agent
  - orchestration
  - ai-governance
  - agent-verification
  - self-healing
  - budget-controls
authors:
  - Sohini Arya
  - Manish Kumar Jha
why_read: You will see how Salesforce governs autonomous agent teams with topology-aware budgets, structured verification contracts, and hard caps on self-repair. The governance patterns around write boundaries and failure classification are transferable to anyone building agentic systems.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 6
model: inclusionai/ling-3.1-flash
image: "https://engineering.salesforce.com/wp-content/uploads/2026/09/image_fbd3d2.png"
original_title: Engineering Multi-Agent AI Teams That Build and Test Themselves
---

The article profiles Agent Designer, an internal Marketing Cloud system that automates the design, verification, testing, and repair of multi-agent AI teams, reducing the cycle from two to four hours to roughly 15 to 30 minutes. Engineers previously hand-authored YAML files, prompts, profiles, tools, models, budgets, and turn limits, then tested and iterated manually. The new system uses an orchestrator that dispatches and verifies work but is prohibited from writing any agent file, supported by seven specialists that each carry their own model, budget, and turn limit, and it has helped about 200 engineers adopt a manager-of-agents model.

Multi-agent governance proved harder than single-agent configuration because independently valid specialist outputs can combine into an unbuildable design. Architecture, failure-mode, and compliance analysts work in parallel without seeing each other's findings, so the orchestrator must detect contradictions and apply bounded remediation rather than restarting the analysis. Since the agent specification lacked a native write-scope field, write boundaries are enforced in prompts, and teams created through Claude Unleashed must define exactly one coordinator and pass a compatibility validation.

Budget enforcement is topology-specific: a flat check for a single agent, items times cost times steps for a swarm, and whole-roster ceilings for a team, all fitting inside the orchestrator's 500-turn budget that is divided across analysis, approval, generation, testing, and retries. Verifiers return structured PASS, WARN, or FAIL blocks with rules such as warning rather than failing when uncertain, and the orchestrator runs a meta-check across their outputs. A test doctor classifies failures into categories including soft failures that require point-by-point comparison against expected behavior, and self-healing is capped at two fix attempts and a three-dollar ceiling before the system stops and escalates to a human.
