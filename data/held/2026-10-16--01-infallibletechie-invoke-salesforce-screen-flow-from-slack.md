---
title: How to invoke a Salesforce Screen Flow directly from a Slack workspace
original_title: Invoke Salesforce Screen Flow from Slack
url: https://www.infallibletechie.com/2026/10/invoke-salesforce-screen-flow-from-slack.html
source: InfallibleTechie
source_type: community
date: 2026-10-16
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - slack-integration
  - screen-flow
  - flow-builder
  - sales-cloud-for-slack
  - message-routing
authors:
  - Magulan Duraipandian
why_read: Readers will learn the exact steps to configure the Sales Cloud for Slack integration and route a Screen Flow into a Slack channel or direct message without leaving their messaging app.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.infallibletechie.com/wp-content/uploads/2026/10/Enable-Slack-Apps-Salesforce--841x1024.png
---

The article outlines a method for running a Salesforce Screen Flow inside Slack by leveraging the Sales Cloud for Slack application. It begins with the prerequisite one-time connection between the Salesforce org and a Slack workspace, followed by assigning a Permission Set that includes system permissions for managing Slack app organization connections and user mappings.

Administrators must enable the Sales Cloud for Slack feature in Setup and install the corresponding app in their Slack directory. Once connected, creators can design a standard Screen Flow in Flow Builder and activate a hidden advanced setting labeled Make available in Slack during the save process.

To actually trigger the flow, a second autolaunched or Record-Triggered Flow acts as an invoker. This parent flow uses an action element to call the enabled Screen Flow, passing a Slack conversation identifier to determine whether the interactive button appears in a public channel or a private direct message. The piece concludes by noting that Salesforce automatically generates a background action for each enabled flow and advises clear button labeling for end users.
