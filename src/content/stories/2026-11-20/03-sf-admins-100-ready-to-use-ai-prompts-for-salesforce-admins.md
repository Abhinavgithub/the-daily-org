---
title: A four-bucket Kit of 100 prompts for Admin work with Agentforce Vibes
original_title: 100 Ready-to-Use AI Prompts for Salesforce Admins
url: https://admin.salesforce.com/blog/2026/100-ready-to-use-ai-prompts-for-salesforce-admins
source: Salesforce Admins Blog
source_type: official
date: 2026-11-20
section: agentforce-and-ai
personas:
  - admin
tags:
  - agentforce-vibes
  - prompt-engineering
  - admin-tooling
  - mcp
  - record-triggered-flow
authors:
  - Joshua Birk
why_read: You will learn how the Admin Accelerator Kit's four prompt buckets (Understanding, Configuring, Troubleshooting, Documenting) are meant to be used, and which prompts to run first in a sandbox. You will also see how the buckets chain together on a real change, such as converting a text field to a picklist.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The four prompt buckets are meant to be used in sequence on a single change
  steps:
    - "Understanding: map what the org already does"
    - "Configuring: plan, then build the change"
    - "Troubleshooting: diagnose what breaks"
    - "Documenting: record the change and the why"
---

The post introduces a set of 100 ready-made prompts for everyday admin tasks, presented at a Dreamforce 2026 session on Agentforce Vibes. The prompts are hosted as a markdown file in the Admin Accelerator Kit on GitHub, and readers can simply browser-copy them. They are organized into four buckets of five categories with five prompts each, and placeholders in angle brackets must be replaced with real API names. The authors note the prompts also work with other agents connected to a Salesforce org through MCP.

The author advises starting in a sandbox or Developer Edition org, especially for Configuring prompts, because Understanding and Documenting prompts mostly read metadata while Configuring prompts change it. Understanding prompts help map objects, Flows, permissions and business processes, and impact-analysis prompts help check what breaks before a field change. Configuring prompts range from "How do I" questions that yield click paths to "Create" and "Write" prompts that generate Flow or Validation Rule metadata for review before deployment.

Troubleshooting prompts cover Flow errors and permission problems, with the advice to paste the full fault email along with record IDs and the affected user. The kit also addresses conflicting automations that silently revert field values. Documenting prompts produce data dictionaries, release notes, deployment checklists and, most importantly, a record of why a rule was configured as it was.

The post closes by showing the buckets chained together on a Region picklist change, and invites feedback and contributions to the kit's repository.
