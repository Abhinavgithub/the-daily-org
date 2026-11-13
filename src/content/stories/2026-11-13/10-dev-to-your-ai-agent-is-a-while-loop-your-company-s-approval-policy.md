---
title: Keep approval policy in data and deterministic code, not in an agent's prompt
original_title: Your AI agent is a while loop. Your company's approval policy is not
url: https://dev.to/juanma_garrido_1974/your-ai-agent-is-a-while-loop-your-companys-approval-policy-is-not-4bba
source: dev.to
source_type: community
date: 2026-11-13
section: agentforce-and-ai
personas:
  - architect
  - developer
tags:
  - ai-agents
  - approval-policy
  - tool-gating
  - llm-architecture
  - business-rules
authors:
  - Juan Manuel Garrido
why_read: You will see why an AI agent should not decide business rules like discount approval, and how to structure it with an explicit approval matrix, gated tools, and a needs_human outcome. The code is generic Python rather than Salesforce-specific.
interest_score: 6
depth_score: 6
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a discount request is routed through the approval gate
  steps:
    - Agent calls request_discount
    - Look up approver in matrix
    - "Approver found: pending approval"
    - "None available: needs human"
  icons:
    - robot
    - search
    - check
    - warning
held_from: 2026-11-10
---

The article argues that an AI agent is essentially an LLM in a loop, and that the difficulty in a company lies in the policy questions nobody has answered, such as who may approve a discount above a rep's limit when the usual approver is unavailable. An agent should not invent such a policy, because any answer it gives looks like a decision but is only a guess.

The proposed design moves policy into data the business owns, such as a table or Custom Metadata listing discount thresholds, the role allowed to approve, and a backup role. A deterministic function looks up the approver and returns nothing when nobody is available, so the case escalates instead of being guessed. Tools that change money, prices or contracts never apply changes directly; they return a pending proposal that a gate handles.

The loop itself stays simple, but it needs a step limit, an allowlist of registered tools, and a first-class needs_human result that explains why the agent stopped. Read and write tools should be treated differently. The author also notes that decisions expressible as simple rules belong in Flow, Apex or plain code, and that agents suit cases needing interpretation of free text or messy context.
