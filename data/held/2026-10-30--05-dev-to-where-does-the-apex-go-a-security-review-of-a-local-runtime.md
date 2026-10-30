---
title: What a local Apex runtime sends off the machine, and what it keeps
original_title: Where does the Apex go? A security review of a local runtime
url: https://dev.to/oblitus/where-does-the-apex-go-a-security-review-of-a-local-runtime-ilc
source: dev.to
source_type: community
date: 2026-10-30
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
---

renmy runtime is a local Apex runtime and developer toolchain that executes Apex, SOQL, DML and Flows on a developer's machine against an embedded PostgreSQL, without an org, Docker or a JVM. The article presents it as a security review. Apex source is read from the working tree and sent nowhere, and the schema comes from project metadata, so a test run needs no connected org, JWT certificate or sandbox. Test data stays in an in-process database with no open network port and is rolled back after each test.

Network behaviour depends on tier and command. The Free tier needs no network access. Telemetry is one privacy-minimal activation event sent to an EU-hosted Supabase instance, disabled with renmy.telemetry = false or the RENMY_TELEMETRY variable. Pro and Team licence validation sends the licence key and, on activation, a hashed installation ID, hostname, OS and account ID, but never code or org data. Licences validate offline for up to 7 days, and the binary can be installed air-gapped, with on-premise validation offered to Enterprise customers.

The article stresses that the Salesforce org remains the system of record and final deployment target, with validation and deployment still happening there. The author lists the network table command by command and the documents to attach to a request.
