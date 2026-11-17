---
title: How to set up Enhanced Omni-Channel Routing for Service Cloud agents
original_title: An Admin’s Guide to Enhanced Salesforce Omni-Channel
url: https://www.salesforceben.com/salesforce-omni-channel/
source: Salesforce Ben
source_type: community
date: 2026-11-17
section: flow-and-admin
personas:
  - admin
  - architect
tags:
  - omni-channel
  - enhanced-omni-channel
  - queue-based-routing
  - skill-based-routing
  - service-cloud
authors:
  - Andreea Doroftei
why_read: You will learn what Enhanced Omni-Channel requires, how queue-based, skill-based and external routing differ, and the main steps to enable routing and test it. You will also know that Standard Omni-Channel was retired in Summer '26 and that existing configurations carried over.
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The order of steps for a first-time Enhanced Omni-Channel setup
  steps:
    - Turn on Enhanced Omni-Channel Routing
    - Choose queue-based or skill-based routing
    - Configure queues or skills and agents
    - Define routing configurations
    - Test with a sample case
image: https://www.salesforceben.com/wp-content/uploads/2021/10/eoc1.webp
---

Standard Omni-Channel was retired in Summer '26, and Salesforce upgraded orgs automatically during the rollout. Enhanced Omni-Channel, generally available since 2023, takes work items such as Cases, Leads, chats, messaging sessions and voice calls and routes them to reps based on availability, skills, capacity and priority. Existing routing configurations, queues, skills and routing rules were carried over. The feature requires a Service Cloud license or one of several add-on licenses, and it works only in Lightning Experience.

To enable it, go to Setup, then Feature Settings, then Service, then Omni-Channel Settings, and turn on Enhanced Omni-Channel Routing. The article describes three routing options: queue-based routing for smaller teams and simpler product lines, skill-based routing for complex cases that need specific expertise, and external routing for keeping logic in a third-party tool that connects through APIs. Enhanced Omni-Channel adds destinations including a queue, a skill, a specific rep and an Agentforce Service Agent.

Queue-based setup can be started with the guided flow under Omni-Channel Setup, which covers creating a queue, assigning agents and setting workload, followed by defining routing configurations. Skill-based setup is more involved: enable Omni-Channel and Field Service settings, create Skills, create active Service Resource records for agents with skill levels and dates, define Skills-Based Routing Rules through skill mapping sets, and confirm the routing configurations use those skills.

The article closes by describing the agent experience: the Omni-Channel Utility Bar item in the Service Console, where agents log in as available and receive incoming work with an audio notification. Its advice is to start with the simplest setup that covers the team, test with a sample Case, and add precision later.
