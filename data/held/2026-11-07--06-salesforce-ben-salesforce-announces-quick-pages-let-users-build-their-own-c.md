---
title: Quick Pages lets users build their own read-only views in beta
original_title: Salesforce Announces Quick Pages – Let Users Build Their Own Custom Pages
url: https://www.salesforceben.com/salesforce-announces-quick-pages-let-users-build-their-own-custom-pages/
source: Salesforce Ben
source_type: community
date: 2026-11-07
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - quick-pages
  - agentforce-coworker
  - permission-sets
  - platform-security-model
  - beta
authors:
  - Ross Collie
why_read: You will learn how the Quick Pages beta is enabled and permissioned, what it can and cannot access, and what governance and prerequisites an admin must check before rolling it out.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a user gets a Quick Page, from enabling the feature to sharing it
  steps:
    - Enable Quick Pages (Beta) in Setup
    - Assign View or Create Permission Set
    - User describes the page in the sidebar
    - Preview, save and share the page
  icons:
    - gear
    - shield
    - person
    - chart
image: https://www.salesforceben.com/wp-content/uploads/2026/11/qp1.webp
---

Salesforce has launched Quick Pages in beta, a feature that lets end users describe in plain language the single-page view they want, such as charts, tables, tabs and actions drawn from several objects, and share the result with users, public groups or the whole org. Access is controlled by two Permission Sets: Create and View Quick Pages (Beta) for building and managing pages, and View Quick Pages (Beta) for viewing only. Users without either set cannot reach the feature, and the Salesforce Platform Security Model governs what the pages can show.

The author stresses that Quick Pages are a read-only interface over existing data and do not create Lightning Pages, Lightning Web Components or other metadata. The feature needs Lightning Experience on Enterprise, Performance, Unlimited or Developer editions with Foundations on Hyperforce, plus Salesforce App Domain, Edge Network and Einstein Generative AI enabled. It is not available on Alibaba Cloud or Government Cloud, cannot use Data 360, Files, CMS or external APIs, and times out prompts after two minutes. AI usage is free during the beta but will be metered at general availability.

Because the feature is in beta, Salesforce may change or withdraw it, so admins should plan carefully before depending on it. Record updates, Apex and Connect REST API support, Data 360 support and Claude integration are under consideration.
