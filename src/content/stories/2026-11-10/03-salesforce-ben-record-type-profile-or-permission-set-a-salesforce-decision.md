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

This Salesforce Ben article helps admins decide between Record Types, Profiles and Permission Sets when a new requirement arrives. It explains that Record Types support different business processes for the same object, controlling available picklist values through Sales Processes and working with Page Layouts. It stresses that Record Types are not a security mechanism, since assigning one does not govern which records or fields a user can see or edit, and that restricting Record Types does not block access to existing records using other types.

Profiles, which every user has exactly one of, are described as the baseline for a user's experience, covering login hours, IP ranges, password and session settings, default apps, default Record Types and Page Layouts. Permission Sets add access on top of that baseline, and a user can hold several of them; Permission Set Groups bundle commonly paired sets together. The article notes Permission Sets generally grant rather than remove access, and that a muting Permission Set inside a group only suppresses permissions from other sets in that same group, not those from the Profile or outside the group.

A decision table maps requirements to starting tools, and the article warns that one requirement may need several tools working together. It walks through worked examples: sales-process picklists suit Record Types, a handful of users needing a feature suits a Permission Set, and hiding fields from a Page Layout does not secure them, so field-level security is needed. It closes with five anti-patterns to avoid, including creating a Profile per department, using Record Types for security, duplicating Profiles in Permission Sets, ignoring Record Types in layout design, and letting Permission Sets sprawl, along with a set of questions to ask before configuring. The article also notes that Salesforce's retirement of Profile-based permissions was cancelled in June 2026, while it still recommends a permission-set-led approach.
