---
title: Upserting Contacts to Accounts with an External ID in Data Loader
original_title: How to upsert related Salesforce records with an External ID (load Accounts before Contacts)
url: https://dev.to/richardc_ailstudio/how-to-upsert-related-salesforce-records-with-an-external-id-load-accounts-before-contacts-3jh1
source: dev.to
source_type: community
date: 2026-11-14
section: integration
personas:
  - admin
  - developer
tags:
  - external-id
  - data-loader
  - upsert
  - account-contact
  - data-migration
authors:
  - Richard C
why_read: You will learn how to set up a unique External ID on Account, load Accounts before Contacts, and map the source key to relate them without a post-load VLOOKUP. You will also see which reference fields cannot be mapped to External IDs and what still breaks.
interest_score: 7
depth_score: 7
novelty_score: 4
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The order of operations for relating Contacts to Accounts by External ID
  steps:
    - Create unique External ID on Account
    - Back up and test a small subset
    - Upsert Accounts
    - Upsert Contacts, mapping Account:External_ID__c
  icons:
    - database
    - shield
    - layers
    - people
held_from: 2026-11-11
---

Relationships in Salesforce are stored as record IDs, so a source system's Account key in a Contact file cannot be used as AccountId. The walkthrough follows Salesforce Help: create or reuse a unique External ID field on Account, load Accounts first (insert, or upsert for reruns), then upsert Contacts and map the source-key column to the Account:External_ID__c field.

The steps include backing up and testing with a small subset, and the Data Loader wording is quoted from Salesforce Help rather than a live run. The example data is invented and was not loaded into an org. A Contact whose key is missing from the Accounts will fail, and that failure appears in the error file.

The piece lists the main failure causes: blank or non-unique External IDs, child rows loaded before the parent, and Lookup Filters or Validation Rules. It also notes that Polymorphic Fields and a Custom Object's Owner cannot be mapped to External IDs, and that a successful upsert does not prove the source key was correct.
