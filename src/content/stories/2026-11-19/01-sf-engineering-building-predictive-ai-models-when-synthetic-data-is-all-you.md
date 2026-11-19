---
title: How Salesforce built ITSM Predictive models before real Customer Incident Data existed
original_title: Building Predictive AI Models When Synthetic Data Is All You Have
url: https://engineering.salesforce.com/building-predictive-ai-models-when-synthetic-data-is-all-you-have/
source: Salesforce Engineering
source_type: official
date: 2026-11-19
section: agentforce-and-ai
personas:
  - architect
  - developer
tags:
  - predictive-ai
  - data-360
  - itsm
  - synthetic-data
  - xgboost
  - model-validation
authors:
  - Taniya Ghosh
why_read: You will learn how the team generated synthetic incident data, validated models using scenario tests instead of accuracy alone, and shipped a reusable Data 360 training and scoring pipeline that trains per customer.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/image-42aeda40.png
figure:
  kind: steps
  caption: How the template turns customer incident history into scored predictions on the incident record
  steps:
    - Sync incidents and milestones into DMOs
    - Daily transform labels milestone violations 0/1
    - Einstein on Data 360 trains XGBoost classifier
    - Scheduled batch writes scores to score DMO
    - AI Accelerator card shows score on incident
  icons:
    - database
    - flow
    - chart
    - clock
    - layers
---

Salesforce's engineering team set out to predict SLA breaches and major incidents in IT service management without customers needing data scientists, and without any real customer incident history to learn from at the start. They built three Predictive Model Templates: SLA Breach Prediction, Major Incident Prediction, and Change Risk Score. Scores and leading predictors are shown on the incident record through Data 360.

Synthetic data came from product manager samples, expanded by varying features and generated with open-source LLMs within product guardrails. The team noted that the simulated Customer Zero data was insufficient on its own, so grounding in realistic scenarios mattered more than volume.

Because SLA breaches are rare, aggregate accuracy can mislead; a naive model could look 95% accurate and still be useless. Instead, the team held all incident features fixed and varied one factor at a time, such as owners with a higher or lower historical milestone miss rate, checking that the score moved in the expected direction. They also checked whether the top three predictors matched what an experienced service manager would flag. The article stresses that these results validate tested scenarios, not production accuracy.

The template ships the training contract rather than fixed weights: DMO API names, transformation logic and model structure. Each customer's history determines the learned parameters. Incidents, milestones and related records sync into DMOs, a daily transform labels milestone violations as a 0/1 target, and Einstein on Data 360 trains an XGBoost binary classifier. A scoring transform writes predictions to a score DMO, displayed on the AI Accelerator card.

Two constraints remain. Scoring runs as a scheduled batch about once an hour rather than in real time, chosen for scalability with large customers. Training requires roughly 400 completed incidents, and prediction quality depends on the customer's history. The templates reached general availability in February.
