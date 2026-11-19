---
title: Salesforce response to a compromised Optimizely script on its websites
original_title: Our response to the Optimizely “OPTIMJACK” supply chain compromise
url: https://www.salesforce.com/blog/our-response-to-the-optimizely-optimjack-supply-chain-compromise/
source: Salesforce Blog
source_type: official
date: 2026-11-19
section: architecture
personas:
  - admin
  - architect
  - developer
tags:
  - optimizely
  - supply-chain-security
  - third-party-scripts
  - incident-response
  - experience-cloud
authors: []
why_read: You will learn how the Optimizely compromise reached Salesforce web properties, what Salesforce has disabled, and which third-party scripts to audit in your own Experience Cloud, Commerce Cloud and Marketing Cloud pages.
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: timeline
  caption: The incident ran from the November 16 exposure window through Salesforce's response and the actions it recommends
  events:
    - when: 16 Nov 2026
      label: Exposure window, about 04:00 to 21:00 UTC
    - when: 16 Nov 2026
      label: Researcher reports 188 compromised files
    - when: 17 Nov 2026
      label: Optimizely confirms the malicious code
    - when: Now
      label: Admins audit for Optimizely snippets
  icons:
    - warning
    - search
    - check
    - shield
---

On November 16, 2026, an attacker exploited a vulnerability in Optimizely, a third-party experimentation platform, and inserted malicious JavaScript into some customer projects. The injected code sat in the Project JavaScript field, which runs on every page. Because the files were still served from Optimizely's trusted content delivery network, browsers and many security tools treated them as legitimate. Security researcher Scott Helm reported 188 compromised files across 178 organizations, Salesforce among them.

Salesforce says unauthorized changes were made to Optimizely scripts used on certain of its websites, and that those scripts could load malicious code in visitors' browsers. As a precaution, it disabled Optimizely scripts across preview and production instances, and they will stay off until Optimizely's remediation is verified, with no timeline to re-enable. Salesforce states it has no evidence the incident affected Salesforce-platform or subscription services. It is following its vulnerability response processes, monitoring for malicious activity, and will notify affected customers if it finds unauthorized access to their data.

The post says the exposure window ran from about 04:00 to 21:00 UTC on November 16. Optimizely says the vulnerability is closed and the injected code has been removed. Its statement points to the account signup flow as the route in.

If you build or host web applications on Salesforce platforms, you are affected only if your own team embedded Optimizely Web Experimentation scripts in them. Salesforce recommends that admins audit Experience Cloud sites, Commerce Cloud storefronts and Marketing Cloud landing pages for Optimizely snippets. Where a customer-facing site used an affected project on November 16, review application logs and watch for payment-form tampering and unusual session activity, such as logins or token use from unfamiliar locations.
