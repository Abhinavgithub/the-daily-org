---
title: AI Skills in Agentforce Coworker are now generally available
original_title: "Introducing AI Skills in Coworker: Turn Your Best Practices Into Reusable Workflows"
url: https://www.salesforce.com/blog/ai-skills-in-coworker/
source: Salesforce Blog
source_type: official
date: 2026-11-11
section: agentforce-and-ai
personas:
  - admin
  - developer
  - architect
tags:
  - agentforce-coworker
  - ai-skills
  - prompt-builder
  - reusable-workflows
  - skill-builder
authors:
  - Liz Awad
  - Jaswinder Rattanpal
  - Joshua Schneyer
why_read: You will learn what an AI Skill is, how users build, share and run one in Coworker, and how it differs from a Prompt Builder Prompt Template. You will also see how permissions and approval gates apply when a skill runs.
interest_score: 6
depth_score: 5
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: A Prompt Template produces text, while a skill runs a whole task
  left:
    heading: Prompt Template
    points:
      - Reusable prompt for an LLM
      - Produces text output
      - "Example: a record summary"
  right:
    heading: AI Skill
    points:
      - Describes an entire repeatable task
      - Agent works through each step
      - Can take action on records
  icons:
    - doc
    - robot
image: https://salesforce.vidyard.com/watch/5R4FSco7me4VLTtgkouPVP
---

AI Skills in Agentforce Coworker are now generally available. A skill is a reusable set of plain-language instructions that tells an agent how to complete a repeatable task. Unlike a Prompt Template, which produces text output such as an email or a record summary, a skill describes an entire task that the agent works through step by step and can act on.

Users build a skill by chatting with Coworker. They name it, say when to use it and list its steps, then refine the steps in Coworker or in Skill Builder. Skills are private by default and are shared with colleagues once they work. A skill is run by typing a forward slash, using the skills icon, or simply asking, and Coworker can select the matching skill from the user's intent.

Skills respect the org's existing controls. A skill runs as the invoking user with their row-level and object-level permissions, and Coworker asks for approval before creating or updating a record. The article suggests example uses such as account research, call prep, competitive battle cards, case summaries and campaign reporting.
