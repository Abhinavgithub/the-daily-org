---
title: Deploy Python Code Extensions for complex Data 360 batch transformations
original_title: Run Complex Data Transformations in Data 360 with Code Extension
url: https://developer.salesforce.com/blogs/2026/09/build-deploy-run-and-troubleshoot-complex-transformations-with-python-and-pyspark-while-keeping-execution-governed-by-data-360
source: Salesforce Developers Blog
source_type: official
date: 2026-10-04
section: data-cloud
personas:
  - developer
  - architect
tags:
  - data-360
  - code-extension
  - python
  - pyspark
  - batch-transform
  - salesforce-cli
authors:
  - Chandan Agarwal
why_read: You will learn how to structure, validate, and deploy Python scripts as managed Code Extensions within Data 360. The guide also covers connecting these scripts to batch data transforms and monitoring execution through the platform.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20260909164152/Generic-D-8-e1788997323200.png?w=1000
---

Northstar Outfitters faced inconsistent product data across commerce systems and needed a trusted catalog. Native visual transforms could not handle the required standardization, enrichment, and scoring logic, prompting the use of Data 360 Code Extension to run modular Python and PySpark scripts directly on Salesforce infrastructure.

The solution relies on isolated runtime environments where scripts read from and write to designated Data Lake Objects using explicit permissions defined in a configuration file. Developers validate logic locally against sampled data before packaging the script, dependencies, and tests into a deployable archive.

The guide details both Setup interface and Salesforce CLI workflows for uploading packages, selecting compute sizes, and linking the extension to a batch data transform. Execution, scheduling, and logging are handled by the platform, while operators can trigger runs and review history through REST API calls.
