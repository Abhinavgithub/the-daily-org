---
title: Salesforce delivers long-awaited Flow actions, List View permissions, and User history tracking
original_title: Salesforce Just Delivered 5 Long-Awaited IdeaExchange Features
url: https://www.salesforceben.com/salesforce-just-delivered-5-long-awaited-ideaexchange-features/
source: Salesforce Ben
source_type: community
date: 2026-10-17
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - flow-builder
  - list-view
  - permission-set
  - field-history-tracking
  - user-interface
authors:
  - Tom M
why_read: Readers will learn how to configure mass Screen Flow actions in List View layouts, restrict List View sharing without granting broad permissions, and enable Field History Tracking on the User object.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
figure:
  kind: parts
  caption: Five long-requested IdeaExchange ideas finally shipped in recent releases
  whole: Delivered IdeaExchange Features
  parts:
    - Flow Quick Actions in List Views
    - Manage Shared List Views Permission
    - Inline Editing on List Views
    - Field History Tracking for Users
    - Restart Superbadge Progress
figure_image: /figures/2026-10-17/05-salesforce-ben-salesforce-just-delivered-5-long-awaited-ideaexchange-featur.webp
---

The latest IdeaExchange updates highlight several features delivered in Winter '27 and Summer '26 that resolve long-standing administrative limitations. Administrators can now execute Screen Flow actions against multiple records selected in List View layouts or Related Lists by passing record identifiers into a text collection variable, eliminating the need for custom components or workarounds.

A new Manage Shared List Views permission replaces the broad Manage Public List Views requirement, allowing targeted sharing without exposing all public views across the organization. Winter '27 also removes the restriction preventing inline editing in List Views containing multiple record types, though administrators must manually activate the setting in User Interface Settings and test it carefully due to varying Validation Rules and picklist values.

Field History Tracking is now available for the User object, monitoring up to twenty fields such as profile, role, and manager changes for eighteen months. The article also notes that Trailhead Superbadges can now be restarted after completion, supporting skill reinforcement rather than single-use certification, while additional roadmap items like dark mode and Opportunity restriction rules remain in development.
