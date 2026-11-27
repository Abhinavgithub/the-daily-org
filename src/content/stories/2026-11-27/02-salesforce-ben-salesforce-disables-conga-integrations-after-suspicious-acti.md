---
title: Salesforce disables Conga connections after suspicious credential store activity
original_title: Salesforce Disables Conga Integrations After ‘Suspicious Activity’
url: https://www.salesforceben.com/salesforce-disables-conga-integrations-after-suspicious-activity/
source: Salesforce Ben
source_type: community
date: 2026-11-27
section: integration
personas:
  - admin
  - architect
  - developer
tags:
  - conga
  - connected-app
  - credential-store
  - security-incident
  - trust-site
authors:
  - Ross Collie
why_read: You will learn that Salesforce cut Conga Connected App integrations as a precaution, what Salesforce says about the cause and the restoration process, and why Conga customers should contact Conga directly. The piece also places this alongside a second Conga incident this year and recent integration disablements.
interest_score: 7
depth_score: 4
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: timeline
  caption: Salesforce's Conga security events, from Conga Composer scrutiny in January to the Conga disablement
  events:
    - when: January
      label: Conga Composer faces authentication scrutiny
    - when: Earlier month
      label: GoFundMe Pro and Talent Rover disabled
    - when: This month
      label: Conga connections disabled after activity
  icons:
    - warning
    - shield
    - lock
---

Salesforce has disabled connections between Salesforce instances and the Conga Connected App after detecting suspicious activity related to the app's credential store. The company describes the step as a precaution, applied to the Conga Connected App and its associated managed packages, and says customers with questions about Conga services or the ongoing remediation should contact Conga directly.

Salesforce stresses that the action was a security measure and not the result of a platform service disruption or a vulnerability in the core Salesforce platform. It says the two companies are working together to restore the affected integrations safely, and that the integrations will stay unavailable until Conga completes its security remediation and shows they can be restored without risk.

Salesforce also committed to notify affected customers without undue delay if it finds unauthorized access to their data as a result of the issue. The article notes this is the second Conga security story this year, following scrutiny of Conga Composer in January over how the product authenticates with Salesforce.

The article places the incident within a broader pattern. Earlier in the same month, Salesforce disabled integrations with two other Connected Apps, GoFundMe Pro and Talent Rover, after spotting suspicious use of access tokens linked to those third-party providers.
