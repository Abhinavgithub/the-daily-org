---
title: How the Salesforce order of execution sequences flows, triggers and validation
original_title: "Salesforce Order of Execution: 9 Important Steps Every Admin and Developer Should Understand"
url: https://dev.to/neha_6ddfbf87f8ffe5f87b89/salesforce-order-of-execution-9-important-steps-every-admin-and-developer-should-understand-6ng
source: dev.to
source_type: community
date: 2026-11-18
section: architecture
personas:
  - developer
  - admin
  - architect
tags:
  - order-of-execution
  - record-triggered-flow
  - apex-triggers
  - validation-rules
  - automation-design
authors:
  - Neha
why_read: You will learn the rough sequence in which Salesforce runs Flows, Apex triggers, Validation Rules and after-save automation when a record is saved, and why that order matters when several automations touch the same record. The article is a general overview rather than a detailed reference.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The main stages Salesforce runs when a record is saved
  steps:
    - Initial record submission
    - Before-save Record-Triggered Flows
    - Before Apex triggers
    - Validation and duplicate rules
    - Save to database, not yet committed
    - After triggers and after-save flows
    - Commit and post-commit operations
  icons:
    - doc
    - flow
    - code
    - check
    - database
    - flow
    - rocket
---

When a record is created, updated or deleted, Salesforce runs several kinds of automation in a defined sequence. The article says this matters because multiple automations touching the same record can produce unexpected results, repeated updates or errors. Understanding the sequence helps teams troubleshoot and avoid needless complexity.

The process starts with the initial submission, whether from the user interface, the API, Apex, Data Loader or an external application. Before-save Record-Triggered Flows then run before the record is written to the database, and are described as efficient for simple field updates because they avoid an extra save. Before Apex triggers follow, with a short example that sets a default value on a Contact description. Validation Rules and duplicate rules run before the save completes.

Once the record is saved to the database, the transaction is not yet committed, so later errors can still roll the changes back. After triggers and after-save flows then run, handling tasks such as creating related records, sending notifications or starting further processes. The article also notes that legacy workflow, escalation and assignment rules can cause extra updates that re-run parts of the sequence. After a successful transaction, the changes are committed and post-commit work such as Queueable Apex, future methods and scheduled paths can run.

The article closes with common mistakes: several Flows on one object without reviewing their order, duplicating field updates across Flows and Apex triggers, ignoring recursion, and skipping tests for API updates. Its advice is to review existing automation on an object before adding a new Flow, trigger or Validation Rule.
