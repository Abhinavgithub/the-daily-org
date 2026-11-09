---
title: How the merge() API handles Lead records and their MCAE Prospects
original_title: "Salesforce: Lead merge with MCAE Prospect"
url: https://www.simplysfdc.com/2026/11/salesforce-lead-merge-with-mcae-prospect.html
source: SimplySfdc
source_type: community
date: 2026-11-09
section: apex-and-platform
personas:
  - admin
  - architect
  - developer
tags:
  - lead-merge
  - merge-api
  - marketing-cloud-account-engagement
  - mcae-prospect
  - queryall
  - master-record-id
authors:
  - Unknown
why_read: You will learn which fields, history, related records and dates survive when Leads are merged, and how the linked MCAE Prospect behaves. You will also see how to find merged records afterwards with queryAll().
interest_score: 6
depth_score: 6
novelty_score: 4
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: What the merge() call does to the victim Leads
  steps:
    - Keep the chosen master Lead
    - Reparent related records to it
    - Copy the field values you supply
    - Delete victims and set MasterRecordId
  icons:
    - check
    - layers
    - flow
    - database
image: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjkMemWUW_ZKNqkLh7T8nFCBqrb4obELM_4PownSkSJS0YmLoSN96iftncC6j8Ra5TGvJQaE7Wh4I9UR8hyphenhyphenH-pqKW3a984Kn3wwFEr6QwAO9GPwL_lNbYc4STkSjoXNekHg51xdQRH8YVu4ymoXK-6TH1eex3qCRW-iu4lUVbuKPxQH8nY4Ne82LjNkU6w/w1200-h630-p-k-no-nu/image.png
held_from: 2026-11-06
---

The merge() SOAP API combines up to three records of the same type into one. The caller chooses the master record and the victims, and Salesforce keeps the master, reparents related records from the victims, deletes the victims and sets MasterRecordId on them. Field values are not copied automatically; any value the caller wants from a victim must be supplied on the master record in the MergeRequest.

For a merged Lead, the victims' lead history is not carried over, but the surviving Lead gets a new "Lead Merged" history line showing the victim's original name and company. Created By and Created Date are taken from the oldest victim. Related records such as Tasks, Campaign Members and Messaging Sessions move to the surviving Lead.

When both Leads are linked to MCAE Prospects, the Prospects are merged too and attached to the surviving Lead. The surviving Prospect keeps its original created date, but its conversion date and Recent Interaction date come from the oldest victim, and its audit log includes the victims' activity. The article also notes an audit line reading "Started matching Marketing Data Sharing criteria". Use queryAll() with MasterRecordId to find the records a merge deleted.
