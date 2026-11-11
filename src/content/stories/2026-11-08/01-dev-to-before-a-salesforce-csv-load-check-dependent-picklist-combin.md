---
title: Checking dependent picklist combinations by Record Type before a CSV load
original_title: "Before a Salesforce CSV load: check dependent picklist combinations by record type"
url: https://dev.to/richardc_ailstudio/before-a-salesforce-csv-load-check-dependent-picklist-combinations-by-record-type-3nbh
source: dev.to
source_type: community
date: 2026-11-08
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - dependent-picklists
  - record-types
  - csv-import
  - object-info
  - data-migration
authors:
  - Richard C
why_read: You will learn how to snapshot dependent picklist values per Record Type from the UI API and run a local preflight that flags CSV rows whose controlling and dependent values do not fit the intended target configuration. The piece is clear that findings are review prompts, not proof of import rejection.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: The preflight runs in four stages before any row is trusted
  steps:
    - Save per-record-type dependent picklist response
    - Preserve exact API values in the CSV
    - Run local preflight against saved metadata
    - Review each non-match row with its owner
  icons:
    - doc
    - chart
    - test
    - person
figure_image: /figures/2026-11-08/01-dev-to-before-a-salesforce-csv-load-check-dependent-picklist-combin.png
---

The article argues that dependent picklist checks must be made on the pair of controlling and dependent values for the target Record Type, since a value valid in one Record Type may not be valid in another, and checking each column against a global list misses this. It recommends saving the dependent field response from the UI API object-info endpoint for each intended target Record Type, recording the org, API version and access scope, and keeping API values rather than translated labels.

A Python 3 standard-library script is provided that reads the saved metadata and a CSV, then assigns each row a status such as CONFIG_MATCH, COMBINATION_NOT_AVAILABLE, VALUE_NOT_AVAILABLE_FOR_TYPE, UNKNOWN_CONTROLLER or REVIEW_BLANK. The worked example with invented fields shows one match and five rows for review, and the script deliberately treats malformed or incomplete metadata as a review case rather than a pass.

The author is explicit about limits: the snapshot reflects UI-available combinations for the reader's access, not full server validation, and required fields, Validation Rules, Flows, field-level security and import-path behavior still need separate review. The approach is scoped to a single confirmed controlling and dependent single-select pair.
