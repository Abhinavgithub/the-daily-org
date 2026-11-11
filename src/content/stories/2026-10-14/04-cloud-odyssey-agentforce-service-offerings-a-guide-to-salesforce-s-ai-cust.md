---
title: Agentforce Service offerings explained for configuration and rollout planning
original_title: "Agentforce Service Offerings: A Guide to Salesforce’s AI Customer Service Platform"
url: https://cloudodyssey.com/blog/agentforce-service-offerings-a-guide-to-salesforces-ai-customer-service-platform/
source: Cloud Odyssey
source_type: community
date: 2026-10-14
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - agentforce-service
  - help-agent
  - service-agent
  - enhanced-omni-channel
  - model-context-protocol
authors:
  - Cloud Odyssey
why_read: Readers will learn how to configure and deploy Agentforce Service agents, understand the prerequisites for Omni-Channel routing and Knowledge grounding, and see which legacy channels are being retired. The piece also outlines practical rollout strategies to avoid common implementation pitfalls.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
image: https://cloudodyssey.com/wp-content/uploads/2026/10/Salesforce-Multi-Cloud-Implementation-Strategy-Guide-4.png
---

The piece is a guide to Agentforce Service, Salesforce's AI customer service platform, which was renamed from Service Cloud in October 2025. It covers seven offerings: AI agents, case management, omnichannel contact center, an AI knowledge base, field service, analytics and integrations. For each, it explains what the offering does, what it depends on and where teams tend to run into trouble. The AI agents come in two forms. Help Agent is prepackaged and set up from one screen, and it is grounded on Salesforce Knowledge, uploaded files or a website sync. It needs Enterprise or Unlimited Edition with Agentforce enabled. Service Agent is configurable, with topics, instructions and actions defined by the team, and suits work that touches the company's own systems, such as order lookups or appointment changes. Agentic features such as Agentic Milestones, MCP support and multi-agent setups are also described. Omni-Channel routing depends on Enhanced Omni-Channel, which the article calls the foundation for Agentforce Service and a requirement for Agentforce Voice and Contact Center.

On the contact center and channels, the article notes that Salesforce is retiring Standard Facebook Messenger and Standard SMS channels in mid-2026, so teams still on them should move to Enhanced channels. It also points to the knowledge base as a dependency: AI answers are only as good as the Knowledge articles behind them, so the author recommends knowledge-centered service habits. Case management, field service work orders, analytics (with metrics such as autonomous resolution rate, escalation rate and CSAT on AI-handled cases) and MuleSoft-based integrations with ERP and telephony systems are each summarized with their key requirements. Pricing mixes per-user licenses, Flex Credits and a per-resolution charge for Help Agent, and the article advises confirming current India pricing with Salesforce.

The rollout advice is the practical core. The author suggests auditing data and the knowledge base first, setting up Enhanced Omni-Channel, launching one AI agent on a single high-volume, low-risk queue, measuring results for a month and then expanding, with budget kept for ongoing tuning after go-live. The article is written by Cloud Odyssey, a Salesforce partner, and it promotes its own services, so its vendor-supplied performance figures (such as 72% of routine inquiries offloaded and 70% resolution on Salesforce's own help portal) are presented as numbers to test rather than guaranteed results.
