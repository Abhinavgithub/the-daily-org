---
title: Finding hidden duplicate accounts after a Salesforce Data migration
original_title: How to find duplicate records after a Salesforce data migration (before users do)
url: https://dev.to/richardc_ailstudio/how-to-find-duplicate-records-after-a-salesforce-data-migration-before-users-do-25ej
source: dev.to
source_type: community
date: 2026-11-07
section: devops
personas:
  - admin
  - architect
tags:
  - data-migration
  - duplicate-records
  - external-id
  - data-loader
  - soql
  - data-quality
authors:
  - Richard C
why_read: You will learn how to normalise legacy keys, count duplicates in a spreadsheet and in SOQL, separate true duplicates from key collisions, and repoint child records before deleting a duplicate Account.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The duplicate clean-up sequence for migrated Accounts
  steps:
    - Normalise the legacy key
    - Count raw and normalised keys
    - Classify each duplicate group
    - Repoint child records
    - Delete the duplicate
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2F82k13o7ludeu6zo9t0jc.png
---

Matching record counts after a migration can hide duplicates. Re-run loads, insert calls used where an upsert on an External ID was needed, and keys that differ only by case, spaces or leading zeros all leave duplicates behind. Salesforce duplicate and matching rules do not examine a legacy key unless a rule is built for it.

The article walks through normalising the key with spreadsheet formulas, counting raw and normalised keys, and classifying each group as unique, exact duplicate, hidden duplicate or key collision. A SOQL GROUP BY query with HAVING clause provides the same check inside the org, though it catches case differences only, not leading zeros or trailing spaces.

Before deleting anything, the author chooses a survivor, usually the Account with the most Contacts, and repoints Contacts, Opportunities and Cases to it with Data Loader or the Account merge operation. The checklist ends with marking the External ID field Unique so the next load cannot insert the same key twice.
