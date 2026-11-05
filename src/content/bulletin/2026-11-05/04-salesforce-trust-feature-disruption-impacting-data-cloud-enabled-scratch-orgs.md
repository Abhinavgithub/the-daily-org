---
kind: alert
title: Data Cloud Scratch Org creation failing with INVALID_INPUT error
original_title: Feature Disruption Impacting Data Cloud - Enabled Scratch Orgs Creation Failure
url: https://status.salesforce.com/generalmessages/20000270
source: Salesforce Trust
date: 2026-11-05
line: You will learn that Data Cloud-enabled Scratch Org creation through Salesforce CLI is failing, the error that signals it, and that no workaround exists yet while a fix rolls out.
flag: Service notice
facts: Open · began 3 Nov 2026
model: anthropic/claude-haiku-5.5
---

Salesforce is investigating a problem that stops customers creating Scratch Orgs with Data Cloud features through Salesforce CLI. Affected requests fail with an INVALID_INPUT error saying that CustomerDataPlatformLite is not a valid feature value. Salesforce links the fault to a recent provisioning configuration rollout and is pushing a change across production to restore creation for eligible Dev Hubs.

No workaround is available for workflows that need Data Cloud features. Requests may keep failing until the configuration change reaches each environment. Salesforce will validate successful creation for eligible Dev Hubs once the change lands and will post further updates as progress is made.
