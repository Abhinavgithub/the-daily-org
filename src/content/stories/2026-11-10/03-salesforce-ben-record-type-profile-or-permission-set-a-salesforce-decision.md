---
title: Choosing between Record Types, Profiles and Permission Sets
original_title: Record Type, Profile, or Permission Set? A Salesforce Decision Guide
url: https://www.salesforceben.com/record-type-profile-or-permission-set-a-salesforce-decision-guide/
source: Salesforce Ben
source_type: community
date: 2026-11-10
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - record-types
  - profiles
  - permission-sets
  - permission-set-groups
  - access-management
authors:
  - Ross Collie
why_read: You will learn what each of Record Types, Profiles and Permission Sets is for, and how to decide which one fits a given requirement. The article also explains why Record Types are not a security control.
interest_score: 7
depth_score: 7
novelty_score: 4
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Each tool solves a different problem, so match the requirement to the right one
  left:
    heading: Record Type
    points:
      - Different business processes
      - Controls picklist values per process
      - Not a security control
  right:
    heading: Permission Set
    points:
      - Grants additional access
      - Assigned to selected users
      - Field and object permissions
image: https://www.salesforceben.com/wp-content/uploads/2026/11/Record-Type-Profile-or-Permission-Set-Graphic-2-1024x868.webp
---

Admins often reach for the wrong tool when a request comes in, for example creating a new Profile to give a team access to a field, or a new Record Type to get a different permission. Each tool solves a different problem: Record Types support different business processes on the same object, Profiles set baseline user settings, and Permission Sets grant additional access to selected users.

The article explains that Record Types do not control Opportunity Stage values directly. A Sales Process supplies those values and is assigned to the Record Type. Record Types are also not a security mechanism, since they do not determine which records or fields a user can see or edit. Permission Sets generally grant access rather than remove it, and a muting Permission Set within a Permission Set Group is the one exception, suppressing selected permissions only within that group.

The piece offers a decision table mapping business requirements to the best starting point, then works through scenarios such as a sales team needing different picklist values, a small group needing a new feature, and a field-level access request. It closes by stressing that a single requirement can need more than one tool, each doing its own job.
