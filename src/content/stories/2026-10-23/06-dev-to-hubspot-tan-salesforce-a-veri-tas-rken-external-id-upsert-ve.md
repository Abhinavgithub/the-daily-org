---
title: "Migrating HubSpot to Salesforce: External IDs, upsert, and load order"
original_title: "HubSpot'tan Salesforce'a veri taşırken External ID, upsert ve ilişki sırası: Geliştirici notları"
url: https://dev.to/korayyalcin/hubspottan-salesforcea-veri-tasirken-external-id-upsert-ve-iliski-sirasi-gelistirici-notlari-67
source: dev.to
source_type: community
date: 2026-10-23
section: integration
personas:
  - developer
  - architect
tags:
  - external-id
  - bulk-api
  - data-migration
  - upsert
  - salesforce-integration
authors:
  - Koray Yalçın
why_read: Readers will learn how to structure a reliable HubSpot to Salesforce data migration using External IDs, proper load ordering, and Bulk API, including strategies for handling hierarchies, deltas, and validation.
interest_score: 7
depth_score: 8
novelty_score: 3
utility_score: 9
model: qwen/qwen3.7-flash
figure:
  kind: steps
  caption: Phased migration process from HubSpot to Salesforce
  steps:
    - Cleanse data and map picklists
    - Dry run in sandbox with disabled automations
    - Load records following dependency order
    - Enable read only mode and run delta load
    - Verify record counts and relationship integrity
---

The article addresses the complexity of moving historical records and relationships from HubSpot to Salesforce, emphasizing that simple export import fails due to differing data models. It establishes the External ID field as the foundation for tracking records, enabling idempotent upserts, and linking related objects without relying on Salesforce generated identifiers.

It outlines a strict dependency sequence for loading records, starting with Users and Accounts before moving to Contacts, Opportunities, and Activities. Special attention is given to Account hierarchies, recommending a two pass approach to avoid parent child reference errors. The piece includes a Python example using the Bulk API to demonstrate upserting an Opportunity by matching its Account via an External ID rather than a native Salesforce identifier.

Before migration, the author stresses data cleansing, deduplication rules, and mapping picklist values like pipeline stages. A sandbox dry run is recommended to generate repeatable error reports and to temporarily disable automations such as Flow and Apex triggers that could trigger unwanted side effects during bulk loads.

The final phase uses a delta load strategy to capture changes made after the initial bulk transfer, requiring source system read only mode and timestamp tracking. Post migration validation involves comparing record counts, verifying relationship integrity, reconciling financial totals, and spot checking field values to ensure data accuracy before full team adoption.
