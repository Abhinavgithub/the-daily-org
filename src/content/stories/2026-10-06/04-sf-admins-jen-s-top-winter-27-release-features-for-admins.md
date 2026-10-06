---
title: Winter 27 release adds inline editing, sharing controls, email security, and report previews
original_title: Jen’s Top Winter ’27 Release Features For Admins
url: https://admin.salesforce.com/blog/2026/jens-top-winter-27-release-features-for-admins
source: Salesforce Admins Blog
source_type: official
date: 2026-10-06
section: releases
personas:
  - admin
  - architect
tags:
  - list-view-inline-editing
  - user-field-history-tracking
  - sharing-rules
  - email-domain-verification
  - lightning-reports
  - winter-27-release
authors: []
why_read: You will learn how to configure new Winter 27 capabilities that improve List View editing, preserve manual sharing during record transfers, streamline email domain verification, and enhance Lightning Reports and Dashboards.
interest_score: 6
depth_score: 4
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20261001111316/ListViews-InlineEditing-300x160.gif
---

The article outlines key Winter 27 enhancements for administrators, starting with core platform and interface updates. Inline editing on List Views now supports multiple Record Types and bypasses Page Layout restrictions when activated through User Interface Settings. User Field History Tracking becomes generally available, allowing tracking of up to twenty fields on the User object with data retained for eighteen months. Administrators can also surface the standard Follow button directly within the Dynamic Highlights Panel on record pages.

Permissions and security receive significant attention with changes to sharing frameworks and email management. A new organization-level setting prevents the automatic deletion of Manual Shares when record ownership changes, while future updates will introduce Custom Row Causes for Standard Objects to clarify sharing reasons. Security improvements include streamlined Passkey registration, a consolidated User Email Domains dashboard, and the ability to import verified domains directly into sandboxes without repeating DNS verification. Sensitive transactional emails can be routed through a secondary sender address, and Experience Cloud sites can explicitly trust specific Chrome extension identifiers.

Reporting and dashboard tools gain usability upgrades through beta features. Lightning Reports introduce a preview mode that displays record details in a side panel without disrupting the current filtered view. Joined Reports can be configured to display only matching rows across all blocks using a new toggle. Additionally, Lightning Dashboards can be embedded directly into Lightning Web Runtime Experience Cloud sites, expanding how analytics are presented to external users.
