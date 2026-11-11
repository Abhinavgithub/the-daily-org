---
title: Spring '27 release updates that need testing before enforcement, part one
original_title: "Salesforce Spring ‘27 Release: What to Expect and How to Prepare (Part 1)"
url: https://www.salesforceben.com/salesforce-spring-27-release-what-to-expect-and-how-to-prepare-part-1/
source: Salesforce Ben
source_type: community
date: 2026-11-07
section: releases
personas:
  - admin
  - developer
  - architect
tags:
  - spring-27
  - release-updates
  - oauth-device-flow
  - sandbox-testing
  - login-history
authors:
  - Ross Collie
why_read: You will learn which of the first Spring '27 release updates, due before the release, affect your org, how to find the affected Connected Apps, SOAP logins and email settings, and how to test and deploy each change safely.
interest_score: 8
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://www.salesforceben.com/wp-content/uploads/2026/11/s271_1.webp
figure:
  kind: steps
  caption: The recommended sequence for preparing Spring '27 release updates before enforcement
  steps:
    - Find impacted features in a sandbox
    - Test each release update with Test Run
    - Re-test impacted connections and users
    - Deploy to Production outside working hours
    - Check results and keep a rollback plan
  icons:
    - search
    - test
    - check
    - clock
    - shield
---

Tom Bassett's guide is the first of two parts covering the 16 release updates due to be enforced before, during or just after Salesforce's Spring '27 release in January 2027. Salesforce will enforce some updates before the release window, which the author notes is unusual and tied to security. The guide advises testing in a sandbox before deploying to production, ideally outside working hours, with a communication plan and a rollback plan. It also suggests developers use tools such as SFDX, Workbench or Salesforce Inspector Reloaded to find dependencies, and that users check the Winter '27 release notes, since Salesforce may delay, change or cancel updates. Installed managed packages should be confirmed with their providers.

This part covers the first group of updates. The OAuth 2.0 Device Flow restriction, enforced on November 30, 2026, affects Connected Apps, packaged External Client Apps and Local External Client Apps without a Callback URL. Teams should review Login History for OAuth device logins, which is only kept for six months, migrate affected Connected Apps to External Client Apps, and confirm Local External Client Apps have a Callback URL. The SOAP Login change, effective December 1, 2026, gates access behind the Use Any API Auth permission, so affected users and integrations need a Permission Set granting it, verified through Login History. The email verification exception is being retired: existing Email Domain Allowlists will stop working, so orgs should move to Authorized Email Domains, especially if DKIM verification is turned on, to avoid users being unable to send email. The accessibility change for To Do Lists and Lightning Dual Listboxes, due January 2027, affects users browsing at more than 200% zoom, so custom and Visualforce pages should be tested at that level.

Other updates also due in January 2027 need attention. Aura action responses will no longer return non-public system fields, so Lightning components and their Apex classes must be reviewed for references to undocumented fields, and the author found standard objects were affected too. Salesforce Connect Cross-Org legacy OAuth and password authentication is being removed, so External Data Sources should be migrated to Named Credentials and re-authenticated. Salesforce to Salesforce is being retired, so organizations should check whether it is enabled, export any backup records, and move to an alternative such as Partner Cloud, Data Cloud One, MuleSoft or a third-party tool.

The guide closes with two adjustments Salesforce has made to earlier updates. The OAuth 2.0 Username-Password Flow retirement for Connected Apps is now due on February 20, 2027, and the update to instanced URLs in API traffic is now due in Spring '27. The author points readers to part two for the remaining updates.
