---
title: AI Skills let Agentforce Coworker run repeatable team tasks
original_title: Salesforce Launches AI Skills in Agentforce Coworker
url: https://www.salesforceben.com/salesforce-launches-ai-skills-in-agentforce-coworker/
source: Salesforce Ben
source_type: community
date: 2026-11-13
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - agentforce-coworker
  - ai-skills
  - prompt-builder
  - permissions
  - governance
authors:
  - Ross Collie
why_read: You will learn what AI Skills in Agentforce Coworker are, how they differ from Prompt Builder templates, and how sharing and permissions are meant to control them. The author notes that admin-level maintenance guidance is still missing.
interest_score: 6
depth_score: 4
novelty_score: 6
utility_score: 5
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://www.salesforceben.com/wp-content/uploads/2026/11/aiskills1.webp
---

AI Skills are reusable sets of instructions that tell Agentforce Coworker how to complete a repeatable task. The author compares them to skills in Claude: the task is defined once, and anyone with access can run it the same way each time. Salesforce says Coworker is the first Agentforce agent to include them. They were announced in pilot in September, with general availability planned for October, as part of a wider Coworker expansion covering Microsoft Teams, mobile and desktop apps, and an MCP server.

The article separates AI Skills from Prompt Builder. A Prompt Template gives a repeatable way to prompt an LLM for text output, such as a sales email or record summary. A skill describes a whole task so an agent can work through each step and take action, which the author says makes skills the more powerful of the two. Salesforce's examples include account research, meeting prep, case classification, flagging renewal risk and case summaries, all work people repeat and often do slightly differently each time.

On governance, skills are private until the creator shares them, and sharing is controlled by the creator. A skill runs as the person using it, and Coworker respects existing permissions, so users should only see records and objects they already have access to. Coworker also pauses for approval before it creates or updates a record. The author argues this is powerful enough that admins need clearer guidance on maintaining skills across a team, and promises a deeper walkthrough later.
