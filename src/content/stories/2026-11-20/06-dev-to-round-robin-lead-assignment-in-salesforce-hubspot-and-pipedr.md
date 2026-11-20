---
title: How Round Robin lead Assignment works in Salesforce, HubSpot and pipedrive
original_title: Round robin lead assignment in Salesforce, HubSpot and Pipedrive
url: https://dev.to/operelio/round-robin-lead-assignment-in-salesforce-hubspot-and-pipedrive-4lao
source: dev.to
source_type: community
date: 2026-11-20
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - round-robin
  - lead-assignment
  - assignment-rules
  - lead-routing
  - crm-comparison
authors:
  - Daniel Pank
why_read: You will learn how each of the three platforms rotates leads between reps, including the Salesforce formula and assignment rule setup and the common reasons assignment rules fail to fire. You will also see how availability, weighting and rule order differ between them.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Salesforce and HubSpot round robin setups differ in what the platform provides
  left:
    heading: Salesforce
    points:
      - No round robin switch built in
      - Autonumber, formula and rule entries
      - Edit formula when team changes
  right:
    heading: HubSpot
    points:
      - Rotate record to owner action
      - Load balanced, round robin, random
      - Assign to available users only
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fc67qwul144bdxs8xbrym.png
held_from: 2026-11-17
---

Round robin lead assignment hands each new lead to the next rep in a fixed order, which suits teams where reps sell the same thing and leads are broadly alike. The article sets it against weighted, load-balanced and rules-based approaches, and notes that real setups usually combine rules to pick a team with a rotation inside it. It lists four common cases where a plain rotation breaks down: leads from existing accounts, uneven lead quality, reps who are away, and reps who own territories.

In Salesforce there is no round robin switch. The article walks through the build: an Autonumber field, a Round Robin ID formula using MOD over the number of reps, and one Assignment Rule entry per rep, with a catch-all entry at the bottom. Each time a rep joins or leaves, the formula and entries must be changed by hand. The article then lists why rules often appear not to fire, such as API calls missing the AssignmentRuleHeader, Data Loader imports without the rule ID, the Lightning checkbox setting, and Flows using the Run Immediately path.

HubSpot uses the Rotate record to owner workflow action, available on Sales Hub and Service Hub Professional and Enterprise, with options for round robin, load balanced and random, and an option to skip users who are set to Away. Its first assignment is random, counts are kept per action, and changing owners resets the counts. Pipedrive offers automatic assignment on Professional and higher plans, where each rule keeps its own rotation, there are no caps or weights, and a rep on leave must be removed from rules by hand.

A comparison table sets the three platforms side by side, covering built-in support, plan requirements, handling of absent reps, and how imports and API traffic are treated. The article then describes Operelio, a tool that applies routing before a lead reaches the CRM, and its routing rules, round robin and CRM checks.
