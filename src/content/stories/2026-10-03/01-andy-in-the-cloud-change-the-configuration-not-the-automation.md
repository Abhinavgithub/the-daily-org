---
title: "Custom Metadata Types as one deployable home for values across Salesforce and Agentforce"
url: https://andyinthecloud.com/2026/09/30/change-the-configuration-not-the-automation-using-custom-metadata-across-salesforce-and-agentforce/
source: Andy in the Cloud
source_type: community
date: "2026-10-03"
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - custom-metadata-types
  - formulas
  - flow
  - apex
  - agentforce
authors:
  - Andrew Fawcett
why_read: You will see how one Custom Metadata Type can feed formulas, Validation Rules, Flow, Apex and Agentforce actions, and where those references stop working.
interest_score: 8
depth_score: 8
novelty_score: 6
utility_score: 9
model: hand-written sample
image: "https://andyinthecloud.com/wp-content/uploads/2026/09/feature.png"
original_title: "Change the Configuration, Not the Automation: Using Custom Metadata Across Salesforce and Agentforce"
figure:
  kind: compare
  caption: One deployable home replaces values typed into each formula, Flow or Apex class
  left:
    heading: Typed into each tool
    points:
      - Thresholds in formulas
      - Defaults in Flows
      - Feature switches in Apex classes
      - Each change means finding every use
  right:
    heading: Custom Metadata Types
    points:
      - One deployable home for values
      - Travels through source control
      - One record per region plus Default
      - Read via $CustomMetadata reference
---

The article argues that developers often hard-code business values such as thresholds, defaults, feature switches and mappings into formulas, Flows and Apex without noticing, which makes later changes hard to trace. Custom Metadata Types offer a central, deployable home for these values. Unlike Custom Settings or Custom Objects, which hold data, Custom Metadata holds configuration that ships with application code through source control and CI/CD. The author illustrates this with a Deal_Policy__mdt type holding a shared maximum discount and regional records for large-deal amount, default discount and approval threshold, selected by region name.

The piece then maps where references work. Formula Fields, Validation Rules and field defaults can use a three-part reference (type, record name, field), but the formula must name a fixed record, so it cannot pick a region from opportunity data. Long text area fields cannot be referenced, and the formula editor does not list Custom Metadata fields for defaults, though typing the reference still works. Flow can query the type with Get Records, match a region, and fall back to the Default record, and it can also use the literal reference. Apex uses getInstance with a similar fallback. Custom Permissions are kept separate, since they govern what a user may do while Custom Metadata governs the values.

Agentforce cannot read $CustomMetadata references directly, so the workaround is an invocable Apex action that loads the policy and returns the values, which the Agent Script maps into variables before answering. Lightning App Builder component visibility does not accept Custom Metadata references. On record pages a Formula Field can bridge the value, though that adds a field, and App and Home pages must read the data in Apex, through @wire, or via Dynamic Interactions.

To assess impact, the article recommends Setup's Where is this used? option or a Tooling API query of MetadataComponentDependency, which lists the Apex classes and Validation Rules that depend on a field. It also notes that an attempt to build an LWC editor that showed these dependencies from Apex was complicated by the authentication setup REST calls require. Finally, it outlines platform limits: 200 types per org (350 with certified managed packages), 100 fields per type, and a 10 million character budget where each text area reserves 255 characters regardless of use. Process Builder allows 15 Custom Metadata formula references per process. The author concludes that teams should treat business values as configuration, centralize them, and keep track of where each reference works and where it does not.
