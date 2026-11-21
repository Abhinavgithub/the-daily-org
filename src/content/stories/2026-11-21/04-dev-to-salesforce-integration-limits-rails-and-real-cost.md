---
title: Salesforce integrations fail on quota and data model, not protocol
original_title: "Salesforce Integration: Limits, Rails and Real Cost"
url: https://dev.to/mecanik-dev/salesforce-integration-limits-rails-and-real-cost-an3
source: dev.to
source_type: community
date: 2026-11-21
section: architecture
personas:
  - architect
  - developer
  - admin
tags:
  - salesforce-integration
  - api-limits
  - bulk-api-2-0
  - sobject-collections
  - external-id-upsert
  - governor-limits
authors:
  - Norbert E. Boros
why_read: You will learn how the org-wide daily API allocation is calculated and why batching is a design decision rather than a tuning step. You will also see the Apex governor limit trap that breaks batch writes, and the external ID and upsert pattern that makes retries safe.
interest_score: 8
depth_score: 9
novelty_score: 5
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: numbers
  caption: Batching cuts the calls needed to write 5,000 Contacts by a factor of 200
  numbers:
    - value: "5000"
      label: Contacts written one record per call
    - value: "25"
      label: Calls needed via sObject Collections at 200 per request
    - value: "100"
      label: SOQL query ceiling per synchronous transaction
---

The article argues that Salesforce integrations rarely fail on authentication or protocol. They fail on the daily API request allocation, which is shared across every consumer in an org, and on the data model choices that are costly to reverse once records exist. It walks through the main APIs, noting that REST and SOAP are both current, that Bulk API 2.0 is a different asynchronous programming model, and that Composite and sObject Collections cut call volume sharply because each counts as one call against the allocation.

The piece then covers the constraints that shape the architecture. The allocation is set by edition and license count, and requests fail with REQUEST_LIMIT_EXCEEDED once it is exhausted, with no grace on trial and Developer Edition orgs. Batching is presented as a design decision: a 5,000 record job costs 5,000 calls one at a time but 25 through sObject Collections. Caching reference data is also suggested. Governor limits are explained as applying to customer Apex that runs when an inbound write fires triggers, and an unbulkified trigger can exceed the 100 query ceiling on a 200 record batch.

Finally, the article addresses authentication, the Lead, Contact, Account and Person Account decisions, external IDs for idempotent upserts, partial-success handling, dead letter stores and reconciliation, and sandbox and API version pinning. It also discusses when middleware is justified and the UK GDPR obligations around controllers, processors and transfers. The cost ranges and vendor-agnostic claims are the author's own estimates and are not independently verified.
