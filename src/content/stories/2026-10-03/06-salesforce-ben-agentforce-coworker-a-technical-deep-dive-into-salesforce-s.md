---
title: "Agentforce Coworker setup, security and routing within AIforce"
url: https://www.salesforceben.com/agentforce-coworker-a-technical-deep-dive-into-salesforces-new-ai-teammate/
source: Salesforce Ben
source_type: community
date: 2026-10-03
section: agentforce-and-ai
personas:
  - admin
  - architect
  - developer
tags:
  - agentforce-coworker
  - aiforce
  - data-360
  - agent-orchestration
  - security-model
  - salesforce-go
authors:
  - Ross Collie
why_read: It explains how Agentforce Coworker fits into the AIforce stack, how its routing and security model work, and gives a concrete setup path via Data 360 and Salesforce Go.
interest_score: 7
depth_score: 6
novelty_score: 7
utility_score: 7
model: inclusionai/ling-3.1-flash
image: "https://www.salesforceben.com/wp-content/uploads/2026/09/Agentforce-Coworker_-A-Technical-Deep-Dive-into-Salesforces-New-AI-Teammate-1024x576.png"
original_title: "Agentforce Coworker: A Technical Deep Dive into Salesforce’s New AI Teammate"
---

Agentforce Coworker is presented as one of three main pillars of AIforce, Salesforce's interface layer announced at Dreamforce '26. Its purpose is to bring Salesforce data and agents to where users already work, such as Lightning Experience, Slack, Microsoft Teams or AI tools, instead of making them switch between applications. It targets two problems: tab-switching between many tools, and users struggling to know which agent to use for a task as agentic workforces grow. It acts as a router agent, the front door to an org's agents, sending queries to the right one. Its foundations are Agentforce (the digital workforce layer it orchestrates), Customer 360 (CRM as the unification point for customer data) and Data 360 (the grounding layer that indexes and governs data for AI).

The piece describes three interaction modes. Find lets users ask questions in plain language and get contextualized answers drawn from CRM data, Slack, files, knowledge bases and other connected sources. Catch Up proactively surfaces changes in the user's scoped workspace, such as what they missed while in meetings. Plan and Act takes outcome-level instructions and routes the work to the appropriate agent. Security relies on the existing Salesforce model: profiles, Permission Sets and Sharing Rules still apply, so Coworker only sees what the user is allowed to see, following least privilege.

The author's hands-on setup path begins with confirming Data 360 is enabled, checked under Data Cloud Setup Home, and assigning the Agentforce Coworker Admin Permission Set to administrators. Coworker is then switched on through Salesforce Go by searching for it in Setup. Administrators choose data sources under Manage Data, with CRM data enabled by default. Finally, users need the Agentforce Coworker User Permission Set, which can be assigned via Manage Access to Agentforce Coworker in Manage Users. In use, the Ask button beside global search opens the Ask: Home tab, and the author recommends starting a fresh session for unrelated prompts to avoid carrying over context.

The article closes with caveats. Data 360 must be enabled before Coworker works, though not every data set must be shared with it. Coworker is available in Enterprise, Unlimited and Agentforce 1 Editions. Billing is either consumption-based through Flex Credits or seat-based with usage caps, so costs can rise quickly and the author suggests monitoring value with tools such as Agentforce Grid and Agentforce Observability. The author also advises planning and cleaning data and permissions before rollout.
