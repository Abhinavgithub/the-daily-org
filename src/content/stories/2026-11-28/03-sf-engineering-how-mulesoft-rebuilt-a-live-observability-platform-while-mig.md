---
title: How MuleSoft moved observability to Hyperforce without breaking customers
original_title: How MuleSoft Rebuilt a Live Observability Platform While Migrating 39 Petabytes of Customer Data
url: https://engineering.salesforce.com/how-mulesoft-rebuilt-a-live-observability-platform-while-migrating-39-petabytes-of-customer-data/
source: Salesforce Engineering
source_type: official
date: 2026-11-28
section: architecture
personas:
  - architect
  - developer
tags:
  - mulesoft
  - hyperforce
  - observability
  - opentelemetry
  - multi-tenancy
  - data-migration
authors:
  - Atul Singh
  - Shashi Chinthakindi
why_read: You will learn how MuleSoft consolidated nearly 3,000 monitoring clusters into 24 multi-tenant clusters, kept legacy query APIs working through a translation layer, and used continuous automated validation and staged cutovers to migrate 39 petabytes of telemetry.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The legacy architecture was replaced by a consolidated multi-tenant platform
  left:
    heading: Legacy architecture
    points:
      - Nearly 3,000 monitoring clusters
      - 153 services and components
      - Statically provisioned per customer
  right:
    heading: Hyperforce architecture
    points:
      - 24 shared clusters
      - 43 services and components
      - Multi-tenant with automated rebalancing
  icons:
    - server
    - layers
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/How-MuleSoft-Rebuilt-a-Live-Observability-Platform-While-Migrating-39-Petabytes-of-Customer-Data-A.png
held_from: 2026-11-26
---

MuleSoft's legacy observability platform ran on nearly 3,000 independently provisioned monitoring clusters, and operating it at that scale was increasingly hard. The team first stabilized the existing system by reorganizing ownership around horizontal capabilities such as ingestion and logging, so each team maintained its part of the legacy system while building its replacement. Replacing ad hoc production fixes with root cause analysis brought incidents down within about six weeks.

The replacement moved to a shared, multi-tenant platform on Hyperforce. Because customers rarely reach peak utilization at the same time, the team could meet each customer's capacity guarantees without reserving the sum of every maximum allocation. High-utilization customers were spread across clusters, and automated mechanisms moved customers when utilization rose, with data kept within its region. Unifying ingestion, processing and storage cut the number of services and components from 153 to 43, and the clusters fell to 24, a reduction of about 99 percent.

The backend changed substantially, but customers were meant to notice little. The team standardized telemetry on OpenTelemetry and kept existing log and metrics query APIs working through a translation layer that mapped requests to the new databases. Customers received 60 days of access to both user interfaces when new features such as enhanced log search arrived, so they could give feedback before switching.

Migration ran alongside production. Automated end-to-end validation compared log and metrics queries, alerts and notifications across both environments and reported discrepancies, which surfaced differences caused by customer-specific implementations. Shadow validation covered selected alerting scenarios. Cutovers were grouped into about eight to ten batches by region, service, feature and customer category, moving from lower-risk to more complex workloads, with feature flags and rollback available throughout. The rollout ran for more than a year across more than 12 regions. The authors report P95 telemetry delay falling from several minutes to under one minute and query latencies improving 2X.
