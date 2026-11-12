# Living Functional & Wire Protocol Specification

## 1. Purpose & Product Intent
**RequestFlow** is an interactive, mobile-first learning laboratory deployed on CloudCrane. It simulates the end-to-end journey of an HTTP request through a multi-node backend architecture.

## 2. Pipeline Nodes
The request pipeline consists of 5 sequential stages:
1. **Node 0 (Client)**: Request dispatch, headers, query parameters, method (`POST /api/v1/checkout`).
2. **Node 1 (CDN / Edge)**: Cache inspection, edge termination, geolocation tagging.
3. **Node 2 (API Gateway)**: TLS termination, rate-limiting (Token Bucket), routing.
4. **Node 3 (Auth Service)**: Token verification, session validation, permission checks.
5. **Node 4 (Database / Persistence)**: Query execution, transaction locking, read/write latency.

## 3. Scenarios & Wire Contracts

### Scenario A: Happy Path (`order_create`)
- **HTTP Method & Path**: `POST /api/v1/checkout`
- **Expected Status**: `201 Created`
- **Traversal**: All nodes 0 through 4 succeed (`passed`).
- **Telemetry**: Calculates and records full round-trip latency.

### Scenario B: Auth Failure (`auth_fail`)
- **Expected Status**: `401 Unauthorized`
- **Traversal**: Progresses through Nodes 0, 1, 2, and strictly halts at **Node 3 (Auth Service)**.
- **Node 4**: Remained unreached / skipped.
- **Wire Payload**: Contains `{ "error": "invalid_bearer_token", "code": 401 }`.

### Scenario C: Database Timeout (`db_timeout`)
- **Expected Status**: `504 Gateway Timeout`
- **Traversal**: Progresses through Nodes 0, 1, 2, 3, and strictly halts with failure at **Node 4 (Database)**.
- **Wire Payload**: Simulates connection pool exhaustion / timeout error.

## 4. Data Storage Contract (CloudCrane `blueprint.json`)
- **Key**: `requestflow.state`
- **v1 Schema**:
  ```json
  {
    "version": 1,
    "totalRequests": 5,
    "inspectedStages": [0, 1]
  }
  ```
- **v2 Schema (Backward-Compatible)**:
  ```json
  {
    "version": 2,
    "totalRequests": 5,
    "inspectedStages": [0, 1],
    "labSettings": {
      "rateLimitEnabled": true,
      "cacheEnabled": true
    }
  }
  ```
- **Promise**: Upgrading from v1 to v2 must preserve all previously logged counts and inspected stages.
