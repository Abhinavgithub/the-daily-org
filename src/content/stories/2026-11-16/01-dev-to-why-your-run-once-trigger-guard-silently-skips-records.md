---
title: Why a static Boolean Trigger guard silently skips records in bulk
original_title: Why Your 'Run Once' Trigger Guard Silently Skips Records
url: https://dev.to/apexcraftstudio/why-your-run-once-trigger-guard-silently-skips-records-4507
source: dev.to
source_type: community
date: 2026-11-16
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - apex-triggers
  - trigger-recursion
  - governor-limits
  - bulk-processing
  - static-variables
authors:
  - ApexCraft Studio
why_read: You will learn why a static Boolean recursion guard fails when a DML statement touches more than 200 records, how to reproduce the bug with a test, and how to replace it with an Id-based Set or a change-based check.
interest_score: 8
depth_score: 7
novelty_score: 5
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: A static Boolean guard against an Id-based Set in a bulk trigger
  left:
    heading: Static Boolean guard
    points:
      - One flag for the whole transaction
      - Chunk 2 onward is skipped
      - 800 of 1,000 records unprocessed
      - Insert still succeeds silently
  right:
    heading: Id-based Set guard
    points:
      - Tracks each record Id
      - New Ids in each chunk processed
      - Recursive Ids already in set skipped
      - Guards afterUpdate, not inserts
  icons:
    - warning
    - check
also:
  - title: "AIforce Explained: Salesforce's Data and AI, Wherever You Actually Work"
    url: https://dev.to/rohanmehta/aiforce-explained-salesforces-data-and-ai-wherever-you-actually-work-2j58
    source: dev.to
figure_image: /figures/2026-11-16/01-dev-to-why-your-run-once-trigger-guard-silently-skips-records.png
---

Many Apex trigger tutorials recommend a static Boolean flag to stop a trigger from running again during recursion. The article argues this flag can silently skip records in production. Salesforce splits any DML statement touching more than 200 records into chunks of 200, running the trigger once per chunk within the same transaction. A static variable persists across those chunks, so the guard cannot distinguish a recursive call from the next batch of records, and records beyond the first chunk never get processed, though the insert still succeeds.

The problem is most likely in Batch Apex with a scope above 200, data migration scripts run from Anonymous Apex, service classes that insert or update large lists, and Flows that change many records in one element. It rarely appears in UI testing because records are saved one at a time. The article provides a test that inserts 201 Accounts and asserts that all 201 are processed. With the Boolean guard the test fails, reporting 200 processed, while a bulk-safe test catches the defect before release.

The recommended fix is to track record Ids in a Set rather than a single Boolean. Adding each Id to the set returns false when it was already present, so only genuinely new records are processed in later chunks, while a true recursive update is skipped. The article notes practical details: guard afterUpdate rather than inserts because records in before insert have no Ids yet, keep separate sets per event if both beforeUpdate and afterUpdate do work, and accept that a record updated twice on purpose is handled only once.

Often the better solution is to avoid needing a guard. Comparing field values against Trigger.oldMap and acting only on the change of interest stops recursion naturally, because the follow-up update does not change the field again. A before-insert handler that only sets fields on Trigger.new cannot cause recursion and needs no guard. The article closes with a checklist: search the org for static Boolean flags in trigger handlers, remove guards that are unnecessary, react to changes rather than every update, use Sets where a guard remains, and test every trigger with 201 or more records in one statement. The article also promotes a commercial starter kit, which is not part of the technical guidance.
