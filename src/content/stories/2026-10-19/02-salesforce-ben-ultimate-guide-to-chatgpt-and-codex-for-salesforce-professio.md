---
title: Connecting ChatGPT and Codex to Salesforce through plugins and the DX MCP
original_title: Ultimate Guide to ChatGPT and Codex for Salesforce Professionals
url: https://www.salesforceben.com/ultimate-guide-to-chatgpt-and-codex-for-salesforce-professionals/
source: Salesforce Ben
source_type: community
date: 2026-10-19
section: agentforce-and-ai
personas:
  - developer
  - admin
  - architect
tags:
  - chatgpt
  - codex
  - agentforce
  - salesforce-dx
  - mcp
  - ai-integration
authors:
  - Tom M
why_read: Readers will learn how to securely link ChatGPT and Codex to Salesforce data and development environments using official plugins and the DX MCP connector. The piece also outlines model selection strategies and permission handling to keep workflows reliable.
interest_score: 6
depth_score: 5
novelty_score: 7
utility_score: 7
model: qwen/qwen3.7-flash
image: https://www.salesforceben.com/wp-content/uploads/2026/10/image4.png
held_from: 2026-10-17
figure:
  kind: parts
  caption: Key plugins and connectors linking OpenAI tools to Salesforce workflows
  whole: OpenAI Salesforce Integrations
  parts:
    - External data plugins
    - Agentforce Sales app plugin
    - Tableau plugin
    - Salesforce DX MCP connector
  icons:
    - database
    - robot
    - chart
    - plug
figure_image: /figures/2026-10-19/02-salesforce-ben-ultimate-guide-to-chatgpt-and-codex-for-salesforce-professio.webp
---

The article is a guide to OpenAI's product line and how Salesforce professionals can connect it to their work. It explains that ChatGPT is now delivered mainly through a desktop app that combines chat with Codex, and introduces ChatGPT Work, an agentic mode that carries out multi-step tasks across Connected Apps and files. It also covers Codex, OpenAI's coding agent available through the CLI, IDE, desktop and web; Dots, always-on autonomous agents that can run tasks after a chat ends and can even coordinate Codex work; ChatGPT inside Slack and Microsoft Teams; and the Spaces, Pages and Sites tools for shared projects, interactive documents and live web apps built from Codex.

On features, the piece describes plugins as the means of giving the AI access to external data, with the Salesforce plugin (formerly the Agentforce Sales app) letting users read and edit CRM records from ChatGPT while respecting their existing Salesforce permissions. A Tableau plugin offers similar access to Tableau sites, workbooks and metrics. For developers, the official Salesforce DX MCP connects Codex to more than 60 developer tools, such as listing orgs, retrieving metadata, creating snapshots and running tests, and it is hosted and updated by Salesforce. Skills are reusable instruction sets, AGENTS.md files give standing instructions read before work begins, projects group related conversations and files, and team tasks let several people own and manage a task. The author explains three model tiers: Astra, the most powerful and costly, to be used sparingly; Sol, the everyday model for moderately complex work; and Luna, the fast, cheap model for simple tasks. The key advice is to match the model to the task, since a weak model on a complex job can waste tokens without a result.

The article offers admin use cases such as generating project and org documentation, summarizing customer and deal information before meetings, and using Codex with the DX MCP to build metadata, testing in a Scratch Org or sandbox, and deploying only after review. Throughout, the author stresses that AI output must be verified, that AI is an assistant rather than a replacement for skilled Salesforce professionals, and that agentic tools should be given restricted org access, with deployments handled manually. Users of the Salesforce app should also be told that AI can make mistakes, and people should avoid granting AI more access than it needs and check their permission and security setup before connecting tools.
