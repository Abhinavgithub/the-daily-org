---
title: Understanding the new Apex heap limits and transition settings in Winter '27
original_title: Increased Apex Heap Size in Winter '27
url: https://bobbuzzard.blogspot.com/2026/09/increased-apex-heap-size-in-winter-27.html
source: Bob Buzzard Blog
source_type: community
date: 2026-10-04
section: apex-and-platform
personas:
  - developer
  - architect
tags:
  - apex-heap
  - winter-twenty-seven
  - platform-limits
  - transaction-scaling
  - apex-settings
authors:
  - Bob Buzzard
why_read: Readers will learn the exact new synchronous and asynchronous Apex heap limits in Winter Twenty Seven and how to configure non-production orgs during the transition. The piece also explains how larger memory allocations impact transaction scaling, user experience, and downstream system stability.
interest_score: 7
depth_score: 7
novelty_score: 8
utility_score: 8
model: qwen/qwen3.7-flash
image: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0HSKqT9TN7oyBfGdzik5S2VYq-28pqxN-RydQz16kXvKWWjvn2jHeMF9cmrmTMQkP23bWG7-5rFMV72iw6UPapes5TWaJMitJxU4eS880pDzflZOGjJkkx1GvSVaGnJJYYgIx0gbAQPJiFjEMiJFTEJGRLA3cNJb8H91IHIypzi4NF4kml4NiLCmJh4_b/s72-w320-h292-c/ceiling.png
---

The Winter Twenty Seven release increases the synchronous Apex heap limit from six megabytes to ten megabytes and raises the asynchronous limit from twelve megabytes to twenty-five megabytes. To manage the transition safely, administrators can use Apex Settings to force non-production orgs to retain the previous Summer Twenty Six limits until code is verified against the new thresholds.

Testing with large compressed files shows that the additional memory allows significantly larger payloads to be processed in a single transaction, though compression algorithms and file structure still dictate actual heap consumption. The author notes that higher memory availability does not automatically improve throughput, as CPU limits and governor constraints remain unchanged.

Larger heaps introduce risks such as overwhelming end users with unfiltered data tables, overloading downstream APIs, or masking existing logic flaws that previously failed at smaller record counts. The article concludes that developers should continue writing code that conserves resources and batches workloads, treating the increased limits as capacity for legitimate growth rather than a target to hit routinely.
