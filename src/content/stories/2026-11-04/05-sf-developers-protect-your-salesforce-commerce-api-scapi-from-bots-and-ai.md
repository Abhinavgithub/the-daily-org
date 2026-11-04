---
title: Restricting Shopper API traffic to Managed Runtime with eCDN rules
original_title: Protect Your Salesforce Commerce API (SCAPI) from Bots and AI Agents with eCDN
url: https://developer.salesforce.com/blogs/2026/11/protect-your-salesforce-commerce-api-scapi-from-bots-and-ai-agents-with-ecdn
source: Salesforce Developers Blog
source_type: official
date: 2026-11-04
section: architecture
personas:
  - developer
  - architect
  - admin
tags:
  - scapi
  - ecdn
  - bot-mitigation
  - scapi-identity-header
  - slas
  - b2c-commerce
authors:
  - Sarah Welker
why_read: You will learn how to lock SCAPI traffic to Managed Runtime with the SCAPI Identity Header, allow other integrations, harden SLAS, and rate limit AI crawlers using eCDN fields and rule expressions.
interest_score: 8
depth_score: 9
novelty_score: 7
utility_score: 9
model: anthropic/claude-haiku-5.5
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261029112113/Generic-D-8-e1793298086874.png?w=1000
figure:
  kind: steps
  caption: How to restrict Shopper API traffic to Managed Runtime, rolled out in stages
  steps:
    - Enable SCAPI Request Identification per instance
    - Add a block rule for the instance's path
    - Place the rule after the Salesforce allow rule
    - Start in Log mode, then switch to Block
  icons:
    - gear
    - shield
    - flow
    - check
figure_image: /figures/2026-11-04/05-sf-developers-protect-your-salesforce-commerce-api-scapi-from-bots-and-ai.png
---

Bots increasingly call the B2C Commerce API directly, bypassing storefronts, and AI crawlers and shopping agents add search and LLM costs and skew analytics. The October 2026 release lets you manage the SCAPI zone in Business Manager and the CDN API, accept Shopper API traffic only from Managed Runtime through the new SCAPI Identity Header, and identify AI traffic on any eCDN zone with verified-bot fields. The SCAPI zone is provisioned automatically and shared across Development, Staging and Production, managed from Production. Some controls such as WAF managed rulesets, mTLS, TLS 1.3 settings and HSTS are not available.

To restrict traffic, enable the Managed Runtime SCAPI Request Identification feature per instance, then add a firewall rule that blocks Shopper API paths for that instance's org-specific path segment, placed after the locked Salesforce allow rule. Start with Log, then switch to Block. Other integrations such as a custom BFF can be allowed with their own rules carrying a separate shared secret header that must stay server-side. For SLAS, Strict Client Auth requires a client secret header on login and authorize requests, though Composable Storefront and Storefront Next do not send it yet, so it should be enabled only for private clients called from your own server code. SLAS also throttles refresh-token exchanges to 3 per 60 seconds.

For AI traffic, the Known Bot and Verified Bot Category fields sort verified bots into 17 categories. The post recommends rate limiting AI Crawler and AI Search traffic on expensive endpoints such as product search rather than blocking it, with thresholds tuned from logs and Log mode run first. Spoofed or unverified automation needs behavioral detection from a bot management partner or Bot Management in front of eCDN.
