---
title: Quick Pages beta lets users build governed single-page views in Salesforce
original_title: "Introducing Quick Pages (Beta): Tailored Views for Every Role"
url: https://www.salesforce.com/blog/introducing-quick-pages-builder-tool/
source: Salesforce Blog
source_type: official
date: 2026-11-06
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - quick-pages
  - agentforce
  - headless-toolkit
  - permission-sets
  - beta
authors:
  - Ted Conn
  - Ahmed Ghanem
why_read: You will learn what Quick Pages does, how its Permission Sets and read-only beta limits affect your org, and what is planned next. Useful if you plan to let users build their own views.
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a user builds and shares a Quick Page in the beta
  steps:
    - Describe the page in natural language
    - Review a live preview as it is built
    - Share with individuals, groups or the org
  icons:
    - doc
    - search
    - people
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Screenshot-2026-11-02-at-1.09.47-PM-1.png?strip=all&#038;quality=95
---

Quick Pages, now in beta, lets users in an org build and share their own single-page apps with charts, data tables, tabs and actions, described in natural language through Agentforce Coworker or the Quick Pages tab. The pages are grounded in the org's metadata, including Custom Objects and fields, and show a live preview while they are built.

The pages follow the standard Salesforce security model, so users see only the data they can access, and they pull from live data rather than going stale. Building a page does not change the org's metadata. Admins control access with the "Create and View Quick Pages (Beta)" and "View Quick Pages (Beta)" Permission Sets, and can view and manage every page. The Headless Toolkit applies the same permission checks and data rules whichever client builds the page.

During beta, AI chat is free but will be metered at general availability. Pages built in beta are read-only, so users cannot change records from them yet, and they will remain viewable after general availability. Planned additions include record editing, Apex and Connect REST API data sources, Data 360 support, and a Claude integration.
