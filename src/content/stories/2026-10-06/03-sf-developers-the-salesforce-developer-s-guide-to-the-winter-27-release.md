---
title: Winter 27 release brings Headless Toolkit, Multi Framework support, and Data SDK extensions
original_title: The Salesforce Developer’s Guide to the Winter ’27 Release
url: https://developer.salesforce.com/blogs/2026/10/developers-guide-to-the-winter-27-release
source: Salesforce Developers Blog
source_type: official
date: 2026-10-06
section: releases
personas:
  - developer
tags:
  - winter-27-release
  - headless-toolkit
  - multi-framework
  - data-sdk
  - salesforce-cli
authors:
  - Mohith Shrivastava
why_read: Readers will learn how to build cross-framework applications on the platform using the new Headless Toolkit and understand how to extend the Data SDK with custom logic.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261005111025/Dev-Blog-1000x563-2.png?w=1000
---

The Winter ’27 release, whose final rollout is set for October 9, 2026, centers on the Headless Toolkit. Salesforce capabilities are exposed as APIs, Model Context Protocol (MCP) tools and CLI commands that any authenticated caller can use. The Salesforce Development plugin for Claude Code adds Salesforce-specific skills, org context and recommendations for specialized plugins, and its skills also work with other coding agents. Multi-Framework apps now support Angular alongside React, with new templates, 2GP packaging and a Data SDK that can package custom logic as typed extensions. Beta microfrontends let an app run inside a Lightning page, with data passed down from the host component and events sent back up.

The Headless Experience Layer (Beta) lets a developer define a widget once and render it in Agentforce, Claude and Slackbot, linked through Apex, Lightning type and widget metadata. MCP now works in both directions, so Agentforce agents can be exposed as tools on custom MCP servers and AgentExchange MCP tools can be added to agents. The Marketing Cloud Engagement MCP server gains 40 tools. The CLI stops printing access tokens and secrets, with the temporary workaround ending October 28, 2026, and it adds async Apex templates and Scratch Org settings. API version 68.0 requires the Use Any API Auth permission for SOAP login from December 1, 2026, retires API versions 31.0 through 40.0, and adds a latest alias for REST URIs.

In Lightning Web Components, template expressions and LWC:external reach general availability, and state managers gain a refresh() method. Apex heap limits rise to 10 MB for synchronous and 25 MB for asynchronous transactions, and integration tests, FORMULA() and the Apex Symbol API are in preview or beta. Agentforce gains new Agent Script language features, file uploads in conversations, and generally available Multi-Agent Orchestration, along with simplified agent metadata types. Data 360 adds a context precision metric for retrievers and Python code extensions for zero-copy data. Web Console, a browser-based IDE, is generally available and needs no installation.
