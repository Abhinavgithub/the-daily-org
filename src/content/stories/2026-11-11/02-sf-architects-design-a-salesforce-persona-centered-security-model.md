---
title: Design a Salesforce security model around user personas
original_title: Design a Salesforce Persona-Centered Security Model
url: https://www.salesforce.com/blog/persona-based-security-model/
source: Salesforce Architects
source_type: official
date: 2026-11-11
section: architecture
personas:
  - architect
  - admin
tags:
  - persona-based-security
  - permission-set-groups
  - custom-metadata-types
  - permission-sets
  - minimum-access-profile
authors:
  - Joshua Dreiling
why_read: You will learn how to map business personas to a User Field, a Custom Metadata Type, a Permission Set Group and Apex automation, so access stays consistent as features are added. The piece also explains when to use functional versus persona-based Permission Sets and why Profiles should be kept minimal.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a persona assigns a user's access, from the User record through to Apex
  steps:
    - Persona set on User record
    - Custom Metadata Type maps persona
    - Permission Set Group for persona
    - Permission Sets grant access
    - Apex assigns access on save
  icons:
    - person
    - database
    - layers
    - shield
    - gear
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Persona-Blog-Visuals-Abstract-Visual.jpeg?strip=all&#038;quality=95
---

Security designs often fail because users lack the access they need at go-live, usually because access was built as a patchwork of inconsistent decisions. The author proposes defining personas as groups of users who share a functional role and baseline access, with the business deciding what each persona may create, read, edit or delete and IT implementing it. Each user's persona is stored in a tightly controlled picklist on the User record, and temporary exceptions go through an approved ITSM process rather than changing the persona.

A Custom Metadata Type maps each persona to its Profile, Role, Public Groups and Permission Set Group. Each persona gets one Permission Set Group, which holds no access of its own, so changing a persona's access means changing the Permission Sets inside it. Permission Sets can be organized by functional capability, as in a Field Service implementation, or by persona when capabilities are hard to separate, as in a Partner Relationship Management site. Users are given a single custom Minimum Access Profile per license type, leaving most permissions to Permission Sets, in line with Salesforce's migration guidance.

The author recommends automating assignment with Apex trigger, handler, service and helper classes rather than Flows, because Apex bulkifies more predictably at high volume. The approach is meant to be reused for capabilities added in later releases.
