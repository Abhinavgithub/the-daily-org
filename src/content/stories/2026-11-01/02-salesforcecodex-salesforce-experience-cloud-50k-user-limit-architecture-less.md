---
title: Scaling Experience Cloud Person Accounts past the 50,000 ownership limit
original_title: "Salesforce Experience Cloud 50K User Limit: Architecture Lessons from a 200K E-Commerce Portal"
url: https://salesforcecodex.com/salesforce/salesforce-experience-cloud-50k-user-limit/
source: SalesforceCodex
source_type: community
date: 2026-11-01
section: architecture
personas:
  - architect
  - admin
  - developer
tags:
  - experience-cloud
  - person-accounts
  - customer-community-plus
  - account-ownership
  - external-roles
authors:
  - Dhanik Lal Sahni
why_read: You will learn how the 50,000 account-ownership limit and the external role allocation differ for role-based Experience Cloud licenses, and what options exist for a 200,000-customer Person Account portal. The reader will also see why license choice should be settled before deployment.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://res.cloudinary.com/duws9yaa5/image/upload/v1793451625/salesforce-experience-cloud-scaling-50k-to-200k-users-SalesforceCodex_zqmupn.webp
figure:
  kind: compare
  caption: Two ways to handle the 50,000 account-ownership limit for Person Accounts
  left:
    heading: Single internal owner
    points:
      - All 200,000 accounts under one user
      - Hits the 50,000 ownership limit
      - Support increase request not approved
  right:
    heading: Person Account Owner Power User
    points:
      - One eligible power user owns more accounts
      - Power user must sit at top of role hierarchy
      - Set up with deferred sharing disabled
  icons:
    - warning
    - check
figure_image: /figures/2026-11-01/02-salesforcecodex-salesforce-experience-cloud-50k-user-limit-architecture-less.png
---

The author describes a production problem on an e-commerce Experience Cloud portal meant to onboard about 200,000 customers. The portal used Person Accounts and the Customer Community Plus Login license, which requires an external user role. When user creation hit a 50,000 account-ownership constraint, Salesforce Support declined the requested increase, leaving the site live in production but unable to proceed with the planned onboarding. The piece stresses that this 50,000 ownership limit, the org-wide external role allocation (documented default of 50,000 for role-based external licenses) and total external user capacity are separate constraints, and that creating 200,000 users does not necessarily consume 200,000 roles.

The article sets out four options. The first is the PersonAccountOwnerPowerUser setup object, which lets an eligible internal user at the top of the role hierarchy own more than 50,000 qualifying portal accounts; it carries restrictions on the role and on deferred sharing, and does not change role allocation or other license limits. The second is spreading ownership across several internal users, which reduces per-owner load but adds sharing, reporting and maintenance complexity. The third is checking whether Customer Community, a high-volume non-role-based license, would meet the business needs, after assessing sharing, reporting, Apex and cost differences. The fourth is requesting a limit increase from Salesforce Support, which is not guaranteed and should not be the only plan.

The author then lists common mistakes, such as treating 50K as the total user limit, ignoring Person Account ownership in early design, choosing a license only because it supports roles, relying on support exceptions, and neglecting data isolation when owners or roles change. A pre-production checklist covers volume forecasting, license confirmation, limit validation, ownership and sharing strategy, customer data isolation, restartable bulk provisioning, early validation with Salesforce, and a fallback plan. The core lesson is that licensing, ownership, role allocation, sharing and provisioning must be settled in the initial design rather than discovered during production rollout.
