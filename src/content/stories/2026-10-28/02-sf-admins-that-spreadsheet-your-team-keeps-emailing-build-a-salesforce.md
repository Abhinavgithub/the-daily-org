---
title: Builder Central turns a requirements prompt into a working Salesforce app
original_title: That Spreadsheet Your Team Keeps Emailing? Build a Salesforce App With Builder Central
url: https://admin.salesforce.com/blog/2026/that-spreadsheet-your-team-keeps-emailing-build-a-salesforce-app-with-builder-central
source: Salesforce Admins Blog
source_type: official
date: 2026-10-28
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - builder-central
  - agentforce
  - beta
  - declarative-config
  - custom-object
  - permission-set
authors: []
why_read: You will learn how Builder Central plans and builds a Custom Object, List View and Permission Set from a plain-language prompt, what it leaves for the Admin to finish, and how it fits beside Lightning App Builder and Flow Builder.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The order in which Builder Central moved the Bulk Delivery Management app from prompt to live use
  steps:
    - Describe the app in a prompt
    - Review the project plan
    - Build in a separate workspace
    - Publish to the org
    - Assign the Permission Set
  icons:
    - doc
    - check
    - gear
    - cloud
    - lock
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20261026100852/Image-1-Spreadsheet.png
---

The author tested Builder Central, a beta conversational workspace for planning, building, previewing and deploying Salesforce apps and agents from plain language. He described a spreadsheet replacement app in one prompt, naming a Custom Object and its fields, and Builder Central first produced a project plan for review before building anything in its own separate workspace.

After the initial build it suggested extra customization, such as a List View, which he accepted. He published the app, asked Builder Central to assign the Permission Set to his user, and then opened the app from the App Launcher. The build took about 12 minutes in real time, though he sped up parts of the video.

The result was not complete: the record page did not show all fields, so he adjusted it in Lightning App Builder. He argues the change matters less for saving time than for shortening the loop between requirements meetings and a working prototype, while Admins still own permissions, automation, user experience and testing. He recommends trying it in a sandbox, recreating an existing app conversationally, and checking the beta limitations.
