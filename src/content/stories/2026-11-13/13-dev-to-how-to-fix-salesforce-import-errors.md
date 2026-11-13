---
title: Fixing common Salesforce Import errors and the surprises that follow a Load
original_title: How to fix Salesforce import errors
url: https://dev.to/operelio/how-to-fix-salesforce-import-errors-3fig
source: dev.to
source_type: community
date: 2026-11-13
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - data-import-wizard
  - data-loader
  - duplicate-rules
  - bulk-data-load-jobs
  - import-errors
authors:
  - Daniel Pank
why_read: You will learn how to choose between the Data Import Wizard and Data Loader, what the most common import error messages mean and how to fix them, and why duplicate-rule matches and skipped automation can make a successful import look wrong.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The Data Import Wizard and Data Loader differ in where they run and how far they scale
  left:
    heading: Data Import Wizard
    points:
      - Runs in the browser from Setup
      - Up to 50,000 records per load
      - Objects the wizard lists in Setup
      - Results in Recent Import Jobs
  right:
    heading: Data Loader
    points:
      - Desktop app, Java 17 or later
      - Up to 150 million with Bulk API 2.0
      - All objects, including Custom Objects
      - Success and error CSV files per run
  icons:
    - cloud
    - server
held_from: 2026-11-10
---

The article starts by separating the two import routes. The Data Import Wizard runs in the browser from Setup, suits smaller loads under 50,000 records on supported objects, and is the easier starting point. Data Loader is a desktop application that needs Java 17 or later, covers all objects including Custom Objects, supports upserts, deletes and scheduled command-line loads, and is the route to take when a file outgrows the wizard.

Most failures come from the file rather than the tool. The article walks through the usual causes: a missing required field such as Last Name, values that do not match a picklist exactly, inconsistent date formats, and values longer than the field allows. It explains that duplicate errors can fire against existing Contacts or Accounts because standard matching rules compare names and contact details by similarity, so the record to update may already exist under another Record Type. It also notes that automation can be skipped unless the trigger-workflow option is ticked, and that existing triggers or Validation Rules can reject mixed batches, which a split-by-value approach can work around. Import jobs run from a queue, so admins check Recent Import Jobs and Bulk Data Load Jobs for status and failure reasons, and users should check List Views, ownership and failed rows before re-importing.

The piece also covers fields missing from the mapping list because of page layout or field-level security, the permission needed to import Custom Objects, and the limits of imports, which cannot merge existing duplicates or change matching rules. The closing sections promote the author's own tools, which the reader should weigh accordingly.
