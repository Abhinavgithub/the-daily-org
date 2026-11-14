---
title: Mining OpportunityHistory with pandas to see how sales really run before automating
original_title: "Before an AI agent automates your sales process, mine how it really runs: Salesforce OpportunityHistory and pandas"
url: https://dev.to/juanma_garrido_1974/before-an-ai-agent-automates-your-sales-process-mine-how-it-really-runs-salesforce-18lm
source: dev.to
source_type: community
date: 2026-11-14
section: data-cloud
personas:
  - developer
  - admin
  - architect
tags:
  - opportunity-history
  - process-mining
  - pandas
  - agentforce
  - data-quality
authors:
  - Juan Manuel Garrido
why_read: You will learn how to turn the OpportunityHistory object into an event log and use pandas to find stage variants, skipped stages, waiting times and single-person bottlenecks. You will also see what these findings should settle before an AI agent is given the sales process.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The four analyses used to measure the real sales process from OpportunityHistory
  steps:
    - Export OpportunityHistory as an event log
    - Build stage variants and count rework
    - Measure median wait between stages
    - Count who moves the stages
  icons:
    - database
    - layers
    - clock
    - people
---

The author argues that a documented sales process often differs from the one a company actually runs, and that an AI agent will faithfully follow whichever version it is given. Before automating, teams should measure the real process. Salesforce already records a row in OpportunityHistory whenever an opportunity's stage, amount or close date changes, so no setup is needed. A SOQL query selecting the opportunity ID, stage, amount, close date, creation date and creator over the last 180 days can be exported to CSV and used as an event log.

The post then walks through four analyses in pandas. The first removes rows that are not real stage changes and counts the distinct stage paths, or variants, across opportunities; the documented process is usually one line, while the data usually shows many. The second flags opportunities that went back to an earlier stage and those that moved from creation to the last stage in two steps or fewer, which suggests the CRM was updated only at the end. The third calculates the median wait between each pair of stages to locate handoffs or approvals that happen outside the system. The fourth counts how many stage changes each user made, since one or two users moving most records suggests updates are being collected elsewhere and typed in.

The author stresses that these numbers show where the problems are, not why they occur. Each signal should prompt a question: which process is the real one, what the rep gains from updating the CRM, which area owns a slow handoff, and where the information actually lives. Answering these first prevents an agent from speeding up the wrong steps. The same approach can extend to orders, invoices and payments when the ERP lives in the same Salesforce org.
