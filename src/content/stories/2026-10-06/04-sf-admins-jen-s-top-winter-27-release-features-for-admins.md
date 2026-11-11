---
title: Winter 27 release adds inline editing, sharing controls, email security, and report previews
original_title: Jen’s Top Winter ’27 Release Features For Admins
url: https://admin.salesforce.com/blog/2026/jens-top-winter-27-release-features-for-admins
source: Salesforce Admins Blog
source_type: official
date: 2026-10-06
section: releases
personas:
  - admin
  - architect
tags:
  - list-view-inline-editing
  - user-field-history-tracking
  - sharing-rules
  - email-domain-verification
  - lightning-reports
  - winter-27-release
authors: []
why_read: You will learn how to configure new Winter 27 capabilities that improve List View editing, preserve manual sharing during record transfers, streamline email domain verification, and enhance Lightning Reports and Dashboards.
interest_score: 6
depth_score: 4
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20261001111316/ListViews-InlineEditing-300x160.gif
---

The Salesforce Admins Blog has published a launchpad for the Winter '27 release, which ships three times a year and is 600-plus pages of notes. The author urges admins to focus on the features that matter to their own org rather than reading everything. The post also explains that features move through pilot, beta and generally available (GA) stages, with beta features carrying limited support and best tested in a sandbox.

On the core platform, two new User Interface Settings let users inline-edit any field they can access, even if it is not on the page layout, and let List Views mix record types. Both are off by default. User field history tracking reaches GA, covering up to 20 fields on the User object and retaining history in the UI for 18 months. The standard Follow button can also be shown in the Dynamic Highlights Panel. For sharing, a setting now keeps manual shares when a record's owner changes, and a forward-looking note says custom row causes for standard objects are targeted for October 10 through the Metadata API.

The security and email section covers a consolidated User Email Domains page in Setup, which shows verified and unverified address counts per domain. Admins can copy verified authorized domains from production into a new sandbox with one click, and set verification to Always, For Updated Addresses Only, or Never for each domain. Secondary sender addresses let sensitive emails route through Salesforce's own Mail Transfer Agent. Experience Cloud Trusted URLs can now take individual Chrome extension IDs, with wildcards unsupported.

The Reports, Dashboards and Flow sections are the longest. Beta features include record previews in Lightning Reports, a Common Rows Only option for joined reports, and Lightning Reports and Dashboards embedded in LWR Experience Cloud sites. Flow Builder adds version Edit History with restore, element grouping, an Unused resource filter, Agent Action details in the canvas, and a User Context run option for flows using API version 68.0 or later. It also brings auto-generated element labels, persistent end elements, and save-time warnings for missing required fields and field length. Flows can now retry on record lock errors, Screen Flows can run as mass actions from List Views and Related Lists, and a native Time component is available. Beta Test Mode and mock outputs for Action and Subflow elements round out the testing tools.
