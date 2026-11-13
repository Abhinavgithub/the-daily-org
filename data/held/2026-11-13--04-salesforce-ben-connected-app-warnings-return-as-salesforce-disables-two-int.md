---
title: Salesforce disables two Connected Apps over suspicious access token use
original_title: Connected App Warnings Return as Salesforce Disables Two Integrations
url: https://www.salesforceben.com/connected-app-warnings-return-as-salesforce-disables-two-integrations/
source: Salesforce Ben
source_type: community
date: 2026-11-13
section: integration
personas:
  - admin
  - architect
tags:
  - connected-app
  - access-tokens
  - managed-packages
  - agentexchange
  - security-advisory
authors:
  - Ross Collie
why_read: You will learn that Salesforce disabled the Talent Rover and GoFundMe Pro Connected Apps and managed packages over suspicious access token use, and what the company said about their status. Read it if your orgs use either integration.
interest_score: 6
depth_score: 4
novelty_score: 5
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://www.salesforceben.com/wp-content/uploads/2026/11/appwarnings1.webp
---

Salesforce disabled integrations with two Connected Apps in the week of November 10, 2025, after identifying suspicious use of access tokens linked to the third-party providers. The first advisory, posted on November 10, covered Talent Rover, a product owned by Bullhorn. Salesforce disabled its Connected Apps and managed packages as a precaution and said the issue did not stem from a vulnerability in the Salesforce platform.

The same day, Salesforce re-enabled the Talent Rover Connected Apps and managed packages after Bullhorn completed security remediation. The second advisory, issued November 11, applied the same measures to the GoFundMe Pro Connected App and its associated managed packages. Salesforce again said the core platform was not at fault.

Salesforce and GoFundMe are investigating the activity together. The GoFundMe Pro integrations will stay unavailable until remediation is complete and GoFundMe has shown they can be restored safely. Salesforce said it will notify affected customers without undue delay if it finds unauthorized access to their data. At the time of writing, GoFundMe Pro remained disabled, and the article notes the earlier Connected App problems of 2025, which led Salesforce to harden Connected App security.
