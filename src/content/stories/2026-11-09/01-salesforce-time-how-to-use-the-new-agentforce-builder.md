---
title: Building and testing agents in the new Agentforce Builder
original_title: How to Use the New Agentforce Builder
url: https://salesforcetime.com/2026/11/08/how-to-use-the-new-agentforce-builder/
source: Salesforce Time
source_type: community
date: 2026-11-09
section: agentforce-and-ai
personas:
  - admin
  - developer
  - architect
tags:
  - agentforce-builder
  - agent-script
  - agentforce-studio
  - agent-preview
  - version-control
authors:
  - Yumi Ibrahimzade
why_read: You will learn how to create an agent from a natural-language description, switch between Canvas and Agent Script views, and test with Simulate and Live Test before committing and activating a version. It is a practical walkthrough of the Builder's main workflow.
interest_score: 7
depth_score: 6
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The Builder workflow from creating an agent to going live
  steps:
    - Describe the agent in natural language
    - Refine in Canvas or Script view
    - Test in Preview
    - Commit Version
    - Activate the version
  icons:
    - robot
    - code
    - test
    - doc
    - rocket
image: https://salesforcetime.com/wp-content/uploads/2026/11/Agentforce-Builder-1024x576.png
figure_image: /figures/2026-11-09/01-salesforce-time-how-to-use-the-new-agentforce-builder.png
---

The new Agentforce Builder, found under Agentforce Studio, is presented as a way to make agent behavior more predictable by combining an upgraded reasoning engine, Agent Script that mixes natural language with programmatic logic, and built-in AI assistance. An agent can be started by describing its role and tasks in natural language, after which Agentforce generates an initial configuration that can be refined through chat or configured manually.

The Builder is organized into an Explorer for navigating settings, subagents, actions, variables and connections, a Canvas for editing configuration in a low-code block view, a Preview panel for testing, and an Agent Optimizer for natural-language changes. Canvas and Script views stay in sync, so changes made in one are written into Agent Script in the other. Typing a slash adds inline logic such as if/else conditionals, and typing an at-sign opens a resource picker for subagents, actions and variables.

Preview offers Simulate, which skips permission checks and does not run actions or touch data, and Live Test, which runs actions and changes data in the org. Both show reasoning explanations, traces, variable values and timing per step. Finally, a version is committed as a locked snapshot and activated; only one version can be live at a time, and activating a new one turns the previous one off.
