---
title: Setting claude's read and write limits in Salesforce through tool restrictions
original_title: Decide What Claude Can See and Change in Salesforce
url: https://www.salesforce.com/blog/what-claude-can-see-and-change-in-salesforce/
source: Salesforce Architects
source_type: official
date: 2026-11-19
section: agentforce-and-ai
personas:
  - architect
  - admin
tags:
  - sales-cloud-in-claude
  - hosted-mcp-server
  - tool-restrictions
  - dispatch
  - permission-sets
  - aiforce
authors:
  - Miriam McCabe
why_read: You will know how the Sales Cloud in Claude plugin reaches Salesforce, why user permissions set what Claude can read, and how the Dispatch tool restriction setting controls whether Claude can create or update records. You will also have a staged rollout plan with a pre-pilot permission review.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Salesforce recommends stepping from read-only to approval-gated writes in this order
  steps:
    - Review permissions before the pilot
    - Set Dispatch to Deny for read-only
    - Move to Needs Approval for writes
    - Use Always Allowed only as last step
  icons:
    - shield
    - lock
    - check
    - rocket
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/AIforce-Insights-Skill-Execution.png?strip=all&#038;quality=95
figure_image: /figures/2026-11-19/04-sf-architects-decide-what-claude-can-see-and-change-in-salesforce.png
---

Sales Cloud in Claude gives sellers a sanctioned way to ask Claude about their Salesforce accounts. The connection runs as the seller, using their own permissions, against live Salesforce data. The Sales Cloud in Claude plugin, built by Salesforce and Anthropic, bundles 37 sales skills, the Salesforce MCP connection and a setup skill that tailors the plugin to each user's role. The plugin is in beta and requires an enterprise agreement with Anthropic and Sales Cloud licenses.

The plugin works through the standard Salesforce Hosted MCP Server, which exposes Discover, Describe, Dispatch read-only and Dispatch tools. A Salesforce Admin sets up the server and an External Client App, and the Claude admin configures the connector, sets tool restrictions and decides who gets access. When a seller signs in through OAuth, requests run with that user's credentials, so field-level security and Sharing Rules apply. Reads need no approval, while writes depend on the Dispatch setting.

Because the hosted server has no generic system user, a user's object permissions, field-level security and Sharing Rules define what Claude can reach. Those permissions were designed for a human, so broad grants such as View All and Modify All may give Claude more than the job needs. Data Claude reads is also sent to the connected model, which makes the review a data-sharing decision as well as a security one.

The Dispatch tool restriction, found under Organization Settings > Connectors, has three options: Needs Approval, which Salesforce recommends as the steady state; Always Allowed; and Deny, which keeps Salesforce read-only. Dispatch can also call deletes directly even though no skill deletes, so Deny or Needs Approval matters. Salesforce suggests a staged approach: clean up permissions before a pilot, agree the Dispatch setting with the Claude admin, then pilot with a small group and review early approvals. Record each decision in an architectural decision record.
