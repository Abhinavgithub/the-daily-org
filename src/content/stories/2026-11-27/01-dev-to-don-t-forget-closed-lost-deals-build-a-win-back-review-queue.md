---
title: Build a win-back review queue for Closed Lost Opportunities with a scheduled Flow
original_title: "Don't Forget Closed Lost Deals: Build a Win-Back Review Queue in Salesforce with a Scheduled Flow"
url: https://dev.to/juanma_garrido_1974/dont-forget-closed-lost-deals-build-a-win-back-review-queue-in-salesforce-with-a-scheduled-flow-2p5a
source: dev.to
source_type: community
date: 2026-11-27
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - scheduled-flow
  - opportunity
  - closed-lost
  - validation-rule
  - win-back
authors:
  - Juan Manuel Garrido
why_read: You will learn how to add a loss reason and revisit date to lost Opportunities, have a Scheduled Flow create follow-up Tasks on those dates, and keep lost deals linked to any later win. The approach needs no Apex.
interest_score: 7
depth_score: 7
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a Closed Lost Opportunity moves from lost deal to a daily revisit Task
  steps:
    - Require a loss reason on Closed Lost
    - Set Revisit_On__c with a Record-Triggered Flow
    - Scheduled Flow runs daily on revisit date
    - Create a Task assigned to the owner
    - Route inactive owners to a queue or manager
  icons:
    - warning
    - flow
    - clock
    - check
    - people
---

The author argues that Opportunities marked Closed Lost fall out of pipeline reports and are rarely revisited, so lost deals return only by chance. He proposes a declarative setup that turns them into a review queue.

The setup adds two Custom Fields on Opportunity, Loss_Reason__c as a picklist and Revisit_On__c as a date. A Validation Rule requires a loss reason when the stage is Closed Lost. A Record-Triggered Flow sets the revisit date, with a default of 12 months after the close date that can vary by reason.

A Schedule-Triggered Flow runs daily on Opportunities that are Closed Lost and whose revisit date is today. It creates a Task for each record, assigned to the owner, with a subject, the activity date and a description containing the reason and amount. Inactive owners will cause failures, so the author suggests routing those records to a queue or manager with a Decision element. Before activating the flow, he recommends running a SOQL query to preview the next 30 days of revisits.

The author also suggests a lookup field, Original_Opportunity__c, to link a new Opportunity to the lost one when a deal returns. He warns against reopening old records or deleting Closed Lost ones, since that erases the history needed to measure how many lost deals come back and after how long. A second query groups won deals by the loss reason of their original Opportunity to test this.
