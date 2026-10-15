---
title: Winter '27 release brings user history tracking and manual share retention
original_title: "Salesforce Winter ’27 Admin Highlights: Top Data, Security and UX Gems"
url: https://salesforcebreak.com/2026/10/14/winter-27-release-updates-admin/
source: Salesforce Break
source_type: community
date: 2026-10-15
section: releases
personas:
  - admin
tags:
  - winter-release
  - user-object
  - field-history-tracking
  - lightning-app-builder
  - sharing-settings
authors:
  - Meredith Anglin
why_read: Readers will learn how to enable native field history tracking on the User object, preserve manual record shares during ownership transfers, and leverage new Lightning App Builder layout controls without writing code. They will also discover diagnostic tools for monitoring Custom Field indexing and query frequency to reduce technical debt.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://salesforcebreak.com/wp-content/uploads/2026/10/Salesforce-Winter-27-Admin-Highlights-Top-Data-Security-and-UX-Gems.png
---

The Winter '27 release makes field history tracking generally available for the User object, allowing administrators to monitor up to twenty fields such as profile, role, and active status directly through the Object Manager. An org-wide toggle under Sharing Settings now prevents manual record shares from being deleted when a record owner changes, which helps maintain collaboration during territory restructures.

The update expands Lightning App Builder capabilities by adding dynamic sorting for Related Lists based on formulas or lookups, conditional section headers that show or hide accordion groups, and scheduling tools for in-app prompts to prevent user fatigue. These layout enhancements align with SLDS 2 Cosmos accessibility standards and require no custom components.

Administrators can now view index status reports for Custom Fields within the Performance Metrics dashboard to troubleshoot slow SOQL queries and report timeouts. Object Manager also displays last modified dates and query frequency for each Custom Field, enabling safer and faster cleanup of unused fields before deprecation.
