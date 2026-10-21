---
title: Custom sharing reasons now roll out for standard objects alongside a setting to preserve manual shares
original_title: "Protect Apex Shares: Custom Row Causes on Standard Objects"
url: https://developer.salesforce.com/blogs/2026/10/protect-apex-shares-custom-row-causes-on-standard-objects
source: Salesforce Developers Blog
source_type: official
date: 2026-10-21
section: apex-and-platform
personas:
  - developer
  - admin
  - architect
tags:
  - apex-managed-sharing
  - custom-row-causes
  - standard-objects
  - metadata-api
  - sharing-model
authors:
  - Larry Tung
why_read: You will learn how to use the new custom sharing reason feature on standard objects and configure the org-wide setting that keeps manual shares intact during record transfers. The article provides exact metadata and Apex examples so you can implement these changes immediately.
interest_score: 8
depth_score: 7
novelty_score: 8
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261020075852/Generic-A-10-e1792508344254.png?w=1000
figure:
  kind: compare
  caption: Two new Salesforce sharing features help records keep access after owner changes
  left:
    heading: Keep Manual Shares
    points:
      - Available immediately in Sharing Settings
      - Keeps user manual shares after ownership changes
      - Best for teams relying on manual distribution
  right:
    heading: Custom Row Causes
    points:
      - Rolls out via Metadata API through October
      - Defines programmatic sharing reasons in code
      - Best for developers using Apex or Flow
figure_image: /figures/2026-10-21/01-sf-developers-protect-apex-shares-custom-row-causes-on-standard-objects.webp
---

Salesforce is introducing two enhancements to the sharing model that eliminate long-standing workarounds for standard object access control. The first is an org-wide toggle called Keep Manual Shares when Transferring Records, which is available immediately in Sharing Settings. Enabling it ensures that manual shares survive ownership changes without requiring custom code or triggers.

The second enhancement rolls out through October and allows developers to define custom row causes on standard objects using the Metadata API. Previously, Apex managed sharing was restricted to Custom Objects. The update lets you declare a sharing reason like On Call Expert directly in the CustomObject metadata, then reference it in Apex share records or Flow actions. This separation keeps programmatic shares distinct from user manual shares and prevents automatic deletion when owners change.

The guidance recommends evaluating existing code that creates CaseShare, AccountShare, or similar records. Teams building shares via Apex or Flow should migrate to custom row causes to maintain auditability and stability. Those relying purely on manual distribution can simply enable the preservation setting. Both features arrive ahead of November updates that will bring management capabilities to Agentforce and Setup.
