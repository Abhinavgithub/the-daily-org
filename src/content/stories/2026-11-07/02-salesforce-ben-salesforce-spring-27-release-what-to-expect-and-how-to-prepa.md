---
title: Spring '27 release updates to Test before enforcement, part two
original_title: "Salesforce Spring ‘27 Release: What to Expect and How to Prepare (Part 2)"
url: https://www.salesforceben.com/salesforce-spring-27-release-what-to-expect-and-how-to-prepare-part-2/
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
  - visualforce-pdf
  - sharing-recalculation
  - guest-user-pii
authors:
  - Ross Collie
why_read: You will know which Spring '27 release updates in this part affect your org, how to find the impacted Visualforce pages, Apex, Flows and permissions, and how to test each one in a sandbox before it is enforced.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A safe order for preparing Spring '27 release updates
  steps:
    - Review release notes and affected features
    - Test each update in a sandbox
    - Deploy the changes to Production
    - Schedule the change outside working hours
  icons:
    - doc
    - test
    - rocket
    - clock
image: https://www.salesforceben.com/wp-content/uploads/2026/11/s272_1.webp
figure_image: /figures/2026-11-07/02-salesforce-ben-salesforce-spring-27-release-what-to-expect-and-how-to-prepa.png
---

This second part of Tom Bassett's guide for the Salesforce Spring '27 Release covers the remaining release updates due to be enforced around the January 2027 release, and explains how to test each one before it reaches production. Release updates change how existing features behave, so the guide recommends checking your org early, either with no-code tools or with pro-code methods such as SFDX, Workbench or Salesforce Inspector Reloaded. It also warns that Salesforce may delay, change or cancel updates, so the Winter '27 release notes should be checked, and that managed packages should be confirmed with their providers.

The first update makes Visualforce pages that render as PDFs use an accessible rendering engine, currently in beta. Admins should find pages set to renderAs="pdf", use the Test Run in a sandbox, and confirm that the pages still display correctly with screen readers. Sharing recalculation is the next change, moving some work to asynchronous processing. It is most likely to affect orgs with large data volumes and high ownership skew, or with Apex and Flows that change group membership or roles or rely on immediately updated share records. This update has no Test Run, so the guide advises enabling the "Test asynchronous sharing recalculation in Apex tests" setting in a sandbox to simulate it.

Several smaller changes follow. The View Setup Audit Trail permission will be granted automatically to anyone who has View Setup and Configuration, so teams should review who holds the older permission and remove it where it is not needed. Personal information fields will be masked separately for Guest Users, and once enabled this cannot be turned off, so guest access should be audited and tested in a sandbox first. Manual assignment of commerce application usage types will become possible, which means automation that assumes checkout is the only source needs review, and that change also cannot be reversed.

Platform Event triggers will roll back their whole transaction on unhandled exceptions, so triggers relying on partly saved records need regression testing. Finally, the OAuth User-Agent and Hybrid User-Agent flows retire on February 20, 2027. Login History, which holds six months of data, can reveal which integrations use them, and those should move to the Web Server flow or Hybrid Web Server flow with PKCE. The guide ends by urging early preparation and reminding readers to read the first part.
