---
title: Lessons from building a Flow Version Cleaner on the Tooling API
original_title: 7 Architectural Lessons From Building With the Tooling API
url: https://www.salesforce.com/blog/tooling-api-architectural-lessons/
source: Salesforce Architects
source_type: official
date: 2026-10-30
section: architecture
personas:
  - architect
  - developer
tags:
  - tooling-api
  - flow-versions
  - named-credentials
  - asynchronous-apex
  - destructive-operations
authors:
  - Samruddhi Zala
why_read: You will learn how to choose between the Tooling API, Metadata API and Apex Metadata for deleting flow versions, and how to handle authentication, object dependencies and state across asynchronous jobs. The piece also sets out safeguards for destructive metadata automation.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 7
model: anthropic/claude-haiku-5.5
image: https://www.salesforce.com/blog/wp-content/themes/salesforce-blog/dist/images/offer-block/offer-illustration-layout-one.png
figure:
  kind: steps
  caption: The cleaner's flow version decision sequence, from protected versions to safe deletion
  steps:
    - Keep the active flow version
    - Keep newer versions under review
    - Keep recent inactive versions as fallback
    - Delete flow interviews via callouts
    - Delete remaining obsolete flow versions
---

The author built an open-source Flow Version Cleaner to prune obsolete flow versions in orgs with hundreds of flows. The tool keeps the active version, keeps newer versions that may be under review, and retains a configurable number of recent inactive versions as a fallback. Requirements were refined during the build, once it became clear that version numbers alone do not show which versions are safe to remove.

The article compares the Apex Metadata namespace, the Metadata API with destructive changes, and the Tooling API. The Tooling API was chosen because it lets each flow version be queried and deleted individually at run time, so one failure does not roll back the whole run. Authentication uses Named Credentials rather than the running user's session, since session IDs can be null in asynchronous work and should not carry the permissions of whoever started the job. Flow interviews must be deleted before flow versions, and because Apex does not allow a callout after DML in the same transaction, both steps use callouts. Versions owned by managed packages cannot be deleted by subscribers.

For asynchronous work, the author recommends building an explicit payload between jobs, since inner-class fields can arrive null without any error, and using one snapshot of org state for both the decision and the action. Destructive metadata work should run in dry-run mode first, record every candidate, and isolate failures, because deleted metadata cannot be restored from the Recycle Bin.
