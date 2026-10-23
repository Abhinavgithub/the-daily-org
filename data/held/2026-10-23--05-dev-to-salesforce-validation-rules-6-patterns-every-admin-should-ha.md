---
title: Six practical Validation Rule patterns to improve data quality in Salesforce
original_title: "Salesforce Validation Rules: 6 Patterns Every Admin Should Have Ready"
url: https://dev.to/rohanmehta/salesforce-validation-rules-6-patterns-every-admin-should-have-ready-2l5g
source: dev.to
source_type: community
date: 2026-10-23
section: flow-and-admin
personas:
  - admin
tags:
  - validation-rule
  - declarative-config
  - data-quality
  - formula-field
  - error-handling
authors:
  - Rohan Mehta
why_read: Readers will learn six ready-to-use Validation Rule formulas that prevent common data entry mistakes, along with best practices for writing clear field-level error messages.
interest_score: 6
depth_score: 4
novelty_score: 2
utility_score: 8
model: qwen/qwen3.7-flash
---

The article outlines six Validation Rule patterns designed to catch frequent user errors without requiring Apex or Flow. These include preventing Closed Won Opportunities from missing amounts or close dates, blocking Cases with backdated open dates beyond a seven day window, and ensuring close dates never precede creation dates.

Additional patterns address picklist state management by stopping records from reverting to New once closed, unless a custom bypass permission is granted. The piece also requires a reason field when priority changes to High status, and locks amount fields during approval reviews to prevent revenue leakage.

Beyond the formulas, the author emphasizes error message hygiene. Rules should be named clearly, descriptions filled out for audits, and errors placed at the field level rather than the page header. Messages must instruct users on the correct action instead of simply stating an invalid value. The author notes that while Validation Rules stop immediate data issues, field level required attributes or Flow notifications may be better alternatives for certain workflows.
