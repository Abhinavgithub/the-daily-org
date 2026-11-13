---
title: How HXL widgets reach the screen in Agentforce and MCP clients
original_title: How HXL Widgets Render in Agentforce and MCP Clients
url: https://developer.salesforce.com/blogs/2026/11/how-hxl-widgets-render-in-agentforce-and-mcp-clients
source: Salesforce Developers Blog
source_type: official
date: 2026-11-13
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - headless-experience-layer
  - agentforce
  - mcp
  - custom-lightning-type
  - widget-rendering
authors:
  - Alba Rivas
why_read: You will learn the two routes a Headless Experience Layer widget takes from a user's question to a card on screen, one through Agentforce and one through MCP clients, and where each route fails. You will also see how to troubleshoot a missing card in each.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The two routes differ in who decides to show the card and who draws it
  left:
    heading: "Route 1: Agentforce"
    points:
      - LLM calls show_tool_results
      - LLM sees result plus ID only
      - Agentforce Client draws with Lightning Web Components
  right:
    heading: "Route 2: MCP clients"
    points:
      - Host shows any tool with a renderer
      - LLM sees data, never the widget
      - Renderer draws in a sandboxed iframe
  icons:
    - robot
    - plug
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261111111801/SingleHeadshot-14-e1794424697863.png?w=1000
---

The Headless Experience Layer beta lets a developer define a widget once and show it as an interactive card in Agentforce, Slackbot, Claude and ChatGPT. How the widget appears depends on the client the user is chatting in, and the article splits this into two runtime routes. The example throughout is a customerReviews widget from the Pronto sample app, which an agent produces by calling the getCustomerReviews Apex action.

In Route 1, inside Agentforce, the runtime stores the action's output under a short ID and marks it as displayable when the surface supports widgets and the action is flagged is_displayable. The LLM then calls the built-in show_tool_results action with that ID, which carries only a caption and the ID. The runtime resolves the result and its Custom Lightning Type, and the Agentforce Conversation Client hydrates the widget in the browser from JSON. Rendering depends on the model choosing to make that call, so the article suggests asking for the card in the agent's instructions.

In Route 2, an MCP server advertises a renderer address for each tool. The client loads the HXL renderer in a sandboxed iframe and calls the tool, and the server returns text for the model, the raw structured output, and a hydrated widget in metadata. The host pushes the widget into the iframe, while the LLM reads only the data and writes the answer.

The article closes with a comparison of the two routes on who decides to show the card, what the LLM sees, where data meets the widget and who draws it. It also gives a troubleshooting checklist for each route, including checking for the is_displayable flag, the show_tool_results call, the resource URI in tools/list, and whether the tool call returned an error.
