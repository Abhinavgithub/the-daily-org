---
title: Checking a Salesforce Data Export is complete before migrating
original_title: How to check that a Salesforce Data Export is complete before you migrate
url: https://dev.to/richardc_ailstudio/how-to-check-that-a-salesforce-data-export-is-complete-before-you-migrate-2c2d
source: dev.to
source_type: community
date: 2026-11-11
section: devops
personas:
  - admin
  - developer
  - architect
tags:
  - data-export
  - data-loader
  - soql-count
  - data-migration
  - csv-validation
authors:
  - Richard C
why_read: You will learn how to confirm every archive, object and file arrived from a Data Export and how to reconcile CSV row counts against SOQL COUNT() before a target load. You will also learn the documented gaps, such as excluded Formula Fields and Recycle Bin data.
interest_score: 7
depth_score: 7
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A sequence of checks to run on a Data Export before migrating from it
  steps:
    - Download every archive within 48 hours
    - Confirm each expected object CSV is present
    - Confirm attachments and files were included
    - Compare each CSV row count to SOQL COUNT()
---

A finished Data Export job does not guarantee a complete file set. Archives can be missing, expire after 48 hours, or be overwritten when a new export is queued, so the piece recommends downloading every zip promptly and counting them against what was saved. It also flags that Sandboxes do not support Data Export and that the scheduling user receives the download email.

The article then covers checking objects and files: forgetting to tick the options for attachments or Salesforce Files leaves files out, Formula Fields and Roll-Up Summary Fields are always excluded, and Data Loader does not obtain physical attachments. Chatter and content files in weekly exports come as MIME files named after the record ID, and Data Loader's ContentDocument export only returns files the user owns or that are shared directly with them unless Query All Files is granted.

For row counts, the author compares each CSV's data rows to a SOQL COUNT() run by a user with comparable visibility, matching the export mode to the query, and counting outside Excel for files above about 1,048,576 rows. A worked spreadsheet example with Match and Review status formulas shows how a short Contact file is caught. A matching count does not prove that attachments open or that parent relationships are correct.
