---
title: Using Global Flow Resources for value mapping in Screen Flows
original_title: Kill Hardcoded Value Mappings With Global Flow Resources in Salesforce
url: https://www.salesforceben.com/kill-hardcoded-value-mappings-with-global-flow-resources-in-salesforce/
source: Salesforce Ben
source_type: community
date: 2026-11-28
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - global-flow-resources
  - value-mapping
  - transform-element
  - screen-flow
  - case-formula
  - summer-26
authors:
  - Ross Collie
why_read: You will learn how to define a value mapping once as a Global Flow Resource and call it from a Transform element, replacing hardcoded CASE() formulas and lookup objects. You will also learn its fallback options and its limits.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Global Flow Resources replace per-flow CASE() formulas and lookup objects for value mapping
  left:
    heading: Before Summer '26
    points:
      - CASE() formula copied into each flow
      - Edit and reactivate every flow to change
      - Or a mapping object queried with SOQL
  right:
    heading: Global Flow Resource
    points:
      - Defined once in the Automation app
      - Called from the Transform element
      - One edit applies to every flow
  icons:
    - flow
    - rocket
image: https://www.salesforceben.com/wp-content/uploads/2026/11/vm1.webp
figure_image: /figures/2026-11-28/01-salesforce-ben-kill-hardcoded-value-mappings-with-global-flow-resources-in.png
---

The article explains that value mapping, translating one value into another such as a satisfaction rating into a customer message, has traditionally been done with CASE() formulas or with a Custom Object queried by Get Records. The first approach means editing and reactivating every flow that uses it when a value changes, and the second costs a SOQL query on every run. Summer '26 adds Global Flow Resources, org-wide value mappings defined once in the Automation app and used in the Transform element of any flow, so one edit applies everywhere.

A mapping supports String, Number, Boolean, Date or Date/Time source and target values. When an unmapped value arrives you can pass it through unchanged, fail the flow, or return a default. The author suggests pass-through for mostly matching values, failing for integrations where a missing value signals an upstream change, and a default for customer-facing flows.

The walkthrough builds a Screen Flow over a Satisfaction Level picklist on Case. It creates a mapping of five picklist values to messages, adds a record variable and a Screen element, then sets up a Transform element that maps the field through the mapping into a text variable. A second screen displays the result, and the author tests it in Debug.

The limits are that a mapping works on a single record or value, not a collection, so it cannot transform 20 records pulled into a collection in one Transform element. It cannot be used in before-save Record-Triggered Flows. Mappings are strictly one-to-one, so a result depending on several fields still needs a Decision element or formula. A mapping cannot be deleted while any flow still references it.
