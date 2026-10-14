---
title: Using Microfrontends and UI Embedding to integrate external web apps into Lightning
original_title: "Salesforce Microfrontends: Embed Web Apps in Lightning"
url: https://developer.salesforce.com/blogs/2026/10/salesforce-microfrontends-embed-web-apps-in-lightning
source: Salesforce Developers Blog
source_type: official
date: 2026-10-14
section: lwc-and-ui
personas:
  - developer
  - architect
tags:
  - lightning-web-component
  - ui-embedding
  - microfrontend
  - salesforce-platform-sdk
  - frontend-architecture
authors:
  - SANGEETA PATNAIK
why_read: You will learn the architecture behind Salesforce Microfrontends, including how the Lightning host and embedded guest application communicate through UI Embedding. The article provides concrete code examples for building both the LWC host and a React-based guest app.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261008132351/Generic-D-10-e1791491042101.png?w=1000
figure:
  kind: parts
  caption: How Salesforce Microfrontends connect external apps to Lightning Experience
  whole: Microfrontend architecture
  parts:
    - Lightning host
    - UI Embedding
    - Embedded web application
figure_image: /figures/2026-10-14/03-sf-developers-salesforce-microfrontends-embed-web-apps-in-lightning.webp
---

Salesforce Microfrontends enable externally hosted web applications built with frameworks such as React, Angular, or Vue to run inside Lightning Experiences. The architecture consists of a Lightning host that manages platform context, a guest application executing in a sandboxed iframe, and the UI Embedding layer that facilitates secure communication between them. This model allows organizations to reuse existing web investments without rebuilding interfaces from scratch.

Data flows from Salesforce to the guest as UI state and properties, while user interactions trigger custom events that return to the host. Browser-enforced iframe isolation maintains security boundaries, and external application origins must be explicitly whitelisted in Salesforce security settings. The host controls exactly which information is shared, preventing tight coupling between the runtime environments.

Implementation requires connecting the guest application to the Salesforce Platform SDK to read initial state, subscribe to updates, and dispatch events. On the Salesforce side, developers create a Lightning Web Component that renders the lightning-ui-embedding base component, passing record data and defining event handlers. This setup enables seamless updates to platform records while keeping the external application independent.

The post clarifies how Microfrontends differ from Salesforce Multi-Framework UI bundles. Microfrontends preserve external hosting and independent release cycles, whereas UI bundles deploy directly onto Salesforce infrastructure using metadata types. Both approaches complement Lightning Web Components rather than replacing them, expanding the frontend ecosystem for modern development workflows.
