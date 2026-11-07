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

The article is the second part of a guide to the Spring '27 release, due in January 2027, with 16 release updates to be enforced before, during or after the release. It advises testing them in a sandbox before Production, scheduling deployments outside working hours, and checking with package providers. It covers the no-code and pro-code approaches, including SFDX, Workbench and Salesforce Inspector Reloaded, and notes that Salesforce may delay or cancel updates.

The guide walks through four updates. Visualforce pages that render as PDFs move to an accessible rendering engine in beta, so pages should be reviewed for renderAs="pdf" and checked with screen readers after a Test Run. Asynchronous sharing recalculation can break Apex and Flows that expect immediate sharing, which matters mainly for large data volumes with high ownership skew or logic that modifies groups or roles; a Sharing Settings option can simulate the behaviour in tests. The View Setup Audit Trail permission will be granted automatically to anyone holding View Setup and Configuration, so the article recommends reviewing who holds the older permission and assigning the audit trail on its own.

Finally, personal information fields are being split so Guest Users and Authenticated Users can have different masking rules, affecting Aura, LWR and Visualforce sites. The article lists queries to find what Guest Users can reach through Apex, Visualforce and Flows, and warns that this update cannot be disabled once enabled, so it should be tried in a sandbox first.
