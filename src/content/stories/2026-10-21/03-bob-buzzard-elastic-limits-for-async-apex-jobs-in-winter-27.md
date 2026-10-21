---
title: How elastic limits extend Async Apex capacity and throttle processing in Winter '27
original_title: Elastic Limits for Async Apex Jobs in Winter '27
url: https://bobbuzzard.blogspot.com/2026/10/elastic-limits-for-async-apex-jobs-in.html
source: Bob Buzzard Blog
source_type: community
date: 2026-10-21
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - async-apex
  - elastic-limits
  - orglimits
  - governor-limits
  - batch-jobs
authors:
  - Bob Buzzard
why_read: You will learn how the Winter '27 extension of elastic limits increases Async Apex capacity while throttling throughput, and how to monitor usage with the OrgLimits class.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2ulcFXshI7uI31TQBxfysYYfY-lDv12rYHUh14VbRyyBxooQGQN-Q_pZ88eADvRwyysaTMPSLS_v-KVme-BuPElnIkIeXyWpdO5376H5RTZy8nwPuclKICBmWakU3hpP66R7cI5Juon7ikAmmZDfRUJM8jNJbUA5Va3c21cYA_rBYjB3c0SzDQmTtO9CG/s72-c/elastic.jpg
---

The Winter '27 release extends the beta capability of elastic limits to Batch jobs, following its initial introduction for Queueable and Future methods in Summer '26. When standard asynchronous governor limits are reached, the system allows additional enqueues up to a secondary cap calculated as the minimum of two million or the standard limit. Enqueued jobs beyond the baseline trigger throttling, which slows active processing and restricts Batch jobs to a single concurrent instance.

Developers can track consumption using the OrgLimits class, specifically querying the DailyAsyncApexElasticExecutions metric alongside the standard daily limit. The feature remains exclusive to production environments, meaning sandbox and trial orgs do not receive the extra capacity. Salesforce intentionally omits exact throttling metrics to prevent teams from treating the slowdown behavior as a guaranteed service level.

Scheduled Apex does not support elastic limits because the feature trades execution speed for additional volume, which conflicts with the time-sensitive nature of scheduled runs. The author advises using the extra capacity strictly as a resilience buffer rather than a primary scaling strategy, recommending that organizations investigate root causes when they regularly approach baseline limits.
