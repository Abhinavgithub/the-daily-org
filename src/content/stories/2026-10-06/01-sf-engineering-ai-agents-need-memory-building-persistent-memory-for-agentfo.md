---
title: How Salesforce engineered persistent memory for Agentforce agents
original_title: "AI Agents Need Memory: Building Persistent Memory for Agentforce"
url: https://engineering.salesforce.com/ai-agents-need-memory-building-persistent-memory-for-agentforce/
source: Salesforce Engineering
source_type: official
date: 2026-10-06
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - agentforce-memory
  - semantic-retrieval
  - agentscript
  - ai-privacy
authors:
  - Roopang Chauhan
  - Sundar Vedula
  - Peng-Wen Chen
why_read: You will learn how the Agentforce team designed persistent memory to solve stateless agent limitations, including retrieval strategies, latency tradeoffs, and privacy controls. Readers will understand why memory was moved into the Reasoner and how to enable it using Agentscript.
interest_score: 8
depth_score: 8
novelty_score: 7
utility_score: 7
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/10/image_610309.png?w=1024
---

The Salesforce Engineering team built Agentforce Memory to eliminate the stateless nature of enterprise AI agents. Without persistent memory, users must repeatedly provide context, which increases friction and slows task completion. The team standardized industry terminology around memory types before designing the architecture.

Early prototypes relied on recent conversation history, but the team shifted to semantic retrieval to capture older but relevant information. They evaluated multiple approaches and selected keyword search during pre-orchestration to keep the context window bounded and minimize latency. Moving memory directly into the Reasoner replaced manual action configurations, simplifying administration and improving developer ergonomics.

Privacy and user control were treated as core architectural requirements rather than afterthoughts. Administrators can enable memory globally, while individual users manage preferences through a console or conversational commands. Enabling the feature requires adding a context.memory block to Agentscript, allowing the platform to handle curation and injection automatically.
