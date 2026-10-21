---
title: A VS Code extension runs anonymous Apex and SOQL with a single keyboard shortcut
original_title: "Virga: run anonymous Apex and SOQL from a VS Code tab with Ctrl+S"
url: https://dev.to/wiktormalyska/virga-run-anonymous-apex-and-soql-from-a-vs-code-tab-with-ctrls-2ih6
source: dev.to
source_type: community
date: 2026-10-21
section: apex-and-platform
personas:
  - developer
tags:
  - vs-code-extension
  - anonymous-apex
  - soql
  - salesforce-cli
  - language-server
authors:
  - Wiktor Małyska
why_read: Readers will learn how to install and configure Virga to execute throwaway Apex and SOQL scripts without leaving the editor. The piece also explains how the extension resolves common language server completion issues and disables telemetry during local runs.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fpr2204vx457ktaiqurlr.png
---

Virga is a free VS Code extension designed to streamline the execution of throwaway Apex and SOQL scripts directly within the editor. Setup requires VS Code version 1.90 or newer, the Salesforce CLI on the system path, and an active Salesforce DX project. Users create dedicated scratch tabs for either language, trigger execution with a keyboard shortcut, and receive formatted output showing compilation status, debug logs, governor limits, or flattened query results.

The tool handles execution through a temporary file copy rather than direct command line arguments, which prevents partial edits from affecting the run. It achieves a seamless experience by applying a brief auto-save delay that clears tab dirtiness markers, allowing instant closure without save prompts. Scratch files persist in a version control ignored folder and survive editor restarts, while conflicting keymaps are handled to preserve the shortcut exclusively for scratch contexts.

Beyond basic execution, the extension patches gaps in the standard Salesforce Extension Pack. It adds completion support for inner types declared in the same file, identifies and offers quick fixes for parameter shapes that crash the language server, and supplies missing snippets for annotations and user mode operations. Privacy is maintained by automatically disabling Salesforce CLI telemetry for each run, though administrators can enforce global telemetry suppression through standard configuration commands.
