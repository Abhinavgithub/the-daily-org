---
title: Choosing replacements for Salesforce to Salesforce before its Spring '27 retirement
original_title: Replace Salesforce to Salesforce Before Its Spring ’27 Retirement
url: https://www.salesforce.com/blog/salesforce-to-salesforce-replacement-architecture/
source: Salesforce Architects
source_type: official
date: 2026-11-21
section: architecture
personas:
  - architect
  - admin
  - developer
tags:
  - salesforce-to-salesforce
  - s2s-retirement
  - experience-cloud
  - partner-connect
  - data-360
  - mulesoft
authors:
  - Shraddha Nakra
  - Marlene Guerra-Reeve
why_read: You will know how Salesforce to Salesforce works, what its retirement means for cross-org sharing, and how to choose among Experience Cloud, Partner Connect, Salesforce Connect, Data 360 and MuleSoft as replacements. You will also see the steps to inventory existing connections and plan a controlled cutover. The piece is aimed at architects and admins who inherit orgs that share data with partners or other orgs.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 9
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: steps
  caption: The first step in replacing S2S is inventorying every connection in each org
  steps:
    - Inventory every connection in each org
    - Retire connections no longer needed
    - Gather business requirements for the rest
    - Choose a partner or platform option
    - Plan a controlled implementation
figure_image: /figures/2026-11-21/07-sf-architects-replace-salesforce-to-salesforce-before-its-spring-27-retire.png
---

Salesforce to Salesforce (S2S) is a declarative, point-to-point integration that shares records between two Salesforce orgs without code or middleware. The publishing org chooses what to share, the subscribing org maps it to its own fields, and forwarded records are sent asynchronously with retries and errors logged in the Connection History. Authentication relies on a mutual invitation, so no credentials are managed. Salesforce is retiring S2S with the Spring '27 release, so teams need a new strategy, and the article suggests using the retirement as a chance to close gaps the current setup leaves open.

The first step is an inventory of every connection in each org. Record what is shared, how records are forwarded and accepted, and who owns each connection, along with the automation, assignment rules and logic that depend on it. Retire connections no longer needed, then gather business requirements for the rest. For partner scenarios, Experience Cloud is the choice when partners can work in your org on records you own, with Default External Access set to Private and access granted through partner roles and Sharing Rules. Partner Cloud adds onboarding, tiers and channel revenue management on top of that site, at the cost of licenses and program design. Partner Connect (Beta) suits partners that need their own synced copy, but it supports only accounts, contacts, leads, opportunities and cases as of Winter '27, and not formula, multiselect or most lookup fields. MuleSoft can replicate records as an alternative for production.

When no partner-facing option fits, the article works through platform options in order of how much data must move. Salesforce Connect's cross-org adapter reads or writes records in place as external objects but suits only small, on-demand operations. Data 360 offers a shared view through Data Cloud One or Data 360 to Data 360 sharing, though neither creates or updates CRM records. MuleSoft for Flow or Anypoint Platform handles replicated records where each org keeps its own copy. A custom build, using Apex, REST, Change Data Capture or Bulk API 2.0, is a last resort and takes on duplicate handling, backfill, deletes and credential management.

Finally, the article recommends a controlled implementation. Agree timelines and field ownership with the other org's owner. Identify every flow, trigger, report and integration that touches the moved data, since automation also runs on records the new integration writes. Test duplicate prevention and failure cases in a sandbox with pass criteria set in advance, and finish production cutover several weeks before the instance's Spring '27 upgrade date, without running S2S and the replacement side by side.
