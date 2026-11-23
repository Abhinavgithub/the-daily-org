---
title: Using Named Credentials to keep secrets out of Apex callout code
original_title: "Salesforce Named Credentials: Secure API Callouts Without Hardcoded Secrets"
url: https://dev.to/rohanmehta/salesforce-named-credentials-secure-api-callouts-without-hardcoded-secrets-a2b
source: dev.to
source_type: community
date: 2026-11-23
section: integration
personas:
  - developer
  - admin
  - architect
tags:
  - named-credentials
  - external-credentials
  - apex-callouts
  - secrets-management
  - permission-sets
authors:
  - Rohan Mehta
why_read: You will learn how to pair an External Credential with a Named Credential, grant access through a Permission Set, and call an external API from Apex without hardcoding endpoints or secrets. The post also flags the callout limits that still apply and the Permission Set step that is easy to miss.
interest_score: 6
depth_score: 6
novelty_score: 3
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Setup order for a Named Credential and its access, then the Apex callout
  steps:
    - Create the External Credential
    - Create the Named Credential
    - Grant access with a Permission Set
    - "Call it from Apex with callout:"
---

Hardcoding endpoint URLs and credentials in Apex or Custom Settings is a common and risky pattern for external integrations. Named Credentials bundle the base URL, authentication scheme and credentials into one definition that Apex refers to by name, so secrets stay out of source code and debug logs.

Setup takes two records, created in order. First, an External Credential holds the authentication protocol and identity details, including the token endpoint for OAuth flows. Second, a Named Credential points at the base URL and links to that External Credential. A Permission Set must then grant users access to the External Credential, a step the author says is often skipped and produces errors that do not explain the cause.

In Apex, the callout uses the callout: prefix with the credential name followed by the resource path, with no URL string or Authorization header in the code. Test classes still need a mock, but only have to assert against the named endpoint. The post notes that Named Credentials do not raise the 100-callout-per-transaction limit or the 120-second timeout, so batching or queueing is still needed for heavy use.

The author also covers rotating secrets by editing a single record rather than redeploying code, and configuring a credential per user where actions should be attributed to individuals rather than the org. Retrofitting an existing integration means creating the two records, replacing hardcoded endpoints with callout: references and deleting stored secrets.
