---
title: Using the JSON Path function in AgentScript to extract and filter data
original_title: "AgentScript built-in functions: json_path()"
url: https://dev.to/exploring_agentforce/agentscript-built-in-functions-jsonpath-cap
source: dev.to
source_type: community
date: 2026-10-13
section: agentforce-and-ai
personas:
  - developer
  - admin
tags:
  - agent-script
  - json-path
  - agentforce
  - collection-filtering
  - json-extraction
authors:
  - Exploring Agentforce
why_read: Readers will learn the syntax and practical examples for using the JSON Path function in AgentScript to select, range, and filter data from action responses without writing Apex or Flow.
interest_score: 6
depth_score: 7
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
---

The article introduces the JSON Path function available in AgentScript, explaining how it extracts data from objects and lists using standard expressions. The function takes three arguments: the source variable, the query path, and an optional default value to return when no match is found. All queries return results as a list.

Several practical examples demonstrate how to navigate nested data structures. The author shows how to retrieve a specific field from a single record, use asterisks to pull the same field from every item in a collection, and apply slice notation to grab a subset of records. Each example includes the exact expression and the resulting output.

Filtering logic allows users to narrow down collections based on conditions before extracting values. The piece illustrates how to combine equality checks and logical operators to isolate records matching multiple criteria. The author warns that while filtering works in sandbox environments, official documentation currently omits these expressions, advising caution before deploying them to production.
