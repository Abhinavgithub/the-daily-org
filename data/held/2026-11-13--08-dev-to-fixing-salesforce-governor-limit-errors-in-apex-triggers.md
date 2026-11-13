---
title: Bulkifying an Opportunity trigger to avoid the 101 SOQL limit error
original_title: Fixing Salesforce Governor Limit Errors in Apex Triggers
url: https://dev.to/sanya_mittal_a509a2c50a2d/fixing-salesforce-governor-limit-errors-in-apex-triggers-1i7l
source: dev.to
source_type: community
date: 2026-11-13
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - governor-limits
  - apex-triggers
  - bulkification
  - soql
  - queueable-apex
authors:
  - Sanya Mittal
why_read: You will learn why a per-record SOQL query inside a trigger loop fails on bulk loads, and how to refactor it to one query and one DML statement using a map keyed by Account ID. You will also see the trade-offs between triggers, Flows and Queueable Apex.
interest_score: 7
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The failing per-record pattern set against the bulk-safe pattern
  left:
    heading: Per-record (fails)
    points:
      - Query Account inside the loop
      - Update Account inside the loop
      - Fails on record 101
  right:
    heading: Bulk-safe (map)
    points:
      - Collect deltas in a map by AccountId
      - One SOQL query with IN
      - One DML update for the list
---

A trigger that passes a single-record test can fail a 200-row bulk import with a Too many SOQL queries error. This happens with Data Loader, Bulk API and scheduled integrations, and it usually shows up first in production, because sandbox test data rarely reaches 200 rows per batch. The article argues that the fix is to change how the trigger reads and writes data, not to retry or buy more licences.

The author uses an after update trigger on Opportunity that adds the Amount of newly closed-won deals to a Total_Won__c field on the parent Account. The original version queries and updates the Account once per record, which breaks on record 101 under the 100 SOQL limit and would also run into the 150 DML statement cap. The article uses this failing version to show the cause of the error.

The refactor has three steps. First, audit every query and DML statement that sits inside a loop over Trigger.new. Second, collect the qualifying deals into a map keyed by AccountId, filtering on the stage change so later edits do not double count, then run a single query with IN and a single update. The map also merges several deals for the same Account. Third, weigh the options: a handler class gives testability and bulk control, Record-Triggered Flow is quicker for simple logic but shares the same caps, and Queueable Apex allows more queries and CPU time at the cost of eventual consistency.

The article closes with a short FAQ. It notes that a LimitException cannot be caught with try-catch, that Limits.getQueries() can be used to check usage, and that Queueable suits follow-up work while Batch Apex suits large record sets. It recommends testing with 200 records in a single call so that the test matches the real chunk size.
