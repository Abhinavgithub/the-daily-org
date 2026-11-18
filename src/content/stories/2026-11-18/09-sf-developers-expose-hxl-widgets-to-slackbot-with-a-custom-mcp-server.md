---
title: Exposing HXL widgets to Slackbot through a custom MCP server
original_title: Expose HXL Widgets to Slackbot with a Custom MCP Server
url: https://developer.salesforce.com/blogs/2026/11/expose-hxl-widgets-slackbot-custom-mcp-server
source: Salesforce Developers Blog
source_type: official
date: 2026-11-18
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - headless-experience-layer
  - mcp-server
  - slackbot
  - hxl-widgets
  - salesforce-org-connection
authors:
  - Akshata Sawant
why_read: You will learn what a custom MCP server needs before Slackbot can render HXL widgets, how to connect Slack through the Salesforce Org Connection, and how to set tool permissions and descriptions so the right tool is chosen. You will also see how to troubleshoot a missing card.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Steps to make an HXL widget appear in Slackbot, in the order the article gives them
  steps:
    - Check the MCP server definition
    - Map users by Federation ID
    - Request and approve the org connection
    - Add the MCP server in Slack admin
    - Turn on the server and set tool permissions
  icons:
    - check
    - person
    - plug
    - server
    - shield
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261111122654/SingleHeadshot-15-e1794428825146.png?w=1000
also:
  - title: Orchestrate Salesforce Agentforce Agent in Slackbot
    url: https://www.infallibletechie.com/2026/11/orchestrate-salesforce-agentforce-agent-in-slackbot.html
    source: InfallibleTechie
---

The article explains how to make an existing HXL widget appear in Slackbot. If a widget already renders in Claude or ChatGPT, it can render in Slackbot without changes to the widget, the Apex action or the Custom Lightning Types. The remaining work is configuration: deciding how Slack connects to the Salesforce MCP server, who can use it, and which tools Slackbot may run. The author uses the Pronto sample app to show a storefront card and a follow-up menu card.

Before connecting, the server must be active, every resource needs a description, each tool's uiResource must match a resourceName, and each tool's readOnly and destructive flags must be set. Slackbot treats unclassified tools as write tools, which adds confirmation prompts. The connection itself is made through the Salesforce Org Connection: users are mapped by Federation ID, the org is requested and approved from Slack and Setup, and the MCP server is added in Slack admin and confirmed by a Date added value.

Each user then turns on the server in Slackbot and approves tools, choosing Allow once, Always allow or Deny per tool. Two limits apply: up to five active servers per user, and a 60-second timeout per call, with stateless calls that rerun the Apex action, so calls should stay small. Overlapping tools on other servers or Slackbot's own Salesforce search can cause a plain table instead of the card, so descriptions should be specific.

The troubleshooting section maps common symptoms, such as plain text, missing tools, or blank values, to causes and fixes. Testing with a debugging tool like MCP Inspector helps separate server definition problems from Slack problems.
