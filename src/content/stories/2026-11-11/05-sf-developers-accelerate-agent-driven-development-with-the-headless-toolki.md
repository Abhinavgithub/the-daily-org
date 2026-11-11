---
title: Running a seven-stage agent-driven Salesforce lifecycle with the Headless Toolkit
original_title: Accelerate Agent-Driven Development with the Headless Toolkit
url: https://developer.salesforce.com/blogs/2026/11/accelerate-agent-driven-development-with-the-headless-toolkit
source: Salesforce Developers Blog
source_type: official
date: 2026-11-11
section: devops
personas:
  - developer
  - architect
tags:
  - agent-driven-development
  - headless-toolkit
  - sf-skills
  - hosted-mcp-servers
  - salesforce-cli
  - spec-driven-development
authors:
  - Mohith Shrivastava
why_read: You will learn how to structure a Salesforce project around coding agents, using Skills, hosted MCP Servers and the Salesforce CLI across seven stages from grounding to observation. You will also see how to keep the agent's context lean and feed each mistake back into the project's instructions, checks and specs.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261105105231/SingleHeadshot-13-e1793904767965.png?w=1000
figure:
  kind: steps
  caption: The seven stages of the agent-driven Salesforce lifecycle, each leaving an artifact for the next
  steps:
    - Ground in business and org
    - Specify what to build
    - Build, then verify
    - Review with a reviewer agent
    - Release through a human gate
  icons:
    - search
    - doc
    - code
    - check
    - rocket
figure_image: /figures/2026-11-11/05-sf-developers-accelerate-agent-driven-development-with-the-headless-toolki.png
---

The article argues that coding agents such as Claude Code, Codex, Cursor and Agentforce Vibes drift from platform best practices and miss what already exists in an org unless they are given more context and tools. The Headless Toolkit supplies Salesforce expertise through the Salesforce Skills Library (sf-skills), org context through Hosted Model Context Protocol Servers, and testing and deployment through the Salesforce CLI. The author presents one possible seven-stage loop (ground, specify, build, verify, review, release, observe) in which each stage leaves an artifact the next stage can read, and in which the developer's role shifts toward directing the agent and judging its output.

The piece distinguishes the agent's built-in harness from the project harness that a team adds on top, made up of Skills, instructions in AGENTS.md, an ontology of business terms, and checks. It advises keeping context lean, since model accuracy falls as the window fills, and it describes how to install the Skill plugins and enable the MCP Servers in Setup. The grounding stage uses the Metadata Grounding MCP Server to find existing org metadata, with its beta limits noted, and a feature map and ontology.yaml to record what the agent cannot guess.

The specify stage recommends a living, spec-anchored document for decisions the code does not show, such as sharing and automation ownership, while warning that specs are overkill for small changes. Throughout, the advice is to add a rule, test or spec topic each time the agent gets something wrong.
