---
title: Tracing retrieval-augmented generation accuracy failures backward through the context pipeline
original_title: "Enterprise AI Accuracy: Building a More Trustworthy RAG Application"
url: https://engineering.salesforce.com/enterprise-ai-accuracy-building-a-more-trustworthy-rag-application/
source: Salesforce Engineering
source_type: official
date: 2026-10-04
section: agentforce-and-ai
personas:
  - developer
  - architect
tags:
  - rag
  - document-parsing
  - semantic-search
  - sfr-embedding
  - knowledge-graph
  - ai-architecture
authors:
  - Sivakumar Shanmugam
  - Kartik Muktinutalapati
why_read: You will learn how to isolate and fix accuracy failures in a retrieval augmented generation pipeline by tracing errors backward through parsing, chunking, and retrieval stages. The article also outlines Salesforce specific tools and architectures that improve enterprise document processing and query performance.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/09/image_ea8f34.png?w=1024
---

The authors describe a RAG application that passed standard text benchmarks above 90% but gave customers wrong answers in production. On complex, customer-representative enterprise documents, accuracy fell to about 46%. Errors could start at any stage: parsing, chunking, enrichment, embedding, retrieval, or answer generation. The central point is that an LLM only sees the context the pipeline preserves, so if information was lost earlier, a stronger model or a rewritten prompt will not recover it. The recommended debugging method is to trace each wrong answer backward through the pipeline, checking first whether the needed context arrived intact and then whether retrieval, chunking, or parsing removed it.

On parsing, the article argues that one strategy does not fit every page. Simple prose can go through a fast deterministic parser, while pages with tables, charts, or diagrams need processing that can interpret visual structure and relationships. Multi-page tables should be kept as one logical unit so their headers still apply after a page break. The authors say their Intelligent Parsing approach routes content by complexity at the page level, raising accuracy in a staged benchmark from 65.1% to 84.4%.

On chunking, the authors recommend treating chunk boundaries as units of meaning rather than storage limits. Headers should stay with their tables, diagrams with their explanations, and procedural steps in order, with overlap used when a split is unavoidable. Chunks can be enriched with summaries, tags, structural context, likely user questions, and file-level details such as title and filename. The article also cites SFR Embedding v3, which extends context capacity from 512 to 8,000 tokens, and reports that enriched indexing raised accuracy from 84.4% to 86.8%.

For retrieval, the article warns that the most semantically similar chunk may belong to the wrong product or context. Explicit constraints such as product, region, or customer tier should be applied as metadata pre-filters before similarity ranking. Questions whose answers depend on facts spread across documents may need GraphRAG, which builds a knowledge graph so an agent can traverse multi-hop relationships; the article says it is slated for general availability in November 2026. Each retrieval method should match the question's shape.

Finally, the authors advise measuring one change at a time against a human-validated end-to-end benchmark, so that each gain can be attributed to a specific stage. They also cover latency: moving payloads under 100 MB from a Spark-based batch architecture to a service-based Just-in-Time indexing architecture cut indexing time three to four times, from more than 30 minutes to about seven to ten minutes.
