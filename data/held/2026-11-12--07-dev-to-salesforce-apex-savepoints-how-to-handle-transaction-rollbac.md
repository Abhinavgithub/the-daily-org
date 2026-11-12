---
title: Using Apex savepoints to roll back a failed multi-step transaction
original_title: "Salesforce Apex Savepoints: How to Handle Transaction Rollbacks"
url: https://dev.to/neha_6ddfbf87f8ffe5f87b89/salesforce-apex-savepoints-how-to-handle-transaction-rollbacks-2jfn
source: dev.to
source_type: community
date: 2026-11-12
section: apex-and-platform
personas:
  - developer
tags:
  - apex
  - savepoint
  - database-rollback
  - transaction-control
  - dml
authors:
  - Neha
why_read: You will learn how Database.setSavepoint() and Database.rollback() undo DML made after a savepoint, and where that protection stops, such as external callouts and emails. The article includes a short worked example.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a savepoint lets a failed Apex transaction undo its earlier database changes
  steps:
    - Call Database.setSavepoint()
    - Insert the Account
    - Insert the related Contact
    - "Contact insert fails: catch the exception"
    - Call Database.rollback(sp) to undo the Account
---

The article describes a common problem: an Apex method performs several database operations, and a later one fails, leaving earlier changes saved. Savepoints address this by marking a point in the current transaction that can later be restored.

It presents two methods. Database.setSavepoint() creates the marker, and Database.rollback() reverses database changes made after it. The worked example creates an Account and a related Contact inside a try block, and on exception rolls back to the savepoint so the Account insert is undone.

The author notes that rollback does not undo every side effect. External API calls and emails already sent are outside the database transaction and are not reversed. The article also contrasts savepoints with partial-success DML using Database.insert(records, false), which is a different approach from a full rollback.

The limitations listed include that savepoints apply only within the current transaction, that Salesforce caps the number of savepoints, that certain transaction-control operations can invalidate them, and that DML and other transaction limits still apply. Best practices suggest creating savepoints only before operations that may need reversing, using clear exception handling, and testing both success and failure paths.
