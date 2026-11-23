---
kind: alert
title: Salesforce disables Every.org Connected App after exposed credentials
original_title: "Security Advisory: Every[.]org Connected Applications"
url: https://status.salesforce.com/generalmessages/20000279
source: Salesforce Trust
date: 2026-11-23
line: You will learn that Salesforce has cut off the Salesforce_for_Every Connected App and its managed packages from customer instances while Every.org fixes exposed credentials, and what to do about the integrations that depend on it.
flag: Security advisory
facts: Open · began 22 Nov 2026
model: anthropic/claude-haiku-5.5
---

Salesforce has disabled connections from its Salesforce_for_Every Connected App and associated managed packages to customer instances, as a precaution after Every.org reported exposed credentials. Salesforce says this was a protective measure, not a platform outage, and that the core Salesforce platform has no vulnerability involved. Customers with questions about Every.org services or the remediation should contact Every.org directly.

Salesforce and Every.org are working together to restore the affected integrations safely. The integrations will stay unavailable until Every.org completes its security remediation and shows that they can be restored without risk. Salesforce will notify affected customers without undue delay if it finds unauthorized access to their data.

Administrators who rely on this Connected App or its managed packages should expect those integrations to be down for now and plan accordingly. They should also watch the Salesforce Trust notice for restoration news and check their own Connected Apps and stored credentials.
