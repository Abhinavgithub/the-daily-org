---
title: Securing Salesforce to LLM integrations with Apex and scoped permissions
original_title: Building a Salesforce-to-LLM Integration With Scoped API Permissions
url: https://dev.to/arthur_doss/building-a-salesforce-to-llm-integration-with-scoped-api-permissions-16k2
source: dev.to
source_type: community
date: 2026-10-22
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - apex
  - named-credentials
  - user-mode
  - field-level-security
  - llm-integration
  - prompt-injection
authors:
  - Arthur Doss
why_read: Readers will learn how to enforce least-privilege access when calling external language models from Apex, including proper use of WITH USER_MODE, Named Credentials, and response validation.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 8
model: qwen/qwen3.7-flash
---

The article argues that connecting Salesforce to a large language model takes more than an API key. The integration should control which records and fields the model can reach, protect credentials, minimize the data sent, and stop AI output from triggering unauthorized actions. It proposes an architecture with five parts: Salesforce enforcing permissions, Apex or middleware handling authorization and request building, Named Credentials managing the endpoint and authentication, the LLM API generating output, and a validation layer checking results before they are shown or used. A support assistant summarizing Cases, for example, needs only subject, description and status, not full contact or financial history. Authorization should happen before data is sent to the model and again before any business action follows its response.

The piece distinguishes several permission mechanisms that must be combined rather than relying on OAuth scopes alone: integration identity, object permissions, field-level security, record sharing and application-level restrictions. In Apex, declaring a class with sharing does not enforce object and field permissions, so the article recommends WITH USER_MODE on supported SOQL queries, with Security.stripInaccessible() as an alternative for removing inaccessible fields. For credentials, it recommends never hardcoding API keys and instead using External and Named Credentials, granting access through Permission Sets, and keeping separate configurations for each environment. A sample Apex class summarizes a Case through the OpenAI Responses API, querying only needed fields, sending a minimal payload, and checking the HTTP status and response structure before returning text.

The article also covers defending against prompt injection, since record text from emails or tickets may contain malicious instructions. Its safeguards include treating retrieved text as untrusted, limiting fields and records, avoiding unrestricted query or tool access for the model, checking proposed operations against a server-side allowlist, requiring human approval for consequential changes, and filtering documents by user access before they reach the model in retrieval-based designs. For scale, it suggests asynchronous processing with Queueable Apex or middleware for longer tasks, bounded retries with backoff only for suitable errors, request identifiers to prevent duplicate actions, token and latency monitoring, and cache designs that respect permission changes. The conclusion urges starting with a read-only use case and adding write capabilities only after authorization and failure handling are tested.
