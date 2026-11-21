---
title: Resuming a Salesforce CDC consumer from a durable replay checkpoint
original_title: How to Build a Resumable Salesforce CDC Consumer in Node.js
url: https://dev.to/sanya_mittal_a509a2c50a2d/how-to-build-a-resumable-salesforce-cdc-consumer-in-nodejs-5ecf
source: dev.to
source_type: community
date: 2026-11-21
section: integration
personas:
  - developer
  - architect
tags:
  - change-data-capture
  - pub-sub-api
  - replay-id
  - grpc
  - idempotency
authors:
  - Sanya Mittal
why_read: You will learn how to store Pub/Sub API replay IDs beside mirrored data, resume a gRPC subscription from them, and make replayed events harmless with an idempotent apply step. The reader also gets the 72-hour retention constraint that shapes the design.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Each batch is applied and checkpointed in one transaction
  steps:
    - Begin transaction
    - Decode each event and skip seen keys
    - Apply fresh changes
    - Save latest replay ID
    - Commit or roll back
  icons:
    - lock
    - search
    - database
    - check
    - layers
held_from: 2026-11-18
---

A Change Data Capture consumer that restarts from the wrong position either drops record updates or replays several days of them. The article's fix is a durable checkpoint: it stores replay IDs, resumes a gRPC subscription from them, and makes replays harmless. The worked example is a worker subscribing to the OpportunityChangeEvent channel and mirroring each change into Postgres, using Node.js, the Pub/Sub API and the pub_sub proto file from the Salesforce repository.

The design has three parts. The first is a checkpoint table holding one replay ID per channel, stored as bytes because Salesforce treats replay IDs as opaque, alongside a table of applied transaction keys so that replayed events become no-ops. The second is a subscription that resumes with the CUSTOM replay preset and the saved bytes, using LATEST only on the first run, with a fixed request count to keep memory flat and the stream paused while the database is awaited so that order is preserved.

The third part applies changes idempotently and checkpoints in the same transaction. Each event's schema is fetched once and cached, its Avro payload is decoded, and it is inserted into the applied-keys table; only fresh keys are applied. The latest replay ID is saved even on empty keep-alive replies so quiet channels do not age out. The article notes the time limit: change events are kept for 72 hours, so the applied-keys table can be pruned after that period. It also points out the trade-off against the older CometD route, which costs gRPC setup and Avro decoding in exchange for flow control and replay tightening.
