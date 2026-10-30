---
kind: alert
title: B2C commerce On-Demand Sandboxes stuck Starting after expired certificate
original_title: "B2CCore: on demand sandbox ods service disruption on 6 instances"
url: https://status.salesforce.com/incidents/20004543
source: Salesforce Trust
date: 2026-10-30
line: The reader learns that an incident left Commerce Cloud On-Demand Sandboxes on six B2CCore instances unable to start, that an expired certificate was the cause, and that service has been restored.
flag: Incident
facts: Resolved · began 29 Oct 2026 · 6 instances
model: anthropic/claude-haiku-5.5
---

Commerce Cloud On-Demand Sandboxes on 6 instances of B2CCore were stuck in a Starting state from 29 Oct 2026, leaving customers unable to access or restart them. Salesforce identified an expired certificate as the cause, renewed certificates across the affected environments, and restarted the sandboxes. Salesforce has confirmed that service is restored and says a full investigation into the trigger, root cause and preventive action is under way. Affected customers can now access and restart their sandboxes, and no action is required beyond watching for the promised follow-up report.
