---
title: Setting up proactive Intelligence in Tableau Next with Slack and MCP
original_title: "Turn Autonomous Insights into Action: How to Set Up Proactive Intelligence with Tableau Next"
url: https://www.salesforce.com/blog/how-to-set-up-proactive-intelligence-tableau-next/
source: Salesforce Blog
source_type: official
date: 2026-11-03
section: data-cloud
personas:
  - admin
  - architect
tags:
  - tableau-next
  - proactive-intelligence
  - autonomous-insights
  - data-alerting
  - slackbot
authors:
  - Rabia Daud
  - Libby Knell
why_read: "You will learn the setup path for Tableau Next's three proactive features: autonomous insights, data alerts and intelligence briefs. You will also see how admins scope agents and users, and how alerts are created and managed through Slackbot."
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/pro-int-1_skill.png?strip=all&#038;quality=95
---

Proactive Intelligence in Tableau Next has Tableau Agent monitor business data in the background and push prioritized insights to Slack, Salesforce or any MCP-compatible client. The article describes three capabilities that work together: autonomous insights, which explore data for risks nobody thought to ask about; data alerts, which notify on conditions such as a commit drop or a large deal slipping; and intelligence briefs, which run scheduled or on-demand reviews of core KPIs. All three draw on the governed semantic model so calculations follow the organisation's definitions.

Setup is a one-time admin task. Prerequisites are Tableau Next in Enterprise, Performance or Unlimited edition, at least one AI-ready semantic data model, and Slack with the Salesforce app and Slackbot connected to MCP. The admin sets up a Tableau Agent, connects Slack to Salesforce, and enables the Tableau Next MCP server for Slackbot. For autonomous insights, the admin turns on the feature under Administration settings, scopes the agent to semantic models, creates an Agentforce Studio skill that supplies business context without scripting output, grants the AI Skill User Permission Set, and assigns an agent to each user, since no one receives insights until that step is done.

Alerts can be created in plain language through Slackbot, or through built-in metric alert types such as period-over-period change, unusual change, goal and threshold. Alerts check daily or weekly and notify only when the condition is met. The article recommends a phased rollout: start with one key alert, pilot autonomous insights with a small group of leaders, then automate one recurring review with an intelligence brief.
