---
title: Avoiding runtime anti-patterns in Lightning Web Components
original_title: Runtime Behavior Anti-Patterns in Lightning Web Components
url: https://developer.salesforce.com/blogs/2026/11/runtime-behavior-anti-patterns-in-lightning-web-components
source: Salesforce Developers Blog
source_type: official
date: 2026-11-05
section: lwc-and-ui
personas:
  - developer
tags:
  - lightning-web-components
  - dom-access
  - lifecycle-hooks
  - lwc-anti-patterns
  - lightning-web-security
authors:
  - Tim Dionne
why_read: You will learn why global DOM queries, ID selectors, setTimeout-based timing and early lifecycle access break LWC components, and the reliable alternatives for each. The piece closes a series, so the reader gets a complete set of runtime fixes.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Replacing timing workarounds with lifecycle-aware code makes updates reliable
  left:
    heading: Fragile timing workaround
    points:
      - setTimeout to wait for data
      - setTimeout(..., 0) after a property change
      - Guessed wall-clock delay
  right:
    heading: Reliable alternative
    points:
      - async and await for loaded data
      - renderedCallback after each render
      - Signal from the engine
  icons:
    - warning
    - check
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261029132431/Generic-C-9-e1793305490174.png?w=1000
figure_image: /figures/2026-11-05/05-sf-developers-runtime-behavior-anti-patterns-in-lightning-web-components.png
---

The article argues that many LWC bugs come from misunderstanding when things happen: when the DOM exists, when a render has completed, and which runtime a component runs in. Components should only query their own shadow tree, so document-level queries and ID selectors are unreliable. The author recommends scoping queries to this.template, using LWC:ref, and avoiding innerHTML, which carries XSS risk and bypasses reactive rendering. The lightning-formatted-rich-text base component is suggested for trusted rich content.

Timing problems are handled by replacing setTimeout with async and await for data loads and with renderedCallback for work that depends on a completed re-render. Lifecycle guidance covers reading @api properties in the constructor, touching the DOM in the constructor or connectedCallback, and using this.template.children by position. The author recommends @wire, renderedCallback with a guard flag, and LWC:ref in these cases.

The last sections cover performance and base component usage. Data from Apex and Lightning Data Service crosses the Lightning Web Security proxy boundary on every access, so cloning it once and pushing aggregation server-side helps large datasets. Plain objects and arrays can outperform Set and Map for large collections in a sandbox. The article then starts on base component usage across Lightning Experience, LWR sites, Experience Cloud and the mobile app, but the excerpt ends before those patterns are covered.
