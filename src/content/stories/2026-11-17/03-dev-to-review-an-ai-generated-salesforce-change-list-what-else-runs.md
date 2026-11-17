---
title: Check what else runs on an object before shipping AI-Generated changes
original_title: "Review an AI-generated Salesforce change: list what else runs on the same object"
url: https://dev.to/juanma_garrido_1974/review-an-ai-generated-salesforce-change-list-what-else-runs-on-the-same-object-4ejb
source: dev.to
source_type: community
date: 2026-11-17
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - ai-generated-code
  - sf-cli
  - tooling-api
  - validation-rules
  - impact-analysis
authors:
  - Juan Manuel Garrido
why_read: You will learn a repeatable way to list the active Flows, Validation Rules and triggers on an object using the Salesforce CLI and pandas, so a reviewer can see what a change will collide with before it ships.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The article's method for finding existing automation on an object before shipping an AI-generated change
  steps:
    - Export active Flows with SOQL
    - Export active Validation Rules
    - Export active triggers via Tooling API
    - Filter the exports by object in pandas
    - Attach the tables to the ticket for review
  icons:
    - flow
    - check
    - code
    - chart
    - doc
---

The article argues that an AI-drafted Flow, Apex class or Validation Rule must be checked against everything else already running on the same object. Before review, the author suggests finding that automation first, since a clean-looking change can clash with an existing rule, loop with another Flow, or overwrite a field a batch expects to be empty.

The method uses the Salesforce CLI to export active Flows with a SOQL query on FlowDefinitionView, and active Validation Rules and triggers through the Tooling API. Triggers are matched on their object, while Flows have no dedicated object field, so the author scans API name, label and description instead, which is imperfect but faster than opening every Flow. A short pandas script then filters the three exports for a chosen object such as Opportunity and produces a review agenda.

The author adds that managed package automation will also show up in these results. Managed items cannot be edited but can still fire after a change, so they belong in a separate list. The tables should be attached to the ticket so the next reviewer does not have to rerun the queries.

The piece also proposes three test cases a model often skips: a record that must be blocked with a clear message, a record that must pass even when a field arrives late, and the same change run by a non-admin user. It lists reasons to wait a day before shipping, such as a missing description, tests that check coverage rather than the business rule, or a field the model invented. The article is practical and short, and the queries are the main takeaway.
