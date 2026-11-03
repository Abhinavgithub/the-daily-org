---
title: Showing an Apex Collection in a Screen Flow Data Table without a Custom Object
original_title: How do you show an Apex collection in a Screen Flow Data Table without a custom object?
url: https://dev.to/juanma_garrido_1974/how-do-you-show-an-apex-collection-in-a-screen-flow-data-table-without-a-custom-object-4eeg
source: dev.to
source_type: community
date: 2026-11-03
section: flow-and-admin
personas:
  - developer
  - admin
tags:
  - screen-flow
  - data-table
  - apex-defined-type
  - aura-enabled
  - invocable-method
  - api-65-0
authors:
  - Juan Manuel Garrido
why_read: You will learn how to define an Apex row type, return it from an invocable action and bind it to a Screen Flow Data Table with a Unique Identifier, avoiding helper objects. You will also learn the current limit that inline editing is not yet supported.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How an Apex collection reaches a Screen Flow Data Table
  steps:
    - Define row class with @AuraEnabled fields
    - Return list from invocable action
    - Store output in Apex-typed collection variable
    - Bind to Data Table with Unique Identifier
  icons:
    - code
    - flow
    - layers
    - chart
---

Since Winter '26 (API 65.0 and later), a Screen Flow Data Table can take a collection of an Apex-defined type as its Source Collection. Choosing a field as the Unique Identifier lets the table treat each item as a record, so users can select rows and the flow can reuse them. Display and selection work now, but inline editing for these collections is still pending.

The article contrasts this with older workarounds: creating a Custom Object that mirrors the Apex class, inserting and deleting temporary records, using a Transform element, or building a custom Lightning Web Component. Each works but leaves extra metadata to maintain. The walkthrough shows a sample FxRate class with @AuraEnabled fields, an invocable GetFxRates action that wraps the list in a result class, and the flow wiring that stores the output in a collection variable and feeds it to the table.

The author advises choosing a stable, unique key such as a record Id, an ISO currency code or a business key as the Unique Identifier, and generating one in Apex if the source has none. The pattern suits currency or stock quotes from an external API, financial calculations resolved in Apex, and batch results that should not be persisted.
