---
title: How to enable and assign the Slackbot UI permission in Salesforce
original_title: Invoke Slackbot in Salesforce
url: https://www.infallibletechie.com/2026/10/invoke-slackbot-in-salesforce.html
source: InfallibleTechie
source_type: community
date: 2026-10-23
section: flow-and-admin
personas:
  - admin
tags:
  - slackbot
  - permission-set
  - system-permission
  - lightning-experience
  - slack-integration
  - flex-credits
authors:
  - Magulan Duraipandian
why_read: You will learn how to connect your Salesforce org to Slack and configure the Slackbot UI system permission so users can access the agent directly in Lightning Experience.
interest_score: 6
depth_score: 4
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.infallibletechie.com/wp-content/uploads/2026/10/Salesforce-Lightning-Experience-Slackbot-UI.png
---

The article outlines the configuration steps required to make Slackbot available inside Salesforce Lightning Experience. Before any user-facing features can be enabled, administrators must link their Salesforce org to a Slack workspace through the Manage Slack Connection setting and accept the pending request.

Access is controlled via a dedicated system permission called Slackbot UI. Administrators create a Custom Permission Set, navigate to System Permissions, check the box for the Slackbot UI capability, and save the changes. The Permission Set is then assigned to individual users or groups who require access.

Best practices emphasize validating the connection in a Sandbox first, using a dedicated Permission Set for easier auditing, and setting assignment expiration dates for pilot phases. The guide also notes that using Slackbot may require Flex Credits approval from a Salesforce administrator, and recommends verifying that the agent respects existing object and field-level security before full deployment.
