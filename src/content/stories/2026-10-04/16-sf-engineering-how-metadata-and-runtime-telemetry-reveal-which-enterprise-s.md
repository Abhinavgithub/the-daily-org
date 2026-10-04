---
title: Connecting metadata and runtime telemetry to prioritize enterprise org remediation
original_title: How Metadata and Runtime Telemetry Reveal Which Enterprise System Problems to Fix First
url: https://engineering.salesforce.com/how-metadata-and-runtime-telemetry-reveal-which-enterprise-system-problems-to-fix-first/
source: Salesforce Engineering
source_type: official
date: 2026-10-04
section: architecture
personas:
  - architect
  - developer
tags:
  - telemetry
  - metadata
  - implementation-patterns
  - headless-api
  - salesforce-health-insights
authors:
  - Karishma Lalwani
  - Anand Vardhan
why_read: Readers will learn how Salesforce Engineering correlates configuration metadata with production telemetry to identify and prioritize implementation anti-patterns. The piece outlines the architectural patterns used to standardize hundreds of health signals and expose them through headless APIs.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 7
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/09/image_d7a87c.png?w=1024
---

Salesforce Engineering addressed the challenge of monitoring enterprise org health at scale by moving beyond static reports to an in-app experience called Salesforce Health Insights. The team needed to correlate point-in-time configuration metadata with continuously changing runtime telemetry across systems that lack shared identity models.

To solve this, they built a harmonization layer that reconciles fragmented datasets and maps runtime activity to individual metadata components while accounting for traffic volume and seasonality. This architecture maintains clear boundaries between deterministic findings and external operational context, preserving data origin and freshness information.

The initiative expanded from roughly one hundred initial security signals to over four hundred covering process automation, customization, and agentic readiness. Each signal follows standardized metadata rules and remediation guidance derived from the Salesforce Well-Architected Framework and known system hotspots.

Findings are prioritized using operational context such as application CPU usage and peak business hour traffic to determine criticality and required effort. The system uses a headless schema that emits raw JSON for any user interface or agent, supports an MCP interface, and can deliver summaries directly to Slack channels.
