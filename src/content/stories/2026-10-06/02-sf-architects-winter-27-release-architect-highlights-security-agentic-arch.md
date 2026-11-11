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

The Winter '27 guide presents the release as a set of coordinated architecture decisions across security, capacity, agentic design and governance. It recommends starting with operational risk, then judging whether new platform capabilities help existing configurations scale and fit the longer-term architecture roadmap.

The security section focuses on deadlines. Production refresh tokens expire after 30 days of inactivity starting November 4, 2026, which can break low-frequency integrations. The OAuth 2.0 device flow is restricted from November 30, 2026, and the username-password, user-agent and hybrid user-agent flows are retired on February 20, 2027. Salesforce to Salesforce retires in Spring '27, and cross-org adapter authentication must move to Named Credentials. Connected Apps lose support by Summer '27, so teams should move to External Client Apps, which are closed by default. The guide advises inventorying integrations, defining each trust boundary, and choosing replacements that will not face further restriction.

The capacity section covers higher limits and their risks. Synchronous Apex heap rises from 6 MB to 10 MB and asynchronous heap from 12 MB to 25 MB, so workarounds may be simplified. Elastic Async Apex Jobs (Beta) now covers batch jobs as well as future and Queueable jobs, with extra capacity capped at the lower of the licensed limit or 2 million jobs, and should be tested in non-production first. Flow improvements may make Apex built around older constraints unnecessary. Retained manual shares on ownership changes can replace recreation logic, but processes that depend on ownership changes removing access need review.

For Agentforce, Multi-Agent Orchestration is generally available and should be treated as a design-time topology decision. The API Catalog should be governed as the control point for the MCP servers and APIs agents can call, and Data 360 hierarchies should be planned as a data-architecture task. Governance tools include Security Health Review, Scale Center, MCP Server Monitoring (Beta) and Security Mesh. Each has edition, license or support-plan limits, and the guide names fallbacks such as Health Check, debug logs and existing observability tools. The guide closes by recommending an architectural decision record for each significant change.
