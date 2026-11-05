---
title: Testing product knowledge grounding for Agentforce with Data 360
original_title: 4 Data 360 Lessons for Connecting Product Knowledge to AI
url: https://www.salesforce.com/blog/data-360-product-knowledge-ai/
source: Salesforce Blog
source_type: official
date: 2026-11-05
section: agentforce-and-ai
personas:
  - architect
  - developer
  - admin
tags:
  - data-360
  - grounding
  - retrieval-augmented-generation
  - agentforce
  - golden-data-set
authors:
  - Helen Matsumoto
  - April Zheng
why_read: You will learn how Salesforce assesses knowledge content before indexing, how it tests Data 360 retrieval changes against a golden data set, and why a human-reviewed failure rate matters more than raw metrics.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The loop used to test each change to the agent's Data 360 configuration
  steps:
    - Hypothesize how the change affects answers
    - Build the recipe in Data 360
    - Evaluate with quantitative and qualitative tests
    - Reject or deploy, then keep monitoring
  icons:
    - search
    - code
    - check
    - rocket
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Two-teams-one-goal.png?strip=all&#038;quality=95
---

The Salesforce Help Agent is grounded in Salesforce's own product knowledge, prepared and organized in Data 360 and used by Agentforce through retrieval augmented generation. The authors argue that an agent's answers can be no better than the content it retrieves, so content quality has to be checked before any model or configuration work starts.

The first lesson is a Fit, Gap, Clash review of every article: whether it answers a real question, whether it leaves a customer issue uncovered, and whether it contradicts other content. Articles are scored using health, failure, resolution and traffic signals, paired with top case drivers. More content does not mean better coverage, and the team chose a separate agent for the Informatica help portal rather than adding that content to the existing Help Agent, which now resolves 92% of questions on that site without a case being filed. Content authors and an AI and Data team share the work, with Agent Managers connecting them.

The second and third lessons describe building by hypothesis: each change to a Data 360 recipe is tested, and only changes that improve answers ship. A product-name metadata hypothesis showed flat results and was rejected, leading to a new recipe that pairs metadata with prompt instructions. Evaluation uses a golden data set of about 200 utterances, each validated by a person, with acceptance criteria covering correct, complete and relevant answers.

The final lesson combines deterministic retrieval metrics, semantic quality checks and business outcomes with human and LLM review. When section-aware chunking was tested against fixed-size chunking on 195 query-document pairs, metrics flagged 8 failures, but review showed the real failure rate was closer to 1%, and that figure was used to approve production.
