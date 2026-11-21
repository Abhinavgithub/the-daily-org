---
title: Carter, a shopper agent for B2C Commerce storefronts built on Agentforce
original_title: Meet Carter, the Shopper Agent that Works Like Your Best Sales Associate
url: https://www.salesforce.com/blog/carter-shopper-agent/
source: Salesforce Blog
source_type: official
date: 2026-11-21
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - carter
  - shopper-agent
  - b2c-commerce
  - agentforce
  - agentic-commerce-search
  - data-360
authors:
  - John Andrews
why_read: You will learn how Carter is structured, with its four preconfigured subagents, page awareness and merchant controls over guided discovery, and what the Shopper Agent template gives you to start from. You will also see the customer results Salesforce reports, though they are vendor claims.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 5
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How Carter handles a shopper request across its subagents
  steps:
    - Shopper asks in natural language
    - Agentic Commerce Search reads the intent
    - Carter routes to a subagent
    - Answer grounded in the product catalog
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Guided-Discovery.png?strip=all&#038;quality=95
held_from: 2026-11-18
---

Salesforce introduces Carter, a shopper agent from Commerce Cloud that gives online shoppers a conversational interface in place of keyword search and category pages. The article argues that shoppers now expect the guided, context-aware help a good in-store sales associate gives, and that Carter is meant to provide it. It is available through B2C Commerce and can be reached from the search bar, the header icon, or FAQ widgets on product detail pages.

Carter is powered by Agentic Commerce Search, which interprets the intent behind a natural language request rather than matching keywords. Its answers are grounded in the merchant's product catalog, and brands can add other knowledge sources through Data 360. Merchants control how Carter sells by choosing which follow-up questions are required or optional in guided discovery and which selling points it highlights when comparing products.

Getting started means using the Shopper Agent for B2C Commerce template in Agentforce, which comes with all the subagents and actions preconfigured. Product Expert handles browsing, search, recommendations, comparisons and product questions. Site FAQ covers policies such as shipping, returns and refunds. Cart manages products, variants, promotions and coupons. Order Confirmation confirms orders and recovers carts after failed or cancelled payments. Carter orchestrates these behind one chat, and because it is page-aware it can answer questions about the product or cart the shopper is currently viewing.

The article cites several retailers using Carter under their own brand names, including Cuisinart's Compass, Hibbett AI and SharkNinja's combined commerce and support interface. Hibbett reports going live in six weeks and handling 90% of core shopper journeys. These are vendor-supplied results. Carter is generally available now as an add-on for B2C Commerce customers and works in every language Agentforce supports.
