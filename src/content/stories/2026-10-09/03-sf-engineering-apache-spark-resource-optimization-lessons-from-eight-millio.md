---
title: Optimizing Apache Spark workloads at scale using telemetry and evidence-based tuning
original_title: "Apache Spark Resource Optimization: Lessons From Eight Million Jobs a Day"
url: https://engineering.salesforce.com/apache-spark-resource-optimization-lessons-from-eight-million-jobs-a-day/
source: Salesforce Engineering
source_type: official
date: 2026-10-09
section: architecture
personas:
  - architect
  - developer
tags:
  - apache-spark
  - data-360
  - telemetry
  - silver-layer
  - trino
  - compute-optimization
authors:
  - Siddharth Sharma
  - Suvhrajit Basak
  - Kusum Dhalia
why_read: You will learn how to collect execution telemetry without modifying application code and validate resource sizing changes against runtime and reliability metrics before production rollout.
interest_score: 6
depth_score: 8
novelty_score: 4
utility_score: 5
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/10/image_1855c2.png?w=1024
---

The Salesforce engineering team addressed inefficient compute allocation across millions of daily Apache Spark jobs by shifting from success-based metrics to evidence-driven resource sizing. They identified that successful job completion often masks unused capacity, pod churn, and unnecessary executor allocations.

To gather comparable measurements without altering customer applications, the team instrumented a shared submission gateway using open-source listener hooks. These listeners exported structured telemetry through Kafka into a curated analytical layer, which standardized metrics for applications, jobs, stages, and executors while explicitly tracking missing data and retry semantics.

The team used the modeled data to distinguish between genuine waste and underlying bottlenecks like shuffle failures or memory pressure. By testing targeted reductions in initial executors and maximum limits, they validated changes against p95 runtime, spill rates, and platform health indicators. The adjustments yielded a thirty-one percent weekly compute cost reduction without degrading performance or increasing failures.
