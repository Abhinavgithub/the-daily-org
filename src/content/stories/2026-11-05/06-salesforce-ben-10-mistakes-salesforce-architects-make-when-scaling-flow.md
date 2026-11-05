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

Flow is the default automation tool in most Salesforce orgs, but an architect's concern is whether a flow keeps working when data volumes, user counts and concurrent integrations grow. Problems often stay hidden in a sandbox and appear during a data migration, a nightly sync or as a flow too large for anyone to maintain. The article frames the work as asking what happens when 200 records arrive in one transaction.

The first mistakes concern bulk processing and data operations. Flow bulkifies operations that reach the same element across interviews in one transaction, but unnecessary queries on separate branches or invocable Apex that queries once per item still cause trouble. Database operations inside loops are singled out as the anti-pattern to avoid: retrieve records before the loop, change values in memory, then save a collection in one operation. Repeated writes to the same record also multiply the automation they trigger, adding CPU time and record-locking risk. The author further recommends before-save flows for same-record updates and reducing transaction-wide DML.

The later mistakes cover portability and resilience. Hard-coded IDs break when flows move between environments, so lookups by DeveloperName, Custom Metadata Types and Custom Labels or settings are suggested instead. Fault handling needs a deliberate decision rather than a default: a Custom Error can block a save, a Screen Flow should explain what happened, and asynchronous failures should be logged somewhere queryable, ideally through a reusable error-logging subflow. The article also separates unhandled errors, which roll back the transaction, from handled faults, which do not undo earlier changes.
