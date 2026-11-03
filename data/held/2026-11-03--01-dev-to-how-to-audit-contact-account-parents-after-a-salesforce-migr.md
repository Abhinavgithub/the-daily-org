---
title: Detecting wrong-parent Contacts after a migration using External IDs and SOQL
original_title: How to Audit Contact–Account Parents After a Salesforce Migration with SOQL
url: https://dev.to/richardc_ailstudio/how-to-audit-contact-account-parents-after-a-salesforce-migration-with-soql-18g8
source: dev.to
source_type: community
date: 2026-11-03
section: devops
personas:
  - admin
  - developer
tags:
  - soql
  - data-loader
  - external-id
  - data-migration
  - contact-account-relationship
  - reports
authors:
  - Richard
why_read: You will learn how to test whether Contacts still point to the correct Account after a migration, using External ID keys, a child-to-parent SOQL export, and a source-to-target comparison. The method works with native tools and needs no third-party code.
interest_score: 6
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The wrong-parent check compares Account keys for each Contact across two orgs
  steps:
    - Confirm keys are unique
    - Export Contacts with parent key
    - Match Contacts on their key
    - Compare Account keys
---

Record Ids usually change between orgs, so comparing AccountId values across a migration tells you nothing. The article proposes a stable External ID on both Account and Contact, then checks that the parent Account's key is the same on each side for every Contact.

The workflow starts with uniqueness and blank-count queries on the keys, then uses a single child-to-parent SOQL export from Contact via Data Loader to pull Account.External_Key__c onto each row. The same view can be built as a Contacts & Accounts report. Rows are then matched on the Contact key and the Account keys compared, with blanks flagged as unresolved and missing rows reported separately.

The author notes limits: the method needs a shared stable key, Data Loader does not support nested subqueries, and a clean parent check does not validate field values, sharing or record types. The article is written by the vendor of a paid CSV comparison tool, which it discloses.
