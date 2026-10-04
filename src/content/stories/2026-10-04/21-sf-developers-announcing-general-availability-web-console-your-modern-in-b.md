---
title: Salesforce announces general availability of Web Console as a modern browser-based IDE
original_title: "Announcing General Availability: Web Console – Your Modern In-Browser IDE"
url: https://developer.salesforce.com/blogs/2026/09/announcing-general-availability-web-console-your-modern-in-browser-ide
source: Salesforce Developers Blog
source_type: official
date: 2026-10-04
section: releases
personas:
  - developer
tags:
  - web-console
  - vs-code-for-web
  - apex-debugging
  - lightning-web-components
  - org-browser
authors:
  - Karen Fidelak
why_read: Readers will learn how to access and use the new Web Console for inline Apex and Lightning Web Component editing, debugging, and query execution directly inside their org. The article explains the production guardrails, Setup steps, and how it differs from the legacy Developer Console and Agentforce Vibes IDE.
interest_score: 6
depth_score: 4
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20260908082812/Generic-B-6-e1788881307316.png?w=1000
---

Salesforce has released Web Console as a generally available browser-based integrated development environment. Built on VS Code for the Web and the existing Salesforce extensions, it serves as a modern replacement for the legacy Developer Console while maintaining platform safety standards.

The tool supports core development tasks including inline editing of Apex classes and triggers, viewing and modifying Lightning Web Component files, running anonymous Apex scripts, and executing SOQL queries with optional Performance Plans. Developers can also run test suites, manage Trace Flags for debugging, and navigate the entire metadata tree using the Org Browser.

Access controls differ by environment, allowing read-only inspection in production orgs while permitting direct saves in sandboxes. Administrators can enable the feature through the Setup menu, where it is turned on by default. The announcement clarifies that this lightweight single-org editor targets quick troubleshooting and routine edits, distinct from the heavier virtual machine-backed Agentforce Vibes IDE.
