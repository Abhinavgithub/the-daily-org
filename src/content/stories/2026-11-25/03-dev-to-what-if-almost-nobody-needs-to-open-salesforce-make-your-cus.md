---
title: Running custom Apex actions in user mode for assistant-driven access
original_title: What if almost nobody needs to open Salesforce? Make your custom actions run in user mode
url: https://dev.to/juanma_garrido_1974/what-if-almost-nobody-needs-to-open-salesforce-make-your-custom-actions-run-in-user-mode-2gc6
source: dev.to
source_type: community
date: 2026-11-25
section: architecture
personas:
  - developer
  - architect
tags:
  - user-mode
  - apex-security
  - with-sharing
  - agentforce-actions
  - invocable-apex
  - copilotforce
authors:
  - Juan Manuel Garrido
why_read: You will learn why Apex invocable actions exposed to Copilot or agents should use with sharing, WITH USER_MODE and AccessLevel.USER_MODE, and how to test them under a low-privilege user with System.runAs.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the example action keeps the running user's permissions in force
  steps:
    - Declare the class with sharing
    - Query with WITH USER_MODE
    - Update with AccessLevel.USER_MODE
    - Return readable messages to the assistant
also:
  - title: Create and Update records in Salesforce Agentforce Coworker
    url: https://www.infallibletechie.com/2026/11/create-and-update-records-in-salesforce-agentforce-coworker.html
    source: InfallibleTechie
figure_image: /figures/2026-11-25/03-dev-to-what-if-almost-nobody-needs-to-open-salesforce-make-your-cus.png
---

The author starts from the Copilotforce announcement, in which Salesforce data is reached from Microsoft Copilot through authenticated user access that keeps existing permissions, Sharing Rules and audit trails. Standard writeback actions already respect these controls, but any custom invocable Apex, Flow calling Apex or REST endpoint is the developer's responsibility.

Apex runs in system mode by default, so an invocable method that queries a field the user cannot see will return that data to an assistant acting on their behalf. A class declared without with sharing also ignores the user's record access. When people worked mainly in the Salesforce UI, page layouts hid much of this; with Copilot, Claude or Slack as the interface, the server-side enforcement is what protects the data.

The article gives an example invocable class, ApprovePaymentAction, declared with sharing. Its SOQL uses WITH USER_MODE so field and object permissions apply, and its update uses Database.update with AccessLevel.USER_MODE and allOrNone set to false, so Validation Rule messages come back as strings the assistant can show. The author suggests writing those messages so they read well in a chat window.

The post closes with a runAs test that runs the action as a Standard User and asserts the approval is blocked, and a checklist: with sharing, WITH USER_MODE on every query, AccessLevel.USER_MODE on every DML, readable validation messages, field history tracking on changed fields, and a low-privilege runAs test for each exposed action.
