---
title: B2C Commerce October 2026 release adds events GA and self-service unpairing
original_title: "Peak-Ready Precision: The October 2026 B2C Commerce Release"
url: https://www.salesforce.com/blog/b2c-commerce-october-26-release/
source: Salesforce Blog
source_type: official
date: 2026-10-28
section: releases
personas:
  - developer
  - admin
  - architect
tags:
  - b2c-commerce
  - release-notes
  - agentic-commerce-search
  - event-framework
  - scapi
  - business-manager
authors:
  - Miryam Meir
why_read: You will learn what the October 2026 B2C Commerce release changes for integrations, environment setup and licensing, including the Event Framework going generally available and the removal of the Data 360 license requirement for the trusted connection. You will also see which agentic and developer tooling features arrived with it.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Trusted connection to a Salesforce org no longer requires a Data 360 license
  left:
    heading: Before October 2026
    points:
      - Data 360 license needed
      - Admin support ticket to reset pairing
      - Sandbox type limits
  right:
    heading: October 2026
    points:
      - No Data 360 license needed
      - Self-service unpairing
      - Any Salesforce sandbox type
image: https://salesforce.vidyard.com/watch/X7EhGA5im2vNzH9pRMgiBf
figure_image: /figures/2026-10-28/10-sf-blog-peak-ready-precision-the-october-2026-b2c-commerce-release.png
---

The October 2026 release for B2C Commerce focuses on speed, automation and unified commerce. It adds Universal Commerce Protocol integration, which lets merchants turn on UCP-powered checkout on Google so shoppers can buy directly from surfaces such as the Gemini app and Google Search while the merchant stays the merchant of record. Agentic features built into Business Manager include conversational catalog search, where the Merchandising Agent builds filter logic from plain English, and AI-suggested category assignments with a dashboard insight for uncategorized products.

For integration work, the most relevant changes are the Event Framework going generally available, with process-level and granular replication events, shopper registered and order placed events routed to HTTP webhook connectors, and support for custom events declared in a cartridge. The trusted connection to a Salesforce org no longer needs a Data 360 license, admins get self-service unpairing after a sandbox refresh, and developers can pair non-production instances with any Salesforce sandbox type. Profile updates now sync to connected Person Accounts in near real time, and partial POS catalog syncs let stores receive only modified pricing and product data.

On the tooling side, the Agentic Developer Toolkit gains more built-in knowledge, new operations runbooks that always ask for approval before making changes, and SCAPI Code Mode, which lets an AI assistant look up Salesforce Commerce API operations and run small scripts against a live instance. Direct SCAPI security controls for rate limits, WAF rules and cache purges are also available in Business Manager or by API.
