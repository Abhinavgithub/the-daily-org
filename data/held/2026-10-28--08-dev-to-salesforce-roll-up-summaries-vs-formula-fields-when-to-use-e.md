---
title: Choosing between roll-up summaries and Formula Fields in Salesforce
original_title: "Salesforce Roll-Up Summaries vs Formula Fields: When to Use Each"
url: https://dev.to/rohanmehta/salesforce-roll-up-summaries-vs-formula-fields-when-to-use-each-f3i
source: dev.to
source_type: community
date: 2026-10-28
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - roll-up-summary
  - formula-field
  - master-detail-relationship
  - lookup-relationship
  - declarative-configuration
authors:
  - Rohan Mehta
why_read: You will know when a value needs a roll-up summary, a Formula Field, or a Flow or Apex alternative, based on relationship type and the shape of the calculation. The piece ends with a short decision checklist.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Roll-up summaries and Formula Fields differ in what they calculate and where they work
  left:
    heading: Roll-up summary
    points:
      - Aggregates child records
      - Master-detail only
      - Recalculates on child change
      - No lookup relationships
  right:
    heading: Formula Field
    points:
      - Uses one record's fields
      - Lookup or master-detail
      - Recalculates on each view
      - Never stale at read time
  icons:
    - layers
    - flow
---

The article distinguishes roll-up summary fields from Formula Fields. A roll-up summary sits on a parent record and aggregates its child records through count, sum, min or max. It works only on master-detail relationships and recalculates when a child changes. A Formula Field calculates from a single record's own fields and related parent fields, recalculating each time the record is viewed, and works on both lookup and master-detail relationships.

Roll-ups suit jobs such as counting open cases on an account or summing opportunity amounts, and they stay accurate without extra queries or flows. Their limits are basic filter criteria, no more than one relationship level, and no support for lookup relationships. Formulas suit record-level logic such as age fields, name concatenation or flags driven by a few fields. The trap is formulas that reach across many objects, which become hard to read and can slow List Views and reports on large data volumes.

The article closes with a checklist: many children into one parent number points to a roll-up, a value derived from the record itself points to a formula, a lookup relationship needs Flow or similar tooling, and complex filtering or cross-object aggregation needs Flow or Apex.
