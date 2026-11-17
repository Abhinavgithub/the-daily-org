---
title: Seven bugs that passed a 113-test Salesforce suite and the fix for each
original_title: 7 bugs that passed 100+ tests in my Salesforce starter kit
url: https://dev.to/apexcraftstudio/7-bugs-that-passed-100-tests-in-my-salesforce-starter-kit-bm1
source: dev.to
source_type: community
date: 2026-11-17
section: devops
personas:
  - developer
  - architect
tags:
  - apex-testing
  - trigger-framework
  - lightning-web-components
  - cacheable-apex
  - lightning-data-service
  - debugging
authors:
  - ApexCraft Studio
why_read: You will learn seven ways Apex and LWC code can pass its tests yet fail in a real org, including keyset paging, retried saves, restricted picklists and cacheable methods. Each comes with a concrete fix and a check you can run on your own code.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: The author's fixes for two of the seven bugs, set side by side
  left:
    heading: Recursion guard (bug 2)
    points:
      - Static Id set skips retried records
      - Silent skip with all-or-none off
      - Compare old and new values instead
  right:
    heading: Cacheable refresh (bug 5)
    points:
      - cacheable=true returns stale rows
      - Mocked Jest tests cannot catch it
      - Drop cacheable or use refreshApex()
figure_image: /figures/2026-11-17/02-dev-to-7-bugs-that-passed-100-tests-in-my-salesforce-starter-kit.png
---

The author's starter kit had 113 passing tests, 68 Apex and 45 Jest, and deployed cleanly to a real org. A tester clicking through the data table and a reviewer reading the code together found seven bugs that no test had caught. The gaps lay between what the tests checked and what a live org did.

The first bug was a paged table that kept showing page one. The server used a keyset cursor, and a cached browser component sent only a page number, so the server treated every request as page one. The tests called each version with the arguments it expected, so an old client against a new server was never tested. The fix is to fall back to offset paging when a later page arrives without a cursor, and to check what an old client would receive after changing an @AuraEnabled contract. The second bug was a static Id-based recursion guard that silently skipped retried records when a save ran with all-or-none off. The fix is to compare old and new values and recalculate for work that is safe to repeat, keeping an Id guard only for work that must happen exactly once.

The third bug was a logger whose Platform Event carried any LoggingLevel name, while the Log__c picklist allowed only ERROR, WARN, INFO and DEBUG. Logs finer than DEBUG failed silently in the subscriber trigger. The fix is to store anything finer as DEBUG, and to test every restricted picklist with a value outside its list. The fourth was an example Account trigger shipped switched on, which changed the data of anyone who deployed the kit. Example code should ship disabled, and the tests should enable handlers only while they run.

The fifth bug was a refresh() method that could show stale rows, because the backing Apex method was cacheable. Jest mocks cannot catch this, so it appears only in a real browser. The fix is to drop cacheable=true where current data matters, or to use @wire with refreshApex(). The sixth was a no-CLI zip, built by hand, that still held six older files. The fix is to build the zip from the source folder in one script, compare every file, and deploy the zip as the final test. The seventh was an offset calculation that overflowed for very large page numbers before the row-limit check ran. The fix is to compare before multiplying.

The author groups the bugs into gaps between versions, between code and platform, between the developer's org and the buyer's, and at input edges nobody types on purpose. The closing advice is that passing tests cover only what the developer thought of, so manual testing and fresh review are needed before calling code production-ready.
