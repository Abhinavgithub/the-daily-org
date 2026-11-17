---
title: Working around the 2,000-row cap on report exports after step-up authentication
original_title: How To Fix the 2,000-Row Cap On Salesforce Report Exports
url: https://www.salesforceben.com/how-to-fix-the-2000-row-cap-on-salesforce-report-exports/
source: Salesforce Ben
source_type: community
date: 2026-11-17
section: releases
personas:
  - admin
  - developer
  - architect
tags:
  - report-export
  - step-up-authentication
  - analytics-api
  - soql
  - row-limit
authors:
  - Ross Collie
why_read: "You will learn why scheduled report exports now fail or stop at 2,000 rows after the Summer '26 changes, and the four practical options for fixing refreshes: manual export, narrower reports, a suitable connector, or SOQL."
interest_score: 7
depth_score: 6
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Four ways to adapt a report export that stops at 2,000 rows
  steps:
    - Export manually for a one-off pull
    - Narrow the report with filters
    - Use a connector built for the change
    - Move recurring extracts to SOQL
  icons:
    - doc
    - search
    - plug
    - database
---

From July 1, 2026, Salesforce requires step-up authentication for exporting and printing reports, even for users already signed in with MFA. Viewing or running a report does not trigger the check. Admins can configure the policy under Session Security Level Policies with a step-up period from 1 to 120 minutes. Scheduled jobs cannot complete the check, so spreadsheet and BI tools have moved to the Analytics API, which uses OAuth and does not trigger it.

The Analytics API returns at most 2,000 rows per report run, and no permission or setting raises that cap. Other limits apply too: 500 synchronous report runs per hour, 1,200 asynchronous requests per hour, 20 Custom Field filters per run, and 100 columns per report. These limits are shared across the org, so heavy scheduled refreshes can affect other processes.

The article offers four options. For a one-off need, use a Details Only export by hand. To stay under the cap, narrow the report with filters such as My or My Team's, fewer columns or a shorter date range, and apply tighter filters in your own pull rather than editing a shared report. For recurring pulls over 2,000 rows, choose a connector that uses the Analytics API and retrieves the full report. For large, regular extracts, use SOQL, which avoids the export and API report limits, though groupings, subtotals and formulas must be rebuilt and queries should be reviewed against the report's logic.

The article closes by advising a review of scheduled refreshes before they compete for the shared API limits. It also promotes Xappex connectors, which handle these cases, and this promotion is the source's own commercial interest.
