---
title: Salesforce retires the OAuth username password flow and guides migration to client credentials
original_title: Salesforce OAuth Username-Password Flow Retirement
url: https://salesforcetime.com/2026/10/15/salesforce-oauth-username-password-flow-retirement/
source: Salesforce Time
source_type: community
date: 2026-10-16
section: integration
personas:
  - developer
  - admin
tags:
  - oauth
  - username-password-flow
  - client-credentials
  - external-client-app
authors:
  - Yumi Ibrahimzade
why_read: Readers will learn how to identify integrations still using the retiring authentication method and follow step-by-step instructions to migrate them to supported flows like client credentials or web server with PKCE.
interest_score: 8
depth_score: 8
novelty_score: 6
utility_score: 9
model: qwen/qwen3.7-flash
image: https://salesforcetime.com/wp-content/uploads/2026/10/image-2-1024x399.png
figure:
  kind: steps
  caption: Migration steps to replace the retiring OAuth username-password flow with the client credentials method
  steps:
    - Create an External Client App
    - Configure the Run As User
    - Get the Client ID and Client Secret
    - Update the Authentication Request
    - Handle Token Expiration
---

Salesforce will enforce the retirement of the OAuth 2.0 username password flow on February 20, 2027. The change affects integrations that authenticate by sending user credentials directly to the token endpoint. Orgs created in Summer 2026 or later already block this method, and existing orgs can track progress through Release Updates in Setup.

Administrators and developers must audit their environments because failed integrations may run silently without warnings. Affected systems can be found by filtering Login History for the OAuth username password subtype, reviewing Connected Apps and middleware configurations, and contacting third party vendors to verify their support status.

The article recommends replacing the retiring flow with more secure alternatives such as client credentials, web server with pkce, or jwt bearer depending on whether user interaction is required. For server to server use cases, it outlines creating an External Client App, assigning a dedicated Run As user with least privilege permissions, and updating the application to request tokens using grant type client credentials instead of passwords.
