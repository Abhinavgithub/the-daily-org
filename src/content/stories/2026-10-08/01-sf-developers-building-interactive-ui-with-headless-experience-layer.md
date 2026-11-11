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
  icons:
    - code
    - gear
    - plug
    - code
    - test
figure_image: /figures/2026-10-08/01-sf-developers-building-interactive-ui-with-headless-experience-layer.webp
---

The post introduces the Headless Experience Layer (HXL), part of Salesforce's Headless Toolkit, which lets developers define an interactive widget once in declarative JSON and have it render natively in Agentforce and in any MCP client that supports MCP Apps. Instead of an agent replying with plain text, the same action can return a branded card that looks and behaves consistently across channels. Widgets are composed from reusable components rather than built as Lightning Web Components or React apps, and they only display what the underlying Apex action returns, so existing sharing and field-level security still apply. HXL rests on three concepts: components, which are surface-aware UI primitives; widgets, which combine components into a use case; and Custom Lightning Types (CLTs), which describe the shape of the data and whose renderer tells the platform which widget draws it and how fields map onto its attributes.

The authors illustrate the approach with a review card from Pronto, their fictional food-delivery sample app. The card is built from four pieces: a global Apex invocable action (GetCustomerReviewsAction) that returns review data; a widget whose files live in a UiWidgetBundle, namely a registration XML file, a JSON composition built from tile blocks with a forEach loop for list items, and an optional schema; a CLT that binds the action's output to widget attributes using {!$attrs} and similar paths; and an agent output or MCP tool that marks the output as displayable. In Agentforce, the Agent Script sets is_displayable to True, and the model decides when to show the card, which in the authors' testing usually happens on the first question of a fresh conversation. For MCP clients such as Claude and ChatGPT, two nested CLTs are needed because the tool output is wrapped in an envelope; only the outer type carries the renderer, and an MCP server entry publishes it as a UI resource that the tool references. The HXL Playground offers a browser-based way to preview layouts with sample data, though previews may differ from the live experience.

The post closes with getting started steps: enable Headless Experience Layer (Beta) under Feature Settings in Setup, use API version 67.0 or later, clone and install the Pronto app, and optionally use the open-source Salesforce Skills library to generate widgets, CLTs and MCP types with an AI agent. It also points to a hands-on workshop, and it presents HXL as a way to deliver consistent interactive UI across agent surfaces with less integration code.
