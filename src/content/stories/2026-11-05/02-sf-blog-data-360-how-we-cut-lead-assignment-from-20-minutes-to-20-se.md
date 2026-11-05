---
title: How Salesforce cut lead assignment to 20 seconds using Data 360 scoring
original_title: "Data 360: How We Cut Lead Assignment From 20 Minutes to 20 Seconds"
url: https://www.salesforce.com/blog/data-360-lead-scoring/
source: Salesforce Blog
source_type: official
date: 2026-11-05
section: data-cloud
personas:
  - architect
  - admin
  - developer
tags:
  - data-360
  - lead-routing
  - lead-scoring
  - unified-profile
  - agent-first-outreach
  - configurable-tables
authors:
  - Kaitlin Lee
  - Jessica Radloff
why_read: You will learn how Salesforce built lead scoring and three-way routing on a unified Data 360 profile, and which design choices carried the gains. The piece also gives a practical checklist for applying the pattern at a smaller scale.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Each inbound response is matched, scored and sent to one of three routes
  steps:
    - Match to unified profile
    - Classify job level and score
    - Apply team thresholds
    - Route to sales, nurture or agent
  icons:
    - database
    - chart
    - gear
    - flow
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-two.png
---

Salesforce's sales team routed leads across three systems with heavily customized rules, and routing changes often went live weeks late. The team unified signals such as website activity, event attendance, email engagement, support history and product usage in Data 360, then built scoring and routing on that profile. Its in-house data science team built a lead score from 1 to 5 and a product interest score, and each inbound response is matched to a profile, classified by job level, scored, and sent to a sales team, marketing nurture or agent-first outreach.

The article reports that lead assignment fell from 20 minutes to 20 seconds, custom code dropped 90% from about 2 million lines, and routing changes now take days instead of four weeks. Thresholds sit in configurable tables rather than code, so a business user could raise the bar for Tableau leads without a release. The authors credit the whole implementation for these results, not Data 360 alone, and note that the same profile drives an email journey with a 233% higher click-through rate than their average Marketing Cloud journey.

The closing advice is to unify data before scoring, define what sales-ready means for each team, give every lead a destination, and keep rule changes out of code releases.
