---
title: What a local Apex runtime sends off the machine, and what it keeps
original_title: Where does the Apex go? A security review of a local runtime
url: https://dev.to/oblitus/where-does-the-apex-go-a-security-review-of-a-local-runtime-ilc
source: dev.to
source_type: community
date: 2026-11-01
section: devops
personas:
  - architect
  - developer
  - admin
tags:
  - apex
  - local-runtime
  - security-review
  - ci-cd
  - telemetry
authors:
  - René Knierim
why_read: You will know where Apex source, test data and licence details go when renmy runtime runs, which settings turn telemetry off, and how it works offline and air-gapped. It is the questionnaire answers a security or procurement team will ask for.
interest_score: 6
depth_score: 8
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Where Apex runs and where data lives, before and after a local runtime
  left:
    heading: Org-based test runs
    points:
      - Each test run deploys to a Salesforce org
      - Test data sits in the org sandbox
      - Each developer needs an org credential
  right:
    heading: Local runtime
    points:
      - Tests run on the developer's machine
      - Test data lives in an in-process database
      - Test runs need no org or credential
  icons:
    - cloud
    - shield
held_from: 2026-10-30
---

This vendor-written piece, published by Renmy UG of Berlin, gives security and procurement teams the answers they need for a questionnaire about renmy runtime, a local Apex runtime formerly called Nimbus. It executes Apex, SOQL, DML and Salesforce Flows on a developer's machine against an embedded PostgreSQL, without an org, Docker or a JVM. Apex source is read locally and sent to no one. Tests run against schema read from the project's metadata, so they need no connected org, and test data sits in an in-process database with no open network port, rolled back after each test.

The article then sets out what leaves the machine. The Free tier needs no network access. By default the runtime sends one privacy-minimal activation event to an EU-hosted service, which excludes code, paths, test names and record data. Pro licences also record one de-duplicated activation from headless CI. Either can be switched off with a single setting or environment variable. Pro and Team licence checks send the licence key to the Keygen licensing API, at most once a day. Activating a machine with renmy login also sends a hashed installation ID, hostname, display name, OS, architecture, CPU core count and account ID. Licences are cached for offline use for up to seven days.

For disconnected networks, the article says the binary can be copied into place without internet access, since the database engine is embedded, and the daily update check can be disabled. Enterprise customers can have licence validation on premises, with pricing from $20,000 a year. A command-by-command table lists what each command contacts. The Salesforce org remains the system of record and deployment target. The deploy flow validates the same payload in the org before deploying, and Pro release commands produce signed receipts for auditors.

The piece closes with a list of documents to attach to the questionnaire, including the security page, data processing addendum, subprocessor list and licence terms. It also gives pricing: Free at $0, Pro and Team free during the public beta with listed prices of $19 and $49 per month, and Enterprise on a custom contract.
