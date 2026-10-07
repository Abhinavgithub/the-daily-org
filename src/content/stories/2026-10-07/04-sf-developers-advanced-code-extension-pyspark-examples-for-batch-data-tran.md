---
title: Advanced PySpark patterns for batch data transforms in Data 360
original_title: Advanced Code Extension PySpark Examples for Batch Data Transforms
url: https://developer.salesforce.com/blogs/2026/10/advanced-code-extension-pyspark-examples-for-batch-data-transforms
source: Salesforce Developers Blog
source_type: official
date: 2026-10-07
section: data-cloud
personas:
  - developer
  - architect
tags:
  - data-cloud
  - pyspark
  - code-extension
  - batch-transform
  - sf-cli
authors: []
why_read: Readers will learn how to structure, test, and deploy PySpark Code Extension scripts for complex batch transformations in Data 360. The piece demonstrates three production-ready patterns for hierarchical rollups, JSON event parsing, and machine learning scoring.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261005160554/Generic-B-7-e1791241572316.png?w=1000
figure:
  kind: steps
  caption: The end-to-end workflow for developing custom batch transforms in Data 360
  steps:
    - Author PySpark script locally using Python SDK
    - Validate script locally via SF CLI command
    - Deploy packaged extension to Data 360 org
    - Execute managed Spark job on demand or schedule
figure_image: /figures/2026-10-07/04-sf-developers-advanced-code-extension-pyspark-examples-for-batch-data-tran.webp
---

The article introduces Data 360 Code Extensions as a mechanism to run custom PySpark logic against Data Lake Objects and Data Model Objects within an isolated compute environment. It outlines the full development lifecycle, detailing how engineers use the Salesforce Command Line Interface to validate scripts locally against a sampled dataset before packaging and deploying them to the platform.

The first example implements an iterative loop to calculate total tree revenue across variable-depth account hierarchies by continuously joining frontier records until convergence. The second example provides a reusable helper to parse and explode JSON array columns containing batched session events into individual rows for downstream analytics.

The third example demonstrates how to bundle a serialized scikit-learn classifier and its categorical feature grid to score leads efficiently via a broadcast join. The post concludes by reviewing managed Spark constraints around memory and timeouts, while noting that the transformed outputs become queryable objects for Agentforce agents.
