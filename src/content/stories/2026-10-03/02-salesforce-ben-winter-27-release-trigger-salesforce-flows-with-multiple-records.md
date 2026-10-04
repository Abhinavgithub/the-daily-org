---
title: "Winter '27 lets admins trigger Screen Flows from List Views and Related Lists"
url: https://www.salesforceben.com/winter-27-release-trigger-salesforce-flows-with-multiple-records/
source: Salesforce Ben
source_type: community
date: "2026-10-03"
section: flow-and-admin
personas:
  - admin
tags:
  - winter-27
  - screen-flow
  - list-views
  - mass-actions
  - quick-actions
authors:
  - Tom M
why_read: A step-by-step setup for the Winter '27 feature that passes the records a user selects in a List View or Related List into a Screen Flow.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 9
model: hand-written sample
image: "https://www.salesforceben.com/wp-content/uploads/2026/10/Winter-%E2%80%9827-Release_-Trigger-Salesforce-Flows-With-Multiple-Records.webp"
original_title: "Winter ‘27 Release: Trigger Salesforce Flows With Multiple Records"
figure:
  kind: steps
  caption: Setup for running a Screen Flow on selected records
  steps:
    - Build Screen Flow with ids variable
    - Create Flow action on the object
    - Add to List View Button Layout
    - Add to Dynamic Related List – Single
---

Starting in Winter '27, users can select several records in a List View or a Related List and hand them to a Screen Flow that opens in a modal. The article treats it as an overlooked part of a large release because it lets admins build mass actions without code.

The setup has one detail that is easy to miss. The flow needs a text collection variable named ids, in lowercase, marked as available for input. The selected record Ids arrive in that variable. The example flow gets the matching Contacts, shows them in an editable Data Table on a screen, and writes the edits back with an Update Records element, with fault paths on the data elements.

To expose it, create an action of type Flow on the object and add it to the List View Button Layout under the Lightning Experience List View actions. For Related Lists, create the same kind of action, then add it to a Dynamic Related List – Single component on the parent's Lightning Record Page.
