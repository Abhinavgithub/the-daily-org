---
title: A raw List in an @InvocableMethod stops Apex completion across the whole file
original_title: How a raw List in an @InvocableMethod breaks Apex completion, measured on 274 signatures
url: https://dev.to/wiktormalyska/how-a-raw-list-in-an-invocablemethod-breaks-apex-completion-measured-on-274-signatures-1df7
source: dev.to
source_type: community
date: 2026-10-31
section: devops
personas:
  - developer
  - admin
tags:
  - apex
  - invocablemethod
  - language-server
  - vs-code
  - completion
  - raw-list
authors:
  - Wiktor Małyska
why_read: You will learn how a raw List parameter in an @InvocableMethod crashes the Apex language server and disables member completion in the file, which signature shapes trigger it, and how the author's VS Code extension detects and fixes them.
interest_score: 7
depth_score: 8
novelty_score: 7
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: Raw List parameters break completion in invocable methods but not in ordinary ones
  left:
    heading: Raw List in @InvocableMethod
    points:
      - Server logs IllegalArgumentException
      - Completion lost across the whole file
      - Shape not checked against element type
  right:
    heading: Raw List in plain method
    points:
      - Only a syntax error is reported
      - Completion keeps working
      - Harmless, so not flagged
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fi3m0hboqkfytq9fwrweq.png
figure_image: /figures/2026-10-31/05-dev-to-how-a-raw-list-in-an-invocablemethod-breaks-apex-completion.png
---

The author wrote an @InvocableMethod with a raw List parameter and found that member completion stopped working throughout the class, while the Problems panel showed only a generic syntax error. The cause is an exception inside jorje, the Apex language server in the Salesforce Extension Pack. For invocable, static @AuraEnabled, @Http and global methods, the server unwraps the element types of collection parameters and expects exactly one type argument, so a raw List produces an empty list and the check fails.

To separate harmful shapes from harmless ones, the author ran the language server headless against 274 signatures and recorded whether it logged an exception and whether completion came back empty. A raw List in an invocable method crashed the file, as did List, unfinished forms and wrong argument counts. A raw List in an ordinary method was only a syntax error with completion intact, and Set and Map in invocable methods were clean. A raw collection as a return type makes the parser drop the method, which limits the damage to that method.

The author's extension, Virga, flags only the shapes that broke, using two diagnostic codes, and offers quick fixes that insert a type such as List chosen from the file. After applying the fixes, the server stopped throwing in all 184 breaking cases and completion returned in 180 of 181 where it had failed.
