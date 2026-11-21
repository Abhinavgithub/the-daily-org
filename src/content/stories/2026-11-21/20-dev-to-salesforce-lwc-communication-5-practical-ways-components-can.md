---
title: Five ways Lightning Web Components can share data between components
original_title: "Salesforce LWC Communication: 5 Practical Ways Components Can Share Data"
url: https://dev.to/renuka_singh_65783f63cbba/salesforce-lwc-communication-5-practical-ways-components-can-share-data-11oa
source: dev.to
source_type: community
date: 2026-11-21
section: lwc-and-ui
personas:
  - developer
tags:
  - lightning-web-components
  - parent-child-communication
  - lightning-message-service
  - lightning-data-service
  - custom-events
authors:
  - Renuka Singh
why_read: You will see how a parent passes data to a child, how a child reports back, and when to use Lightning Message Service or Lightning Data Service instead. The piece also lists common mistakes to avoid.
interest_score: 6
depth_score: 6
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Parent-to-child uses public properties; child-to-parent uses custom events
  left:
    heading: Parent to child
    points:
      - "@api public property"
      - Parent sets HTML attribute
      - Child reads the value
  right:
    heading: Child to parent
    points:
      - Child dispatches CustomEvent
      - Detail carries the payload
      - Parent handles the event
  icons:
    - flow
    - bolt
held_from: 2026-11-18
---

The article surveys five ways Lightning Web Components can communicate. The simplest is parent-to-child communication through a public property marked with the @api decorator, where the parent sets an HTML attribute and the child receives it. Code examples show a child component declaring a message property and a parent passing a welcome string into it.

When a child needs to notify its parent, it dispatches a custom event carrying a detail payload. The example has a child button fire a valuechange event, and the parent handles it and stores the selected value. The author notes that this lets the child report upward without reaching into the parent's internal properties.

For components with no parent-child relationship, such as a customer information panel and a related sales panel, the article describes Lightning Message Service. The steps are to create a message channel, import it into a publisher, publish a message, subscribe in the receiving component and process the payload. Lightning Data Service is presented for cases where the data is a Salesforce record, using getRecord through a wire adapter, with the benefit of caching and record sharing across components. Shared JavaScript modules are mentioned for reusable logic.

The article closes with a table matching each method to its best use and a list of mistakes to avoid, such as using custom events where a public property is enough, creating unnecessary message channels, and calling Apex when Lightning Data Service already covers the need.
