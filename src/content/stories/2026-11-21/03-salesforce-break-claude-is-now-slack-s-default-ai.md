---
title: Claude becomes Slack's default AI, with two Admin-Controlled experiences
original_title: Claude Is Now Slack’s Default AI
url: https://salesforcebreak.com/2026/11/20/claude-slack/
source: Salesforce Break
source_type: community
date: 2026-11-21
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - slack
  - claude
  - slackbot
  - claude-tag
  - spend-limits
  - admin-controls
authors:
  - Meredith Anglin
why_read: You will learn how Slackbot and Claude Tag differ in access, billing and admin control, and what to set up before users start tagging Claude. The piece gives a practical rollout checklist for Salesforce admins.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Where a user messages Claude decides whose access and billing apply
  left:
    heading: Channel or group DM
    points:
      - Uses tools set up for the channel
      - Runs under Claude's own identity
      - Billed to your organization
  right:
    heading: One-to-one DM or AI panel
    points:
      - Uses the user's own Claude account
      - Uses that user's own connectors
      - Billed to that user's account
  icons:
    - people
    - person
image: https://salesforcebreak.com/wp-content/uploads/2026/11/Gemini_Generated_Image_aoee05aoee05aoee-1024x572.jpeg
---

Claude is now the default model for Slack, powering Slackbot and supporting team work through Claude Tag. The two experiences work differently and each has its own admin controls, so the article sets out what each does, who manages it, and what to check before users begin tagging @Claude.

Slackbot needs no installation. Recent August 2026 upgrades include Big Mode for drafting long documents, Deep Research that returns cited reports from org data and the web, Skill Sets that can be shared and assigned to groups or channels, a Skills Admin Dashboard showing usage, and a Tasks tab for recurring routines. Feature availability depends on rollout timing, licensing and extra license requirements, and compute-heavy Advanced Features are limited at Enterprise+ with 30 days' notice before any new limits.

Claude Tag, Anthropic's product, places Claude in channels as a shared teammate, replacing the older Claude in Slack app. It is in beta and requires a Claude Team or Enterprise plan. Whose access it uses and who pays depends on where the user messages it: channels use the tools set up for that channel and bill the organization, while one-to-one DMs use the user's own account. Setup needs a Slack workspace admin to install the app and a Claude Owner to pair the workspace and set spend limits. Owners control access by workspace or channel, guest channel access (restricted by default), spend caps with alerts at 75% and 90%, and auditing of scheduled work and memory on the Activity page. Slack conversations are kept apart from Claude chat history and deleted within 30 days of disconnecting.

The article closes with a rollout checklist: confirm the roles, pilot a low-risk channel, scope connections by channel, set spend caps first, keep guest access restricted, check the Slack plan, review Skill Sets, and teach users when to use a channel versus a direct message.
