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

The author describes an e-commerce customer portal built on Experience Cloud with about 200,000 customers, using Person Accounts and the Customer Community Plus Login license. During onboarding, user creation stopped at a 50,000 account-ownership constraint, and a Salesforce Support request for an increase was not approved, which forced a rethink after the site had already gone live.

The piece separates three limits that are easy to conflate: the total number of external users a license supports, the org-wide allocation of external roles, and the number of qualifying accounts owned by one internal user. It presents Person Account Owner Power User as the main remedy for high-volume ownership, with a short illustrative Apex snippet, and notes its restrictions, including that the designated user must sit at the top of the role hierarchy and that the record must be created with deferred sharing disabled. Spreading ownership across several internal users and moving to the non-role-based Customer Community license are the other options discussed, each with trade-offs in sharing, reporting and cost.

The main lesson is that ownership strategy and license selection belong in the initial architecture, not in a production fix. The author advises checking the current release and org requirements before relying on any of these features.
