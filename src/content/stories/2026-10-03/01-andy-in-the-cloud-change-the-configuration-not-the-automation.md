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

Thresholds, defaults and feature switches tend to get typed straight into whichever formula, Flow or Apex class needs them. The cost shows up later, when the business changes a number and someone has to find every place it was used. Andrew Fawcett argues that Custom Metadata Types are the platform's answer: a single, deployable home for those values that travels through source control with the rest of the application, unlike records in a Custom Object or Custom Settings.

The post works through a deal-policy example. A Deal_Policy__mdt type holds a large-deal amount, a maximum discount, a default discount and an approval threshold, with one record per region and a Default record for org-wide values. A Formula Field reads the Default record directly using the $CustomMetadata reference, which names the type, the record and the field. The same shape works in Validation Rules and field defaults, though long text area fields cannot be referenced this way.

From there it covers each consumer in turn: formulas, Validation Rules, Flow, Apex, Lightning Record Pages and Agentforce, noting which support the reference natively and which need a workaround. A sample project deploys to a Scratch Org so readers can follow the same Setup paths. The harder question the post keeps returning to is impact: once the value lives in one place, how do you find out what reads it and what changes when you edit it.
