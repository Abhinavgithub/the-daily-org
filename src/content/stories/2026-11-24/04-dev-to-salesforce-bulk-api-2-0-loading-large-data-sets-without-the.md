---
title: Loading large Data sets with Bulk API 2.0 and avoiding common failures
original_title: "Salesforce Bulk API 2.0: Loading Large Data Sets Without the Headaches"
url: https://dev.to/rohanmehta/salesforce-bulk-api-20-loading-large-data-sets-without-the-headaches-39ap
source: dev.to
source_type: community
date: 2026-11-24
section: integration
personas:
  - developer
  - admin
tags:
  - bulk-api-2-0
  - data-loader
  - external-id
  - upsert
  - data-migration
  - governor-limits
authors:
  - Rohan Mehta
why_read: You will learn how Bulk API 2.0 jobs work, the limits that govern them, and practices such as external-ID upserts, load ordering and failure reconciliation that keep large loads repeatable.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The job flow Bulk API 2.0 follows from creation to completion
  steps:
    - Create job
    - Upload CSV
    - Close job
    - Check job status
    - Download failed records
  icons:
    - gear
    - doc
    - check
    - clock
    - warning
---

Bulk API 2.0 is Salesforce's asynchronous data-loading API. Rather than sending records one request at a time, you create a job, upload a CSV file, close the job, and check its status while Salesforce processes the records in the background. Success and failure files are available for download, so the outcome of every record can be accounted for.

The article recommends it for thousands of records or more, such as migrations, nightly syncs and bulk cleanups, and suggests the standard Data Loader or Import Wizard for smaller volumes. It stresses that a bulk load multiplies the quality of its source file, so data should be cleaned first by standardizing picklist values, deduplicating and validating required fields.

Five practices are offered. Upsert against a stable External ID so re-runs do not create duplicates. Keep files within the limits of 150 MB per CSV and 150 million records per job, splitting very large loads into logical chunks. Watch the job through its states of Open, UploadComplete, InProgress and JobComplete, and download the failed-records file, which gives an error per row. Respect the daily limits of 10,000 Bulk API batches per rolling 24 hours and 15,000 Bulk API 2.0 jobs per day in most editions. Load parent records before children.

The piece also notes gotchas. Validation Rules still fire, so blocked rows fail while the rest succeed. Triggers and Flows run on every record and can slow the job or hit governor limits, so non-essential automation may be deactivated during a migration window. The hardDelete operation is permanent and skips the Recycle Bin, so it should be tested on a small batch first.
