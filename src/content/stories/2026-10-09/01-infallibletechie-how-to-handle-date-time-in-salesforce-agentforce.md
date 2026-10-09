---
title: Fixing time zone mismatches in Agentforce agents with proper input types
original_title: How to Handle Date Time in Salesforce Agentforce?
url: https://www.infallibletechie.com/2026/10/how-to-handle-date-time-in-salesforce-agentforce.html
source: InfallibleTechie
source_type: community
date: 2026-10-09
section: agentforce-and-ai
personas:
  - developer
  - admin
tags:
  - agentforce
  - agent-script
  - datetime-handling
  - flow-integration
  - llm-instructions
authors:
  - Magulan Duraipandian
why_read: You will learn how to prevent time zone conversion errors in Agentforce by enabling user profile context, adding explicit LLM instructions, and typing action inputs as ISO 8601 strings. The guide also shows how to structure these elements in an Agent Script that calls a Flow.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
---

The article addresses a common failure mode where Agentforce agents misinterpret local time because Salesforce stores DateTime values in UTC while users communicate in their local time zones. It outlines three required components to fix this: exposing the user profile context, providing explicit reasoning instructions to the large language model, and defining action inputs with the correct data type.

A complete Agent Script example demonstrates an Employee Agent that manages calendar events. The script enables the user profile context to retrieve the current user time zone without asking the user. Reasoning instructions direct the model to apply that time zone for display purposes while omitting offset details from the conversation. Conditional logic gates event actions behind a valid record identifier.

The workflow passes deterministic parameters like account identifiers directly to the Flow, leaving only the start datetime field open for natural language processing. By assigning the lightning__dateTimeStringType complex data type to that input, the agent converts conversational phrases into structured ISO 8601 values before handing them off to the downstream Flow.
