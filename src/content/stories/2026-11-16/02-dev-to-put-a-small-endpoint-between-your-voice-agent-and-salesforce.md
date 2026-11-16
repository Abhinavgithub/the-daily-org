---
title: Route a voice agent's Salesforce calls through a small endpoint you control
original_title: Put a Small Endpoint Between Your Voice Agent and Salesforce
url: https://dev.to/dograh/put-a-small-endpoint-between-your-voice-agent-and-salesforce-5db5
source: dev.to
source_type: community
date: 2026-11-16
section: integration
personas:
  - developer
  - architect
tags:
  - external-client-app
  - client-credentials
  - voice-agent
  - named-credential
  - oauth
  - task-logging
authors:
  - Pritesh Kumar
why_read: You will learn why a token-renewing middle endpoint suits a voice agent that cannot refresh OAuth tokens itself, how to set up a client credentials External Client App with a locked-down integration user, and how to log call results as Tasks without duplicates.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a call result reaches Salesforce through the endpoint
  steps:
    - Agent sends request with bridge key
    - Endpoint attaches cached Salesforce token
    - Salesforce returns success or error
    - Endpoint passes reply back to webhook
    - Webhook retries temporary failures
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fg6xmi3mit62ybho269q1.webp
---

The author treats Salesforce's reply as the only proof that a call reached the CRM, so any non-success reply should trigger a retry. Because the Salesforce client credentials flow issues short-lived tokens with no refresh token, and the Dograh voice platform stores credentials only as fixed values, the design places a small HTTPS endpoint between the agent and Salesforce. That endpoint holds the Salesforce secret, caches tokens, and checks a fixed bridge key header before doing anything else.

The token logic fetches a token, reuses it, and on a 401 response fetches a fresh one and retries once, so nothing downstream has to handle expiry. For setup, the article recommends starting with an External Client App, since new Connected Apps are restricted from Spring '26. It advises enabling OAuth and the client credentials flow, running the app as a dedicated integration user with the Minimum Access - API Only Integrations profile, and granting only read on Contacts and Leads plus create on Tasks.

For inbound calls, a pre-call data fetch can search Contacts and Leads by phone number before the agent speaks, matching on the last 10 digits to handle inconsistent formatting. The author warns to keep this fast and to confirm identity with an approved check before using any Salesforce data. After the call, a webhook files a Task on the matched record, with TaskSubtype set to Call at creation since it cannot be changed later. Retries can file duplicates, so the endpoint should track the run_id of filed Tasks and skip repeats. The article closes with testing advice: check View Trace after a live call, and test an unknown caller.
