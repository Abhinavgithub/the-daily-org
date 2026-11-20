---
title: A blameless postmortem template for Salesforce incidents caused internally
original_title: "No external attack found: a blameless postmortem template for the Salesforce incidents we cause ourselves"
url: https://dev.to/juanma_garrido_1974/no-external-attack-found-a-blameless-postmortem-template-for-the-salesforce-incidents-we-cause-29ba
source: dev.to
source_type: community
date: 2026-11-20
section: architecture
personas:
  - admin
  - architect
  - developer
tags:
  - blameless-postmortem
  - setup-audit-trail
  - incident-review
  - deployment-status
  - process-automation
authors:
  - Juan Manuel Garrido
why_read: You will get a reusable postmortem template for Salesforce incidents, with the org queries to rebuild the timeline and a method for finding where warnings were lost.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The order in which a blameless postmortem is built, as the article describes it
  steps:
    - Build the timeline from org records
    - Search tickets and chat for earlier warnings
    - Ask each person individually what they saw
    - Record contributing factors by role, not name
    - Assign each change an owner and a due date
  icons:
    - clock
    - search
    - people
    - layers
    - check
---

The author argues that when a Salesforce production incident happens, the first question is often who deployed, which discourages people from speaking up. A blameless postmortem instead asks how the process let the problem through and whether anyone saw it coming. The piece offers a template with sections for the incident summary, timeline, what the team knew beforehand, contributing factors, and a changes table with owners and due dates. Two rules keep it blameless: names appear only in the timeline, never in contributing factors, and every action needs an owner and a date.

To build the timeline from the org, the article points to Setup Audit Trail, which can be queried with SOQL on SetupAuditTrail for the last seven days or exported with the Salesforce CLI. It also suggests checking Setup > Deployment Status for recent deployments and their initiators, and Flow and Apex error emails for exact timestamps and failing elements. If nobody receives those error emails, the author says that gap itself belongs in the changes table.

The section on what the team knew before is presented as the most important part. The author recommends searching tickets, pull request comments and chat threads, then asking people individually whether they noticed a concern and whether they raised it. Where a warning was raised but lost, the document should say so plainly, since it shows where the process drops warnings. The article closes with tips for running the review meeting, such as having the most senior person speak last.
