---
title: Loading central bank exchange rates into Salesforce with Apex batch Jobs
original_title: "Loading Dated Exchange Rates into Salesforce: Why Apex DML Fails and What Works"
url: https://dev.to/allratestodaycom/loading-dated-exchange-rates-into-salesforce-why-apex-dml-fails-and-what-works-2fff
source: dev.to
source_type: community
date: 2026-11-26
section: integration
personas:
  - developer
  - admin
  - architect
tags:
  - advanced-currency-management
  - dated-conversion-rate
  - named-credential
  - batch-apex
  - exchange-rates
authors: []
why_read: You will learn why DatedConversionRate cannot be written with Apex DML, how to convert a bank's rate table into your corporate currency, and how to schedule a callout-based sync with the right credentials. The post also lists setup errors that waste time.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The batch sync runs one table per execute, with a single rates GET and then one REST write per currency
  steps:
    - Scheduled Apex starts a batch job
    - One GET to the rates API
    - One REST write per currency
    - Failures make the job fail
figure_image: /figures/2026-11-26/04-dev-to-loading-dated-exchange-rates-into-salesforce-why-apex-dml-fa.png
---

Salesforce multi-currency uses whatever rates are maintained under Manage Currencies, and it does not fill them in. Orgs often update rates by hand, so they drift from the figures finance books in the ERP. When a specific institution's rate is required, such as the ECB or the Fed, a scheduled job can load the table and date each rate with the day the bank published it.

The post explains that DatedConversionRate cannot be written with plain DML and must be written through the REST API, which means an in-org job calls its own REST endpoint from Apex using a Named Credential. Salesforce closes the previous date range automatically, so the job must query for an existing row with the same StartDate and update it rather than insert a duplicate. Rates are stored as units of the currency per one unit of the corporate currency, and the post gives a formula for converting any bank's table from its home currency into the corporate currency's basis.

The post also covers the credential setup for both the rates API and the org's own REST API, including External Client App steps, and lists pitfalls such as an empty Scope value and redacted tokens. For scheduling, Scheduled Apex cannot make callouts, so the schedulable starts a batch job with scope 1, and write failures should be made to fail the job so they appear under Apex Jobs. The author reports test results from a Developer Edition org and offers a Python alternative for teams that already run cron or CI jobs.
