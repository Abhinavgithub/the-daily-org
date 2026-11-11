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

The article argues that AI-generated Apex can be functionally correct and fully unit-tested yet still exhaust shared transaction budgets, because agents build each feature in isolation and small additions compound until a governor limit is breached. Standard small-data tests rarely expose this, and since governor limits are platform capacity ceilings, the author recommends treating them as architectural contracts and enforcing them automatically before code merges. It illustrates the compounding with a sprint-by-sprint example where SOQL consumption climbs from 15% to 59% through individually harmless changes.

The proposed approach has several parts. Teams should supply a shared, immutable GovernorLimitSnapshot test utility, require agents to write bulk tests of 200 records that capture before and after snapshots, and have CI verify that these test conventions are present. A table compares synchronous and asynchronous limits, and a budget-allocation table recommends consumption thresholds by execution context: roughly 40 to 50% for trigger code, 60 to 70% for service classes, 80 to 85% for isolated asynchronous jobs, and 20 to 30% for Scheduled Apex. Snapshots should be taken just before Test.stopTest() so the synchronous footprint is measured separately from asynchronous work, which is tested in its own method.

The article then describes a closed feedback loop in CI. When a test breaches its budget, a structured prompt containing the metric, consumption, threshold and required optimization steps goes back to the agent, which gets up to three attempts, with the delta between attempts supplied on later tries. If the third attempt fails, the merge is blocked and a human architect is asked to review, possibly moving the logic to Queueable. Agents must not be allowed to weaken tests or thresholds, and the author notes that some limits, such as callouts and Platform Event publishing, need production monitoring as well. Thresholds should start generous, use warning and violation tiers, and be tightened over time, with a closing checklist for rolling the pattern out.
