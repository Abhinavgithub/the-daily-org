---
title: Route real phone calls to your Agentforce Voice agent using Salesforce CLI and Omni-Channel flows
original_title: "Agentforce Voice for Agent Script: Route Real Phone Calls to Your Agent"
url: https://developer.salesforce.com/blogs/2026/10/agentforce-voice-for-agent-script-route-real-phone-calls-to-your-agent
source: Salesforce Developers Blog
source_type: official
date: 2026-10-22
section: agentforce-and-ai
personas:
  - developer
tags:
  - agentforce-voice
  - agent-script
  - omni-channel-flow
  - pstn-voice
  - salesforce-cli
  - voicecall-record
authors:
  - Alex Martinez
why_read: You will learn how to configure an Agentforce Service Agent user, request a phone number, and build a one-element Omni-Channel routing flow to connect callers to your voice enabled script. You will also know how to verify call routing and inspect post call records using the Salesforce CLI.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 9
model: qwen/qwen3.7-flash
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261020100630/SingleHeadshot-10-e1792516002205.png?w=1000
figure:
  kind: steps
  caption: This diagram shows the five-step process for routing real phone calls to an Agentforce Voice agent
  steps:
    - Verify entitlements and licenses
    - Create an Agentforce Service Agent user
    - Build an Omni-Channel routing flow
    - Activate the flow and PSTN Voice channel
    - Test the call and query records
figure_image: /figures/2026-10-22/02-sf-developers-agentforce-voice-for-agent-script-route-real-phone-calls-to.webp
---

The article explains that routing live calls requires an active Agentforce Voice agent, a dedicated Einstein Agent User license, and available inbound voice credits. Developers must verify entitlements and create a service agent user through the Salesforce CLI before configuring any routing logic.

A call reaches the agent through three linked components: a purchased phone number, a PSTN Voice channel, and an Omni-Channel flow. The flow requires a single input variable named recordId and one Route Work element that directs the call to the activated service agent, with a voice queue as a fallback.

After activating the flow and channel, administrators can test the connection by dialing the assigned number. Since live sessions do not generate transcripts, the author demonstrates how to query VoiceCall and AgentWork records via SOQL to confirm call duration, vendor type, and successful routing.
