---
title: How Salesforce suspends third-party Apps and how they are restored
original_title: Understanding Salesforce Connected App or External Client App Suspension
url: https://www.salesforce.com/blog/understanding-salesforce-connected-app-or-external-client-app-suspension/
source: Salesforce Blog
source_type: official
date: 2026-11-24
section: architecture
personas:
  - admin
  - architect
  - developer
tags:
  - connected-apps
  - external-client-apps
  - app-suspension
  - oauth
  - agentexchange
  - managed-packages
authors: []
why_read: You will learn what triggers a suspension of a Connected App or External Client App, what it does to your integrations, how the developer must remediate before restoration, and which OAuth and permission practices reduce your exposure.
interest_score: 7
depth_score: 7
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: steps
  caption: The stages Salesforce follows when it suspends a third-party app and then restores it
  steps:
    - Suspend app and revoke its tokens
    - De-list or restrict Managed Packages
    - Contact the developer and set requirements
    - Notify customers via Trust site
    - Developer contains and remediates root cause
    - Pass updated security review or assessment
    - Salesforce restores app to service
  icons:
    - lock
    - warning
    - people
    - mail
    - search
    - check
    - rocket
---

Many Connected Apps and External Client Apps are built and maintained by third parties and distributed through AgentExchange and other marketplaces. Customers choose whether to connect them, and remain responsible for how they interoperate with their orgs. Salesforce says it will suspend an app as a preventive measure when there is reason to believe customer data is at risk, for example after potentially malicious activity, a credible security incident reported by industry or government partners, or failure to meet the published security requirements.

A suspension revokes the app's access and refresh tokens and blocks new authorizations, so dependent integrations stop and credentials issued before the suspension no longer work. Salesforce may also de-list or restrict Managed Packages on AgentExchange, while it contacts the developer, sets out restoration requirements, and posts notices on the Salesforce Trust site. Customers are notified directly if there is evidence of unauthorized access to their data.

Restoration depends on the developer. They must explain how they contained and remediated the root cause, show that compromised credentials can no longer be used, and provide a quote from a third-party breach response provider confirming containment. They must also meet the Connected App and External Client App security control requirements and pass an updated AgentExchange security review or an independent assessment at their own expense. A previous review or existing listing does not clear an app to return. When the app comes back, customers should re-authorize it and review the access they grant.

The post also sets out customer practices: validate OAuth controls before installing and use the Insights tool for installed apps, set Permitted Users to admin-approved users so access is granted through Profiles or Permission Sets, and review requested OAuth scopes against what the app needs. For server-to-server integrations, give each integration its own integration user, and prefer the JWT Bearer Flow over shared secrets.
