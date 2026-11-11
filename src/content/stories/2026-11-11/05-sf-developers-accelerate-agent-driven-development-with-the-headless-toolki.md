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
    - Build with the agent
    - Verify with tests and checks
    - Review with a reviewer agent
    - Release through a human gate
    - Observe and feed mistakes back
  icons:
    - search
    - doc
    - code
    - test
    - check
    - rocket
    - chart
figure_image: /figures/2026-11-11/05-sf-developers-accelerate-agent-driven-development-with-the-headless-toolki.png
---

This Salesforce Developers Blog post, written by Principal Developer Advocate Mohith Shrivastava, proposes an agent-driven development lifecycle built on the Headless Toolkit: the Salesforce Skills Library (sf-skills), Salesforce Hosted MCP Servers for org context, and the Salesforce CLI for testing and deploying. The author argues that coding agents drift from platform best practices and miss what already exists in an org, so a team should wrap them in its own project layer of skills, instructions, ontology, tools and checks. The linear project model becomes a loop in which each stage leaves an artifact for the next, and every mistake feeds back into the project. The author also stresses keeping the agent's context lean, since accuracy falls as the context window fills, and notes that the agent's built-in harness is the same for everyone while the project harness is what makes it effective on a specific org.

The seven stages run as follows. Ground gives the agent the org's existing metadata through the read-only Metadata Grounding MCP Server (Beta), a feature map and an ontology of business terms. Specify has the agent produce a short, human-approved spec kept up to date alongside the code, recommended as spec-anchored and used only for features that span several metadata types or sessions. Build lets one agent work step by step, or subagents work in parallel in separate git worktrees, with each subagent given only the context it needs. Verify runs independent checks such as Apex tests, Code Analyzer, ApexGuru scans, LWC and accessibility checks, and hooks that run automatically. Review uses a separate, read-only adversarial reviewer agent whose findings humans judge. Release has the agent validate and promote changes through deterministic gates, with a human owning the production step. Observe has the agent read debug logs and traces to find production issues and start the next loop.

The post closes with a principle: each repeated mistake should become a constraint. Advisory instructions and skills reduce errors, but deterministic tests, Code Analyzer rules, hooks and quality gates catch them regardless of who wrote the code, and the author recommends choosing the strongest option available and cleaning up existing code that the agent might copy. The author presents this as one approach to adapt rather than the only way, and suggests installing the skills and starting with the stages that suit the team.
