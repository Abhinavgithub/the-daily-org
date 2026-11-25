---
title: Copilotforce brings Salesforce Sales Data and skills into Microsoft Copilot and Teams
original_title: "Copilotforce Explained: How Salesforce in Microsoft Copilot, Teams and Fabric Works"
url: https://cloudodyssey.com/blog/copilotforce-explained-how-salesforce-in-microsoft-copilot-teams-and-fabric-works/
source: Cloud Odyssey
source_type: community
date: 2026-11-24
section: agentforce-and-ai
personas:
  - admin
  - architect
tags:
  - copilotforce
  - microsoft-copilot
  - data-360
  - microsoft-fabric
  - zero-copy
  - mcp
authors:
  - Cloud Odyssey
why_read: You will learn what Copilotforce includes, which parts are generally available and which are in preview, how Copilot reaches Salesforce through MCP and permissions, and how Data 360 and Fabric connect with zero copy. You will also get a checklist for preparing a pilot.
interest_score: 6
depth_score: 6
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: parts
  caption: Copilotforce combines three parts announced together on November 17, 2026
  whole: Copilotforce
  parts:
    - Salesforce in Copilot
    - Sales Cloud in Teams
    - Data 360 and Fabric zero copy
image: https://cloudodyssey.com/wp-content/uploads/2026/11/Copilotforce_-Salesforce-in-Microsoft-Copilot-Explained.png
held_from: 2026-11-21
also:
  - title: What Is Copilotforce? Salesforce Meets Microsoft Copilot
    url: https://salesforcebreak.com/2026/11/24/copilotforce/
    source: Salesforce Break
---

Copilotforce is a partnership between Salesforce and Microsoft, announced at Microsoft Ignite on November 17, 2026. It brings Salesforce customer context, business processes and actions into Microsoft Copilot, Teams and Fabric, so sellers can work with CRM records without switching to a CRM tab. The article describes three parts: Salesforce in Copilot, a plugin in public preview with 38+ prebuilt sales skills; Sales Cloud in Teams, in pilot with an open beta expected later in 2026; and a two-way zero copy link between Salesforce Data 360 and Microsoft Fabric.

The article explains how a Copilot request flows. Microsoft Work IQ adds context from Teams, Outlook and SharePoint or OneDrive documents. Copilot calls Salesforce through authenticated MCP access, and Salesforce applies the user's existing permissions. The seller reviews any draft, and supported writeback needs explicit confirmation and follows Validation Rules. The skills are grouped around revenue growth, deal risk and call follow-up.

For data, Data Federation from OneLake into Data 360 is generally available, letting teams query Fabric data in place. Sharing curated Data 360 data into OneLake is in public preview. The article notes that zero copy consumes Data 360 credits, so query volume should be included in cost planning. Governance is split: Salesforce controls records and actions, while Microsoft controls documents and communications, so the Salesforce and Microsoft 365 admin teams need to agree ownership before a pilot.

The article closes with a six-point preparation checklist covering data quality, permissions, governance owners, data mapping, a 30-day pilot and integration planning. Much of the commentary is from Cloud Odyssey, a consultancy, and some product status details are marked for confirmation with account teams.
