---
title: Automate temporary access management with Permission Set expiration dates
original_title: "Stop Manually Removing Salesforce Permissions: Assign Permission Sets That Expire on Their Own"
url: https://dev.to/rohanmehta/stop-manually-removing-salesforce-permissions-assign-permission-sets-that-expire-on-their-own-12db
source: dev.to
source_type: community
date: 2026-10-13
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - permission-set
  - assignment-expiration
  - security-governance
  - temporary-access
authors:
  - Rohan Mehta
why_read: You will learn how to configure automatic expiration dates on Permission Set assignments and manage them individually or in bulk. The piece outlines best practices for temporary access scenarios and highlights important considerations for compliance and user communication.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 8
model: qwen/qwen3.7-flash
figure:
  kind: compare
  caption: Contrasting manual permission revocation with automatic expiration dates
  left:
    heading: Old Method
    points:
      - Manually remove permissions later
      - Trust memory or calendar reminders
      - Use deprecated session-based activation
  right:
    heading: New Automation
    points:
      - Set expiration on Permission Set assignments
      - Choose fixed dates or relative day counts
      - Automatically lapse access for clean audits
figure_image: /figures/2026-10-13/04-dev-to-stop-manually-removing-salesforce-permissions-assign-permiss.webp
---

Salesforce now allows administrators to set expiration dates directly on Permission Set assignments, eliminating the need for manual revocation of temporary access.

Administrators can configure expirations when adding individual assignments or use the Manage Assignment Expiration action in Setup for bulk updates. The system supports both fixed calendar dates and relative day counts for recurring temporary needs.

The feature benefits contractors, project teams, and compliance audits by ensuring access lapses automatically. The author warns that expiration happens silently, recommends automating recurring assignments with Flow, and notes that this model replaces the deprecated session-based activation approach.
