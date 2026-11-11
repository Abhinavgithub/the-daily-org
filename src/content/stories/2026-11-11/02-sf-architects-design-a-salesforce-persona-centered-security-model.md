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

The article argues that Salesforce security models often become a fragmented patchwork, and that features can fail on release because users lack the access they need. Its remedy is to build the security model around personas: groups of users who share a functional role and baseline access. The business defines which persona needs which access (create, read, edit, delete) for a feature, and IT implements that access consistently, so the same framework can serve later releases. Shared understanding between IT and the business is treated as essential to making this work.

The approach rests on five pieces. A persona picklist on the User record, whose edits are tightly restricted to administrators, stores each user's persona. A Custom Metadata Type acts as a maintainable mapping table from each persona to its profile, role, public groups and Permission Set Group, and automation fails if a persona lacks a mapping record. Each persona gets one Permission Set Group, which has no access of its own, so changing a persona's access means changing its Permission Sets. Those Permission Sets can be organized either by functional capability, which suits features spanning many objects such as Field Service, or by persona, which suits cases with few personas and complex functions, such as a Partner Relationship Management Experience Cloud site. Temporary cross-role duties are handled through an approved exception process, such as an ITSM workflow, while permanent combined roles should become new personas.

The article also recommends keeping profiles minimal: each user gets a custom "Minimum Access" profile, one per license type, with most permissions moved to Permission Sets, since profiles are still needed only for edge cases such as page layouts, login hours and IP ranges. Assignment is automated with Apex through the organization's trigger framework, which the author prefers over Flows for consistent performance at scale. For teams not ready for the full design, the author suggests starting with Permission Set Groups for the personas a feature and its successors will need, assigned manually at first, and adding the persona field and automation later. The article frames this as a way to meet the Salesforce Well-Architected Framework's goals of scalability and predictability.
