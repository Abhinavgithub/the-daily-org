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

Salesforce Multi-Framework has reached general availability for Angular, joining React as a supported frontend framework. Developers can scaffold employee-facing or customer-facing applications using dedicated templates that include necessary metadata and platform integrations. These projects function as standard Salesforce DX repositories and deploy as UIBundle metadata types.

The Microfrontend capability allows teams to embed these external applications across Lightning Experience, Experience Cloud, and mobile platforms without rebuilding them in Lightning Web Components. A secure sandboxed iframe handles the boundary, while a two-way communication channel enables property passing and event dispatching between host components and embedded apps.

Partners can now bundle non-site applications alongside their required schema and permissions into upgradeable Managed Packages. The runtime also integrates native Salesforce localization for dates and currencies, enforces existing multi-factor authentication policies, and offers a beta dashboard for tracking performance and usage metrics.
