---
title: Running Apex tests locally lets new developers skip the sandbox wait
original_title: "Onboarding Salesforce developers: day one, without an org"
url: https://dev.to/oblitus/onboarding-salesforce-developers-day-one-without-an-org-53jd
source: dev.to
source_type: community
date: 2026-10-30
section: devops
personas:
  - developer
  - admin
  - architect
tags:
  - renmy-runtime
  - local-apex-testing
  - developer-onboarding
  - sfdx-project
  - ci-pipeline
authors:
  - René Knierim
why_read: You will learn how a committed renmy.properties file and a local Apex runtime let a new developer run the full Apex test suite on day one without an org. You will also see the same command reused in CI, with its trade-offs.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Day one with a local Apex runtime takes four steps, none of which needs an org
  steps:
    - Clone the repository
    - Install renmy runtime
    - Run renmy doctor
    - Run renmy test
---

The article argues that onboarding a Salesforce developer usually means waiting days for a sandbox, a user, a Permission Set and VPN access before the first Apex test can run. It presents renmy runtime, a local Apex runtime made by Renmy UG in Berlin, as a way to skip that wait. The tool executes Apex, SOQL, DML and Salesforce Flows on the developer's machine against an embedded PostgreSQL, ships as one binary for macOS, Linux and Windows, and needs no org, Scratch Org, Docker or JVM. The author says governor limits are enforced and each test runs in its own transaction, and cites a public benchmark in which 837 tests ran roughly 45 times faster locally than in an org.

The article walks through a four-step day one: clone the SFDX repository, install the binary with a one-line script (or let the IntelliJ plugin or VS Code extension handle it), run renmy doctor to check the project layout, and then run renmy test "" or narrow it to a class or method. The test environment lives in a renmy.properties file that the team lead generates with renmy config init and commits to the repository. That file sets org defaults such as currency, locale and timezone, seeds Custom Settings so code reading getOrgDefaults() works without @testSetup, and defines a stricter ci profile. Permission Sets load from metadata already in the repository.

Some gaps still need attention. Managed packages whose source is hidden need stubs pulled once by someone with org access and then committed, and multi-currency orgs need a feature flag. The doctor output and failure traces name missing pieces, so closing a gap in the repository helps every later developer. Org access remains necessary for deployment and browser-based work, so the access request still goes in on day one but is off the critical path. The same renmy test "" command runs in CI with the ci profile and needs no connected org, though it requires a license key secret. The Free tier costs nothing per developer for one machine, while the Team tier adds CI runs and seat management, is free during the public beta, and lists at $49 per developer per month. The article concludes that sandboxes remain the right place for UI work and deployment.
