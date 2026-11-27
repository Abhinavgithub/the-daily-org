---
title: How Agentforce Voice works, how it is configured, and what it costs
original_title: Ultimate Guide to Salesforce Agentforce Voice
url: https://www.salesforceben.com/ultimate-guide-to-salesforce-agentforce-voice/
source: Salesforce Ben
source_type: community
date: 2026-11-27
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - agentforce-voice
  - salesforce-voice
  - omni-channel-flow
  - telephony
  - flex-credits
authors:
  - Ross Collie
why_read: You will learn how Agentforce Voice differs from Salesforce Voice and Agentforce Contact Center, how calls are routed to a voice agent, which deployment surfaces exist, and which limits and cost factors to check before going live.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://www.salesforceben.com/wp-content/uploads/2026/11/Agentforce-Voice-vs-Salesforce-Voice-vs-Contact-Center@2x.webp
held_from: 2026-11-26
---

Agentforce Voice lets customers speak with an AI agent over the phone, through a website or in a mobile app, instead of navigating menus or waiting for a person. The agent can use data held in Salesforce, take actions such as updating records or creating cases, and pass the conversation to a human with its context intact. The article notes that the product has been generally available for about a year and clears up the confusion between Agentforce Voice, Salesforce Voice and Agentforce Contact Center. Agentforce Voice is the AI layer, Salesforce Voice is the telephony connection to Salesforce, and Agentforce Contact Center is Salesforce's own contact center add-on.

The article explains the processing path. Calls arrive over the PSTN, over SIP from a CCaaS platform such as Amazon Connect, Genesys, NICE or Vonage, or through WebRTC in a browser or app. Speech is converted to text in real time, the Atlas reasoning engine decides what to do, and data is read from Salesforce and external systems through Data 360 using a zero-copy approach. The Trust Layer checks responses before they reach the customer, and the text is then converted back to speech. Setup involves creating an agent from the Agentforce Service Agent template, configuring its Subagents and Actions, adding a Telephony Connection, choosing a voice persona and pronunciation dictionary, and building an Omni-Channel Flow with a Route Work component and a fallback queue.

The article also covers deployment options and pricing. Agentforce Voice can sit on an existing telephony provider, on Salesforce's own contact center, in a mobile SDK, in employee mobile apps, in web chat, and in WhatsApp voice notes. Pricing is consumption-based through Flex Credits, with Agentforce Voice Minutes available to eligible customers, and telephony licensing or carrier charges may apply on top. Limitations include a 200 MB sandbox storage limit that makes call recording a problem, a default of 500 concurrent calls per org, and the fact that data can leave Salesforce's environment during provider failover, although providers are meant to apply zero data retention. Caller ID must also stay the same across a transfer, or the two VoiceCall records cannot be linked.
