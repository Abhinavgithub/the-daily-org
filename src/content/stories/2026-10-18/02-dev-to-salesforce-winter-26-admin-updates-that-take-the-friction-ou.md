---
title: Winter '26 adds multi-column sorting and Flow version comparison
original_title: "Salesforce Winter '26: Admin Updates That Take the Friction Out of Daily Work"
url: https://dev.to/rohanmehta/salesforce-winter-26-admin-updates-that-take-the-friction-out-of-daily-work-3a8l
source: dev.to
source_type: community
date: 2026-10-18
section: flow-and-admin
personas:
  - admin
tags:
  - winter-26
  - flow-builder
  - list-views
  - report-charts
  - translation-workbench
authors:
  - Rohan Mehta
why_read: Readers will learn which Winter '26 updates improve daily admin workflows, including multi-column List View sorting, enhanced Flow debugging, and localized report labels.
interest_score: 7
depth_score: 3
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
figure:
  kind: parts
  caption: Main update categories in the Winter '26 Salesforce release
  whole: Winter '26 release
  parts:
    - List Views
    - Flow Builder
    - Reporting and dashboards
---

The Winter '26 release introduces several quality of life improvements for administrators, starting with List Views. Users can now sort records by up to five columns simultaneously, each set to ascending or descending order. Configuring this stays persistent until manually reset. Field pickers within List View controls also support type ahead search, allowing admins to quickly locate fields by typing characters and using keyboard shortcuts.

Flow Builder receives substantial updates to streamline automation design and management. Decision elements can now leverage Generative AI to analyze unstructured data and route records based on tone or urgency. Flows can automatically trigger when files attach to records, and newly created records can be referenced immediately without additional query elements. Debugging becomes easier with a resizable side panel and card based results that jump directly to canvas elements. Administrators can also compare flow versions side by side to track changes across autolaunched, scheduled, and record triggered types.

Reporting and dashboard capabilities expand with localization and security features. Labels for reports and dashboards can now be translated through the Translation Workbench, covering widget titles and footers. Exported reports include a beta option to block spreadsheet formula interpretation, preventing accidental execution of malicious strings. Dashboard charts in Lightning Experience will soon support reference lines, mirroring functionality previously limited to report charts. The author recommends testing these updates in a sandbox before production deployment.
