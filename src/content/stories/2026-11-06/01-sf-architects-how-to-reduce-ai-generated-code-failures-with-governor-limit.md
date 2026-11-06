---
title: Catching AI-Generated Apex that breaks governor Limits with budget tests in CI
original_title: How to Reduce AI-Generated Code Failures With Governor Limit Testing
url: https://www.salesforce.com/blog/governor-limit-testing-ai-generated-code/
source: Salesforce Architects
source_type: official
date: 2026-11-06
section: devops
personas:
  - developer
  - architect
tags:
  - governor-limits
  - apex-testing
  - ai-generated-code
  - ci-cd
  - bulkification
  - limits-class
authors:
  - Sakthi Kuppusamy
why_read: You will learn how to measure governor limit consumption in Apex tests, set per-context budgets, and close the loop so AI agents fix limit-heavy code before it merges. The post includes a snapshot class pattern, a limits table and a retry-and-escalation design.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: anthropic/claude-haiku-5.5
figure:
  kind: steps
  caption: How the CI loop handles a governor limit breach in agent-written code
  steps:
    - Agent pushes code with bulk tests
    - CI measures limit consumption
    - Breach sends feedback to agent
    - Up to two refactor attempts
    - Human architect review if still failing
  icons:
    - code
    - check
    - warning
    - robot
    - people
image: https://www.salesforce.com/blog/wp-content/uploads/sites/2/2026/11/Blog-Images-Prevent-Agentic-Code-Failures-with-Governor-Limits-Testing-edited.png?strip=all&#038;quality=95
---

The article argues that AI-generated Apex can pass unit tests and still exhaust shared transaction limits, because agents write each feature in isolation and never see the cumulative cost of other automation in the same transaction. Each addition can look harmless while the total climbs until one change breaches a limit. The author therefore treats governor limits as architectural contracts that need automated enforcement rather than prompt instructions alone.

The post sets out a measurement framework built on the Limits class and a reusable GovernorLimitSnapshot test class. It recommends synchronous and asynchronous limit budgets per execution context, such as 40 to 50 percent for trigger logic and 80 to 85 percent for isolated asynchronous jobs, and bulk tests at the 200-record trigger batch size. It also explains that test isolation and sandbox behavior can hide real production pressure, so budgets should be checked at merge time.

Finally, the author describes a CI feedback loop in which violations are fed back to the agent with the metric, consumption and threshold, allowing up to two refactor attempts before a human architect is asked to review. The approach is practical for teams already using autonomous coding pipelines.
