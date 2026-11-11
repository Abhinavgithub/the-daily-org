---
kind: alert
title: Salesforce disables Talent Rover integrations after suspicious token use
original_title: "Security Advisory: Salesforce Disables Talent Rover Integrations"
url: https://status.salesforce.com/generalmessages/20000271
source: Salesforce Trust
date: 2026-11-11
line: You will know that Talent Rover Connected Apps and managed packages are disabled in Salesforce orgs as a precaution, why, and that restoration depends on Bullhorn. The notice does not say whether any data was accessed.
flag: Security advisory
facts: Open · began 10 Nov 2026
model: anthropic/claude-haiku-5.5
---

Salesforce has disabled Talent Rover Connected Apps and managed packages as a precaution after spotting suspicious use of access tokens linked to this third-party provider, which is owned by Bullhorn. Salesforce states that the cause was not a vulnerability in the Salesforce platform itself, and that this was a protective step rather than a platform outage.

The affected integrations will stay unavailable until the security remediation is complete and Bullhorn has shown that they can be restored safely. Salesforce says it is still investigating and will notify impacted customers without undue delay if unauthorized access to their data is identified.

Admins and developers with Talent Rover in their orgs should expect the integration to be down and direct questions about the service or remediation to Bullhorn.
