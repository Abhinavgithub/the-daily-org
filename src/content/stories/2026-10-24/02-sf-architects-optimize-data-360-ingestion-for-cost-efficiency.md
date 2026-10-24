---
title: Cutting Data 360 credit costs through ingestion choices
original_title: Optimize Data 360 Ingestion for Cost Efficiency
url: https://www.salesforce.com/blog/optimize-data-360-ingestion-costs/
source: Salesforce Architects
source_type: official
date: 2026-10-24
section: data-cloud
personas:
  - architect
  - admin
tags:
  - data-360
  - zero-copy
  - file-federation
  - credit-consumption
  - ingestion-cost
authors:
  - Pradeep Krishna
why_read: You will learn how Data 360 credits are consumed by rows processed, and how the choice between zero-copy, batch and streaming, and query or file federation changes that cost. You will also see when internal CRM pipelines are free.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Zero-copy and standard ingestion differ in cost per million rows and in when each is cheaper
  left:
    heading: Zero-copy
    points:
      - About 70 credits per 1 million rows
      - Best for infrequent or ad-hoc queries
      - Data must stay in external lake
  right:
    heading: Standard ingestion
    points:
      - 500 to 2,000 credits per 1 million rows
      - Cheaper for frequent queries and transforms
      - Copies are acceptable
  icons:
    - cloud
    - database
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
---

Data 360 credit consumption for many usage types is driven by the number of records processed or accessed, not by the rows returned. The article argues that pipelines which scan large volumes but return few rows waste credits, so architects should decide how data enters the platform before anything else. Data kept outside the platform, or filtered before ingestion, incurs no processing cost, and zero-copy avoids replicating data at all.

The article compares zero-copy with standard ingestion. Zero-copy suits infrequent or ad-hoc queries and data that must stay in an external lake, at roughly 70 credits per million rows processed plus compute on both sides. Standard ingestion, at 500 to 2,000 credits per million rows, is more economical when data is queried frequently and transformed. Streaming costs more than batch because of continuous micro-batching and index updates, so batch should be used unless near-real-time freshness is needed. Core CRM pipelines from Sales Cloud, Service Cloud, Marketing Cloud and B2C Commerce have consumed zero credits since August 2025, though some Industry Cloud connectors still incur standard usage.

For zero-copy, the article contrasts query federation over JDBC, which bills compute on both Data 360 and the external source and is best for datasets under 100 million rows, with file federation over Apache Iceberg, which reads storage directly, is faster on datasets over one billion rows, and has native change capture and Flow automation. It recommends enabling acceleration for frequently queried zero-copy data to avoid repeated external compute charges.
