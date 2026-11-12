---
title: Reconciling record counts and parent relationships after a Salesforce load
original_title: How to check record counts and parent relationships after a Salesforce load
url: https://dev.to/richardc_ailstudio/how-to-check-record-counts-and-parent-relationships-after-a-salesforce-load-1k5a
source: dev.to
source_type: community
date: 2026-11-12
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - data-loader
  - bulk-api
  - soql
  - data-migration
  - lookup-relationships
  - record-counts
authors:
  - Richard C
why_read: You will learn how to reconcile source and target row counts for each object using Data Loader's success and error files, and how to find children with blank parent lookups or missing children per parent using SOQL. The examples are illustrative and were tested in LibreOffice Calc.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Reconciliation sequence for a finished load, from object counts to per-parent checks
  steps:
    - Count success and error rows
    - Compare with source and target COUNT()
    - Count children with blank parent
    - Compare children per parent
  icons:
    - check
    - search
    - warning
    - layers
---

After a Data Loader or Bulk API job finishes, a load can be short on rows or leave parent lookups blank even when every child is accepted. The article suggests reconciling counts per object using the job's success and error files, along with the JobInfo fields numberRecordsProcessed and numberRecordsFailed when the Bulk API is used. It then compares those numbers with a SOQL COUNT() on the target object, and shows spreadsheet formulas to check that success plus error matches the source and that the target matches the success file.

The second step checks whether parents resolved. A SOQL COUNT() with a WHERE clause on a blank lookup field shows how many children have no parent, and a relationship query reads the parent name to inspect those rows. The author notes that a blank lookup may be legitimate on an optional field, so these rows should be treated as a review list rather than a failure.

The third step compares child counts per parent between source and target, using GROUP BY with COUNT on a shared external key, since record Ids usually change between orgs. A parent can look correct overall yet be short because some of its children were rejected. The example shows one parent with two children in the source and none in the target, flagged for review.

The article closes by noting that matching counts do not prove each child is attached to the intended parent, and that SOQL can only count records the user can see. It also advises removing personal fields before sharing exports. The piece ends with a promotion for a paid export review service, which is not part of the technique.
