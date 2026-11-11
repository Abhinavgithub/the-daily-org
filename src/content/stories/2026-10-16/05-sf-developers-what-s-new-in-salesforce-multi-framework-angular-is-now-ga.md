---
title: Salesforce Multi-Framework now supports Angular, microfrontends, and Managed Packages
original_title: "What’s New in Salesforce Multi-Framework: Angular Is Now GA"
url: https://developer.salesforce.com/blogs/2026/10/whats-new-in-salesforce-multi-framework-angular-is-now-ga
source: Salesforce Developers Blog
source_type: official
date: 2026-10-16
section: lwc-and-ui
personas:
  - developer
  - architect
tags:
  - salesforce-multi-framework
  - angular
  - microfrontend
  - managed-packages
  - internationalization
  - agentforce-vibes
authors:
  - Alice Oh
why_read: Readers will learn how to build, embed, and distribute Angular applications directly on the Salesforce Platform using the new Multi-Framework runtime. The article also covers secure cross-app communication, localization, and enterprise authentication requirements.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261014145046/DoubleHeadshot-8-1-e1792014657877.png?w=1000
figure:
  kind: parts
  caption: The Winter '27 release introduces key enhancements to the Multi-Framework runtime
  whole: Multi-Framework runtime capabilities
  parts:
    - Angular framework support
    - Microfrontend embedding
    - Managed packages
    - Localization and internationalization
    - Multi-factor authentication
    - Multi-Framework Insights
figure_image: /figures/2026-10-16/05-sf-developers-what-s-new-in-salesforce-multi-framework-angular-is-now-ga.webp
---

Salesforce Multi-Framework is a framework-agnostic runtime that lets developers run modern web apps directly on the Salesforce Platform, inheriting Salesforce authentication, security and governance without a separate hosting stack or manual token handling. After React reached general availability, the Winter '27 release adds Angular as a second GA framework, with internal, external and basic templates, deployment as a UIBundle metadata type, and the same Data SDK and security model that React apps use. Internal apps run on the Salesforce.app domain, which isolates them from the Lightning runtime and from each other, while platform rules for object-level security, field-level security, sharing and validation continue to apply to data requests and saves.

Microfrontend is now generally available, allowing externally hosted React or Angular apps to be embedded in Lightning Experience, Experience Cloud, the Salesforce mobile app and Mobile Publisher apps without rebuilding them in Lightning Web Components. The lightning-ui-embedding component hosts the app in a sandboxed iframe and provides a two-way channel: hosts pass properties down and embedded apps send custom events back. Managed packages can now distribute non-site, employee-facing Multi-Framework apps together with their supporting metadata such as Permission Sets, Apex and Custom Objects, though site-based apps are not supported. The release also adds locale-aware formatting and localized labels through the Platform SDK and Data SDK, enterprise multi-factor authentication managed by Salesforce, and Multi-Framework Insights in Beta for performance and usage reporting.

The article also describes three ways to build these apps: Agentforce Vibes, now with Angular support and generally available, for code-first development; Builder Central in Beta for natural-language app creation by admins; and Quick Pages in Beta, where business users describe a page in plain language and get a data-driven page that respects the viewer's security. Salesforce says Vue is the next UI framework planned, along with agentic experiences and Government Cloud support.
