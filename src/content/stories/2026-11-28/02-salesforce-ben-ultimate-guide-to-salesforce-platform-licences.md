---
title: Choosing between Salesforce Platform licenses and full licenses
original_title: Ultimate Guide to Salesforce Platform Licences
url: https://www.salesforceben.com/salesforce-platform-licenses/
source: Salesforce Ben
source_type: community
date: 2026-11-28
section: architecture
personas:
  - admin
  - architect
tags:
  - platform-licences
  - lightning-platform-starter
  - lightning-platform-plus
  - custom-objects
  - licence-selection
authors:
  - Andreea Doroftei
why_read: You will know what each Platform license type includes, which objects and features it blocks, and how to pick between Starter, Plus, Login and a full Sales or Service license.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://www.salesforceben.com/wp-content/uploads/2021/09/Blog-Graphic-Ultimate-Guide-to-Salesforce-Platform-Licenses.webp
---

Platform licences are a cheaper alternative to full Sales or Service licences for users who do not need the full feature set. All Platform licences include standard features such as Accounts, Reports, Approvals and Automations. The Lightning Platform Starter licence allows up to 10 Custom Objects and is assigned per user, while the Salesforce Platform Login licence also allows up to 10 Custom Objects but is assigned per login, which suits users who log in infrequently. The Lightning Platform Plus licence allows up to 110 Custom Objects. Custom Objects in publicly available Managed Packages on AgentExchange do not count towards these limits.

The article sets out the limits on each licence. Platform licences provide different Data Storage, File Storage and daily API call allowances, with some applying only to the Starter licence. They cannot access objects such as Contracts, Leads, Opportunities, Orders, Price Books, Products, Quotes and Service Appointment, and support agents working on Cases need a Service licence. Industry-specific features also require their own licence. The article warns against recreating standard objects as Custom Objects to avoid these restrictions, noting it may conflict with the Master Service Agreement.

The article gives a decision path. If a user needs an excluded object, a Platform licence is unsuitable. Otherwise, if up to 10 Custom Objects are enough, frequent daily logins point to Starter and rare logins point to Login, while needing up to 110 Custom Objects points to Plus. Beyond that, a different licence type is needed. The article concludes that Platform licences suit basic CRM use, and that organisations can mix licence types across their users.
