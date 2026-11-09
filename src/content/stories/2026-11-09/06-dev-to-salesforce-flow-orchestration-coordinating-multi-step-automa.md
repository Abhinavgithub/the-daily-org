---
title: Using Flow Orchestration to coordinate multi-step business processes
original_title: "Salesforce Flow Orchestration: Coordinating Multi-Step Automations"
url: https://dev.to/rohanmehta/salesforce-flow-orchestration-coordinating-multi-step-automations-1l72
source: dev.to
source_type: community
date: 2026-11-09
section: flow-and-admin
personas:
  - admin
  - developer
  - architect
tags:
  - flow-orchestration
  - record-triggered-flow
  - orchestration-run
  - approval-process
  - process-automation
authors:
  - Rohan Mehta
why_read: You will understand how Flow Orchestration organizes stages and steps across automated and interactive work, and when it is better than chaining several Flows. The article gives a worked onboarding example and a short checklist for a first build.
interest_score: 6
depth_score: 5
novelty_score: 4
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: A Flow Orchestration advances to the next step only when the previous one completes
  steps:
    - Automated Flow stage
    - Interactive Screen Flow stage
    - Automated provisioning stage
  icons:
    - flow
    - person
    - bolt
held_from: 2026-11-07
---

Most automations start as one Flow, but as a process grows, several Flows can conflict, run out of order or duplicate work. Flow Orchestration, which the article describes as generally available in recent releases, lets you build one process made of stages and steps, where each step is an automated Flow, a background Apex or invocable action, or an interactive Screen Flow or approval assigned to a user or queue with a due date.

An orchestration advances to the next step only when the previous one completes. If a step fails, the orchestration pauses rather than continuing silently, and the orchestration run record shows the current stage, step, assignee and status in one place. The author's onboarding example has an automated stage that creates tasks and a project, an interactive stage where a specialist confirms a kickoff call within three days, and an automated stage that provisions a portal user and sends a welcome email.

The article says orchestration suits processes with handoffs between people and automation, such as approvals, onboarding, case escalation and quote-to-cash, and is excessive for a single condition-and-action rule. It advises mapping the process on paper first, keeping one job per Flow, and remembering that orchestration runs consume Flow interviews and so still need governor-limit planning.
