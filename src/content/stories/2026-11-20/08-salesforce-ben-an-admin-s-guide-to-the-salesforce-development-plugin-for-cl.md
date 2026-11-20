---
title: Building Custom Objects and Permission Sets with the Salesforce Development Plugin for Claude Code
original_title: An Admin’s Guide to the Salesforce Development Plugin for Claude Code
url: https://www.salesforceben.com/how-salesforce-admins-can-build-metadata-with-the-salesforce-development-plugin/
source: Salesforce Ben
source_type: community
date: 2026-11-20
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - claude-code
  - salesforce-development-plugin
  - metadata-api
  - mcp-server
  - custom-object
  - permission-set
authors:
  - Tom M
why_read: You will learn how to set up the Salesforce Development Plugin in Claude Code, prepare an org with the metadata-experts and salesforce-api-context MCP Servers, and generate a Custom Object, Permission Sets and a Lightning page as metadata. You will also see why the older Salesforce DX MCP Server is being retired and why deployments should stay with humans.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The main stages of building metadata with the plugin in the worked example
  steps:
    - Create the DX project
    - Build the Custom Object and fields
    - Build the Permission Sets
    - Build the Lightning page
    - Package the metadata for a human to deploy
image: https://www.salesforceben.com/wp-content/uploads/2026/11/image-1-1024x389.png
held_from: 2026-11-17
figure_image: /figures/2026-11-20/08-salesforce-ben-an-admin-s-guide-to-the-salesforce-development-plugin-for-cl.png
---

The article explains how the Salesforce Development Plugin for Claude Code differs from other tools with similar names. It groups Skills, the Salesforce CLI and hosted metadata servers into one toolset, while the Salesforce DX MCP Server reaches end-of-life on November 2, 2026, and Salesforce in Claude is aimed at end users rather than builders. The author lists the prerequisites: Node.js, Python, the Salesforce CLI and Claude Code, with a Claude plan that includes Claude Code. The org must have the MCP Servers page under Integrations and API Catalog used to enable the metadata-experts and salesforce-api-context MCP Servers.

The walkthrough then installs the plugin with the claude plugin install command and runs the setup command to check the org connection. The author builds a worked example, The General Store, using prompts that create a DX project, an Equipment Loan Custom Object with picklists, a lookup and a long text field, two Permission Sets, and a Lightning Record Page. He reviews the generated XML to confirm the read, create and edit permissions match the requirements.

The piece closes with advice on safety. It recommends building in a sandbox, Developer Edition org or Scratch Org, keeping deployments in human hands, and giving the agent specific field names and permissions because the model is trained on generic data.
