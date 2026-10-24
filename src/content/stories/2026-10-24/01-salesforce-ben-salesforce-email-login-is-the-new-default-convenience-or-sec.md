---
title: Salesforce makes email the default Login on its standard Login pages
original_title: "Salesforce Email Login Is the New Default: Convenience or Security Risk?"
url: https://www.salesforceben.com/salesforce-email-login-is-the-new-default-convenience-or-security-risk/
source: Salesforce Ben
source_type: community
date: 2026-10-24
section: devops
personas:
  - admin
  - developer
  - architect
tags:
  - login-salesforce-com
  - email-login
  - username-login
  - my-domain
  - passkeys
  - environment-switcher
authors:
  - Ross Collie
why_read: You will learn which login pages change and when, what stays the same for passkeys and MFA, and what admins should do about users, shared inboxes and automated UI tests before the rollout reaches production.
interest_score: 8
depth_score: 7
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Login order on login.Salesforce.com once email becomes the default
  steps:
    - Enter the email address
    - Receive a verification code by email
    - Choose the org in the environment switcher
    - Or click Login with Username
  icons:
    - mail
    - lock
    - layers
    - person
image: https://www.salesforceben.com/wp-content/uploads/2026/10/email1.webp
figure_image: /figures/2026-10-24/01-salesforce-ben-salesforce-email-login-is-the-new-default-convenience-or-sec.png
---

Salesforce has announced that the login pages at login.Salesforce.com and test.Salesforce.com will ask for an email address first, with username login still available through a Login with Username link. The change was first described in the Spring '26 release notes and was communicated to admins by email in September. Sandboxes are scheduled for August 2026 and production for October 2026, while mobile apps are tentatively planned for late 2026. My Domain and Experience Cloud login pages are not affected.

The article notes that a username-first experience is also being rolled out on My Domain login pages, and that Salesforce describes passkeys as the fastest, easiest and most secure way to sign in. Salesforce's stated reason for email login is a unified login process in which a user types one email and sees every org they can access. The author could not find a clear security rationale for the change. Email login sends a verification code, and the environment switcher lists the matching orgs. Problems arise when a user's email and username differ, or when one email maps to several usernames.

The community is split. Supporters find the flow smooth and note that passkeys reduce clicks. Consultants and partners with many orgs find the extra selection step costly. An IdeaExchange request asking Salesforce not to make email the default has gathered 760 points, arguing that an email lookup can reveal every environment tied to it. Salesforce said at True to the Core that email login still requires access to the inbox, and that it is working on auto-favoriting login hints for multi-org users. The article's advice is to check for shared inboxes, tell users to use the My Domain URL, and add ?login=1 to automated test URLs so they reach the username screen.
