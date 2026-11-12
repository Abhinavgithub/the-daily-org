---
title: EGI-Bench scores AI agents across six enterprise skill dimensions
original_title: 6 AI Agent Capabilities to Evaluate Before Enterprise Deployment
url: https://engineering.salesforce.com/6-ai-agent-capabilities-to-evaluate-before-enterprise-deployment/
source: Salesforce Engineering
source_type: official
date: 2026-11-12
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - ai-agents
  - llm-evaluation
  - egi-bench
  - benchmarking
  - model-selection
authors:
  - Shelby Heinecke
why_read: You will learn how EGI-Bench groups eight benchmarks into six enterprise skill dimensions and a weighted global score, and what its tests found about choosing among 14 LLMs. You will also see how to run it in deep or quick mode and adjust the weights to your use case.
interest_score: 6
depth_score: 6
novelty_score: 6
utility_score: 6
model: anthropic/claude-haiku-5.5
figure:
  kind: compare
  caption: EGI-Bench's two run modes trade completeness for speed
  left:
    heading: Deep mode
    points:
      - Runs the benchmarks in full
      - Gives a comprehensive evaluation
  right:
    heading: Quick mode
    points:
      - Subsamples each benchmark
      - Gives a faster directional signal
  icons:
    - clock
    - bolt
image: https://engineering.salesforce.com/wp-content/uploads/2026/11/image-417a8f54.png?w=1024
---

Salesforce's AI research team has built EGI-Bench, a framework for judging whether the LLMs behind enterprise agents are ready for production. The authors argue that many benchmarks test narrow skills, so an agent can pass evaluation and still fail on real enterprise work. EGI-Bench combines eight independently developed benchmarks, spanning more than 20 subdomains and 1,500 test tasks.

The framework scores six dimensions: task outcomes, tool actioning, planning, grounding, safety and engineering. Sub-metrics from the eight benchmarks are mapped onto these dimensions and normalised so they can be combined. The six subscores are then weighted into a single global EGI score, with default weights that users can change to suit their priorities.

To keep runs practical, EGI-Bench offers a deep mode that runs the full benchmarks and a quick mode that subsamples each one for a faster directional signal. A weak result in quick mode can be investigated more deeply rather than triggering every test at once.

The team tested 14 LLMs and reports three findings. No single model led on all six dimensions, so model choice should follow the work the agent does. Multi-step planning scored low across the models. Lower-cost models, including Haiku 4.5, GPT-5 mini and Gemini 2.5 Flash, performed competitively. EGI-Bench is available on GitHub, with a technical report for further detail.
