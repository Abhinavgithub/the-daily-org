---
title: Design the permission model before the screens in occupational health cases
original_title: "The Permission Model Is the Product: Occupational Health Case Management on Salesforce"
url: https://dev.to/innerluxes/the-permission-model-is-the-product-occupational-health-case-management-on-salesforce-5ddg
source: dev.to
source_type: community
date: 2026-11-16
section: architecture
personas:
  - architect
  - admin
tags:
  - permission-model
  - field-level-security
  - record-types
  - external-community
  - data-modelling
  - sharing-rules
authors:
  - INNERLUXES
why_read: You will see how to split an occupational health case across objects so an employer sees fitness outcomes but never clinical detail. You will also see why governed picklists, data-driven thresholds and an external community help with privacy and audit.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: parts
  caption: A single case is split into separate objects so each role sees only its own slice
  whole: Occupational health case
  parts:
    - Case
    - Encounter
    - Exposure event
    - Restriction
    - Surveillance result
    - Employer account
---

The article frames occupational health case management as a permission problem. Five roles touch each case, and the employer may learn whether a worker can lift or drive but not why. Spreadsheets and shared drives fail because they cannot enforce who sees what or show afterwards who looked.

The author argues against a single large record. The case should be split into objects for the encounter, exposure event, restriction, surveillance result, employer account and worker record, with a junction object where the employer of record differs from the work site. Restrictions carry start and end dates and a review owner, so expiry becomes a tracked state. Record types and field-level security then separate employer-visible outcomes from clinical detail.

Free text classification is treated as a privacy risk as well as a reporting problem, because a diagnosis typed into a notes field escapes every Sharing Rule. Governed picklists close that gap. Regulated rules such as blood lead level monitoring thresholds and testing frequency should live as records rather than code, so regulatory changes become configuration edits and reports draw on the same data as the rules. Correspondence is logged as case activity, and documents carry version history, classification and retention rules.

For employers and referring clinicians, the article recommends an external community rather than a hidden-field copy of the internal app, which also avoids consuming internal user licences. Migration is where legacy duplicates and inconsistent classifications surface, so it should be rehearsed in a full sandbox and validated against historical caseloads. The closing advice is to settle the permission model first, since it is the expensive part to retrofit.
