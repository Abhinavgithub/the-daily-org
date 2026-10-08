---
title: Building interactive UI with the Headless Experience Layer for Agentforce and MCP clients
original_title: Building Interactive UI with Headless Experience Layer
url: https://developer.salesforce.com/blogs/2026/10/building-interactive-ui-with-hxl
source: Salesforce Developers Blog
source_type: official
date: 2026-10-08
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - headless-experience-layer
  - agentforce
  - custom-lightning-types
  - mcp
  - apex-invocable-method
authors:
  - Akshata Sawant
why_read: You will learn how to structure declarative JSON widgets, bind them to Apex data using Custom Lightning Types, and configure Agentforce to render interactive cards instead of plain text.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261007104934/DoubleHeadshot-8-e1791395412468.png?w=1000
figure:
  kind: steps
  caption: Workflow for building and testing interactive widgets with HXL
  steps:
    - Write an Apex invocable method to return data
    - Package the layout into a UiWidgetBundle
    - Link output shape to widget via renderer config
    - Update Agent Script to mark data displayable
    - Test layouts in HXL Playground before deploy
figure_image: /figures/2026-10-08/01-sf-developers-building-interactive-ui-with-headless-experience-layer.webp
---

The Headless Experience Layer extends the Headless Toolkit by allowing developers to replace plain-text agent responses with consistent, interactive cards across Agentforce and Model Context Protocol clients. Widgets are defined as declarative JSON trees rather than traditional web frameworks, ensuring that branding and layout remain uniform regardless of the interface where the agent operates.

The architecture relies on three main parts: reusable surface-aware components, the widget composition file, and Custom Lightning Types that bridge data structures to UI attributes. Because the widget only displays what the backend returns, existing Sharing Rules and field-level security automatically apply without extra integration code.

Implementation begins with an Apex invocable method that calculates and returns structured data. Developers then package the layout into a UiWidgetBundle containing metadata and optional schema files, and link the output shape to the widget via a renderer configuration. The final step involves updating the Agent Script to mark the complex data type as displayable, while the HXL Playground provides a browser-based environment for testing layouts before deployment.
