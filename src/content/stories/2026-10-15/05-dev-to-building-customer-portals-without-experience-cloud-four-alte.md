---
title: Architecting customer portals beyond Experience Cloud licensing and API limits
original_title: "Building Customer Portals Without Experience Cloud: Four Alternatives Worth Knowing"
url: https://dev.to/rohanmehta/building-customer-portals-without-experience-cloud-four-alternatives-worth-knowing-4k4i
source: dev.to
source_type: community
date: 2026-10-15
section: architecture
personas:
  - architect
  - admin
  - developer
tags:
  - experience-cloud
  - api-limits
  - connected-app
  - data-sync
  - guest-access
authors:
  - Rohan Mehta
why_read: Readers will learn how to evaluate four portal architectures against Experience Cloud by weighing licensing costs, API budgets, and data synchronization trade-offs. The piece provides a structured set of questions to assess security, visibility, and failure modes for each approach.
interest_score: 7
depth_score: 7
novelty_score: 5
utility_score: 8
model: qwen/qwen3.7-flash
---

The article examines four architectural approaches for building customer portals that do not rely on Experience Cloud licenses. It contrasts running the portal directly on the Salesforce platform using licensed external users or headless identity APIs, connecting to a live Salesforce database through a third party, syncing records to an external database, or migrating customer data entirely to a different system like Microsoft Dataverse.

Each model carries distinct operational trade-offs. On-platform deployments enforce native security and real-time data but require per-user licensing and consume administrative capacity. Off-platform live connections avoid licensing fees but draw heavily from the rolling 24-hour API limit and introduce OAuth token security risks. Synced copies reduce API consumption and provide outage resilience but risk data staleness and write collisions, requiring careful reconciliation policies.

To navigate these options, the author recommends evaluating every vendor against five criteria: where customer data resides, how Salesforce classifies portal visitors, which layer enforces record visibility, the typical API cost per page or acceptable sync lag, and procedures for handling connection failures or token revocation. The analysis concludes that Experience Cloud remains the only true single system of record, while alternatives simply shift architectural responsibilities to API management, data governance, or external security configurations.
