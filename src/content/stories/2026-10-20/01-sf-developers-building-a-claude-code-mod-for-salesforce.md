---
title: Build a Claude Code mod to display Salesforce CLI org context
original_title: Building a Claude Code Mod for Salesforce
url: https://developer.salesforce.com/blogs/2026/10/building-a-claude-code-mod-for-salesforce
source: Salesforce Developers Blog
source_type: official
date: 2026-10-20
section: devops
personas:
  - developer
tags:
  - salesforce-cli
  - claude-code
  - mcp-server
  - sfdx-project
  - plugin-development
authors:
  - Dave Norris
why_read: You will learn how to create a Claude Code mod that reads Salesforce CLI configuration files to show your default org, its type, and Scratch Org expiry directly above the command prompt. The guide covers the required plugin structure, event hooks, and testing steps.
interest_score: 6
depth_score: 8
novelty_score: 6
utility_score: 6
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261019085424/SingleHeadshot-9-e1792425278776.png?w=1000
---

The article walks through creating a custom plugin for Claude Code that surfaces Salesforce CLI context directly in the terminal interface. It explains how to set up the plugin manifest, define reactive state types, and structure the directory for hooks and tests.

Instead of running slow CLI commands, the mod reads internal Salesforce authentication and configuration files to determine the target org alias, My Domain, org type, and Scratch Org expiration date. It also tracks which organizations are connected to configured Salesforce MCP servers.

The tutorial details several event hooks that trigger when sessions start, directories change, or tool calls execute. A render hook draws a colored status band above the prompt, using theme-aware colors to distinguish production, sandbox, and Scratch environments. The author includes validation and testing procedures, plus instructions for making the plugin load automatically across sessions.
