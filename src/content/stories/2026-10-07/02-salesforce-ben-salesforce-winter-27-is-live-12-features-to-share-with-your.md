---
title: Salesforce Winter '27 brings Flow testing, bulk screen actions, and higher heap limits
original_title: "Salesforce Winter ’27 Is Live: 12 Features to Share With Your Team"
url: https://www.salesforceben.com/salesforce-winter-27-is-live-12-features-to-share-with-your-team/
source: Salesforce Ben
source_type: community
date: 2026-10-07
section: releases
personas:
  - developer
  - admin
  - architect
tags:
  - flow-builder
  - test-mode
  - apex-heap-limit
  - rest-api
  - field-history-tracking
authors:
  - Ross Collie
why_read: Readers will learn how to implement the new Flow Test Mode, process multiple records via List Views, and adjust to increased Apex heap limits and updated REST API versioning without manual tracking.
interest_score: 7
depth_score: 6
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.salesforceben.com/wp-content/uploads/2026/08/2026-08-18-21.38.09.gif
---

The release introduces Test Mode for Flow Builder, enabling repeatable testing with assertions and mock outputs for external callouts. Screen Flows launched from List Views or Related Lists can now process multiple selected records by accepting a lowercase ids collection variable. Reactive Formulas allow Conditional Visibility to evaluate same-screen inputs instantly, while new save-time validation catches missing Required Fields and character limit breaches before runtime.

Logic handling gains Split by Field Value and Split by Date elements, which create automatic branches but do not fully replace Decision elements. Navigation improves through an Unused Resources filter, Element Grouping, and an Edit History panel. Security receives a User Context option that enforces running user permissions, and an org-wide toggle preserves Manual Shares when record ownership changes.

Synchronous Apex transactions now support a 10 megabyte heap limit, while asynchronous transactions reach 25 megabytes, with a transition setting available to manage the shift. List View inline editing expands to include off-page layout fields and mixed Record Types. Integrations may use latest for REST API versioning, and Field History Tracking becomes generally available for the User object.
