---
title: Routing every Salesforce Lead to the right rep with Assignment Rules
original_title: "Salesforce Lead Assignment Rules: Routing Every Lead to the Right Rep Automatically"
url: https://dev.to/rohanmehta/salesforce-lead-assignment-rules-routing-every-lead-to-the-right-rep-automatically-3lh8
source: dev.to
source_type: community
date: 2026-11-15
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - lead-assignment-rules
  - lead-routing
  - queues
  - web-to-lead
  - round-robin
authors:
  - Rohan Mehta
why_read: You will know how Salesforce Lead Assignment Rules evaluate entries, why a catch-all Queue matters, and the main ways to get round-robin distribution. You will also have a short checklist for testing before activation.
interest_score: 6
depth_score: 5
novelty_score: 3
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How a new lead is routed through assignment rule entries
  steps:
    - Lead is created with assignment flag set
    - Entries checked top to bottom
    - First matching entry sets the owner
    - "No match: lead goes to catch-all queue"
---

Lead Assignment Rules route each new Lead to an owner as soon as it is created, which removes the slow and inconsistent manual triage that many teams rely on. The rule is a list of entries evaluated top to bottom, each with criteria and an owner that is a User or a Queue. The first entry whose criteria match wins, so the most specific entries must sit above the broader ones or they will never fire.

The article points out a common trap: rules only run when the record is created with the "Assign using active assignment rule" flag. The web-to-lead form, the API and Data Loader set this by default, but a manual record created in the UI does not unless the user ticks the box. It recommends structuring entries by territory first, then Lead Source, then score or company size, rather than writing one large entry per rep.

Every rule should end with a catch-all entry that sends unmatched Leads to a Queue rather than a named person, since a Queue is visible to the whole team and keeps working when someone is away. A growing catch-all Queue is a sign that criteria are missing a segment. Standard Lead Assignment Rules do not provide round-robin, so the options are a Queue that team members pull from, an autolaunched Flow that stamps a rotating owner using a counter field, or a third-party tool. The author suggests a Queue for most small teams because it is easier to audit, and notes that a Flow assigning owners should run in system context so creating-user permissions do not block it.

Before activating, create a test Lead for each entry and one that matches nothing, confirm each lands with the right owner, and check the web-to-lead path specifically. The article advises trialling the rule in a Sandbox against a week of real traffic before changing production.
