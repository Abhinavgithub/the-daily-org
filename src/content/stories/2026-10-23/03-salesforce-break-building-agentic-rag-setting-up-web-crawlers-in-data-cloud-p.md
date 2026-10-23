---
title: Set up Data Cloud web crawlers to ingest and vectorize external pages for AI agents
original_title: "Building Agentic RAG: Setting Up Web Crawlers in Data Cloud (Part 1)"
url: https://salesforcebreak.com/2026/10/22/agentic-rag-data-360-agentforce/
source: Salesforce Break
source_type: community
date: 2026-10-23
section: data-cloud
personas:
  - admin
  - developer
tags:
  - data-cloud
  - web-crawler
  - css-selectors
  - data-lake-object
  - vector-search
authors:
  - Sinan Kırım
why_read: Readers will learn how to configure a Data Cloud Web Content Connector, filter target elements with CSS selectors, and generate searchable vector chunks from live websites. The guide also shows how to verify the ingested data using Data Explorer and SOQL.
interest_score: 6
depth_score: 7
novelty_score: 5
utility_score: 8
model: qwen/qwen3.7-flash
image: https://salesforcebreak.com/wp-content/uploads/2026/10/Building-Agentic-RAG-Setting-Up-Web-Crawlers-in-Data-Cloud-Part-1.png
---

The article introduces Retrieval-Augmented Generation and explains why keeping AI agents grounded in real-time data matters. It outlines the prerequisites of enabling Einstein, Agentforce, and Data Cloud in a development org.

It details the configuration of a Web Content Connector in Data Cloud Setup. The steps explain how to set crawl depth to zero to avoid following irrelevant links and how to use browser developer tools to copy CSS selectors for targeting specific page elements.

The guide describes creating a Data Lake Object and its corresponding Data Model Object. It notes that semantic search must be enabled while skipping image embedding and knowledge harmonization for this text-only use case. It concludes by showing how to validate the chunked output through Data Explorer and standard SOQL queries against the unstructured data model object suffix.
