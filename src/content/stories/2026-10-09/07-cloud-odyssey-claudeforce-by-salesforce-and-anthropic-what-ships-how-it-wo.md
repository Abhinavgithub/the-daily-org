---
title: Preparing your org for the Claudeforce partnership and new billing model
original_title: "Claudeforce by Salesforce and Anthropic: What Ships, How It Works, and How to Prepare"
url: https://cloudodyssey.com/blog/claudeforce-by-salesforce-and-anthropic-what-ships-how-it-works-and-how-to-prepare/
source: Cloud Odyssey
source_type: community
date: 2026-10-09
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - claudeforce
  - agentforce
  - mcp-server
  - flex-credits
  - aiforce
  - salesforce-in-claude
authors:
  - Cloud Odyssey
why_read: Readers will learn how to configure the Salesforce in Claude plugin, audit permissions for agentic access, and prepare for the November billing model using Flex Credits and agent registration.
interest_score: 8
depth_score: 8
novelty_score: 9
utility_score: 7
model: qwen/qwen3.7-flash
image: https://cloudodyssey.com/wp-content/uploads/2026/10/Salesforce-Multi-Cloud-Implementation-Strategy-Guide-3.png
figure:
  kind: steps
  caption: Five checks to prepare your Salesforce org for Claudeforce and AIforce billing
  steps:
    - Audit Permission Sets and profiles
    - Clean the fields the skills read
    - Keep approvals on
    - Pilot in a sandbox
    - Name an owner for connections
  icons:
    - shield
    - database
    - check
    - test
    - person
figure_image: /figures/2026-10-09/07-cloud-odyssey-claudeforce-by-salesforce-and-anthropic-what-ships-how-it-wo.webp
---

Claudeforce, the expanded Salesforce and Anthropic partnership announced on August 26, 2026, works in two directions. Claude becomes a reasoning model inside Agentforce and the default model in Slack, while Salesforce reaches into Claude through the Salesforce in Claude plugin. That plugin bundles 37 prebuilt sales skills covering account research, call prep, pipeline review and CRM updates, with Salesforce and Slack connectors. It is in beta for approved orgs on paid Claude plans and requires the latest Sales Cloud Enterprise edition.

On security, sellers sign in with their own Salesforce credentials, so Claude can only do what their permissions allow, and by default it asks for approval before any write. Salesforce Help notes that when a custom action uses a Claude model hosted inside the Salesforce Trust Boundary, data stays inside that boundary, though Einstein Trust Layer data masking is disabled for those agents and zero data retention still applies. The article advises reading that page in full before writing a risk assessment, and it warns that most capability claims come from launch material and should be tested in a sandbox first.

The setup path has four stages. First, the org confirms eligibility and gets approval through the beta sign-up on AgentExchange. Second, a Salesforce admin creates an External Client App for Claude, because Connected Apps are not supported for MCP clients. Third, a Claude Primary Owner or Owner enables the plugin in Organization settings and enters the app's consumer key and secret. Finally, each member signs in with their own Salesforce account on first use.

The billing changes are targeted for November. Admins register agents, each of which gets its own identity and can hold a narrower Permission Set than a human user. Every successful MCP or API call from a registered agent counts as a Headless Platform Interaction, paid with Flex Credits, though the rates are still TBA and metering applies only to active production orgs, with 30 days' notice before it starts. Customers who buy on or after September 17, 2026 must register agents at purchase, while existing customers register at renewal. The article does not say how the Salesforce in Claude plugin will be classified under this model.

The article recommends five preparation steps: audit Permission Sets and Profiles, clean the fields the skills read, keep approvals switched on, pilot in a sandbox, and name an owner for connections and consumption. Cloud Odyssey's own view is that Claudeforce exposes existing CRM data quality problems, and it suggests starting with a health check, connecting surrounding systems, piloting with one team, and keeping model choice open.
