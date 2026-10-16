---
title: Send Custom Notifications in Salesforce using Flow Builder without writing Apex
original_title: "Send Custom Notifications in Salesforce Using Flow: A No-Code Guide"
url: https://dev.to/rohanmehta/send-custom-notifications-in-salesforce-using-flow-a-no-code-guide-1547
source: dev.to
source_type: community
date: 2026-10-16
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - flow-builder
  - custom-notifications
  - notification-builder
  - record-triggered-flow
  - mobile-push
authors:
  - Rohan Mehta
why_read: You will learn how to configure Notification Builder and build a Flow that pushes targeted alerts to desktop and mobile users. The guide covers recipient targeting, deep linking, and best practices to avoid notification spam.
interest_score: 6
depth_score: 6
novelty_score: 3
utility_score: 8
model: qwen/qwen3.7-flash
held_from: 2026-10-13
---

The article explains how to implement Custom Notifications in Salesforce using Flow Builder instead of Apex. It begins by outlining the prerequisite setup in Notification Builder, where administrators define a notification type and select delivery channels such as desktop or mobile.

It then walks through creating a Record-Triggered Flow with entry criteria to control when alerts fire. The guide details how to use the Send Custom Notification action element, wire up the notification type ID, construct dynamic titles and bodies with formula resources, and populate recipient collections using Get Records. It also explains how to set a target ID to enable deep linking directly to the relevant record.

A practical scenario demonstrates using a scheduled Flow to alert managers about stalled high-value opportunities. The author concludes with implementation tips, emphasizing concise titles, aggressive filtering to prevent spam, verifying sharing settings for non-admin testers, and reserving mobile push notifications for urgent escalations.
