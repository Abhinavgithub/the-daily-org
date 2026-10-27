---
title: Checking Contact parent accounts after a Salesforce data migration
original_title: How to catch wrong-parent Contacts after a Salesforce migration
url: https://dev.to/richardc_ailstudio/how-to-catch-wrong-parent-contacts-after-a-salesforce-migration-o65
source: dev.to
source_type: community
date: 2026-10-27
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - data-migration
  - external-id
  - contact-account-relationship
  - pandas
  - google-sheets
authors:
  - Richard
why_read: You will learn why matching field values is not enough to verify a migration, and how to test each Contact's parent Account through a stable external key, using either pandas or Google Sheets formulas.
interest_score: 6
depth_score: 7
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The check follows each Contact's parent Account through the stable key to the target org
  steps:
    - Source Contact to its source Account ID
    - Source Account ID to its stable key
    - Target Contact to its target Account ID
    - Compare the two Account keys
  icons:
    - person
    - search
    - shield
    - check
---

A Contact can keep its name and email after a migration and still be attached to the wrong Account. Comparing field values will not catch this, and record IDs usually change between orgs, so they cannot be compared directly either. The article proposes a stable key, such as an External ID field, that identifies the same Account in both exports. The check follows the Contact's source Account to its key, then confirms that the target Contact's Account has the same key.

The article works through a small set of invented example CSVs. A pandas script merges the Contacts, maps each parent through the keys, and flags a WRONG_PARENT result for one Contact whose target Account points to the wrong record. The same logic is then rebuilt as Google Sheets formulas using INDEX and MATCH, with uniqueness checks on the keys and an EXACT comparison because MATCH is case-insensitive.

The author notes practical cautions for real exports. Lookups that return errors should be investigated rather than hidden with IFERROR, and the ranges must be widened for larger files. The check only verifies the relationships in the files loaded, so it does not certify a whole migration.
