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

The article introduces Salesforce Microfrontends, which use UI Embedding to bring web applications built with React, Angular, Vue, or other standards-based technologies into Lightning pages alongside Lightning Web Components. The architecture has three parts: a Lightning host (a custom LWC that renders the lightning-ui-embedding base component and owns the Salesforce context and data), the embedded guest web application, and UI Embedding as the managed communication layer between them. The guest runs in a sandboxed iframe, which gives the two applications a browser-enforced isolation boundary. The host decides what information to share, and the external origin must be allowed in Salesforce security settings.

The article illustrates this with a ScoreAccount web app that shows an Account's rating and lets users choose Hot, Warm, or Cold. The host retrieves the record data and passes the state to the guest, which renders it and subscribes to later updates. When the user selects a rating, the guest dispatches a score event that the host handles by updating the Salesforce record, and the host then sends any changed data back down. The article lists the four steps to bring such an app into Lightning: allow the origin, connect the guest to the UI Embedding channel through the Salesforce Platform SDK, create the host LWC, and deploy both sides through their own workflows. It presents the example in React but notes that the approach is not tied to one framework.

The piece argues that Microfrontends suit established web experiences that a team wants to keep on its own framework, infrastructure, and release cycle, such as an existing analytics app or internal search tool, rather than rebuilding them. It positions Microfrontends as complementary to LWC, which remains the native model for Salesforce-specific experiences, and to Salesforce Multi-Framework, where supported frameworks are packaged as UI bundles and hosted on Salesforce. A comparison table shows that externally hosted Microfrontends run on the team's own infrastructure, while UI bundles are built and deployed through Salesforce workflows. The article gives UI Embedding's status as GA since September 2026 and UI bundle embedding as in Beta with GA targeted for mid-November 2026, and it points readers to the UI Embedding recipes and Salesforce Developer documentation for implementation details.
