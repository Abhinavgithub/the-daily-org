---
title: Finding missing and duplicate records after a migration by matching external keys
original_title: How to find missing and duplicate records after a Salesforce migration (match on an external key)
url: https://dev.to/richardc_ailstudio/how-to-find-missing-and-duplicate-records-after-a-salesforce-migration-match-on-an-external-key-mbf
source: dev.to
source_type: community
date: 2026-11-04
section: integration
personas:
  - admin
  - developer
tags:
  - data-migration
  - external-id
  - spreadsheet-reconciliation
  - duplicate-detection
  - data-loader
authors:
  - Richard C
why_read: You will learn a method to reconcile two CSV exports on a shared External ID, using spreadsheet formulas to flag records that are missing, extra, duplicated or have blank or mismatched keys. You will also see why to check parent objects first.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Reconciling source and target exports by external key, in order
  steps:
    - Export source and target with the shared key
    - Count blank and duplicate keys per sheet
    - Match each row in both directions
    - Review missing, extra and duplicate statuses
    - Repeat per object, parents first
  icons:
    - doc
    - search
    - check
    - warning
    - layers
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2F0mm9rzso3vtgybrw73ek.png
---

After a migration, record counts can look right while hiding records that never arrived, records loaded twice, and records with no source. The article argues that the Salesforce Id cannot be used for matching because it is regenerated on insert, so you need a key present on both sides, such as a legacy ID held in an External ID field like Legacy_ID__c.

The method uses two exports and a spreadsheet. Keys are first checked for blanks and duplicates with a case-sensitive EXACT-based count, since COUNTIF ignores case. A status formula on each sheet then labels each row as OK, Missing in target, Extra in target, Duplicate key, Blank key or similar, which is checked in both directions so that a duplicate in the target shows up only when both sides are compared.

The author recommends running this per object, starting with Accounts and then Contacts and Opportunities, because a missing parent explains gaps underneath it. The method does not compare field values or verify parent relationships; the article points to separate posts for those checks and mentions a paid tool it sells.
