---
title: Architecting real-time mobile personalization with server-side decisioning and content zones
original_title: Engineering Real-Time Mobile Personalization Across iOS, Android, React Native, and Flutter
url: https://engineering.salesforce.com/engineering-real-time-mobile-personalization-across-ios-android-react-native-and-flutter/
source: Salesforce Engineering
source_type: official
date: 2026-10-04
section: architecture
personas:
  - developer
  - architect
tags:
  - mobile-personalization
  - data-360
  - sdk-integration
  - cross-platform
  - identity-resolution
authors:
  - Scott Nyberg
why_read: You will learn how to separate app instrumentation from campaign configuration so marketers can update experiences without app releases. The piece also explains how to maintain consistent identity resolution and dynamic native rendering across iOS, Android, React Native, and Flutter using server-side decisioning.
interest_score: 7
depth_score: 7
novelty_score: 6
utility_score: 8
model: qwen/qwen3.7-flash
image: https://engineering.salesforce.com/wp-content/uploads/2026/09/Engineering-Real-Time-Mobile-Personalization-Across-iOS-Android-React-Native-and-Flutter.png?w=1020
---

The team built a unified architecture to deliver real-time mobile personalization across iOS, Android, React Native, and Flutter. They solved platform fragmentation by establishing consistent schemas and event semantics while allowing each technology stack to use its native rendering capabilities. A bridge layer enables React Native and Flutter to access native APIs through iOS and Android, preserving a single SDK interface for developers.

Developers define stable content zones and register approved native components once. Marketers then configure templates, targeting, and component selection through the Salesforce user interface. The platform serves this metadata via a global CDN, and the mobile SDK applies the rules to dynamically render the correct native element without requiring new app builds.

Real-time identity resolution relies on Data 360 to merge anonymous web, email, and mobile interactions into a single profile during authentication. Decisioning runs entirely on the server, so the SDK only receives final experience instructions rather than raw customer data. Teams can validate targeting and layout using a QR code preview flow that injects live profile attributes into the simulator before launch.
