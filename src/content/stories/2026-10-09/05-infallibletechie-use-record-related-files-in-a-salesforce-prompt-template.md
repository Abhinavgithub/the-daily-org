---
title: Configure Prompt Builder to ground Flex templates with Salesforce Files
original_title: Use Record Related Files in a Salesforce Prompt Template
url: https://www.infallibletechie.com/2026/10/use-record-related-files-in-a-salesforce-prompt-template.html
source: InfallibleTechie
source_type: community
date: 2026-10-09
section: agentforce-and-ai
personas:
  - admin
  - developer
tags:
  - prompt-builder
  - flex-prompt-template
  - salesforce-files
  - ai-grounding
  - prompt-configuration
authors:
  - Magulan Duraipandian
why_read: Readers will learn how to configure a Flex Prompt Template in Prompt Builder to automatically pass Salesforce Files attached to a record as context for an AI model. The guide covers prerequisites, step-by-step setup, sample prompt syntax, and security best practices.
interest_score: 6
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://www.infallibletechie.com/wp-content/uploads/2026/10/Salesforce-Files-Related-List-Notes-Attachments-Files-Prompt-Template.png
---

Prompt Builder now allows administrators and developers to attach Salesforce Files from a record Related List directly into a Flex Prompt Template. This grounds artificial intelligence models with actual document content instead of relying solely on record fields, reducing manual review time for tasks like vendor evaluation or contract analysis.

The setup requires three main actions inside Prompt Builder. First, create a Flex Prompt Template to define custom inputs. Second, add an Object type input pointing to the target record, such as Account. Third, insert the Notes and Attachments Related List as a resource within the prompt workspace so the system can resolve the attached files during execution.

Only Salesforce Files are supported, meaning legacy classic attachments must be converted before testing. Builders must assign the Prompt Template Manager Permission Set or Customize Application permission, and select an artificial intelligence model that accepts file inputs. The article recommends previewing templates with representative records, screening documents for sensitive data, and maintaining human oversight for generated summaries.
