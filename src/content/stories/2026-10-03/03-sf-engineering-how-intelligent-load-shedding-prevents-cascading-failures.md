---
title: Cloud Atlas replaces per-instance rate limits with fleet-wide protection
url: https://engineering.salesforce.com/how-intelligent-load-shedding-prevents-cascading-failures-in-tier-0-systems/
source: Salesforce Engineering
source_type: official
date: "2026-10-03"
section: architecture
personas:
  - architect
  - developer
tags:
  - rate-limiting
  - load-shedding
  - identity
  - multi-tenancy
  - reliability
authors:
  - Ramya Subramani
  - Prateek Vats
why_read: An inside account of why per-instance rate limits failed for the identity store behind Salesforce authentication, and what replaced them.
interest_score: 7
depth_score: 7
novelty_score: 7
utility_score: 5
model: hand-written sample
image: "https://engineering.salesforce.com/wp-content/uploads/2026/09/How-Intelligent-Load-Shedding-Prevents-Cascading-Failures-in-Tier-0-Systems.png"
original_title: How Intelligent Load Shedding Prevents Cascading Failures in Tier-0 Systems
---

Cloud Atlas is the globally distributed identity data store behind a large share of Salesforce logins and token validations, run to five nines of availability. In this interview, the team's engineering lead explains why overload at that layer is dangerous: slow responses cause upstream services to retry, the retries add traffic to a system already under pressure, and a local bottleneck spreads. Agent-driven and automated workloads have made traffic burstier and harder to predict than human logins.

The old protection was per-instance rate limiting. That held up while infrastructure was static, but with autoscaling each server's limits went stale whenever instances were added or removed, and each server knew only its own load rather than a customer's total usage across the fleet. Busy servers rejected requests while capacity sat idle elsewhere, and one tenant's spike could still starve others.

The redesign protects the service as a whole instead of individual servers. It combines global quota management that needs no central coordinator with load shedding that acts before retries begin to amplify the overload, so a single customer's surge is isolated rather than shared.
