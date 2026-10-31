---
title: Eight practices for building a performant Tableau Semantics model
original_title: Best Practices for Creating a Performant Semantic Model in Tableau Semantics
url: https://www.salesforce.com/blog/tableau-semantics-best-practices-performant-semantic-model/
source: Salesforce Blog
source_type: official
date: 2026-10-31
section: data-cloud
personas:
  - architect
  - developer
  - admin
tags:
  - tableau-semantics
  - semantic-model
  - data-360
  - query-performance
  - row-level-security
authors:
  - Lior Ebel
why_read: You will know how to structure a Tableau Semantics model for query speed, correct joins, governance and scale, and which build path suits your situation. The piece is practical guidance rather than a release announcement.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/10/1_Tableau-Agent_Semantic-Modeling_Creation_GIF.gif?strip=all&#038;quality=95
held_from: 2026-10-28
figure:
  kind: steps
  caption: Five groups of practices for building a performant semantic model, in the order the article presents them
  steps:
    - Business-driven design and conceptual modeling
    - Choose a build path
    - Implement and test iteratively
    - Design for query performance
    - Centralize security and standardize
  icons:
    - flow
    - layers
    - gear
    - check
    - bolt
---

The article argues that a semantic model should reflect business concepts rather than database schemas, and that conceptual modeling and stakeholder review should come before joins are configured. It describes three build paths: generating a model from natural language with Tableau Agent, generating one from existing CRM Analytics or Tableau Cloud data, and extending a verified model through composable modeling. It recommends starting from the Salesforce Customer 360 Semantic Model where applicable.

For performance, the guidance is to keep runtime joins to about six or seven, avoid many-to-many joins and expensive operators such as BETWEEN, join on primary keys, set explicit join cardinality, and align default filters with Data Lake Object partitioning. Secondary indexes and pushing heavy transformations upstream into Data 360 batch transforms or Calculated Insights are suggested for very large datasets. Security should be enforced through Data 360 Policies rather than model filters, which are meant for business relevance and can be bypassed by ad-hoc queries.

The piece also advises testing with the Test Model feature and visual checks for join fan-outs, and stress testing against production-scale volumes and concurrent query patterns before rollout.
