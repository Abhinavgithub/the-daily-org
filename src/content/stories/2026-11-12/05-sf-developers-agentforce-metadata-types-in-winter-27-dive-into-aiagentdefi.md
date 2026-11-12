---
title: Agentforce agents move to AiAgentDefinition metadata types in API version 68.0
original_title: "Agentforce Metadata Types in Winter ’27: Dive into AiAgentDefinition"
url: https://developer.salesforce.com/blogs/2026/11/agentforce-metadata-types-in-winter-27-dive-into-aiagentdefinition
source: Salesforce Developers Blog
source_type: official
date: 2026-11-12
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - agentforce
  - aiagentdefinition
  - metadata-api
  - salesforce-cli
  - api-version-68
  - ci-cd
authors:
  - Sarah Welker
why_read: You will learn how the new AiAgentDefinition and AiAgentDefinitionVersion types replace Bot, GenAiPlannerBundle and AiAuthoringBundle for Agentforce agents, how to write a manifest and retrieve a single version with its dependencies, and which deployment rules and migration steps apply.
interest_score: 9
depth_score: 9
novelty_score: 8
utility_score: 9
model: anthropic/claude-haiku-5.5
figure:
  kind: parts
  caption: The three old metadata types and the two new types that replace them
  whole: Agentforce agent at API 68.0
  parts:
    - AiAgentDefinition
    - AiAgentDefinitionVersion
    - AiAuthoringBundle
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261110110101/Generic-B-8-e1794337302733.png?w=1000
figure_image: /figures/2026-11-12/05-sf-developers-agentforce-metadata-types-in-winter-27-dive-into-aiagentdefi.png
---

Winter '27 introduces two metadata types for Agentforce agents at API version 68.0: AiAgentDefinition, which holds agent-level settings, and AiAgentDefinitionVersion, which holds one version's settings, messages and an inline planner with its subagents and actions. Under the previous structure, one agent was spread across the Bot, GenAiPlannerBundle and AiAuthoringBundle types, with generated name suffixes, hard-to-find welcome messages and folder names that changed between retrieves. The author compares a sample agent retrieved at API 67.0 and 68.0, showing that the content was identical and only the names and packaging changed.

At API 68.0, Agentforce agents must use the new types, and retrieving or deploying them as Bot or BotVersion returns an error. The # delimiter lets a manifest or the --metadata flag select a single version, such as TestAgent#1, all versions with TestAgent#, or every version of every agent. Salesforce CLI version 2.149.9 or later is needed, and the --root-type-with-dependencies AiAgentDefinitionVersion flag pulls in the parent definition, the authoring bundle and the Flows, Apex classes and Prompt Templates the version uses. The dependency retrieve is limited to 25 requests per day, 100 components per request, and one level deep.

Deployments fail if the old and new formats are mixed, if a version is deployed without its definition existing in the target org or the same deployment, or if the Agent Script source is omitted. The author also notes that the agent user from the source org must be replaced for a draft agent, and recommends switching to API 68.0 in its own commit and updating any scripts that parse the old files.
