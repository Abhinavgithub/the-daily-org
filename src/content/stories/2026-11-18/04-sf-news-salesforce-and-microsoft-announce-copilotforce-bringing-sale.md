---
title: Salesforce in Microsoft Copilot and Teams, with zero-copy access to Fabric
original_title: Salesforce and Microsoft Announce Copilotforce, Bringing Salesforce Customer Context and Sales Workflows to Microsoft Copilot
url: https://www.salesforce.com/news/stories/copilotforce-announcement/
source: Salesforce News
source_type: official
date: 2026-11-18
section: agentforce-and-ai
personas:
  - admin
  - developer
  - architect
tags:
  - salesforce-in-microsoft-copilot
  - data-360
  - microsoft-fabric
  - zero-copy
  - sales-cloud-in-teams
authors: []
why_read: "You will learn what the Salesforce and Microsoft integrations now offer: Salesforce context inside Copilot and Teams, and bidirectional zero-copy data sharing between Data 360 and Fabric. You will also see which parts are in beta, pilot or generally available."
interest_score: 7
depth_score: 5
novelty_score: 7
utility_score: 6
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/news/wp-content/uploads/sites/3/2026/11/Informatica-Salesforce.png?w=1024
figure:
  kind: compare
  caption: Data Federation lets Salesforce query Fabric data in place, while Data Sharing sends Data 360 context to OneLake
  left:
    heading: Data Federation
    points:
      - Query Fabric OneLake data in Data 360
      - Source data stays in Fabric
      - Generally available
  right:
    heading: Data Sharing
    points:
      - Share curated Data 360 context to OneLake
      - Supports custom analytics and AI workloads
      - Public preview, beta
  icons:
    - database
    - layers
---

Salesforce and Microsoft have announced Copilotforce, a partnership that brings Salesforce customer context and sales workflows into Microsoft Copilot, adds real-time CRM collaboration in Microsoft Teams, and connects Salesforce Data 360 with Microsoft Fabric. Accenture is the design and implementation partner and is deploying the integrations in its own global sales organization.

Salesforce in Microsoft Copilot lets sellers ask natural-language questions and get grounded outputs, prepare for meetings, analyze opportunities and take supported CRM actions. Copilot's Work IQ layer combines Salesforce data with Teams meetings, Outlook emails and shared documents on SharePoint and OneDrive. The article names three daily workflows: meeting preparation, deal-health analysis and pipeline review with close plans in Word and PowerPoint.

The Sales Cloud in Teams app, which was shown at Dreamforce, is in pilot. It shows pipeline and quota progress, sends deal notifications, and lets sellers update supported opportunity details through adaptive cards, with changes saved back to Salesforce. Agentforce Coworker handles actions within Teams.

On the data side, Data Federation is generally available and lets joint customers query Microsoft Fabric OneLake data inside Data 360 without moving it. Data Sharing is in public preview and beta and lets organizations share curated Data 360 context into OneLake. Access follows existing Salesforce permissions and Sharing Rules, and supported writeback actions require explicit user confirmation and respect Validation Rules. The article stresses that pricing and availability depend on customer agreements.
