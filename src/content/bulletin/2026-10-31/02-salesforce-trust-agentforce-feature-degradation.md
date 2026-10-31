---
kind: alert
title: Agentforce customers using third-party LLMs hit errors, now resolved
original_title: Agentforce Feature Degradation
url: https://status.salesforce.com/generalmessages/20000269
source: Salesforce Trust
date: 2026-10-31
line: You will learn that a third-party LLM provider's change caused Agentforce errors for some customers, that it was rolled back, and that service is back to normal. It is the final update, so you need take no further action beyond checking your own logs if you saw 4xx errors.
flag: Service notice
facts: Resolved · began 30 Oct 2026
model: anthropic/claude-haiku-5.5
---

Salesforce reports a feature degradation affecting a subset of Agentforce customers. The cause was a change made by a third-party service provider that supplies some of the large language models Agentforce uses. Customers using those third-party LLMs saw 4xx errors, and some features were unavailable or slower than normal. The provider rolled back the change and applied a follow-up fix, and service has returned to normal.

This is the final update to the notice. Salesforce says it will investigate to confirm the root cause and the steps it will take to prevent a recurrence. Its message does not name the provider or give a time window for the incident.

Affected admins and developers do not need to take action beyond confirming that Agentforce calls that use third-party models are succeeding again and reviewing any failed requests from the incident period.
