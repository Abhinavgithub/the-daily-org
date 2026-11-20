---
title: Rolling out multi-factor authentication across a Salesforce org in stages
original_title: "Salesforce MFA: Setting Up Multi-Factor Authentication for Your Org"
url: https://dev.to/rohanmehta/salesforce-mfa-setting-up-multi-factor-authentication-for-your-org-f5m
source: dev.to
source_type: community
date: 2026-11-20
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - mfa
  - identity-verification
  - security-keys
  - salesforce-authenticator
  - login-history
authors:
  - Rohan Mehta
why_read: You will know how to choose verification methods, phase an MFA rollout to avoid a backlash, handle integration and exception accounts, and prepare recovery procedures before users get locked out.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A staged MFA rollout runs from a pilot to profile-by-profile enablement
  steps:
    - Pick verification method
    - Pilot with administrators
    - Fix friction over one week
    - Roll out profile by profile
    - Review enrollment monthly
  icons:
    - shield
    - people
    - search
    - layers
    - check
---

The article opens by framing MFA as a requirement for Salesforce sign-in, since a password alone no longer protects customer data in an org. It then sets out a five-part plan for the admin running the rollout. The first step is choosing a verification method: the Salesforce Authenticator app as the smooth default, a third-party TOTP app, or a physical security key, with keys recommended for System Administrators and users with broad data access.

The second step is staging the rollout. The author suggests enabling MFA under Setup, Identity Verification, starting with System Administrators and a small pilot group, running the pilot for a week, fixing friction such as missed enrollment emails or shared devices, and then rolling out profile by profile rather than all at once.

The third and fourth steps cover exceptions and non-human access. Users who cannot use a phone app, such as shared service accounts or kiosk logins, should use a security key or hardware token with a documented owner and review date. API-only and integration users should rely on OAuth flows or locked-down integration users, and the Login History report should be reviewed monthly for logins that bypassed MFA.

The final step is preparing users for recovery, since a new phone lockout is the most common support ticket. The author recommends a one-page guide and admin reset of MFA registration from the user's record. The article closes by treating MFA as ongoing work, with monthly enrollment checks and quarterly exception reviews.
