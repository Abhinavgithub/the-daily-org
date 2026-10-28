---
title: Using latest for the REST API trades upgrade control for convenience
original_title: Latest comes with Strings Attached in Winter '27
url: https://bobbuzzard.blogspot.com/2026/10/latest-comes-with-strings-attached-in.html
source: Bob Buzzard Blog
source_type: community
date: 2026-10-28
section: releases
personas:
  - developer
  - architect
tags:
  - rest-api
  - api-versioning
  - winter-27
  - backward-compatibility
  - regression-testing
authors:
  - Bob Buzzard
why_read: You will learn what the latest alias for REST API versions changes, why it shifts upgrade timing onto your release testing, and why even fixed versions still depend on the current platform.
interest_score: 6
depth_score: 6
novelty_score: 5
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Fixed versions and latest differ in who decides when an upgrade happens
  left:
    heading: Fixed version
    points:
      - Upgrade is a planned event
      - Testing happens before the switch
      - Still runs on current platform
  right:
    heading: latest alias
    points:
      - Upgrade arrives with the release
      - No action needed to adopt it
      - Testing moves to release preview
  icons:
    - lock
    - bolt
image: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhmCH5hN8JcDRZi6wU0Pr94peGsFEHDIkDKTQ9ss-HSrzfaiMe7NwpW7hODAnD-lid5IM8YBG57qM-aQ5xlc8qkzKMu34ufvx5rvw3TN8WsiBb0nbIDjDC8DNKXUwe1Ul-o4Q8sHeOAqmGy9KPPFDSBa4OlJGqAPCQxZuoTKpzXs3Kt98SnT1AgBfg9Kju1/s72-c/latest.jpg
---

Winter '27 lets integrations target the REST API with the alias latest in place of an explicit version number such as v68.0. The alias removes the need to update integration versions every four months and spares you from tracking version retirements, since requests always reach the current release.

The author argues the convenience comes at a cost of control. An integration on latest picks up whatever Salesforce treats as current, so when the next version arrives, behavioral differences, new fields or updated metadata can reach your code without a planned upgrade. Salesforce recommends fixed versions for production integrations with a specific contract and latest for scripts and internal tools.

The post also points out that a fixed version does not fully protect you. Once a new version goes live, requests to older fixed versions are served by the current platform with backward compatibility applied, so the platform underneath you still changes. The author concludes that non-critical work can use latest, while critical integrations should stay on fixed versions and be regression tested every release.
