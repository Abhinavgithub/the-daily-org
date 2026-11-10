---
title: Checking a Contact export for orphans, duplicate External IDs and picklist mismatches after a load
original_title: "Check a Salesforce Contact export after a load: orphans, duplicate External IDs, and picklist mismatches"
url: https://dev.to/richardc_ailstudio/check-a-salesforce-contact-export-after-a-load-orphans-duplicate-external-ids-and-picklist-17d6
source: dev.to
source_type: community
date: 2026-11-10
section: devops
personas:
  - admin
  - developer
tags:
  - data-loader
  - external-id
  - picklist
  - orphan-records
  - post-load-validation
  - soql
authors:
  - Richard C
why_read: You will learn how to count orphaned Contacts, unresolved AccountIds, duplicate External IDs and picklist values outside the allowed API names, using spreadsheet formulas, a standard-library Python script and SOQL. The article also explains what these checks cannot catch.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Four checks run on the exported files after a load
  steps:
    - Export Contacts and Accounts
    - Flag blank and unresolved AccountIds
    - Find duplicate External IDs
    - Compare picklist to allowed API names
  icons:
    - doc
    - search
    - layers
    - check
---

A successful Data Loader insert or upsert can still leave a Contact export with problems the success file does not show. The article covers blank AccountIds, AccountIds that point to no Account in the export, External IDs shared by more than one Contact, and picklist values that are not among the field's allowed API names.

The walkthrough works through example files and three methods: spreadsheet formulas that flag each problem column, a Python script using only the standard library, and SOQL queries to confirm the counts against the live org. It notes that SOQL returns picklist API names rather than labels, and that values loaded into an unrestricted picklist can be stored without being listed in Setup.

The author stresses that orphans are a review list rather than a delete list, and that a wrong but existing AccountId needs a separate source-to-target comparison. The example data is fabricated and the reader must adapt field headers to their own org.
