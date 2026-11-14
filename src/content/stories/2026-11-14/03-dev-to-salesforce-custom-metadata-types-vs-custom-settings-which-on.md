---
title: Choosing between Custom Metadata Types and Custom Settings for org configuration
original_title: "Salesforce Custom Metadata Types vs Custom Settings: Which One to Use and When"
url: https://dev.to/rohanmehta/salesforce-custom-metadata-types-vs-custom-settings-which-one-to-use-and-when-24pn
source: dev.to
source_type: community
date: 2026-11-14
section: architecture
personas:
  - developer
  - admin
  - architect
tags:
  - custom-metadata-types
  - custom-settings
  - hierarchy-custom-settings
  - deployment
  - configuration-storage
authors:
  - Rohan Mehta
why_read: You will learn which configuration store fits deployment-time values, which fits per-user or runtime state, and how to migrate between them. The article gives a clear decision rule that you can apply when designing new configuration.
interest_score: 6
depth_score: 6
novelty_score: 3
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Custom Settings and Custom Metadata Types differ in how they deploy and in what they can do at runtime
  left:
    heading: Custom Settings
    points:
      - Records are data, not metadata
      - Not in change sets or packages
      - "Hierarchy cascade: org, profile, user"
      - Count against data storage
  right:
    heading: Custom Metadata Types
    points:
      - Stored as metadata
      - Deploy with change sets and packages
      - Referenced from formulas and Flows
      - Apex cannot edit them at runtime
  icons:
    - doc
    - rocket
---

Salesforce orgs need to store configuration that code reads, such as feature flags, endpoint URLs and thresholds. The article contrasts the two classic options, Custom Settings and Custom Metadata Types, and notes that choosing the wrong one tends to cause problems later, often during deployment.

Custom Settings hold org-specific data in two forms: List settings, which are sets of records, and Hierarchy settings, which cascade values from org to profile to user. The cascade is their main advantage, since it allows per-user or per-profile values without code. Their records are data rather than metadata, so they do not travel with change sets or packages, must be recreated in each sandbox and in production, are invisible to the Metadata API, and count against data storage.

Custom Metadata Types store configuration as metadata that deploys with change sets, unlocked packages and the Metadata API. They can be referenced from formulas, Flows, Apex and Validation Rules, and they support protected records in managed packages. Their limits are that Apex cannot create or edit them at runtime, and they have no per-user or per-profile cascade, so one value applies to everyone in the org.

The article's rule is to ask whether the value changes at runtime or only at deployment. Runtime state such as counters or timestamps belongs in Custom Settings or a Custom Object, while deployment-time configuration belongs in Custom Metadata Types. Per-user or per-profile values call for Hierarchy Custom Settings. Many orgs combine both, using Custom Metadata Types for stable configuration and a Custom Setting or Custom Object for live state.

For migration, the author recommends creating the Custom Metadata Type with the same fields, recreating the records as metadata, and updating references, noting that the getInstance() call changes to the mdt syntax. Migrate one setting at a time, keep the old one until the new one is proven, and check that test classes still cover the code so the 75% deployment gate is not breached.
