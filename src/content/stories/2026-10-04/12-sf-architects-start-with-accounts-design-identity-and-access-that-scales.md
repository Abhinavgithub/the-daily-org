---
title: Use the account record to anchor identity, access, and onboarding in Experience Cloud
original_title: "Start with Accounts: Design Identity and Access That Scales"
url: https://www.salesforce.com/blog/experience-cloud-identity-access-account/
source: Salesforce Architects
source_type: official
date: 2026-10-04
section: architecture
personas:
  - architect
  - admin
tags:
  - experience-cloud
  - login-discovery
  - account-model
  - sharing-model
  - sso-routing
authors:
  - Iuliia Kolisnyk
why_read: You will learn how to structure Experience Cloud implementations around the account record to automate authentication routing, enforce consistent data access, and simplify multi-organization onboarding without additional deployments.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
---

Introduces the challenge of scaling Experience Cloud portals for multiple independent organizations, each managing its own identity infrastructure and security standards. Relying on separate login paths and manual configurations quickly creates bottlenecks during onboarding.

Proposes using the account record as the central anchor for external user management. The user to contact to account relationship provides a stable context for storing identity provider preferences, authentication configurations, and onboarding status. This design keeps organization scoped policies centralized and easily retrievable.

Details the implementation steps, including configuring Login Discovery to route users based on account level settings instead of presenting multiple login buttons. Data access follows this same model by aligning lookup relationships with appropriate sharing mechanisms like Sharing Sets or standard Sharing Rules. These choices directly impact community license selection and must align with least privilege principles.

Concludes that treating onboarding as a configuration exercise rather than a deployment project allows administrators to bring new organizations online predictably. The approach reduces architectural complexity while maintaining secure, scalable access controls across the portal.
