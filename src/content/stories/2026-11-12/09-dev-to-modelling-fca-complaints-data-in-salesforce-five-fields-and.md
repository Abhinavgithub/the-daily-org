---
title: Modelling FCA complaints data in Salesforce and avoiding the UTC time zone trap
original_title: "Modelling FCA Complaints Data in Salesforce: Five Fields and a Time Zone Trap"
url: https://dev.to/anuragsfdc/modelling-fca-complaints-data-in-salesforce-five-fields-and-a-time-zone-trap-1c6k
source: dev.to
source_type: community
date: 2026-11-12
section: architecture
personas:
  - admin
  - developer
  - architect
tags:
  - fca-complaints
  - data-model
  - time-zone
  - record-triggered-flow
  - field-history-tracking
  - uk-gdpr
authors:
  - Anurag Bhardwaj
why_read: You will know how to model the fields COM001 needs for Cases, including a UK-local date that puts complaints in the correct half-year. You will also know how to test the setup before the 2027 deadline.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the UK date feeds the half-year label used in COM001 reporting
  steps:
    - Complaint received in UTC
    - Convert to Europe/London date
    - Store in Date_Received_UK__c
    - Derive H1 or H2 formula
    - Group report by legal entity
  icons:
    - clock
    - gear
    - database
    - chart
    - doc
---

From 1 January 2027, UK financial services firms will report complaints to the FCA in a new return, COM001, covering fixed half-years. The article sets out a data model for this built from standard Salesforce features, for orgs that hold complaints as Cases. Group reporting is removed, so each complaint needs a required legal entity, held as a restricted picklist or a lookup to a reference object that compliance controls. Every trading name and acquired brand must map to exactly one entity.

The return counts complaints from vulnerable customers and complaints about a failure to consider or respond to vulnerability, which can overlap. The author recommends two separate checkboxes rather than one picklist, with Field History Tracking switched on. Standard history is kept for 18 months, or 24 months via the API, unless Field Audit Trail is enabled, so it should not be relied on for longer retention.

The main pitfall is time zones. Datetime values are stored in UTC, so a complaint received just after midnight on 1 July during British Summer Time falls on 30 June in UTC and lands in the wrong half-year. The fix is a separate date field holding the UK date, set in a before-save trigger or invocable Apex using the Europe/London time zone, with the same done for the closed date. A formula on that date field then derives the half-year label, and reports are grouped by legal entity and that label.

The article also advises keeping the reason for a vulnerability marker in a separate field or related record, protected by field-level security, since health details can be special category data under UK GDPR. Before 1 January, it recommends testing a complaint created at 00:30 UK time on 1 July, running the same report twice a week apart, and confirming that changes to a vulnerability marker on a closed complaint are logged. The exact field names and validations are in the FCA's COM001 Data Reference Guides.
