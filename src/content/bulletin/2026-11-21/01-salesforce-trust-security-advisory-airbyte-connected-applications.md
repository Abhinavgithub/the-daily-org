---
kind: alert
title: Salesforce disables the Airbyte Connected App after suspicious activity
original_title: "Security Advisory: Airbyte Connected Applications"
url: https://status.salesforce.com/generalmessages/20000278
source: Salesforce Trust
date: 2026-11-21
line: You will learn that Salesforce has cut off connections from the Airbyte Connected App, why, and that the integrations stay down until Airbyte completes remediation. You will also know to contact Airbyte directly for questions.
flag: Security advisory
facts: Open · began 20 Nov 2026
model: anthropic/claude-haiku-5.5
---

Salesforce has disabled connections from the Airbyte Connected App to Salesforce customers' instances as a precaution. The step follows suspicious activity associated with Airbyte, the third-party provider. Salesforce says this was a security measure, not a platform outage or a vulnerability in the core Salesforce platform.

Affected integrations will stay unavailable until Airbyte completes its security remediation and shows they can be restored safely. Salesforce and Airbyte are working together on the restoration. Customers with questions about Airbyte services or the remediation should contact Airbyte directly.

Salesforce says it will notify affected customers without undue delay if it finds unauthorized access to their data resulting from the issue. Admins and integration owners who rely on Airbyte should expect the sync to stay down and check for any notice from Salesforce or Airbyte.
