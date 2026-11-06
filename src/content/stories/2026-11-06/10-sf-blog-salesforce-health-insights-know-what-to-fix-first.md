---
title: Salesforce Health Insights scans an org and ranks what to fix first
original_title: "Salesforce Health Insights: Know What to Fix First"
url: https://www.salesforce.com/blog/salesforce-health-insights/
source: Salesforce Blog
source_type: official
date: 2026-11-06
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - salesforce-health-insights
  - org-health
  - next-best-action
  - implementation-health
  - winter-27
authors:
  - Sanjeevani Bhardwaj
why_read: You will learn what Salesforce Health Insights does, its two pillars of Product Adoption and Implementation Health, and who can access it in the Winter '27 release. The piece stays at the level of an overview and does not explain how to configure it.
interest_score: 6
depth_score: 5
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How Salesforce Health Insights turns an org scan into next actions
  steps:
    - Scan org configuration and usage
    - Evaluate against benchmarks
    - Rank findings by severity
    - Deliver next best actions
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
held_from: 2026-11-03
---

Salesforce Health Insights is a Salesforce-native solution that scans an org, evaluates it against benchmarks, and turns the findings into prioritized next best actions. The article presents it as a way to replace a manual org health review, which it says can take up to three weeks, with an on-demand scan that returns ranked results in near real time. The recommendations are built from the org's own configuration, feature set and usage patterns, and ranked by criticality and the effort needed to fix them.

The tool has two pillars. Product Adoption shows which licensed capabilities are owned, which are used, and where there is room to grow, including license utilization over the past 30 days. Implementation Health delivers severity-ranked insights across Security and Process Automation, with recommendations meant to reduce exposure and prevent automation failures. The article also describes a headless delivery model, with a conversational view inside Salesforce and access through Slackbot outside it.

According to the article, Salesforce Health Insights is available with the Winter '27 release for Signature Success Plan customers on Core products at no extra cost, and is found by searching for it in the App Launcher. The piece is a product announcement written by Salesforce and gives no detailed configuration steps or measured results.
