---
title: Koa Decisions, a small model for fast routing Decisions in Agentforce
original_title: Salesforce Unveils Cheaper, Quicker AI Decisions Model “Koa Decisions”
url: https://www.salesforceben.com/salesforce-unveils-cheaper-quicker-ai-decisions-model-koa-decisions/
source: Salesforce Ben
source_type: community
date: 2026-11-10
section: agentforce-and-ai
personas:
  - developer
  - architect
  - admin
tags:
  - koa-decisions
  - decision-model
  - agentforce
  - hyperclassifier
  - llm-routing
authors:
  - Ross Collie
why_read: You will learn what Koa Decisions is, how it differs from a general-purpose LLM for categorical decisions, and the latency figures Salesforce reports. You will also see the planned extension to flows, Apex and Prompt Templates.
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: A decision model returns a short answer far faster than a general-purpose LLM
  left:
    heading: General-purpose LLM
    points:
      - Generates text token by token
      - Roughly 1.4 seconds for routing
      - Built for writing and reasoning
  right:
    heading: Koa Decisions
    points:
      - Reads the whole request at once
      - Roughly 26 milliseconds for routing
      - Returns a choice, yes/no or score
  icons:
    - robot
    - bolt
image: https://www.salesforceben.com/wp-content/uploads/2026/11/koad1.webp
---

Salesforce is releasing a new version of Koa Decisions, an AI decision model built on its HyperClassifier model and trained on Google's open-weight Gemma. It takes a request and a list of categories you define, and returns a choice, a yes or no, or a score within milliseconds. The latest version adds multimodal support for images and audio.

The article argues that a general-purpose LLM is slower and more costly for quick, targeted decisions such as routing a request to a team. A decision model reads the whole request at once and can return an answer in as little as one token, while an LLM generates text token by token. Salesforce reports that, when routing requests in Agentforce, the decision model took roughly 26 milliseconds against roughly 1.4 seconds for a general-purpose LLM.

Salesforce plans to extend the model beyond routing into flows, Apex and Prompt Templates, with an API for developers. The company frames it as a way to keep larger models for reasoning and generation while smaller models handle routine decisions.
