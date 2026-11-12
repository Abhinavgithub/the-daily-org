---
title: Write a metric contract before giving an AI agent access to CRM and ERP data
original_title: "Three systems, three numbers: write a metric contract before you put an AI agent on your CRM and ERP"
url: https://dev.to/juanma_garrido_1974/three-systems-three-numbers-write-a-metric-contract-before-you-put-an-ai-agent-on-your-crm-and-erp-38on
source: dev.to
source_type: community
date: 2026-11-12
section: architecture
personas:
  - architect
  - admin
tags:
  - metric-contract
  - data-governance
  - agentforce
  - order-object
  - erp-integration
  - source-of-truth
authors:
  - Juan Manuel Garrido
why_read: You will learn why the same business metric can differ across Salesforce and an ERP, and how a versioned metric contract naming one source of truth and owner per number prepares data for an AI agent.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Two valid queries for the same business question can return different totals
  left:
    heading: Won opportunities
    points:
      - Sums Amount on Opportunity
      - Filters on IsWon and CloseDate
      - Measures closed deals this month
  right:
    heading: Activated orders
    points:
      - Sums TotalAmount on Order
      - Filters on Status and EffectiveDate
      - Measures orders effective this month
  icons:
    - chart
    - doc
---

A sales manager asking for one figure often gets three answers: the CRM, the ERP and a spreadsheet each record a different moment of the same sale. The author says this is common in mid-sized companies running Salesforce beside a separate ERP, and that an AI agent given access without resolving it will simply pick one number.

The piece illustrates the problem with two valid SOQL queries for sales this month: one summing won Opportunities by close date, the other summing activated Orders by effective date. Both are correct and can return different totals on the same day, while invoicing in the ERP follows its own date logic.

The proposed fix is a metric contract, a short versioned YAML file. For each metric it names the question, the definition, the source of truth, the object and filter, the amount field, an owner, what the metric is not, and any metrics it reconciles with along with the expected gap. The example pairs a sales_this_month metric on the Order object with an invoiced_this_month metric held in the ERP.

The author's practical rules are to give the agent the contract as context rather than only database access, to flag metrics that depend on spreadsheets as candidates for removal, and to review the contract when processes change, as one would review code. The article also notes that a single data source avoids much reconciliation work, and it promotes the author's own ERP product built natively on Salesforce.
