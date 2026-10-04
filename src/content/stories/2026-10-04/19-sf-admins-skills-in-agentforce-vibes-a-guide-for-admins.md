---
title: Using Agentforce Vibes Skills to inspect and configure your Salesforce org
original_title: "Skills in Agentforce Vibes: A Guide for Admins"
url: https://admin.salesforce.com/blog/2026/skills-in-agentforce-vibes-a-guide-for-admins
source: Salesforce Admins Blog
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - admin
tags:
  - agentforce-vibes
  - ai-skills
  - metadata-deployment
  - sandbox-testing
  - mcp-protocol
authors:
  - Joshua Birk
why_read: Readers will learn how to access the prebuilt Skills library in Agentforce Vibes and use them to inspect, modify, and deploy metadata changes through a plan and verify workflow. The guide demonstrates practical administration tasks like creating reports and Record-Triggered Flows without writing code.
interest_score: 6
depth_score: 4
novelty_score: 8
utility_score: 7
model: qwen/qwen3.7-flash
image: https://d3nqfz2gm66yqg.cloudfront.net/images/20260921085226/Screenshot-2026-09-21-at-10.51.27%E2%80%AFAM-286x300.png
---

The article introduces Agentforce Vibes as a browser-hosted Visual Studio Code instance configured specifically for Salesforce development and administration. Although it functions as a developer environment, the piece emphasizes its value for administrators by focusing on the Skills feature, which bundles instructions for distinct configuration actions into reusable packages.

Administrators can browse the preinstalled Skills library through the Toolkit menu after launching Vibes from Setup. The system automatically detects verbs in user prompts and maps them to the appropriate Skills, allowing the agent to execute tasks efficiently without manual selection. Users can also manually add new Skills to expand the toolkit over time.

Changes made through Vibes follow a strict plan, verify, and deploy sequence. Modifications are initially written to the virtualized local filesystem rather than directly to the connected org. Administrators review the generated change plan, approve it, and then trigger deployment using built-in commands or conversational prompts, with the agent handling connection tokens and API calls behind the scenes.

The author strongly recommends testing these workflows in trial environments such as Scratch Orgs, Developer Edition, or sandboxes. Example use cases include creating Custom Objects, adding fields, generating Permission Sets, running SOQL queries, and building Record-Triggered Flows. While early deployments may encounter errors or require multiple attempts, the structured approach provides a safe way to explore AI-assisted platform configuration.
