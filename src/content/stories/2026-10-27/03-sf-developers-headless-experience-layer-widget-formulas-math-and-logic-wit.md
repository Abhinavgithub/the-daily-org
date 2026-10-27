---
title: Moving display logic from Apex into HXL widget formulas
original_title: "Headless Experience Layer Widget Formulas: Math and Logic with JSON"
url: https://developer.salesforce.com/blogs/2026/10/headless-experience-layer-widget-formulas-math-and-logic-with-json
source: Salesforce Developers Blog
source_type: official
date: 2026-10-27
section: lwc-and-ui
personas:
  - developer
  - architect
tags:
  - headless-experience-layer
  - widget-formulas
  - custom-lightning-types
  - agentforce
  - apex
authors:
  - Charles Watkins
why_read: You will learn how to express conditional display, badge coloring, arithmetic and blank checks as formulas inside HXL widget JSON, what the formula functions can and cannot do, and why deployed widget schemas can only grow.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Display logic moves from the Apex DTO into the widget itself
  left:
    heading: "Before: Apex"
    points:
      - Precomputes ratingVariant
      - Computes winRate in Apex
      - Sends hasPhone and hasOpenPipeline
  right:
    heading: "After: widget formulas"
    points:
      - CASE() picks the badge variant
      - IF() guards the win rate division
      - NOT(ISBLANK()) checks the phone
  icons:
    - code
    - layers
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261023094210/SingleHeadshot-11-e1792773746965.png?w=1000
figure_image: /figures/2026-10-27/03-sf-developers-headless-experience-layer-widget-formulas-math-and-logic-wit.png
---

HXL widgets are declarative JSON components, currently in beta, that can be embedded in Claude, ChatGPT and Agentforce. Their {!...} expressions can use math, comparison and logic operators and functions such as IF, CASE, AND and LEN, so display logic can sit beside the display rather than in Apex. The author shows an account card whose display fields were first precomputed in an Apex DTO and then replaced with formulas for visibility, badge variant, win rate and phone presence.

The author notes limits. There are no formatting functions for dates or currency, so those values still need formatting in Apex, and there is no aggregate such as SUM or AVERAGE across a list. Moving an existing widget also has a catch: a deployed schema.json can only grow, so removing old properties requires deploying a new widget bundle and repointing the Custom Lightning Type renderer.

The post also points to the Headless Experience Layer Playground for testing formulas live and to a formula reference in the Salesforce platform-widget-generate skill for coding agents.
