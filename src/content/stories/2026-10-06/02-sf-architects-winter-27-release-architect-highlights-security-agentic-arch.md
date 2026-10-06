---
title: Winter ’27 release guides architects through security enforcement and agent scaling
original_title: "Winter ’27 Release Architect Highlights: Security, Agentic Architecture, and Governance"
url: https://www.salesforce.com/blog/winter-27-release-architect-highlights/
source: Salesforce Architects
source_type: official
date: 2026-10-06
section: architecture
personas:
  - architect
tags:
  - winter-release
  - security-enforcement
  - external-client-apps
  - agentforce
  - elastic-async-apex
  - security-center
authors:
  - Marlene Guerra-Reeve
why_read: You will learn which authentication methods retire by early 2027 and how to migrate integrations to secure alternatives. The piece also outlines updated platform limits, new Agentforce orchestration patterns, and governance tools that shape long-term org architecture.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: parts
  caption: The Winter ’27 release guides architects through four key architectural focus areas
  whole: Winter ’27 Release
  parts:
    - Mandatory security enforcements
    - Capacity and automation updates
    - Agentic architecture design
    - Governance and observability
figure_image: /figures/2026-10-06/02-sf-architects-winter-27-release-architect-highlights-security-agentic-arch.webp
---

The article outlines mandatory security changes in the Winter ’27 release, including the retirement of legacy authentication flows and the expiration of refresh tokens after thirty days of inactivity. Architects must inventory current integration patterns and plan migrations to supported protocols before the November fourth twenty twenty six and February twentieth twenty twenty seven deadlines. Connected Apps will lose support by Summer twenty twenty seven, requiring a shift to External Client Apps with stricter default access controls.

Platform constraints are shifting, giving teams more headroom for processing workloads. Synchronous Apex heap limits rise to ten megabytes and asynchronous limits to twenty five megabytes, while Elastic Async Apex Jobs now supports batch operations up to two million jobs. These changes allow architects to simplify custom chunking logic and revisit automation previously built around Flow CPU or record locking restrictions. New sharing settings also preserve Manual Shares during ownership transfers, reducing the need for custom share recreation processes.

Agentic architecture requires deliberate design choices before production deployment. Multi-Agent Orchestration enables specialist agents to hand off tasks across channels without custom glue code, while the API Catalog governs Model Context Protocol server access. Grounding agents on Data 360 hierarchies and standardizing machine-written code through Lightning Design System skills improves consistency. Continuous security monitoring via Security Health Review, Scale Center, and Security Mesh provides centralized visibility into agent connections and platform risk, though availability depends on licensing and support tiers.
