---
title: "Trigger Lib: a role-based Apex trigger framework built around governor limits"
original_title: Trigger Lib
url: https://blog.beyondthecloud.dev/blog/trigger-lib
source: Beyond the Cloud
source_type: community
date: 2026-10-28
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
---

The author argues that Flows are a poor fit for automation in the AI era, leaving Apex Triggers as the better choice, but that triggers become messy and hit limits such as too many SOQL queries or DML statements when several teams and AI agents add logic to the same transaction. Existing trigger frameworks did not, in his view, give tools to protect transaction limits, so he built Trigger Lib as part of the open-source Apex Fluently collection.

Trigger Lib is not metadata-driven. A trigger calls either run() with an orchestrator class that lists the handlers, or runFromMetadata() if handlers are registered in Custom Metadata Types. Each handler plays one of four roles: populators set fields in the before contexts, validators reject records in the before contexts, writers perform CRUD on related records in the after contexts, and dispatchers start async jobs, publish events or send emails. Optional add-on interfaces provide bulk parent and related queries, bypassing, recursion guards, error handling and per-handler Unit of Work.

The design aims to be idiot-proof for AI and developers, since each interface only offers the methods its context needs, and to keep handler classes small, reportedly under 100 lines. Queries and DML are batched through ParentQuery, RelatedQuery and the Unit of Work, and DML in before contexts raises a runtime error. The post includes code samples for a populator and a validator.
