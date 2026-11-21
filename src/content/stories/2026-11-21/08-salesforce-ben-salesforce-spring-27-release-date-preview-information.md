---
title: Spring '27 upgrade dates and how to find yours
original_title: Salesforce Spring ‘27 Release Date + Preview Information
url: https://www.salesforceben.com/salesforce-spring-27-release-date-preview-information/
source: Salesforce Ben
source_type: community
date: 2026-11-21
section: releases
personas:
  - admin
  - developer
  - architect
tags:
  - spring-27
  - release-schedule
  - sandbox-preview
  - trust-maintenance
  - pre-release-org
authors:
  - Lauren Metcalf
why_read: You will know where to check when your production instance and sandbox receive Spring '27, and why to test before the upgrade. The article gives the main release weekends and sandbox preview dates but not the release notes themselves.
interest_score: 6
depth_score: 4
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: timeline
  caption: Key Spring '27 dates for production and sandboxes
  events:
    - when: 9-10 Jan 2027
      label: Sandbox upgrade weekend
    - when: 10 Jan 2027
      label: Sandbox preview period begins
    - when: 16 Jan 2027
      label: Main release weekend
    - when: 6 Feb 2027
      label: Main release weekend
    - when: 20 Feb 2027
      label: Main release weekend
---

Salesforce Spring '27 is approaching, and the article argues that admins need to know when their environments will be upgraded in order to prepare. It recommends testing key functions in production before the Winter '27 release lands, even though upgrades rarely cause major problems.

The release date for each instance depends on which instance the org runs on. The main release weekends listed are January 16, February 6 and February 20, 2027. To find an exact date, the article says to open Salesforce Trust, search by instance name or domain, and select Maintenance. If the instance is unknown, Company Information in Setup shows it.

Sandboxes are the chance to test the new release against your own configuration. Sandboxes are either Preview or Non-Preview instances, and each has its own upgrade window. The Spring '27 sandbox preview period begins on January 10, 2027, with upgrade activity over the January 9-10 weekend, though the exact date depends on the instance. A pre-release org is useful for a first look, but it does not contain your setup.

The article notes that release notes are the most anticipated item, and that they will be linked once published.
