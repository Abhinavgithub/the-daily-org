---
title: Building a Salesforce–NetSuite sync in Python that proves the two systems agree
original_title: A Salesforce–NetSuite Sync in Python That Proves the Two Systems Agree
url: https://dev.to/eproxim/a-salesforce-netsuite-sync-in-python-that-proves-the-two-systems-agree-28bn
source: dev.to
source_type: community
date: 2026-11-18
section: integration
personas:
  - developer
  - architect
tags:
  - salesforce-netsuite-sync
  - field-ownership
  - external-ids
  - retry-safe-queue
  - reconciliation
authors:
  - Jayant Chaudhary
why_read: You will see how to enforce field ownership in code, make Salesforce and NetSuite writes retry-safe with external ID upserts, stay inside NetSuite's concurrency limit, and run a reconciliation report that catches drift. The worked code is Python with httpx and psycopg, not Apex.
interest_score: 7
depth_score: 9
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Each change moves through the queue, from enqueue to upsert, with retry or review on failure
  steps:
    - Source record changes and is enqueued
    - Worker claims due rows under a lease
    - Upsert by external ID to the other system
    - Success marks the version as sent
    - Retryable error backs off and retries
    - Ambiguous match parks for review
figure_image: /figures/2026-11-18/11-dev-to-a-salesforce-netsuite-sync-in-python-that-proves-the-two-sys.png
---

A software services client ran an off-the-shelf Salesforce–NetSuite connector for years, and the data drifted: customer names, invoice statuses and billing contacts stopped agreeing, and a sales rep's edit once overwrote a legal billing name in NetSuite. The author argues that most CRM-to-ERP integrations fail by drifting rather than crashing, and rebuilds the integration around explicit field ownership, external IDs and a reconciliation report.

Field ownership is kept as data. NetSuite owned legal entity, billing terms, invoice balances and payment status, while Salesforce owned segmentation, Opportunities and account-manager assignments. Each outbound payload is built only from fields the source system owns, and mirrored fields are read-only in Salesforce. Records are matched through external IDs on both sides, and a cross-reference table holds the linkage, with a needs_review status for ambiguous matches.

Writes go through a queue holding one desired state per record with a version number, so repeated edits produce a single write. Workers claim rows with a lease, and writes are upserts by external ID, so a retry after a timeout does not create duplicates. The code shows how NetSuite and Salesforce each respond to upserts and to errors such as 429 and 300. Concurrency is capped with semaphores because NetSuite limits concurrent requests per account across all connectors. Invoice changes are pulled with SuiteQL using a keyset checkpoint, and a nightly reconciliation classifies each invoice as matched, stale, missing or wrongly linked.

The parallel run of the new integration against the old one exposed overwrites, wrong bill-to links and missed status updates. Invoice status went from a lag of 24 to 48 hours to normally 10 to 15 minutes, and the finance spreadsheet was retired once the daily report explained every remaining difference.
