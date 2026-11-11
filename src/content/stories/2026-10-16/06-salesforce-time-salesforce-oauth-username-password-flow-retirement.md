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
  icons:
    - plug
    - person
    - lock
    - flow
    - clock
---

Salesforce will retire the OAuth 2.0 Username-Password Flow on February 20, 2027. The flow has an external application send a Salesforce username, password and security token to the token endpoint. Salesforce first announced the change in Spring '26 and later moved enforcement from Winter '27 to the Spring '27 release. The article calls this a breaking change: integrations that still use the flow will fail when they request new access tokens after enforcement, and the failures may go unnoticed, such as a scheduled job that quietly stops updating records. Orgs created in Summer '26 and later already block the flow, and the article says that an org with no matching release update may already be blocked.

To find affected integrations, the article recommends several checks. Create a Login History view filtered on the OAuth Username-Password login subtype, keeping in mind that history is kept for about six months, so an empty result does not prove that nothing is affected. Review Connected Apps in App Manager, although the Connected Apps OAuth Usage page does not show these integrations. Search middleware, custom code and repositories for grant_type=password, the Resource Owner Password Credentials term and calls to the token endpoint, checking the grant_type value because other flows use the same endpoint. Managed packages and third-party applications also need review, and the article suggests asking vendors whether they use the flow and what update is required.

The replacement depends on the integration. Client Credentials suits server-to-server work, Web Server Flow with PKCE suits applications that act for individual users, and JWT Bearer suits certificate-based server-to-server setups. For Client Credentials, the article describes creating an External Client App with the api scope, enabling the flow, and choosing a Run As user with only the permissions the integration needs. It also warns that a different user may lack the original user's record access. The token request changes to grant_type=client_credentials without a username or password. Because this flow issues no refresh tokens, the integration should request a new token when the current one expires, not for every call, and should include retry handling.

The PKCE flow sends users to Salesforce to sign in and authorize the app, then exchanges an authorization code and a code verifier for a token, and it can use refresh tokens. JWT Bearer uses a signed assertion checked against a certificate, which means certificates must be managed. The article also notes that legacy Connected Apps lose full support in Summer '27, and that migrating one to an External Client App does not fix the username-password dependency, because External Client Apps do not support that flow.

To test, the article advises disabling the Allow OAuth Username-Password Flows setting in a sandbox under OAuth and OpenID Connect Settings, then running each integration. Successful connection tests can be misleading because cached sessions may keep working for a while, so each integration should obtain a fresh token through a supported flow. Failures may show an invalid_grant error and an OAuth Username-Password Flow Disabled status in Login History. The article's main advice is to start the inventory and migration well before the deadline.
