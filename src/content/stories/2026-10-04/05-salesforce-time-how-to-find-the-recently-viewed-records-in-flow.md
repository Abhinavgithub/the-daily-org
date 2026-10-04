---
title: Replicate the standard Recently Viewed List View inside a Screen Flow
original_title: How to Find the Recently Viewed Records in Flow
url: https://salesforcetime.com/2026/09/20/how-to-find-the-recently-viewed-records-in-flow/
source: Salesforce Time
source_type: community
date: 2026-10-04
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - flow-builder
  - recently-viewed-object
  - transform-element
  - collection-sort
  - screen-flow
authors:
  - Yumi Ibrahimzade
why_read: You will learn how to query the Recently Viewed object, merge its results with parent records using the Transform element, and sort the combined data for display in a Screen Flow. This approach replaces the missing native sorting capability in Flow Builder.
interest_score: 7
depth_score: 6
novelty_score: 5
utility_score: 8
model: qwen/qwen3.7-flash
image: https://salesforcetime.com/wp-content/uploads/2026/09/image-16-1024x927.png
---

The article addresses the limitation of Flow Builder when trying to replicate the standard Recently Viewed List View, noting that direct sorting by view date is unavailable through standard Get Records elements. It introduces the Recently Viewed object as the underlying source that tracks records accessed by each user without requiring explicit user filtering.

The author demonstrates a six-step process starting with a Get Records element to fetch Recently Viewed entries filtered by the Account type. A Transform element extracts the record identifiers, which are then used in a second Get Records element to retrieve full Account data.

Because the original view date field resides outside the Account collection, another Transform element joins the two datasets using the record identifier as the key. The merged collection is subsequently ordered by the Last Viewed Date field using a Collection Sort element before being rendered in a Data Table component.
