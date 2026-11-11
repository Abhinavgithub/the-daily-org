---
title: Using Apex frameworks to enforce code quality and platform limits in the AI era
original_title: Framework-Driven Development
url: https://blog.beyondthecloud.dev/blog/framework-driven-development
source: Beyond the Cloud
source_type: community
date: 2026-10-04
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - apex-framework
  - platform-limits
  - trigger-patterns
  - defensive-design
  - ai-assisted-development
authors:
  - Piotr Gajek
why_read: Readers will learn how to structure Apex libraries with strict interfaces and runtime validations to prevent both human and AI errors. The piece also explains how these patterns automatically optimize SOQL and DML usage to stay within Salesforce governor limits.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 6
model: qwen/qwen3.7-flash
image: https://wordpress.beyondthecloud.dev/wp-content/uploads/2026/09/Copy-of-Apex-Character-Limit.png
---

The article, written by Piotr Gajek, a Senior Salesforce Developer and Technical Architect, introduces Framework-Driven Development (FDD), an approach developed over a couple of years in his Apex Fluently libraries. Its core idea is to move responsibility for code quality and Salesforce governor limits out of individual developers and AI agents and into shared frameworks and the development process. He argues that LLM output is statistically average and often disconnected from the wider architecture, and that shared limits on an org mean one team's careless generated code can break another's solution. He describes the phenomena of "meat proxies" and "slop grenades" as reasons why ownership of code becomes unclear.

The approach rests on three rules: frameworks should be idiot-proof and AI-proof, generated code should be optimized for platform limits, and quality should be built in by design. Idiot-proofing uses limited interfaces that expose only permitted methods, such as the SOQL Lib cache module that blocks toList() because of misleading cached results, and the Trigger Lib contexts that allow only relevant actions per trigger phase. Internal validation throws explanatory exceptions with suggested overrides, and documentation and AI-readable skills act as a final safeguard.

For limits, the author highlights Async Lib, which manages queueable, schedulable and batch jobs to avoid the "Too many queueable jobs" error; DML Lib, which builds a dependency graph and commits records in optimized order through a shared Unit of Work; SOQL Lib, which caches queries in static, org or session scope; and Trigger Lib, which batches parent queries from many handlers. Quality by design is reinforced by phase-specific rules and small, single-responsibility classes. He also suggests administrators could benefit when Apex-based logic replaces Record-Triggered Flows. The conclusion recommends combining libraries, context documents and layered testing, with TDD where useful.
