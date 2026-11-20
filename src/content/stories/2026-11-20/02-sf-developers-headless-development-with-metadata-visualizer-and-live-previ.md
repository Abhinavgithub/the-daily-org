---
title: Two VS Code extensions bring visual context back to agent-driven Salesforce work
original_title: Headless Development with Metadata Visualizer and Live Preview
url: https://developer.salesforce.com/blogs/2026/11/headless-development-with-metadata-visualizer-and-live-preview
source: Salesforce Developers Blog
source_type: official
date: 2026-11-20
section: devops
personas:
  - developer
  - admin
tags:
  - vs-code
  - metadata-visualizer
  - live-preview
  - headless-toolkit
  - agent-skills
authors:
  - Philippe Ozil
why_read: You will learn what the Metadata Visualizer and Live Preview VS Code extensions show, which metadata types and UI bundles they cover, and how to open them. It helps you judge whether they fit a workflow built on agents and the Headless Toolkit.
interest_score: 6
depth_score: 6
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Editing a Permission Set with and without the Headless Toolkit
  left:
    heading: Setup and XML route
    points:
      - Retrieve long XML file
      - Navigate Setup to change permissions
      - Retrieve updated metadata
      - Commit changes to version control
  right:
    heading: Headless Toolkit route
    points:
      - Query and modify from terminal
      - Edit metadata locally
      - No retrieve after changes
      - Run operations in parallel
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261118075858/SingleHeadshot-16-e1795017556230.png?w=1000
---

Building with agents lets developers skip many Setup clicks, but it removes the visual context that makes Flows and Permission Sets easy to grasp. The post presents two VS Code extensions, Metadata Visualizer and Live Preview, as a way to restore that context. It frames them as the visual companion to the Headless Toolkit, which combines agent skills, hosted MCP servers and the Headless Experience Layer.

The author describes the Headless Toolkit through a Permission Set example. Working through Setup meant retrieving a long XML file, navigating menus to understand and change permissions, then retrieving and committing the result. Through agents and the toolkit, the same change can be queried and edited from the terminal in seconds, locally and in parallel, without repeated round trips.

Metadata Visualizer renders read-only views of Salesforce metadata and comes with the Salesforce Extension Pack for VS Code. It covers agents, Flows, Lightning pages, objects and Permission Sets as of November 2026, and is opened by clicking Visualize in the editor. Users can analyze in the visualizer and ask an agent to apply changes, and with Agentforce Vibes they can select elements to have the agent edit them. Live Preview covers Lightning Web Components and Multi-Framework UI bundles, using live org data, and HXL widgets, using sample data that can be customized as JSON.

The post closes by suggesting that future interactive widgets could show metadata directly in agent responses, replacing some of these extensions and builders.
