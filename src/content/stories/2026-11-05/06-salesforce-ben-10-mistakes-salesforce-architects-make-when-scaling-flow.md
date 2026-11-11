---
title: Ten Flow design mistakes that break Salesforce orgs as they scale
original_title: 10 Mistakes Salesforce Architects Make When Scaling Flow
url: https://www.salesforceben.com/10-mistakes-salesforce-architects-make-when-scaling-flow/
source: Salesforce Ben
source_type: community
date: 2026-11-05
section: flow-and-admin
personas:
  - architect
  - developer
  - admin
tags:
  - flow-builder
  - governor-limits
  - bulkification
  - record-triggered-flow
  - fault-handling
  - custom-metadata-types
authors:
  - Ross Collie
why_read: You will learn how bulk record processing, database operations inside loops, repeated writes, hard-coded IDs and weak fault handling make Flow fail under load, and how to design around each one. The piece is practical guidance for anyone whose orgs run record-triggered automation at volume.
interest_score: 7
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://www.salesforceben.com/wp-content/uploads/2026/11/sfam1.webp
---

This Salesforce Ben article, written for architects, lists ten Flow design mistakes that cause failures as orgs grow, and suggests a fix for each. The first concerns treating Flow as a single-record tool: bulk operations from Data Loader or List Views share one transaction's governor limits, so authors should use before-save flows for same-record updates, tighten entry conditions, and make invocable Apex bulk-safe. The second warns against database operations inside loops, recommending retrieving records before the loop, changing values in memory, and saving a collection once afterwards, with Collection Filters and Transform as alternatives. The third covers writing to the database too often, since each write can fire further automation and cause record-locking, so decisions should come first and writes should be batched near the end.

The next several points cover maintainability, testing and error handling. Hard-coded IDs break when flows move between environments, so the article recommends looking up records by DeveloperName, using Custom Metadata, Custom Labels or Custom Settings. Flows without deliberate fault handling leave failures to Salesforce's default response, so authors should choose between blocking saves, guiding users, or logging failures, and should understand how rollback differs for unhandled errors, handled faults and explicit rollbacks. Testing with a single record gives little assurance, so the article urges bulk tests of at least 200 records, representative data, and separate logic, transaction-limit and load testing.

The final points address structure and design. Monolithic flows are hard to maintain, so the piece suggests subflows for repeated logic, self-contained processes and frequently changing rules, while warning against too many tiny subflows and recommending grouping flows by business purpose. Transaction boundaries matter because governor limits apply per transaction, and asynchronous paths, scheduled paths, screens, Wait elements and Platform Events can move work out of the original save, with the trade-off that committed changes cannot be rolled back. Screen Flows need care when users click Previous, which can cause duplicates, so the article advises saving at the end and making steps idempotent. Finally, it cautions that data model problems such as data skew, non-selective queries, recreated roll-up functionality and master-detail choices can limit what Flow design alone can fix. The conclusion advises reviewing the highest-volume objects first.
