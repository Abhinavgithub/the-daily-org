---
title: Reconciling record Counts and field values before a Salesforce go-live
original_title: "Salesforce data migration testing: how to reconcile record counts and field values before go-live"
url: https://dev.to/richardc_ailstudio/salesforce-data-migration-testing-how-to-reconcile-record-counts-and-field-values-before-go-live-3k0b
source: dev.to
source_type: community
date: 2026-11-09
section: devops
personas:
  - admin
  - developer
  - architect
tags:
  - data-migration
  - external-id
  - record-count-reconciliation
  - soql
  - go-live-testing
authors:
  - Richard C
why_read: You will learn a spreadsheet-based method for proving a Salesforce data migration is complete and accurate, using external keys, SOQL counts and totals, and case-sensitive value comparisons. You will also see how to tell nulls and truncation apart from other mismatches.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The migration check runs in four steps, from counts to sign-off
  steps:
    - Reconcile record counts per object
    - Compare totals on amount fields
    - Compare field values on an external key
    - Sign off each object
  icons:
    - database
    - chart
    - search
    - check
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fpmklifig343oyyvx9nzg.png
held_from: 2026-11-06
---

A load that finishes without errors only shows that Salesforce accepted the rows sent to it. It does not show that every source record arrived or that the values arrived unchanged. The article sets out a check per object that compares record counts with SOQL, excluding records created by hand in the sandbox and records left out on purpose, and reports the difference in a status column.

Count matches are not enough on their own, so the author compares summed amounts per object and per StageName group, including the handling of corporate-currency totals in multi-currency orgs. Field values are then matched on an External ID using INDEX and MATCH, with EXACT used for a case-sensitive comparison and a sample taken for large objects. Nulls and truncation are flagged separately, because they have different causes and fixes.

The article closes with a per-object sign-off table that can only read Ready when counts, totals and value checks all pass, with a Counts only status for objects whose values have not been checked. The formulas were tested in LibreOffice Calc and are noted as untested in Excel and Google Sheets.
