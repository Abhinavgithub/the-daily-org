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

An "ACTION REQUIRED" email from Salesforce on October 29, 2026, warned of three certificate changes that could cause security problems or service disruption. The article argues that many orgs need only a few checks. Admins should first ask three questions: whether mutual TLS (mTLS) is in use, which is checked under Certificate and Key Management (the Mutual Authentication Certificates section is hidden until Salesforce Support enables it); whether external systems such as middleware or on-premises servers connect to Salesforce; and whether their team renews public certificates by hand.

The first change affects only orgs using mTLS. Under Chrome Root Program Policy v1.8, a certificate can no longer serve both server and client authentication, so existing dual-use certificates may not be renewable after March 2027. The fix is a dedicated client certificate from a supported public authority, such as DigiCert, SSL.com, Sectigo or GlobalSign. Salesforce does not currently accept private certificate authorities for inbound mTLS. The integration owner handles the replacement, while the admin confirms who that is and that a plan exists.

The second change shortens the maximum lifespan of publicly trusted TLS certificates: 398 days before March 2026, 200 days from then, 100 days from March 15, 2027, and 47 days from March 2029. Salesforce rotates its own certificates at least 45 days before expiry, so the risk lies with systems that pin a specific certificate, which Salesforce strongly advises against. Self-signed certificates are not subject to the new limits but still expire after a year. Admins should decide who owns manual renewals, assign the Expired Certificate Notification permission, and consider automation through the Metadata API Certificate type.

The third change concerns root certificates and trust stores. Salesforce recommends that connecting systems trust all roots on Mozilla's Server Authentication list, since it may switch roots. Older Java or SAP integrations, particularly those more than ten years old running JDK 8 or earlier, may need extra files to support its cryptographic algorithms. Self-signed and custom CA-signed certificates are exempt, and MuleSoft users should follow separate guidance. The admin's role is to pass three questions to IT about trust stores, pinning and Java versions, and then confirm that each check has an owner. Salesforce is also running webinars for engineering and security teams on November 4 and 5, 2026.
