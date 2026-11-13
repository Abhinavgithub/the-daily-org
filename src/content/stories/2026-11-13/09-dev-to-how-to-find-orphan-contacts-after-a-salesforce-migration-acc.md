---
title: Finding Contacts with a blank AccountId after a Salesforce migration
original_title: How to find orphan Contacts after a Salesforce migration (AccountId is blank)
url: https://dev.to/richardc_ailstudio/how-to-find-orphan-contacts-after-a-salesforce-migration-accountid-is-blank-4adn
source: dev.to
source_type: community
date: 2026-11-13
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - contact
  - accountid
  - orphan-records
  - data-migration
  - soql
  - private-contacts
authors:
  - Richard C
why_read: You will know how to find Contacts with no Account using SOQL or a report, why such Contacts are private by default, and how to triage them before attaching any of them to an Account.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Triage steps for orphan Contacts after a load
  steps:
    - Query Contacts where AccountId is null
    - Compare count with source system
    - Label each row attach, private or investigate
    - Attach only reviewed Attach rows
    - Re-run null query and spot-check
  icons:
    - search
    - chart
    - check
    - lock
    - test
held_from: 2026-11-10
---

After a migration, a Contact can keep all its field values and still have a blank AccountId. That is an orphan, which differs from a wrong-parent Contact whose AccountId points at the wrong company. The article notes that Salesforce Help says Contacts not linked to an Account are private, visible only to the owner and to administrators with View All Data or Modify All Data, and not governed by Contact Sharing Rules. It lists example causes such as Accounts loaded after Contacts or a failed parent lookup on insert, while stressing that a blank AccountId is one finding to be assessed rather than a diagnosis.

The query is a SOQL statement filtering on AccountId = null, optionally combined with an External ID field to narrow to migration-loaded records, and a count can be compared with the source system's count of Contacts without an account. The same set can be produced from a Data Loader export or a standard report. The author recommends a triage step that labels each row as attach, leave private or investigate, never attaching the whole list automatically, matching on Contact Id, and re-running the null query after updates.

The piece closes with its limits: intentional private Contacts are normal, a null check cannot detect a wrong parent, and users without View All Data may under-count what they can see. It also promotes a paid CSV comparison tool for wrong-parent checks.
