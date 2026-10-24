---
title: Manually enter a default no-reply address in Salesforce Flow without changing its configuration
original_title: How to Use the Default No-Reply Address in Salesforce Flow
url: https://salesforcetime.com/2026/10/21/how-to-use-the-default-no-reply-address-in-salesforce-flow/
source: Salesforce Time
source_type: community
date: 2026-10-24
section: flow-and-admin
personas:
  - admin
tags:
  - salesforce-flow
  - organization-wide-email-address
  - send-email-action
  - email-sender
  - workflow-workaround
authors:
  - Yumi Ibrahimzade
why_read: You will learn how to send emails through Salesforce Flow using an Organization-Wide Email Address configured exclusively as a default no-reply sender. The guide explains the manual entry workaround and advises validating the behavior in your own org before deploying to production.
interest_score: 6
depth_score: 3
novelty_score: 4
utility_score: 7
model: qwen/qwen3.7-flash
image: https://salesforcetime.com/wp-content/uploads/2026/10/image-15-1024x375.png
held_from: 2026-10-22
figure:
  kind: steps
  caption: How to send a Flow email from a Default No-Reply Address without changing its purpose
  steps:
    - Add an Action element and select Send Email
    - Set Sender Type to OrgWideEmailAddress
    - Type the address into Sender Email Address
    - Or pass a Text resource holding the address
  icons:
    - mail
    - gear
    - search
    - doc
---

Salesforce Flow hides Organization-Wide Email Addresses that are configured strictly as default no-reply senders. While changing the address purpose to allow user selection works, it modifies existing configurations that may rely on the restricted setting.

The recommended approach bypasses the dropdown menu entirely by typing the exact email address directly into the Sender Email Address field. A Text resource holding the address can also be passed to the same field. Salesforce documentation supports using Text resources to supply Organization-Wide Email Addresses, which makes this method functionally sound.

The author notes that this behavior acts as a tested workaround rather than an officially documented exception for default no-reply addresses. Readers should verify the flow in a test environment to ensure consistent email delivery before implementing it in live business processes.
