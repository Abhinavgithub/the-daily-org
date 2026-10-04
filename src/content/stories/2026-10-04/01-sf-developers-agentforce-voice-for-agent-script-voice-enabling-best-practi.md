---
title: How to voice-enable an Agent Script agent with proven best practices
original_title: "Agentforce Voice for Agent Script: Voice-Enabling Best Practices"
url: https://developer.salesforce.com/blogs/2026/10/agentforce-voice-for-agent-script-voice-enabling-best-practices
source: Salesforce Developers Blog
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - developer
  - admin
tags:
  - agentforce
  - agent-script
  - voice
  - telephony
  - prompt-engineering
  - stt-correction
authors:
  - Alex Martinez
why_read: Readers will learn the exact configuration blocks needed to enable voice in an Agent Script agent and how to adjust system instructions for spoken delivery. The guide also covers org prerequisites and deployment steps to avoid common speech-to-text pitfalls.
interest_score: 8
depth_score: 8
novelty_score: 9
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261001092313/SingleHeadshot-8-e1790871831604.png?w=1000
figure:
  kind: steps
  caption: A streamlined workflow to voice-enable an Agent Script agent
  steps:
    - Verify Agentforce Voice is active
    - Insert language, telephony, and modality blocks
    - Rewrite instructions for spoken delivery
figure_image: /figures/2026-10-04/01-sf-developers-agentforce-voice-for-agent-script-voice-enabling-best-practi.webp
---

Before modifying any code, administrators must verify that Agentforce Voice is active in the organization. Once enabled, adding voice capability follows a straightforward two-part workflow that keeps the core agent logic intact while routing conversations through a telephony channel.

Developers need to insert three specific configuration blocks into their Agent Script files. These blocks define the supported language, establish the telephony connection, and select the outbound voice model along with its persona. The nested settings ensure the correct speech synthesis engine handles both incoming audio transcription and outgoing responses.

Because listeners cannot reread text, the system prompts require careful rewriting. Replies must be concise, free of markdown or raw code snippets, and formatted so symbols are spoken as words. The guide emphasizes training the agent to silently correct common speech-to-text errors, such as mishearing technical terms, before providing a final response.
