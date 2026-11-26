---
title: Combining Selected and Edited Data Table Rows in a Screen Flow
original_title: How to Combine Selected and Edited Data Table Rows in Flow
url: https://salesforcetime.com/2026/11/25/how-to-combine-selected-and-edited-data-table-rows-in-flow/
source: Salesforce Time
source_type: community
date: 2026-11-26
section: flow-and-admin
personas:
  - admin
  - developer
tags:
  - screen-flow
  - data-table
  - transform-element
  - collection-filter
  - inline-editing
authors:
  - Yumi Ibrahimzade
why_read: "You will learn why a Data Table's Selected Rows and Edited Rows outputs must be merged to get the chosen records with their updated values. You will also see two ways to do it: a single Transform element, which drops unedited selections, and a Loop with Collection Filter, which keeps every selected row."
interest_score: 6
depth_score: 7
novelty_score: 5
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: Option 2 merges the two outputs by looping over the selected rows
  steps:
    - Loop over Selected Rows
    - Collection Filter on edited Id
    - "Decision: match found?"
    - Assign edited Quantity
    - Add row to new collection
image: https://salesforcetime.com/wp-content/uploads/2026/11/image-24.png
---

The standard Data Table component in Screen Flow can return selected rows and edited rows as two separate collections. The Selected Rows output holds the records the user picked but not their edited field values, while the Edited Rows output holds the changed values whether or not the row was selected. Neither output alone gives the set of selected records with their updated values, and the component does not offer a single combined output.

The article's example is a screen where users pick Price Book Entry records and enter a quantity for each, using a custom Quantity field. The author notes that a user can edit a row without selecting it, or select it without editing, so the two outputs must be merged to get the list the flow needs.

The first option uses a Transform element with the two outputs as sources, joined on Id. The Quantity must be mapped from the Edited Rows collection to get the user's value. This is simple and needs no loops, but it performs an inner join, so a selected row with no edit is excluded. The article suggests this fits when every selected row is expected to be edited.

The second option keeps all selected rows. A Loop runs over Selected Rows, a Collection Filter finds any matching edited record by Id, and a Decision checks whether a match exists. If one does, an Assignment copies its Quantity; if not, the original values are kept. Each row is then added to a new collection. The author says this uses more elements but gives more control. The choice depends on whether unedited selections should be kept.
