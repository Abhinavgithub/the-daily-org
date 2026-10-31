---
title: Prototyping Screen Flows and record pages before building in a sandbox
original_title: How to Prototype Salesforce Screen Flows and Lightning Record Pages Before Opening a Sandbox
url: https://salesforcetime.com/2026/10/30/how-to-prototype-salesforce-screen-flows-and-lightning-record-pages-before-opening-a-sandbox/
source: Salesforce Time
source_type: community
date: 2026-10-31
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - screen-flow
  - dynamic-forms
  - lightning-record-page
  - requirements-prototyping
  - gherkin-acceptance-criteria
authors:
  - Sandeep Ramineni
why_read: You will learn a four-step pre-build method for mapping and mocking up Lightning pages and Screen Flows with stakeholders, and when to choose Dynamic Forms over a Screen Flow. You will also see how to turn the approved prototype into a field dictionary and Gherkin acceptance criteria.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The four steps from discovery to a spec ready for sandbox configuration
  steps:
    - Map the process swimlane
    - Prototype the record page in SLDS
    - Test visibility and edge cases live
    - Export data dictionary and Gherkin
  icons:
    - flow
    - layers
    - search
    - doc
image: https://salesforcetime.com/wp-content/uploads/2026/10/Screen-Flow-prototyped-as-the-actual-screens-users-will-see-1024x534.png
---

The author opens with a familiar failure: a discovery workshop produces a requirement that is then built in a Developer Sandbox over two days, only to be reworked after a playback call. He argues that the gap is stakeholders not being able to picture how a written user story becomes a real Lightning page or Screen Flow until they see it, and that generic tools fall short. Written stories, Figma or Miro canvases, and prototyping in a sandbox each fail for Salesforce in different ways, so the prototype should stay within SLDS constraints.

The method starts with mapping the process swimlane using Universal Process Notation, identifying the trigger, decision gateways, and whether the user needs a guided wizard or persistent fields with conditional visibility. A rule of thumb is given: use Dynamic Forms with Path guidance for ongoing single-record updates with a few conditional fields, and a Guided Screen Flow for multi-step wizards, related child record creation or verification before advancing a stage. The prototype is then reviewed across four zones of the Lightning page: the Highlights Panel, Path stages with guidance text, two-column detail sections, and sidebar Related Lists.

The author then recommends testing conditional visibility and edge cases live, including negative paths, persona-based editability, and console density. Finally, the approved prototype is converted into a field-level data dictionary and Given/When/Then acceptance criteria before any sandbox configuration begins. The approach is presented as a 15-minute pre-sandbox routine, though the article is aimed mainly at admins and business analysts.
