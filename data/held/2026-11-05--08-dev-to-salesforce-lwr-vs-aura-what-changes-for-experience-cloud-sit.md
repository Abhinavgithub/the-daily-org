---
title: How LWR differs from Aura for Experience Cloud sites and what migration involves
original_title: "Salesforce LWR vs Aura: what changes for Experience Cloud sites?"
url: https://dev.to/salesforcedorian/salesforce-lwr-vs-aura-what-changes-for-experience-cloud-sites-p86
source: dev.to
source_type: community
date: 2026-11-05
section: lwc-and-ui
personas:
  - developer
  - architect
  - admin
tags:
  - lightning-web-runtime
  - experience-cloud
  - aura
  - lightning-web-components
  - b2b-commerce
  - migration
authors:
  - Dorian Sabitov
why_read: You will learn how Lightning Web Runtime delivers pages differently from Aura, where the performance gains come from and where they do not, and what an Aura-to-LWR migration usually involves. The piece helps you decide whether a new or existing site should move to LWR.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: LWR publishes cacheable resources, while Aura delivers components dynamically
  left:
    heading: Aura
    points:
      - Components delivered dynamically
      - No republish for component changes
      - Broader existing template set
  right:
    heading: LWR
    points:
      - Static, cacheable resources
      - CDN can serve eligible files
      - Republish to expose component changes
---

Lightning Web Runtime (LWR) is the newer runtime behind Experience Cloud templates such as Build Your Own (LWR) and Microsite (LWR). Components are built with Lightning Web Components, and the site publishes prepared, cacheable resources that can be served through a content delivery network. Aura delivers components dynamically, so LWR can load faster, but the article stresses that speed is not guaranteed. Large images, unnecessary API calls and poorly designed custom components still slow pages, and integration changes may matter more than the storefront technology.

The main practical differences are in publishing and component support. Aura sites can pick up component code changes without republishing, while LWR sites must be republished for updated components to reach visitors. Standard LWR templates use LWC only, and LWR offers fewer templates and components than Aura, so some Aura features have no direct equivalent. Salesforce recommends LWR for new B2B Commerce storefronts and encourages migration from Aura-based B2B stores.

Migrating an Aura site usually means replacing Aura components with LWC, while many existing LWCs can be reused with few changes. The article advises inventorying components and dependencies, transferring storefront configuration, and testing the full user journey. It also recommends recording baseline performance with tools such as Lighthouse, WebPageTest and Core Web Vitals before and after migration.
