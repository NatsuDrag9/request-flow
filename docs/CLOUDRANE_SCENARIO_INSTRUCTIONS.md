# CloudCrane Scenario Instructions & Blueprint Guide

This document explains how instructions to engage with each scenario are displayed on CloudCrane, references the official platform schemas, and shows how to update the CloudCrane blueprint to surface interactive scenario instructions on the live app page.

---

## 1. How Instructions Display on CloudCrane

CloudCrane is an AI-native hosting platform for mobile PWAs. When an application is deployed to CloudCrane (e.g., `https://requestflow-v0o76jkwr0.cloudcrane.ai/`), CloudCrane extracts metadata from the application's **`blueprint`** object.

The blueprint powers two distinct user-facing surfaces:

1. **The Public App Web Page & Explore Directory**:
   - The platform renders the app's `purpose`, `category`, and **`journeys`**.
   - CloudCrane displays each journey's `title` and numbered `steps` as an interactive capability guide showing visitors and evaluators what can be done in the app.

2. **The Mobile Install Sheet (iOS & Android PWA)**:
   - When a person opens the live QR URL on physical mobile devices, CloudCrane displays an install card featuring the app icon, description, and the step-by-step journeys so users know how to engage with the app before launching it.

---

## 2. CloudCrane Platform Specification Reference

Per CloudCrane's schema (retrievable via `get_spec_guide` and `update_app` tool schemas):

```json
"journeys": {
  "description": "What the person does, step by step. Every step is proved by a test. Shown on the app's page and install screen.",
  "type": "array",
  "items": {
    "properties": {
      "id": { "type": "string", "description": "J-1, J-2, …" },
      "title": { "type": "string" },
      "steps": {
        "type": "array",
        "items": {
          "properties": {
            "id": { "type": "string", "description": "J-1.1, J-1.2, … within journey J-1" },
            "text": { "type": "string" }
          },
          "required": ["id", "text"]
        }
      }
    },
    "required": ["id", "title", "steps"]
  }
}
```

```json
"screens": {
  "description": "Each screen and what it shows.",
  "type": "array",
  "items": {
    "properties": {
      "id": { "type": "string" },
      "says": { "type": "string" },
      "states": {
        "description": "Optional: what it shows with nothing saved yet (empty), while it loads, offline, and when something fails (error), a sentence each.",
        "properties": {
          "empty": { "type": "string" },
          "error": { "type": "string" },
          "loading": { "type": "string" },
          "offline": { "type": "string" }
        }
      }
    },
    "required": ["id", "says"]
  }
}
```

---

## 3. Blueprint Journeys for All 8 Scenarios

To display clear instructions for engaging with each scenario on CloudCrane, we can structure `blueprint.journeys` with explicit guidance:

```json
{
  "journeys": [
    {
      "id": "J-1",
      "title": "Simulate Standard Checkout (Happy Path 201)",
      "steps": [
        { "id": "J-1.1", "text": "Select 'Happy Path (Standard Checkout)' from the top dropdown." },
        { "id": "J-1.2", "text": "Tap PLAY AUTO or STEP FWD to watch the request traverse Client, DNS/TLS, LB, Gateway, Backend, and Database." },
        { "id": "J-1.3", "text": "Observe successful PostgreSQL ACID commit returning HTTP/1.1 201 Created." }
      ]
    },
    {
      "id": "J-2",
      "title": "Test Authentication & Authorization Failures (401 & 403)",
      "steps": [
        { "id": "J-2.1", "text": "Select 'Expired Bearer Token' (401) to observe JWT expiration failure at Node 05 Backend Controller." },
        { "id": "J-2.2", "text": "Select 'RBAC Role Restriction' (403) to observe read-only viewer role rejected from mutating state." },
        { "id": "J-2.3", "text": "Verify Node 06 (Database) remains UNREACHED in both scenarios to protect data integrity." }
      ]
    },
    {
      "id": "J-3",
      "title": "Test Perimeter Rate Limiting & Safe Retries (429 & 200 Replay)",
      "steps": [
        { "id": "J-3.1", "text": "Select 'Token Bucket Rate Limiter' (429) to watch burst traffic dropped at Node 04 API Gateway." },
        { "id": "J-3.2", "text": "Select 'Idempotency Replay' (200) to observe duplicate UUID requests served instantly from Gateway cache without touching Backend or DB." }
      ]
    },
    {
      "id": "J-4",
      "title": "Test Database Latency & Timeout Cutoffs (504 & Degraded 200)",
      "steps": [
        { "id": "J-4.1", "text": "Select 'DB Connection Pool Exhaustion' (504) to observe connection starvation exceeding 5000ms SLA." },
        { "id": "J-4.2", "text": "Select 'Degraded Full Table Scan' (200) to observe unindexed queries returning with X-Query-Time: 1200ms latency warning." }
      ]
    },
    {
      "id": "J-5",
      "title": "Test Optimistic Concurrency Race Conditions (409 Conflict)",
      "steps": [
        { "id": "J-5.1", "text": "Select 'Optimistic Locking Conflict' (409) to observe version mismatch on concurrent inventory updates." },
        { "id": "J-5.2", "text": "Open Wire Inspector at Node 06 (Database) to inspect CAS_VERSION: 2 and 0 rows affected." }
      ]
    },
    {
      "id": "J-6",
      "title": "Live Interception via ⚙ LAB Controls Drawer",
      "steps": [
        { "id": "J-6.1", "text": "Tap ⚙ LAB to override Token Bucket, User Roles, DB Latency, or Concurrency modes in real time." },
        { "id": "J-6.2", "text": "Observe the glowing amber notification beacon on [ ℹ SCENARIO INFO ] indicating altered traversal." },
        { "id": "J-6.3", "text": "Tap [ ℹ SCENARIO INFO ] to read dynamically updated traversal mechanics and telemetry targets." },
        { "id": "J-6.4", "text": "Tap SAVE CONFIG to persist your custom lab parameters across app reloads via v3 storage." }
      ]
    }
  ]
}
```

---

## 4. How to Update CloudCrane with These Instructions

When you are ready to update the CloudCrane deployment:

1. Use the `update_app` MCP tool with the updated `blueprint` object containing the `journeys` above.
2. CloudCrane validates the blueprint and publishes the new version.
3. Visitors navigating to `https://requestflow-v0o76jkwr0.cloudcrane.ai/` or scanning the QR code will immediately see all 6 scenario journeys and step-by-step engagement instructions.
