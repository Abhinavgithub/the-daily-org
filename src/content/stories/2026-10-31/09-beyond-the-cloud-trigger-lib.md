---
title: "Trigger Lib: a role-based Apex trigger framework built around governor limits"
original_title: Trigger Lib
url: https://blog.beyondthecloud.dev/blog/trigger-lib
source: Beyond the Cloud
source_type: community
date: 2026-10-31
section: architecture
personas:
  - developer
  - architect
tags:
  - apex-trigger-framework
  - trigger-lib
  - apex-fluently
  - governor-limits
  - unit-of-work
authors:
  - Piotr Gajek
why_read: You will learn how Trigger Lib splits trigger logic into populators, validators, writers and dispatchers, how orchestrators and Custom Metadata Types register handlers, and how its add-on interfaces bulkify queries and batch DML.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://wordpress.beyondthecloud.dev/wp-content/uploads/2026/10/Copy-of-Copy-of-Apex-Character-Limit.png
held_from: 2026-10-28
figure:
  kind: parts
  caption: Trigger Lib has four handler roles, each with one job in a trigger context
  whole: Trigger Lib handler roles
  parts:
    - Populator
    - Validator
    - Writer
    - Dispatcher
  icons:
    - code
    - shield
    - database
    - rocket
---

The article introduces Trigger Lib, an open-source Apex trigger framework from the Apex Fluently collection, written by an author who argues that Flows are impractical and that Apex triggers are the best automation option, provided they are organized well. The author's main complaint is that existing trigger frameworks rarely help teams manage governor limits, which become a serious risk when AI-generated code and other automations share a transaction. Trigger Lib is deliberately not metadata-driven. It can be started with an orchestrator class that lists handlers, or with runFromMetadata() for handlers registered in Custom Metadata Types, and Custom Metadata is then used only to switch handlers off.

Handlers are split into four roles: Populators set field values in before insert and update, Validators reject invalid records in before contexts, Writers queue DML on a shared Unit of Work in after contexts and before delete, and Dispatchers start Queueable jobs or publish events in after contexts. Each role has a qualifying method and an action method, and SOQL and DML are blocked in the per-record methods. Add-on interfaces such as ParentQuery, PriorParentQuery, RelatedQuery, OwnUnitOfWork, Bypassable, RecursionGuard, Finalizer and ContinueOnError extend these roles, for example to bulk-load parents and related records or to let a failing handler be logged without failing the save.

The author analyzed 919 SOQL queries from three projects and found that parent and config queries made up most of the total, which is why the framework bulk-loads parents once per chunk and recommends static variables for configuration data. Writers commit through DML Lib, which orders inserts by dependency and performs one DML per operation and object type at the end of the run. The article is cut off during its discussion of the Logger interface, so the logging details are not covered.
