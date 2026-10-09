---
title: Configuring permissions and security guardrails for Agentforce and Prompt Builder
original_title: "Salesforce AI Guardrails: An Admin’s Guide to Permissions, FLS, & Agentforce"
url: https://salesforcebreak.com/2026/10/08/admin-permissions-agentforce/
source: Salesforce Break
source_type: community
date: 2026-10-09
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - agentforce
  - prompt-builder
  - permission-set-groups
  - field-level-security
  - einstein-trust-layer
authors:
  - Meredith Anglin
why_read: Readers will learn how to structure Permission Sets and groups for different AI roles, understand how field-level security applies at runtime, and implement human-in-the-loop controls for autonomous agents.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 9
model: qwen/qwen3.7-flash
image: https://salesforcebreak.com/wp-content/uploads/2026/10/Gemini_Generated_Image_n6p5ain6p5ain6p5-1024x529.jpeg
figure:
  kind: parts
  caption: Breakdown of the three core pillars for AI governance
  whole: Generative AI Security Setup
  parts:
    - License and Permission Set Allocation
    - Field-Level Security Inheritance
    - Agentforce Action Boundaries
---

The article outlines a structured approach to managing generative AI access by separating feature availability through Permission Set Licenses from functional capabilities via Permission Sets and Permission Set Groups. It defines four core roles, including an AI System Administrator, Prompt Template Author, Standard End-User, and Agentforce Runtime User, emphasizing that bundling permissions into groups prevents security drift when users change departments.

When prompts execute on record pages, Prompt Builder enforces security before data reaches the large language model. The system validates object read access, applies field-level security by nullifying restricted merge fields, and respects Sharing Rules. A practical example shows how a customer support representative without access to a profit margin field receives a blank value, ensuring sensitive financial data never leaves the organization or enters the model cache.

For autonomous execution, Agentforce supports three action modes ranging from full autonomy to requiring explicit user approval. The piece recommends starting with safe defaults that allow read-only lookups while triggering human confirmation for write operations. It demonstrates a human-in-the-loop pattern where an agent drafts an email via a flow, leaving the final review and send capability restricted to a human user.

Finally, the guide provides a deployment checklist covering permission group assembly, field security verification, action boundary configuration, and Einstein Trust Layer settings like zero data retention and data masking to ensure compliance before production rollout.
