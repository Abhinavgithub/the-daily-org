---
title: Salesforce developer docs now offer Markdown copies and llms.txt for AI tools
original_title: Bring Salesforce Developer Docs into Your AI Tools
url: https://developer.salesforce.com/blogs/2026/11/bring-salesforce-developer-docs-into-your-ai-tools
source: Salesforce Developers Blog
source_type: official
date: 2026-11-25
section: releases
personas:
  - developer
  - admin
  - architect
tags:
  - llms-txt
  - markdown
  - ai-assistants
  - salesforce-docs
  - agentforce-vibes
authors:
  - Kyle Jackson
why_read: You will learn how to get any Salesforce developer doc page into an AI assistant as clean Markdown, how to point agents at the llms.txt index, and where these actions are not available.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: none
image: https://d259t2jj6zp7qm.cloudfront.net/images/20261119121043/Generic-B-9-e1795119054922.png?w=1000
---

Salesforce Developers documentation now includes a row of actions below each page title on the newer docs. Previously, AI tools often received bloated HTML or empty shells from client-rendered pages, and copying text lost headings, lists and code blocks. The new actions let readers copy a page as Markdown, view its Markdown version, or copy a direct Markdown link. The first actions arrived in June 2026, and AI-focused options were added in October 2026.

The toolbar also gives agents a map of the documentation. The main llms.txt file, which follows an open standard, lists more than 40 products, and each product has its own llms.txt file linking to the Markdown version of every page. Readers can open the main index, or copy its URL to add to an assistant's sources or an agent's instructions, so an agent can locate the right page without searching the web.

The More actions menu also opens ChatGPT, Claude or Perplexity with a prompt that names the page and links to the docs map. These options pass links rather than page text, so the assistant needs web access enabled and must follow the links itself. The actions appear only on English pages in the newer docs, and not on some API reference pages built from a spec.

Under the hood, Markdown files are generated during the documentation build from the same source as the HTML pages, sharing a URL path with a different extension. Each product build produces its own llms.txt, and the main index combines them without overwriting entries from other products.
