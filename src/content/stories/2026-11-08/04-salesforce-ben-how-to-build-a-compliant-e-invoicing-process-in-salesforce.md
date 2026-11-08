---
title: Building an e-invoicing process in Salesforce across german, belgian and french Rules
original_title: How to Build a Compliant E-Invoicing Process in Salesforce
url: https://www.salesforceben.com/how-to-build-a-compliant-e-invoicing-process-in-salesforce/
source: Salesforce Ben
source_type: community
date: 2026-11-08
section: flow-and-admin
personas:
  - admin
  - architect
  - developer
tags:
  - e-invoicing
  - zugferd
  - xrechnung
  - legal-entity
  - peppol
  - finblick
authors:
  - Ross Collie
why_read: You will learn how national e-invoicing rules in Germany, Belgium and France differ and what each means for Salesforce invoice data, configuration and exchange channels. The article also outlines a readiness checklist for a multi-entity org.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Germany's ZUGFeRD and XRechnung formats differ in how they carry structured data
  left:
    heading: ZUGFeRD
    points:
      - XML embedded in the PDF
      - Human-readable PDF included
  right:
    heading: XRechnung
    points:
      - Structured XML file
      - No PDF included as part of format
  icons:
    - doc
    - code
image: https://www.salesforceben.com/wp-content/uploads/2026/11/Germany-E-Invoicing-Key-Dates-Timeline-1-1024x595.webp
held_from: 2026-11-05
---

The article argues that a Salesforce team cannot treat European e-invoicing as one rule set. Each legal entity and transaction must first be checked against the applicable country's deadlines, structured format and exchange method. Germany's ZUGFeRD and XRechnung, which have transition periods running through 2026 and 2027, are contrasted with Belgium's mandatory Peppol-based structured invoicing from January 2026 and France's phased platform-based model starting in September 2026.

For the Salesforce implementation, the author recommends mapping the regulatory scope, defining the required output and exchange method, auditing that the needed seller, customer, tax, line-item and reference data exists at generation time, and adding controls with Validation Rules, Flow or Apex. The lifecycle should also cover receiving incoming e-invoices and handling corrections.

The piece then shows how the Finblick application on AgentExchange supports these needs with Legal Entity records, Matching Rules tied to Tax Rules, ZUGFeRD and XRechnung generation from the Invoice record, and Credit Notes for corrections. It closes by recommending testing across entity, country, VAT and correction combinations, and ongoing review as national rules change.
