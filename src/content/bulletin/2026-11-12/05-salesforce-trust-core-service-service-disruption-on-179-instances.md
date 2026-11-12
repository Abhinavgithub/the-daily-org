---
kind: alert
title: Apex compilation and deployment disrupted on 179 instances after a release
original_title: "Core Service: service disruption on 179 instances"
url: https://status.salesforce.com/incidents/20004592
source: Salesforce Trust
date: 2026-11-12
line: You will learn that a recent Core Service release caused intermittent Apex compile and deploy failures on 179 instances, that it is now resolved by rollback, and what to watch for if your org was affected.
flag: Incident
facts: Resolved · began 10 Nov 2026 · 179 instances
model: anthropic/claude-haiku-5.5
---

Salesforce reports a service disruption affecting 179 instances of Core Service, beginning on 10 Nov 2026, which it now describes as resolved. The disruption affected customers on instances that received a recent software release, causing intermittent failures when compiling or deploying Apex code, and in some cases login failures and business processes that depend on the affected Apex code. Salesforce attributes the likely trigger to an update to a supporting runtime library in that release, has halted further deployment of the release, and has rolled affected instances back to the previous version, with a corrective release prepared as a fallback. Salesforce says it has apologized, will investigate the underlying cause and preventive action, and notes that the impact turned out to differ from its first understanding and that the posting has been updated accordingly. If you run instances affected by this release, check that Apex compile and deploy steps succeed and that any login-dependent processes are working; no further action is stated in the notice.
