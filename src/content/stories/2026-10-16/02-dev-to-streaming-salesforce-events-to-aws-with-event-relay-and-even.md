---
title: How to stream Salesforce Platform Events to AWS using Event Relay and EventBridge
original_title: Streaming Salesforce Events to AWS with Event Relay and EventBridge
url: https://dev.to/aws-builders/streaming-salesforce-events-to-aws-with-event-relay-and-eventbridge-4ac2
source: dev.to
source_type: community
date: 2026-10-16
section: integration
personas:
  - developer
  - admin
  - architect
tags:
  - event-relay
  - amazon-eventbridge
  - platform-events
  - aws-integration
  - error-recovery
authors:
  - Sabarish Sathasivan
why_read: You will learn how to configure Salesforce Event Relay to publish custom Platform Events to Amazon EventBridge without middleware. The guide covers channel setup, payload structure, error recovery options, and capacity limits so you can design a reliable integration.
interest_score: 7
depth_score: 8
novelty_score: 6
utility_score: 9
model: qwen/qwen3.7-flash
image: https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fhfpxgi2p7oana2diy4se.png
---

Organizations often rely on expensive middleware to synchronize Salesforce data with AWS applications. This article demonstrates a direct integration path using Salesforce Event Relay and the Amazon EventBridge partner connection, removing the need for third-party platforms. The example tracks Account creation and pushes the details to a DynamoDB table.

The configuration requires a Named Credential pointing to the target AWS account, a Channel grouping the specific Platform Event type, and an Event Relay linking the two components. Once activated, Salesforce publishes record changes to its internal event bus. The relay reads these messages and forwards them to a dedicated AWS partner event bus, maintaining delivery state to resume after transient failures.

The relayed payload places event fields under a detail node, allowing AWS routing rules to send messages to an SQS queue for buffering before a Lambda function processes them into DynamoDB. The author highlights critical operational parameters, including the seventy-two hour retention window, LATEST versus EARLIEST error recovery modes, daily delivery quotas per edition, and the necessity of designing idempotent consumers to handle duplicate messages during failover.
