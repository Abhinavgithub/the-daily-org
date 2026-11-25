---
title: Using a Git-based knowledge graph to give AI agents reliable engineering context
original_title: "Supercharging AI Agents: Build a Git-Based Engineering Knowledge Framework in 20 Minutes"
url: https://engineering.salesforce.com/supercharging-ai-agents-build-a-git-based-engineering-knowledge-framework-in-20-minutes/
source: Salesforce Engineering
source_type: official
date: 2026-11-25
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - ai-agents
  - git-knowledge-base
  - knowledge-graph
  - engineering-knowledge
  - kubernetes-upgrades
  - llm-skills
authors:
  - Stefana Muller
why_read: You will learn how Salesforce structured a Git-backed, domain-split knowledge graph for AI agents, the mistakes that shaped it, and how it cut Kubernetes upgrade effort. You will also see the tutorial steps and the open problems around stale knowledge and agent accountability.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The Second Brain setup process, from choosing a domain to ongoing maintenance
  steps:
    - Choose one engineering domain
    - Create Git repository with AI agent
    - Connect and validate knowledge sources
    - Run LINT checks regularly
  icons:
    - search
    - code
    - plug
    - check
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/Supercharging-AI-Agents-Build-a-Git-Based-Engineering-Knowledge-Framework-in-20-Minutes.png?w=1024
---

Salesforce engineers found that architectural decisions were scattered across repositories, meeting transcripts, collaboration tools and documentation, and that some were being reversed without anyone noticing. As AI agents entered their workflows, they built a Git-based knowledge system called the Second Brain, backed by a knowledge graph that links decisions to source evidence, ownership and implementation. Today it spans 21 domain-specific repositories, more than 200 sources and over 250 articles.

Their first attempt, a single large repository, made agents slower and more expensive, because retrieval slowed and irrelevant material consumed context. They split it into smaller domain brains connected through the graph, so agents start in the relevant domain and follow links only when needed. The article also stresses knowledge integrity: keeping source references, surfacing contradictions for human review, flagging gaps, and keeping sensitive material out of the repository rather than inventing answers.

The article walks through a roughly 20-minute setup. Readers pick one domain, create a repository with an AI coding agent using the Second Brain plugin and skills from GitHub, and ingest sources such as repositories, pull requests, meeting notes and tickets, using MCP connectors where available. Updates take about three minutes after the first ingestion. A LINT skill checks for conflicting decisions, outdated knowledge, missing connections, undocumented topics and unprocessed pull requests, and the team runs it manually each week.

The reported results include about 80% automation of Kubernetes upgrades, cutting hands-on work from three months to three weeks, and a new DevOps engineer completing a first production pull request in under two weeks. The authors note that production upgrades still need human oversight and that the figures are not from a formal productivity measurement. They close by naming unresolved issues: knowledge freshness, autonomous validation, and agent identity and accountability.
