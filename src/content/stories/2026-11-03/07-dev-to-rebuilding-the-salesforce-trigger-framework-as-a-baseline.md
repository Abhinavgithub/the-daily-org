---
title: A small owned trigger framework built around an explicit handler contract
original_title: Rebuilding the Salesforce trigger framework as a baseline
url: https://dev.to/aamirahkhan/rebuilding-the-salesforce-trigger-framework-as-a-baseline-2jhi
source: dev.to
source_type: community
date: 2026-11-03
section: architecture
personas:
  - developer
  - architect
tags:
  - apex-trigger-framework
  - trigger-handler
  - recursion-guard
  - custom-metadata
  - user-mode
  - unit-of-work
authors:
  - Aamir Khan
why_read: You will learn how to structure an Apex trigger framework with a single dispatcher, a recursion guard that tracks record IDs, layered bypass controls via Custom Metadata and a permission, and user-mode selectors with a savepoint-based unit of work. The author also explains why they chose an owned baseline over a third-party framework.
interest_score: 7
depth_score: 8
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fdrktzw6baqe39eidkveg.gif
figure:
  kind: steps
  caption: The trigger lifecycle checks run in a fixed order before the context hook is called
  steps:
    - Check bypass layers
    - Confirm trigger context
    - Check recursion guard
    - Mark records as handled
    - Call context hook
  icons:
    - lock
    - bolt
    - shield
    - check
    - flow
---

The author argues that Salesforce trigger frameworks usually fail on their contract rather than their code: when a handler runs, when it is skipped, what happens on re-entry, and who may bypass it. Their baseline is deliberately small, with a one-line trigger that delegates to a dispatcher. The lifecycle checks bypass settings first, confirms the code is running inside a trigger, resolves the context, verifies the SObject type, checks the recursion guard, marks records as handled, and then calls the context hook. Handlers only override the contexts they need and delegate rules to domain classes.

The recursion guard tracks which record IDs a named handler has already processed in the transaction, instead of using a static boolean. This avoids both blocking legitimate second passes for different records and re-entry from after-triggers. Bypass works in three layers: a runtime bypass for tests and controlled operations, an Is_Active__c flag on Custom Metadata to disable a handler without deployment, and a Custom Permission for integration users during data loads. Metadata is read once per transaction. The surrounding layers keep business logic out of the trigger, with selectors running in user mode and a unit of work that commits DML in a fixed order inside a savepoint.

The author reports that static checks and a check-only compile against an org caught configuration issues, and that the test suite exposed a null dereference outside trigger context and a wrong assumption about scheduled job execution in tests. The article closes by listing next steps, including removing defaults from test factories and enforcing the Permission Set in the deploy pipeline.
