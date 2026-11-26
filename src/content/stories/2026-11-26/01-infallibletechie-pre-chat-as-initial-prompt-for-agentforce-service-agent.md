---
title: Sending a Pre-Chat Answer as the First Message to an Agentforce Service Agent
original_title: Pre-Chat as Initial Prompt for Agentforce Service Agent
url: https://www.infallibletechie.com/2026/11/pre-chat-as-initial-prompt-for-agentforce-service-agent.html
source: InfallibleTechie
source_type: community
date: 2026-11-26
section: agentforce-and-ai
personas:
  - developer
  - admin
tags:
  - agentforce
  - pre-chat
  - embedded-messaging
  - lwc
  - enhanced-chat
  - session-storage
authors:
  - Magulan Duraipandian
why_read: You will learn how to capture a customer's Pre-Chat question with a custom LWC and pass it automatically to the Agentforce Service Agent as the opening message. The post also lists security and reliability points to check before go-live.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the Pre-Chat answer reaches the agent as the first message
  steps:
    - Customer fills in the custom Pre-Chat LWC
    - LWC posts the value to the host website
    - Website stores the value in sessionStorage
    - First bot message sent event fires
    - sendTextMessage() sends the stored value
image: https://www.infallibletechie.com/wp-content/uploads/2026/11/Salesforce-Messaging-Channel-Custom-Parameters-1024x628.png
---

The article addresses a common friction point: customers type their question into a Pre-Chat form, then have to type it again once the Agentforce Service Agent joins. By default, the Pre-Chat value is stored on the Messaging Session and never reaches the agent as a message. The author shows how a custom Pre-Chat Lightning Web Component can capture that answer and send it on as the first message, so the agent can respond straight away and route to the right subagent with context.

The setup runs in five stages. The Agentforce Service Agent and its subagents are configured first, since the quality of the reply depends on their instructions. An Enhanced Chat Embedded Service Deployment is then created with Pre-Chat enabled and a field for the question. In the Messaging Channel, a Custom Parameter is mapped to a Flow Input Variable, and an Omni-Channel Flow routes the session and updates it with Update Records. The custom LWC renders the form and posts the value to the host website with window.postMessage, targeting a specific origin.

On the website, listeners store the value in sessionStorage with an in-memory fallback, then call utilAPI.sendTextMessage() when onEmbeddedMessagingFirstBotMessageSent fires. The stored value is cleared when the conversation or window closes. The article closes with a best-practice list covering strict origin checks, treating the text as untrusted input against prompt injection, avoiding logs of customer text, handling empty prompts, clearing the value after sending, and keeping configuration out of code.
