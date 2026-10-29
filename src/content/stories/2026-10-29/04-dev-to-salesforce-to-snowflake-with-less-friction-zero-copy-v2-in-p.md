---
title: Setting up zero-copy V2 between Salesforce Data Cloud and Snowflake
original_title: "Salesforce to Snowflake, With Less Friction: Zero-Copy V2 in Practice"
url: https://dev.to/swaroop_krishna_e2f4b83b2/salesforce-to-snowflake-with-less-friction-zero-copy-v2-in-practice-4435
source: dev.to
source_type: community
date: 2026-10-29
section: data-cloud
personas:
  - admin
  - architect
  - developer
tags:
  - zero-copy-v2
  - snowflake
  - data-cloud
  - data-share
  - oidc
  - legacy-schema-alias
authors:
  - Krishna Tangudu
why_read: You will learn the setup steps for the Zero-Copy V2 connector, including the enrollment code handoff, consumer grants and legacy schema aliases. You will also see where change tracking via streams failed in one test.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The V2 setup runs between the Snowflake admin and the Salesforce admin in four steps
  steps:
    - Create connector and get Enrollment ID
    - Create Snowflake V2 target in Salesforce
    - Link Data Share to the target
    - Mount shared data and grant access
  icons:
    - plug
    - gear
    - bolt
    - lock
---

The author revisits connecting Salesforce data to Snowflake and reports that the V2 connector simplifies setup. The enrollment code replaces manual credential configuration, authentication uses OpenID Connect, and friendly names reduce SQL cleanup. Legacy schema aliases and grant comparisons before and after migration help keep existing access intact.

The walkthrough covers creating the connector and retrieving the Enrollment ID, then the Salesforce-side steps: creating a Snowflake V2 Data Share target, linking a Data Share to it, and mounting the shares in Snowflake as a linked database. It also covers granting usage and select privileges on existing and future views to the consuming role, and the choice between legacy and friendly naming.

The author's incremental test did not work. A stream on an exposed view failed with a change tracking error involving unmanaged Iceberg tables, so current-state queries worked but change feeds did not through that path. The author recommends confirming the supported source object and stream setup, then testing inserts, updates and deletes end to end before relying on downstream history.
