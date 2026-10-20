---
title: Security researchers identify unauthenticated prompt injection paths in Agentforce
original_title: Researchers identify security flaw in Salesforce Agentforce that affects internal programs
url: https://dev.to/hacksgr/researchers-identify-security-flaw-in-salesforce-agentforce-that-affects-internal-programs-54j2
source: dev.to
source_type: community
date: 2026-10-20
section: agentforce-and-ai
personas:
  - architect
  - developer
tags:
  - agentforce
  - security-vulnerability
  - flow-governance
  - platform-security
authors:
  - Hacks.gr
why_read: Readers will understand how external inputs can bypass controls to reach Agentforce internal instructions, and why current governance models struggle to monitor these paths.
interest_score: 6
depth_score: 3
novelty_score: 6
utility_score: 3
model: qwen/qwen3.7-flash
---

Researchers have identified a security vulnerability in Salesforce Agentforce where automated flows create unauthenticated pathways from external customer messages directly into internal program instructions. This occurs when services convert emails or web submissions into support records and pass them through chained integrations.

The primary challenge highlighted is a lack of visibility into these execution environments. External monitoring tools cannot easily inspect what happens inside the program boundaries, making it difficult to track risk profiles or detect unauthorized access attempts.

The article notes that similar exploitation tactics are part of the City-Forum data theft operation targeting enterprise platforms since March 2025. It also emphasizes that relying on written security policies without operational proof exposes organizations to significant regulatory fines under European Union artificial intelligence regulations.
