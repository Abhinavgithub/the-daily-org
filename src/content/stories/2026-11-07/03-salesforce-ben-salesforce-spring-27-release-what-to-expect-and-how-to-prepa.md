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

Salesforce's Spring '27 release arrives in January 2027, with 16 release updates due before, during or after it. This first part covers the updates enforced before the release. Release updates change how existing features behave, so the author recommends testing them in a sandbox before they are enforced, using SFDX, Workbench or Salesforce Inspector Reloaded to find dependencies. Salesforce may delay, change or cancel updates, so the latest release notes remain the source of truth, and installed managed packages should be checked with their providers.

The article walks through the updates enforced before the release. The first restricts the OAuth 2.0 Device Flow to Local External Client Apps, enforced on November 30, 2026. Login History, which holds six months of data, shows OAuthDevice logins to compare against Connected Apps and External Client Apps. Connected Apps must be migrated, packaged apps referred to their developers, and Local External Client Apps need a Callback URL. The second gates SOAP Login() behind the Use Any API Auth user permission from December 1, 2026, and the author suggests finding SOAP users in Login History and granting them a Permission Set.

Other updates covered include the retirement of email verification exceptions, where Email Domain Allowlists must move to Authorized Email Domains before enforcement, and accessibility changes to To Do Lists and Lightning Dual Listboxes at over 200% zoom, which affect custom and Visualforce pages. The removal of non-public fields from Custom Object data in Aura action responses from January 2027 requires checking components that loop over fields. The article recommends running changes in a sandbox, then deploying to production outside working hours with a rollback plan.
