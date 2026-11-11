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

This final post in a series on Lightning Web Component anti-patterns covers runtime mistakes in DOM access, asynchronous timing, the component lifecycle, performance, and base component usage. The article's central point is that these bugs stem from wrong assumptions about when things happen, such as when the DOM exists, when a render has completed, and which runtime a component runs in.

On DOM access, the article warns against querying the global document, since Lightning Web Security scopes calls to the sandbox and tests may behave differently from production; it recommends scoping queries to the component's template or using LWC:ref. It also warns against setting innerHTML, which carries XSS risk and conflicts with reactive rendering, recommending declarative markup and lightning-formatted-rich-text for trusted rich text. ID selectors are unreliable because LWC rewrites id attributes at render time, so class selectors, data attributes, or LWC:ref should be used instead. For timing, setTimeout should not be used to wait for async data (use async/await) or for re-renders (use renderedCallback, which runs after every render). For lifecycle, @api values are not readable in the constructor, DOM access fails in the constructor and connectedCallback because nothing has rendered yet, and this.template.children should be avoided in favour of stable selectors.

Performance guidance says that repeatedly crossing the Lightning Web Security proxy boundary becomes costly with large data: clone host data into local arrays once, push aggregation into Apex, and prefer plain objects and arrays over Set and Map for large collections. The base component section covers several silent failures: platformShowToastEvent does nothing outside Lightning Experience and mobile, so lightning/toast should be used; only lightning/modal and lightning/datatable support extension, so other components should be wrapped; the record ID should be read from the success event rather than from submit; internal SLDS shadow styles should not be overridden, and the public --slds- hooks used instead; and mobile support must be checked, since lightning-datatable fails silently in the Salesforce Mobile App and desktop responsive mode does not reliably reproduce this.

The conclusion ties the patterns together: LWC guarantees are narrower than they seem, and assuming readiness before it exists causes most of these problems. The article closes with a list of resources, including lifecycle documentation, LWC:ref, lightning/toast, @Salesforce/client/formFactor, and the LWC ESLint plugin rules.
