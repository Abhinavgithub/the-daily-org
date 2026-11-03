---
title: Which Salesforce Certificate changes actually affect your org
original_title: "Salesforce Certificate Changes: Does Your Org Actually Need to Act?"
url: https://www.salesforceben.com/salesforce-certificate-changes-does-your-org-actually-need-to-act/
source: Salesforce Ben
source_type: community
date: 2026-11-03
section: releases
personas:
  - admin
  - architect
  - developer
tags:
  - certificate-management
  - mutual-tls
  - tls-certificates
  - trust-store
  - certificate-pinning
  - security
authors:
  - Ross Collie
why_read: You will learn which of the three upcoming certificate changes apply to your org, how to check for mutual TLS and certificate pinning, and what to ask your integration team before the March 2027 deadlines.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Three certificate changes, each checked in turn to see whether an org is affected
  steps:
    - Check whether the org uses inbound mTLS
    - Review which systems connect to Salesforce
    - Plan renewals as certificate lifespans shorten
    - Confirm connected systems trust Mozilla's roots
  icons:
    - lock
    - plug
    - clock
    - shield
figure_image: /figures/2026-11-03/06-salesforce-ben-salesforce-certificate-changes-does-your-org-actually-need-t.png
---

Salesforce has announced three certificate changes, and the article argues that most orgs need only a few checks rather than a full investigation. The mutual TLS change matters only if an org uses inbound mTLS with dual-use certificates, which Chrome's root program rules no longer permit after March 2027. The article explains how to check for mTLS in Certificate and Key Management, and notes that Salesforce Support must enable that section first.

The second change shortens the maximum lifespan of publicly trusted TLS certificates in stages, from 398 days to 100 days in March 2027 and 47 days by March 2029. This affects teams that buy and renew public certificates by hand, and the article suggests the Expired Certificate Notification permission and the Metadata API Certificate type to ease renewals. It also warns against certificate pinning, which Salesforce does not support on Hyperforce or for Marketing Cloud Engagement.

The third change concerns root certificates and trust stores. Salesforce guarantees that its certificates chain to a root on Mozilla's list and recommends that connecting systems trust all those roots, since Salesforce may switch providers. The article frames this as a task for the IT or integration team, with the Salesforce Admin's job being to identify who owns each affected connection.
