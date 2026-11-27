---
title: Testing a HubSpot to Salesforce migration with Node.js and MongoDB staging
original_title: How we tested a HubSpot to Salesforce migration with Node.js and MongoDB
url: https://dev.to/dailycodings/how-we-tested-a-hubspot-to-salesforce-migration-with-nodejs-and-mongodb-42bo
source: dev.to
source_type: community
date: 2026-11-27
section: architecture
personas:
  - architect
  - developer
  - admin
tags:
  - hubspot-migration
  - salesforce-data-migration
  - mongodb
  - node-js
  - reconciliation
  - native-notes
authors:
  - Forhad at DailyCodings
why_read: The reader will learn how a staging layer in MongoDB can support reconciling activity counts and verifying note-to-record links before a CRM cutover. They also get practical checks for dates and fields and a view of what evidence to require before go-live.
interest_score: 6
depth_score: 7
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The migration ran in three stages, each with its own check
  steps:
    - HubSpot to MongoDB archive
    - MongoDB to Google Sheets timelines
    - Reviewed records to Salesforce
  icons:
    - database
    - chart
    - cloud
---

A team migrating sales data from HubSpot to Salesforce used Node.js to copy HubSpot records into MongoDB, keeping change history so that a source version could be checked when a batch looked wrong. Google Sheets timelines for companies and contacts let the sales team review relationship histories before the move. The archive held 23,684 activities across emails, calls, meetings, messages, notes and tasks.

Because an activity can appear on both a company timeline and a contact timeline, summing rows across those views would double-count. The article gives an aggregation that groups by activity type and HubSpot ID first, so each activity is counted once, and recommends checking for missing source IDs before the count. A matching grand total can still hide a missing call and an extra email, so counts should be compared type by type.

For notes, the article traces a note from HubSpot's note body and timestamp fields to Salesforce native notes, where ContentDocumentLink.LinkedEntityId shows which records the note is attached to. A worked example compares expected and actual parent IDs to identify missing and misplaced links. It also separates the conversation date, the creation date and the last-edited date, and warns that an import can leave them inconsistent unless audit fields and permissions are set correctly.

The article says 113 automated tests had passed and that Salesforce test batches had been compared record by record, but the full production cutover was still ahead. It proposes three checks for the final change window: reconcile counts by type, resolve or accept every mapping difference, and have a sales rep find a known conversation with ordinary access.
