---
title: B2C Commerce release 26.9 introduces edge credential detection and SFRA password warnings
original_title: Stop Credential Stuffing with B2C Commerce eCDN
url: https://developer.salesforce.com/blogs/2026/10/stop-credential-stuffing-with-b2c-commerce-ecdn
source: Salesforce Developers Blog
source_type: official
date: 2026-10-15
section: releases
personas:
  - developer
  - architect
tags:
  - b2c-commerce
  - ecdn
  - cloudflare
  - sfra
  - credential-stuffing
  - waf-rules
authors:
  - Sarah Welker
why_read: Readers will learn how to configure Cloudflare firewall and rate limiting rules in B2C Commerce to block leaked credentials, and how to implement server-side header checks in SFRA to prompt users to rotate breached passwords.
interest_score: 6
depth_score: 8
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261013145359/Generic-C-7-e1791928453298.png?w=1000
---

The September 2026 update to B2C Commerce adds built-in credential stuffing protection through its eCDN layer without requiring additional entitlements. Four new detection fields evaluate login attempts against known breach data, allowing administrators to create custom firewall and rate limiting rules at the network edge.

The article provides exact rule syntax examples to throttle malicious traffic while preserving verified search crawlers. It explains how to use managed challenges for password leaks and emphasizes separating counting expressions from rule expressions to avoid penalizing legitimate bot activity.

For storefront implementations, the piece details how to read a server-side request header added by Cloudflare after a successful login. A working SFRA code example demonstrates how to map header values to user-facing warning messages and direct shoppers to a password reset flow, deliberately avoiding failed login responses to prevent information leakage to attackers.

Finally, the author outlines monitoring strategies using Security Analytics in Business Manager and eCDN Logpush exports, recommending these detections as a baseline before layering in broader bot mitigation controls.
