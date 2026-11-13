---
title: Threat actors are using the ARTEX framework against Salesforce orgs; here is how to defend
original_title: "Agentic AI Attacks Are Here: What We’re Seeing with ARTEX, and How to Protect Your Org"
url: https://www.salesforce.com/blog/artex-agentic-ai-attacks/
source: Salesforce Blog
source_type: official
date: 2026-11-13
section: architecture
personas:
  - admin
  - architect
  - developer
tags:
  - agentic-ai-attacks
  - connected-apps
  - named-credentials
  - phishing-resistant-mfa
  - event-monitoring
  - oauth-tokens
authors: []
why_read: You will learn how an AI-driven attack against Salesforce environments behaves, what Salesforce Threat Intelligence has observed, and which controls to put in place now.
interest_score: 8
depth_score: 7
novelty_score: 7
utility_score: 9
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: steps
  caption: How the ARTEX-assisted campaign moved through a Salesforce org, from access to persistence
  steps:
    - Use stolen application credentials
    - Relay traffic through Apex and Named Credentials
    - Inspect existing Apex and integration settings
    - Deploy custom Apex and REST endpoints
    - Enumerate users, profiles and Permission Sets
    - Retry code-execution and integration paths
  icons:
    - lock
    - flow
    - search
    - code
    - people
    - rocket
figure_image: /figures/2026-11-13/01-sf-blog-agentic-ai-attacks-are-here-what-we-re-seeing-with-artex-and.png
---

Salesforce Threat Intelligence reports that several threat actors are using ARTEX, an open-source, multi-agent offensive framework originally built for autonomous penetration testing. A malicious operator supplies a target and an objective, and AI agents coordinate the intrusion, combining known attack techniques with continuous planning, parallel execution and on-the-fly code generation. The framework's GitHub repository was taken down, but community forks still circulate, and the authors treat ARTEX as an accessible capability rather than a tool tied to one actor. Other vendors report its use by a state-aligned actor against Microsoft 365 tenants and by financially motivated groups against financial organizations.

Salesforce observed a campaign that used stolen application credentials and trusted integration sessions against customer environments. The company states that the activity did not stem from a flaw in the Salesforce platform and that affected customers were notified directly. The observed behavior included using Salesforce as a relay through Apex and abused Named Credentials, inspecting existing Apex and integration settings before deploying custom Apex, REST endpoints and Visualforce components, and testing the compromised account's effective permissions by enumerating users, profiles and Permission Sets. The attackers kept retrying code-execution and integration paths, including anonymous Apex, and audit logs showed rapid, dynamic automation that Salesforce reads as an agentic-like operator.

The recommended defenses are phishing-resistant MFA for all users, with Salesforce already enforcing it for admins and MFA for all users, User Email Domain Restrictions, short-lived context-bound OAuth tokens, and step-up authentication for sensitive actions such as bulk export and permission changes. Also recommended are IP allowlisting for users and Connected Apps, behavioral detection of full attack sequences, Event Monitoring streamed to a SIEM, regular scanning of repositories for exposed secrets, and a response plan able to disable an integration, revoke tokens and reset credentials within hours.
