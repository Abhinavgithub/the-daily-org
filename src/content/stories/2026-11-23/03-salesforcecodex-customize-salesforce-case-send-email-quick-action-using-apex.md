---
title: Customizing the Case Send Email Action with Apex and declarative options
original_title: Customize Salesforce Case Send Email Quick Action Using Apex
url: https://salesforcecodex.com/salesforce/customize-case-send-email-action-apex/
source: SalesforceCodex
source_type: community
date: 2026-11-23
section: flow-and-admin
personas:
  - developer
  - architect
  - admin
tags:
  - send-email-quick-action
  - case-feed
  - quickactiondefaultshandler
  - predefined-field-values
  - custom-metadata-types
authors:
  - Dhanik Lal Sahni
why_read: You will learn when Predefined Field Values and formulas are enough for the Case Send Email action, and how to use a QuickActionDefaultsHandler with Custom Metadata Types to set sender and recipients dynamically. You will also see the precedence and design trade-offs to weigh before writing Apex.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Declarative defaults suit simple cases, while Apex suits complex routing
  left:
    heading: Declarative
    points:
      - Fixed sender address
      - Subject from a formula
      - Recipient from Case Contact
  right:
    heading: Apex handler
    points:
      - Sender chosen by region
      - Dynamic CC and BCC
      - Routing from related records
  icons:
    - doc
    - code
image: https://res.cloudinary.com/duws9yaa5/image/upload/v1795187255/customize-salesforce-case-email-with-apex-SalesforceCodex_gz4cit.webp
held_from: 2026-11-21
figure_image: /figures/2026-11-23/03-salesforcecodex-customize-salesforce-case-send-email-quick-action-using-apex.png
---

The article explains that Salesforce Service Cloud's standard Send Email Quick Action in the Case Feed lets agents compose and send emails from a Case, with default values for recipients, sender and subject. It argues that many requirements, such as a fixed sender, a subject built from the Case Number or a recipient taken from the Case Contact, can be met declaratively through Predefined Field Values and formula expressions on the action's configuration page.

Where logic becomes more complex, such as choosing a sender by Case region, adding an Account Relationship Manager to CC or a Compliance Team to BCC for certain Case types, the author proposes Apex using the QuickAction.QuickActionDefaultsHandler interface. The example stores region-to-sender mappings in a Custom Metadata Type called CaseRegionSetting__mdt, with a From Address field and records for North America, Europe, Asia Pacific and India. The handler class is then registered under Setup, Support Settings, as the Default Handler for Email Action.

The architectural section sets out when to choose each approach, and notes that the Apex handler takes precedence over predefined values, so conflicting defaults should be avoided. It recommends keeping addresses and routing rules in Custom Metadata rather than hardcoding them, checking that the From Address is an eligible sender identity such as a verified Org-Wide Email Address, and avoiding SOQL inside loops because the handler runs when the composer initializes.
