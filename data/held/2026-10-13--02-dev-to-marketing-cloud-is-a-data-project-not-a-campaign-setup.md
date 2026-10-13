---
title: Architecting Salesforce Marketing Cloud requires a data foundation before campaign configuration
original_title: Marketing Cloud Is a Data Project, Not a Campaign Setup
url: https://dev.to/rio_albert/marketing-cloud-is-a-data-project-not-a-campaign-setup-127e
source: dev.to
source_type: community
date: 2026-10-13
section: architecture
personas:
  - architect
  - admin
  - developer
tags:
  - marketing-cloud
  - data-360
  - identity-resolution
  - consent-management
  - journey-builder
  - data-architecture
authors:
  - Albert Rio
why_read: Readers will learn how to structure data, identity, and consent architectures before configuring journeys in Marketing Cloud. The piece outlines practical questions to answer during implementation planning to prevent scaling failures.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 6
model: qwen/qwen3.7-flash
---

The article argues that Salesforce Marketing Cloud implementations often fail when treated as simple campaign setups rather than comprehensive data projects. It emphasizes that reliable personalization depends on a foundational layer that handles data trust, identity mapping, consent tracking, and system integration before any journeys are built.

It outlines key architectural decisions that must be made prior to configuration, such as identifying authoritative data sources, selecting shared attributes for decisioning, and determining refresh frequencies. The author warns against indiscriminately loading every available field into Data Extensions, recommending instead a focused dataset that supports cross-journey personalization.

Identity resolution and consent management are highlighted as critical components that require business-led decisions rather than pure platform configuration. While tools like Data 360 can consolidate records, organizations must define trusted identifiers, handle duplicates, and map household relationships. Consent must be modeled across channels, geographies, and purposes to ensure accurate suppression and compliance.

Finally, the piece advises designing integrations around business journeys rather than creating point-to-point connections between systems. It recommends evaluating implementation partners based on their ability to establish governance rules, reusable journey patterns, and clear data ownership, ensuring the platform remains sustainable as campaign volume grows.
