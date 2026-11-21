---
title: Migrating from Workflow Rules and Process Builder to Flow without breaking automations
original_title: "Salesforce Workflow Rules to Flow: A Migration Checklist That Won't Break Your Automations"
url: https://dev.to/rohanmehta/salesforce-workflow-rules-to-flow-a-migration-checklist-that-wont-break-your-automations-2de1
source: dev.to
source_type: community
date: 2026-11-21
section: flow-and-admin
personas:
  - admin
  - developer
  - architect
tags:
  - workflow-rules
  - process-builder
  - flow-migration
  - flow-builder
  - record-triggered-flow
authors:
  - Rohan Mehta
why_read: You will learn a six-step sequence for moving Workflow Rules to Flow safely, and how to choose the right Flow type for each rule. It is a practical checklist rather than a deep technical study.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The six steps of the migration checklist, in order
  steps:
    - Inventory every rule and process
    - Map each rule to a Flow type
    - Rebuild the logic, don't copy it
    - Test in a sandbox with real data
    - Switch over one rule at a time
    - Document what you migrated and deleted
  icons:
    - search
    - layers
    - gear
    - test
    - flow
    - doc
---

The article begins with the retirement of Workflow Rules and Process Builder in favor of Flow, and argues that a rushed migration is how working automations quietly break. It recommends a checklist that runs in a fixed order, starting with an inventory of every rule and process in the org: the object each fires on, its criteria and its actions.

It suggests using the Flow Migration Tool in Setup to see what can be converted automatically, while treating the output as a starting point. Rules with time-based actions and complex criteria are said to need manual review. The author then maps each rule to a Flow type: a same-record field update becomes a before-save Record-Triggered Flow, a task or email becomes an after-save one, and a scheduled rule becomes a scheduled Flow.

The next steps are to rebuild the logic rather than copy it, questioning criteria that may encode outdated business rules, and to test in a sandbox with real create and edit scenarios, paying attention to order of execution and run context. The article advises switching over one rule at a time, running old and new in parallel where possible, and documenting what was migrated and what was deleted.
