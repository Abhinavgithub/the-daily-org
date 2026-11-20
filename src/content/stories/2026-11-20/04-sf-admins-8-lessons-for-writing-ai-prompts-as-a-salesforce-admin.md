---
title: Writing clearer prompts for agents when you administer Salesforce
original_title: 8 Lessons for Writing AI Prompts as a Salesforce Admin
url: https://admin.salesforce.com/blog/2026/8-lessons-for-writing-ai-prompts-as-a-salesforce-admin
source: Salesforce Admins Blog
source_type: official
date: 2026-11-20
section: agentforce-and-ai
personas:
  - admin
tags:
  - prompt-writing
  - agentforce-vibes
  - validation-rule
  - agentforce
  - admin-productivity
authors:
  - Joshua Birk
why_read: You will learn eight writing principles for prompting an agent on admin work, and see a weak prompt rewritten into a strong one for a Validation Rule. The advice applies to any agent request you make.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
---

Joshua Birk argues that prompting an agent is a writing skill rather than a form of engineering, and that admins can apply the communication habits they already have. He notes that a good prompt is usually three to six plain-language sentences that name the exact objects, fields and Flows by API name, explain the business reason, and state the output wanted and the guardrails. A one-line prompt tends to cost several rounds of clarification, while a few extra sentences up front save them.

The article then sets out eight lessons: know your audience, lead with the goal, be specific, give context and explain why, define the output format, show examples, use plain language, and set constraints. Each comes with an admin example, such as naming the team size so the agent pitches its answer correctly, or pasting an existing Validation Rule so the agent follows its naming pattern. Constraints such as working only in a sandbox or not touching active Flows are written into the prompt from the start.

To show the lessons together, Birk rewrites a vague request to create a close-reason Validation Rule into a detailed prompt covering the object, field, error message, naming convention, length limit and a no-deploy instruction. He closes by saying that one prompt rarely produces a finished solution, so admins should plan follow-up prompts, and he points to Trailhead modules and a GitHub kit of 100 admin prompts.
