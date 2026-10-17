---
title: Block unwanted outbound emails in Email-to-Case using Custom Metadata and Apex
original_title: "Stop Unwanted Emails from Leaving Salesforce: Blocking Addresses in Email-to-Case"
url: https://dev.to/rohanmehta/stop-unwanted-emails-from-leaving-salesforce-blocking-addresses-in-email-to-case-2m6b
source: dev.to
source_type: community
date: 2026-10-17
section: apex-and-platform
personas:
  - developer
  - admin
tags:
  - email-to-case
  - custom-metadata-types
  - apex-trigger
  - service-cloud
  - emailmessage
authors:
  - Rohan Mehta
why_read: The reader will learn how to prevent accidental outbound replies in Email-to-Case by storing blocked addresses in a Custom Metadata Type and enforcing them with an Apex trigger on EmailMessage.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 9
model: qwen/qwen3.7-flash
---

Agents frequently reply to internal distribution lists or automated mailboxes during Email-to-Case interactions, causing infinite loops or unintended data exposure. Standard workarounds rely on hardcoded Validation Rules or Apex classes, which demand repeated testing and deployments whenever the blocklist changes.

The proposed solution moves the restriction list into a Custom Metadata Type. Administrators gain direct access to manage blocked addresses through Setup, removing the need for developer intervention or version control cycles for simple address updates.

Enforcement occurs via a before insert trigger on the EmailMessage object paired with a dedicated handler class. The code isolates outbound communications, verifies the fifty hundred parent identifier to limit scope to cases, and compares recipient addresses against the metadata records using case insensitive matching.

When a restricted address appears in the to or cc fields, the trigger applies an error that prevents the message from sending. This architecture keeps the logic modular, avoids interfering with inbound case creation or unrelated email automation, and provides a reusable template for other metadata driven routing rules.
