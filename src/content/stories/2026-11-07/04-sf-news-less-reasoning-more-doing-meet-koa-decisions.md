---
title: Koa Decisions brings fast single-step decision models to Salesforce builders
original_title: Less Reasoning. More Doing. Meet Koa Decisions.
url: https://www.salesforce.com/news/stories/koa-decisions-salesforce-decision-models/
source: Salesforce News
source_type: official
date: 2026-11-07
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - koa-decisions
  - decision-models
  - hyperclassifier
  - agentforce
  - routing
authors:
  - Darvish Shadravan
why_read: You will learn what a decision model is, how it differs from a general-purpose LLM for choosing among options, and how Koa Decisions is positioned to reach flows, Apex and Prompt Templates. The article also points to a free Trailhead demo for testing it.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: A decision model returns one choice directly, while an LLM writes its answer token by token
  left:
    heading: Decision model
    points:
      - Reads the whole request at once
      - Returns one choice in one step
      - About 26 ms in Agentforce routing
  right:
    heading: General-purpose LLM
    points:
      - Writes its answer token by token
      - Generates text before the choice
      - About 1.4 s in Agentforce routing
  icons:
    - bolt
    - layers
image: https://www.salesforce.com/news/wp-content/uploads/sites/3/2026/11/Koa-Decisions-Graphic-2.png?w=1024
---

Salesforce has introduced Koa Decisions, the next version of its HyperClassifier model. It reads a request and a list of categories the user defines, then returns a decision in a single step, in milliseconds. It was built by applying training techniques to Google's open-weight Gemma model, and it adds multimodal support for images and audio. Salesforce plans to extend it beyond Agentforce routing into flows, Apex and Prompt Templates, plus an API for developers. It joins a separate reasoning model built with NVIDIA in the Koa family.

The article argues that much of an agent's work is choosing an option, a yes or no, or a score rather than generating text. A decision model returns that choice directly, while an LLM writes its answer one token at a time. In Agentforce routing measurements, the decision model took roughly 26 milliseconds against about 1.4 seconds for a general-purpose LLM. New categories can be added without retraining, which the article contrasts with building a custom predictive model over months.

Readers can test the model through the Koa Decisions demo on a free Trailhead account by changing the options and request text. The article also notes pricing and availability are subject to change and vary by region.
