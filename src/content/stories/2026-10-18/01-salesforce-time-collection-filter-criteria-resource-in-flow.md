---
title: New Collection Filter Criteria resource simplifies single record lookups in Flow
original_title: Collection Filter Criteria Resource in Flow
url: https://salesforcetime.com/2026/10/18/collection-filter-criteria-resource-in-flow/
source: Salesforce Time
source_type: community
date: 2026-10-18
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - flow-builder
  - collection-filter-criteria
  - winter-27
  - flow-resources
  - record-processing
authors:
  - Yumi Ibrahimzade
why_read: You will learn how to use the new Collection Filter Criteria resource to extract a single record from an existing collection without adding extra Loop or Assignment elements. The piece explains its limitations, performance benefits, and when it outperforms traditional Flow elements.
interest_score: 7
depth_score: 6
novelty_score: 8
utility_score: 7
model: qwen/qwen3.7-flash
image: https://salesforcetime.com/wp-content/uploads/2026/10/image-8-1024x655.png
figure:
  kind: compare
  caption: Comparison of the new Collection Filter Criteria resource against existing Flow elements
  left:
    heading: Collection Filter Criteria
    points:
      - Configured via Manager tab
      - Returns only first match
      - Eliminates extra Loop steps
      - Supports child relationships
  right:
    heading: Collection Filter and Sort
    points:
      - Placed directly on canvas
      - Returns full record collection
      - Requires additional Loop steps
      - Standard element configuration
figure_image: /figures/2026-10-18/01-salesforce-time-collection-filter-criteria-resource-in-flow.webp
---

Salesforce is introducing Collection Filter Criteria as a new resource type in the Winter '27 release. Unlike the standard Collection Filter and Collection Sort elements, this resource is configured through the Manager tab rather than placed on the canvas. It allows administrators to define combined filtering and sorting rules against an existing variable.

The resource currently returns only the first matching record instead of a full collection. This behavior makes it particularly valuable when processing repeater items or iterating through records, as it eliminates the need for nested Loops or extra Assignment steps to access individual field values. The author notes that Salesforce claims the resource processes over two hundred times faster than manual loop filtering and supports filtering through child relationships and Apex defined data types.

While it does not replace the original Collection Filter element, it provides a more efficient path for scenarios requiring a single matched record. Practitioners can reduce canvas complexity and improve execution speed by applying this resource alongside their existing Flow logic.
