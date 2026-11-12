import type { NodeId, WireData, NodeTelemetry, ScenarioDefinition } from "./types";

export type { NodeId, WireData, NodeTelemetry, ScenarioDefinition };

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  "order_create": {
    id: "order_create",
    code: "201",
    name: "Happy Path (Standard Checkout)",
    summary: "Full end-to-end checkout flow committing an ACID order transaction to PostgreSQL.",
    description: "Standard end-to-end checkout flow. The client sends a valid request with authentication, passes the LB, gateway, and auth middleware, and successfully commits an order transaction to the database.",
    category: "auth",
    haltNode: 5,
    resultStatus: "HALTED_SUCCESS",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Browser constructs POST /api/v1/checkout with Bearer JWT token and checkout items.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "User-Agent": "RequestFlow/2.0 (Mobile PWA)",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
            "Content-Type": "application/json",
            "Idempotency-Key": "4a71bc12-f049-43c2-8431-7b02c0199e12"
          },
          payload: { item: "industrial_terminal_keyboard", quantity: 1, currency: "USD", price: 249 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "DNS resolves api.cloudcrane.ai to 198.51.100.1; completes 1-RTT TLS 1.3 cryptographic session.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 4 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 38 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "L4/L7 traffic distributor performs round-robin balancing, attaches X-Forwarded-For, and routes to Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-02:443",
            healthCheck: "HTTP 200 OK (latency 1.2ms)",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway (Nginx / Envoy)",
        description: "Enforces Token Bucket rate limiting, inspects Idempotency cache, and forwards downstream.",
        wireData: {
          gateway: {
            routingRule: "/v1/checkout -> upstream_app:8080",
            corsAllowed: true,
            rateLimitRemaining: 98,
            rateLimitCapacity: 100,
            traceId: "req-trace-8921-prod"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "Validates JWT signature, checks user role ('member'), and dispatches transaction to PostgreSQL.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED (JWT RS256)",
            userId: 8812,
            userRole: "member",
            requiredRoles: ["member", "admin"],
            middlewareChain: ["corsGuard", "rateLimitProbe", "jwtAuth", "rbacPolicy", "checkoutHandler"],
            handler: "CheckoutController.processOrder"
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL 16)",
        description: "Acquires connection pool lease, starts ACID transaction, inserts order, commits successfully.",
        wireData: {
          database: {
            engine: "PostgreSQL 16.2",
            isolationLevel: "READ COMMITTED",
            sql: "BEGIN; INSERT INTO orders (user_id, item, qty, status) VALUES (8812, 'industrial_terminal_keyboard', 1, 'CONFIRMED') RETURNING id; COMMIT;",
            lockStatus: "EXCLUSIVE_ROW_LOCK_GRANTED",
            executionMs: 8,
            rowsAffected: 1
          },
          response: {
            statusCode: 201,
            statusText: "Created",
            body: { orderId: 98412, status: "confirmed", createdAt: "2026-11-12T16:00:00Z" }
          }
        }
      }
    }
  },

  "auth_token_expired": {
    id: "auth_token_expired",
    code: "401",
    name: "Expired Bearer Token",
    summary: "Authentication failure: JWT verification expires at Node 4 Backend Controller.",
    description: "Models authentication failure. The client request carries an expired or malformed Bearer token, causing the Backend/Auth Service to reject the request with 401 before any database queries execute.",
    category: "auth",
    haltNode: 4,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client sends POST /checkout with a stale JWT Bearer token (exp: 1730000000).",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.expired_token_signature",
            "Content-Type": "application/json"
          },
          payload: { item: "crt_amber_phosphor", quantity: 1 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "DNS resolution and TLS 1.3 handshake succeed normally at the transport edge.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 4 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 39 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "LB evaluates health checks and distributes traffic downstream to Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-01:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway (Nginx)",
        description: "Perimeter gateway validates SSL and rate limits, forwarding packet to backend.",
        wireData: {
          gateway: {
            routingRule: "/v1/checkout -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 94,
            traceId: "req-trace-401-auth"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "Auth middleware parses Bearer token; rejects with TokenExpiredError (exp < now). Halts before DB.",
        wireData: {
          backend: {
            authStatus: "REJECTED (TokenExpiredError)",
            userId: null,
            middlewareChain: ["jwtAuth (FAILED)"],
            handler: "ErrorHandler.unauthorized"
          },
          response: {
            statusCode: 401,
            statusText: "Unauthorized",
            body: { error: "invalid_or_expired_token", code: 401, message: "JWT token expired at 2026-11-01T00:00:00Z" }
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL)",
        description: "UNREACHED: Pipeline halted at Backend Controller; no SQL queries or pool connections dispatched.",
        wireData: {}
      }
    }
  },

  "rbac_restriction": {
    id: "rbac_restriction",
    code: "403",
    name: "RBAC Role Restriction (Viewer)",
    summary: "Authorization failure: authenticated user with 'viewer' role denied mutating POST.",
    description: "Models authorization restriction. The client is authenticated with a valid identity, but holds a read-only 'Viewer' role that lacks permission to execute the mutating checkout action.",
    category: "auth",
    haltNode: 4,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client sends checkout request with valid JWT for role 'viewer'.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInJvbGUiOiJ2aWV3ZXIifQ...",
            "Content-Type": "application/json"
          },
          payload: { item: "matrix_printer_ribbon", quantity: 2 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Edge transport session established cleanly over TLS 1.3.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 3 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 37 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "Routes payload to active gateway worker instance.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-03:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway",
        description: "Passes perimeter checks; routes to backend.",
        wireData: {
          gateway: {
            routingRule: "/v1/checkout -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 92,
            traceId: "req-trace-403-rbac"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "User is authenticated, but RBAC guard rejects 'viewer' (mutation requires 'member' or 'admin').",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 3012,
            userRole: "viewer",
            requiredRoles: ["member", "admin"],
            middlewareChain: ["jwtAuth (PASSED)", "rbacPolicy (FAILED)"],
            handler: "ErrorHandler.forbidden"
          },
          response: {
            statusCode: 403,
            statusText: "Forbidden",
            body: {
              error: "insufficient_permissions",
              code: 403,
              required_roles: ["member", "admin"],
              granted_role: "viewer"
            }
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL)",
        description: "UNREACHED: Mutation rejected at RBAC security layer before executing SQL transaction.",
        wireData: {}
      }
    }
  },

  "token_bucket_empty": {
    id: "token_bucket_empty",
    code: "429",
    name: "Token Bucket Rate Limiting",
    summary: "Perimeter defense: burst traffic depletes Token Bucket at Node 3 API Gateway.",
    description: "Demonstrates API Gateway traffic protection using a Token Bucket algorithm. When rapid bursts exhaust available bucket tokens, subsequent requests are dropped at the perimeter.",
    category: "perimeter",
    haltNode: 3,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client dispatches rapid successive requests exceeding per-second rate limits.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGci...",
            "Content-Type": "application/json"
          },
          payload: { item: "burst_traffic_probe", quantity: 1 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Secure TLS connection established.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 4 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 36 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "LB passes ingress packet to API Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-02:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway (Token Bucket Filter)",
        description: "Token Bucket empty (0/5 tokens). Request dropped immediately with HTTP 429 and Retry-After: 1.",
        wireData: {
          gateway: {
            routingRule: "DROP_RATE_LIMIT_EXCEEDED",
            corsAllowed: true,
            rateLimitRemaining: 0,
            rateLimitCapacity: 5,
            retryAfter: 1,
            traceId: "req-trace-429-dropped"
          },
          response: {
            statusCode: 429,
            statusText: "Too Many Requests",
            headers: { "Retry-After": "1", "X-RateLimit-Remaining": "0" },
            body: { error: "rate_limit_exceeded", message: "Token bucket capacity exhausted. Retry in 1 second." }
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "UNREACHED: Dropped at perimeter gateway; backend compute is protected from traffic spike.",
        wireData: {}
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL)",
        description: "UNREACHED: Protected from downstream connection overload.",
        wireData: {}
      }
    }
  },

  "db_pool_timeout": {
    id: "db_pool_timeout",
    code: "504",
    name: "DB Connection Pool Timeout",
    summary: "Database failure: connection pool exhaustion causes transaction lock exceeding 5000ms SLA.",
    description: "Simulates database connection pool exhaustion. Query execution hangs beyond the gateway's timeout SLA (5000ms), causing the reverse proxy to sever the connection with 504.",
    category: "database",
    haltNode: 5,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client submits checkout request awaiting backend confirmation.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGci...",
            "Content-Type": "application/json"
          },
          payload: { item: "vintage_mainframe_reel", quantity: 1 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Transport connection completes in 38ms.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 3 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 38 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "LB forwards packet to API Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-01:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway (Nginx)",
        description: "Gateway routes request to backend with upstream timeout SLA: 5000ms.",
        wireData: {
          gateway: {
            routingRule: "/v1/checkout -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 89,
            traceId: "req-trace-504-timeout"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "Authenticated successfully; requests connection lease from PostgreSQL connection pool.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 1042,
            userRole: "member",
            middlewareChain: ["jwtAuth", "rbacPolicy", "checkoutHandler"],
            handler: "CheckoutController.processOrder"
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL Connection Pool)",
        description: "Pool exhausted (20/20 active connections). Query blocked on exclusive row lock > 5000ms SLA.",
        wireData: {
          database: {
            engine: "PostgreSQL 16.2",
            isolationLevel: "SERIALIZABLE",
            sql: "SELECT * FROM inventory WHERE item_id = 902 FOR UPDATE NOWAIT;",
            lockStatus: "LOCK_WAIT_TIMEOUT_EXCEEDED",
            executionMs: 5021
          },
          response: {
            statusCode: 504,
            statusText: "Gateway Timeout",
            body: {
              error: "gateway_timeout",
              code: 504,
              message: "Upstream database connection pool failed to respond within 5000ms SLA."
            }
          }
        }
      }
    }
  },

  "query_degraded": {
    id: "query_degraded",
    code: "200",
    name: "Slow Query Latency (Degraded)",
    summary: "Performance degradation: unindexed full-table scan returns 200 OK with 1200ms latency alert.",
    description: "Models database disk I/O bottleneck or unindexed full-table scan. The request completes successfully with 200 OK, but exhibits degraded round-trip latency (1200ms vs 15ms).",
    category: "database",
    haltNode: 5,
    resultStatus: "HALTED_SUCCESS",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client queries order status requiring complex backend table scanning.",
        wireData: {
          method: "GET",
          url: "https://api.cloudcrane.ai/v1/orders/history?search=vintage",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGci..."
          }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Session established cleanly.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 4 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 38 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "Routes GET query to active gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-03:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway",
        description: "Forwards read request to backend service.",
        wireData: {
          gateway: {
            routingRule: "/v1/orders/history -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 96,
            traceId: "req-trace-degraded-io"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend Controller",
        description: "Processes query and awaits database scan.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 5541,
            userRole: "member",
            middlewareChain: ["jwtAuth", "historyQueryHandler"],
            handler: "OrderHistoryController.search"
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL - Full Table Scan)",
        description: "Unindexed sequential scan across 2.4M rows takes 1200ms; succeeds with latency alert header.",
        wireData: {
          database: {
            engine: "PostgreSQL 16.2",
            isolationLevel: "READ COMMITTED",
            sql: "EXPLAIN ANALYZE SELECT * FROM order_audit_log WHERE metadata ILIKE '%vintage%';",
            lockStatus: "SHARED_READ_LOCK",
            executionMs: 1200,
            rowsAffected: 14
          },
          response: {
            statusCode: 200,
            statusText: "OK",
            headers: { "X-Query-Time": "1200ms", "X-Performance-Warning": "Full table scan detected" },
            body: { count: 14, latencyMs: 1200, status: "completed_degraded" }
          }
        }
      }
    }
  },

  "idempotency_cache": {
    id: "idempotency_cache",
    code: "200",
    name: "Idempotency Replay (UUID Cache Hit)",
    summary: "Duplicate prevention: client resends duplicate UUID; Gateway returns cached 200 replay.",
    description: "Demonstrates duplicate request protection using UUID idempotency keys. Repeated submissions with the same key return the cached response immediately from the gateway without re-executing backend logic.",
    category: "perimeter",
    haltNode: 3,
    resultStatus: "HALTED_SUCCESS",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Client retries checkout submission carrying existing Idempotency-Key UUID.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGci...",
            "Idempotency-Key": "4a71bc12-f049-43c2-8431-7b02c0199e12"
          },
          payload: { item: "industrial_terminal_keyboard", quantity: 1 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Secure session setup established.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 3 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 37 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "LB routes packet to API Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-01:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway (Idempotency Store)",
        description: "Idempotency Key found in Redis/memory store. Returns cached 200 OK without touching backend or DB.",
        wireData: {
          gateway: {
            routingRule: "IDEMPOTENCY_CACHE_HIT",
            corsAllowed: true,
            rateLimitRemaining: 97,
            idempotencyStatus: "REPLAY",
            traceId: "req-trace-idemp-replay"
          },
          response: {
            statusCode: 200,
            statusText: "OK",
            headers: {
              "X-Idempotency-Status": "REPLAY",
              "X-Original-Request-Id": "4a71bc12-f049-43c2-8431-7b02c0199e12"
            },
            body: { orderId: 98412, status: "confirmed", replayed: true }
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend / Auth Controller",
        description: "BYPASSED: Request intercepted and resolved by API Gateway idempotency cache.",
        wireData: {}
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL)",
        description: "BYPASSED: Zero duplicate database writes or transaction locks incurred.",
        wireData: {}
      }
    }
  },

  "optimistic_lock_cas": {
    id: "optimistic_lock_cas",
    code: "409",
    name: "CAS Optimistic Concurrency Conflict",
    summary: "Concurrency race: second concurrent transaction encounters version mismatch (409 Conflict).",
    description: "Models a race condition when two concurrent requests attempt to purchase the final inventory item using Compare-And-Swap (CAS) version checks, resulting in 409 Conflict.",
    category: "database",
    haltNode: 5,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Concurrent client sends checkout attempting to purchase final inventory item.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/checkout",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGci...",
            "Content-Type": "application/json"
          },
          payload: { itemId: 402, expectedVersion: 1 }
        }
      },
      1: {
        nodeId: "dns_tls",
        title: "DNS & TLS 1.3 Handshake",
        description: "Session established cleanly.",
        wireData: {
          dns: { domain: "api.cloudcrane.ai", resolvedIp: "198.51.100.1", dnsSec: true, queryMs: 4 },
          tls: { version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", sni: "api.cloudcrane.ai", handshakeMs: 38 }
        }
      },
      2: {
        nodeId: "lb",
        title: "Load Balancer (Edge LB)",
        description: "Routes traffic to Gateway.",
        wireData: {
          lb: {
            algorithm: "round-robin",
            targetInstance: "gateway-node-02:443",
            healthCheck: "HTTP 200 OK",
            forwardedFor: "192.168.1.104"
          }
        }
      },
      3: {
        nodeId: "gateway",
        title: "API Gateway",
        description: "Forwards request to backend checkout handler.",
        wireData: {
          gateway: {
            routingRule: "/v1/checkout -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 95,
            traceId: "req-trace-409-cas"
          }
        }
      },
      4: {
        nodeId: "backend",
        title: "Backend Controller",
        description: "Executes optimistic locking logic: UPDATE ... WHERE id = ? AND version = ?.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 9102,
            userRole: "member",
            middlewareChain: ["jwtAuth", "rbacPolicy", "checkoutHandler"],
            handler: "CheckoutController.processOrderWithCAS"
          }
        }
      },
      5: {
        nodeId: "database",
        title: "Database (PostgreSQL - CAS Conflict)",
        description: "Another transaction incremented version to 2. Stale version 1 yields 0 rows affected (409 Conflict).",
        wireData: {
          database: {
            engine: "PostgreSQL 16.2",
            isolationLevel: "READ COMMITTED",
            sql: "UPDATE inventory SET stock = stock - 1, version = version + 1 WHERE id = 402 AND version = 1;",
            lockStatus: "CAS_VERSION_MISMATCH (0 rows affected)",
            executionMs: 14,
            rowsAffected: 0,
            casVersion: 2
          },
          response: {
            statusCode: 409,
            statusText: "Conflict",
            body: {
              error: "optimistic_lock_conflict",
              code: 409,
              message: "Resource was modified by another concurrent transaction. Please refresh and retry."
            }
          }
        }
      }
    }
  }
};

// Aliases for backward compatibility with initial MVP tests
const SCENARIO_ALIASES: Record<string, string> = {
  "201-created": "order_create",
  "401-unauthorized": "auth_token_expired",
  "403-forbidden": "rbac_restriction",
  "429-ratelimit": "token_bucket_empty",
  "504-timeout": "db_pool_timeout",
  "slow-query": "query_degraded",
  "idempotency-replay": "idempotency_cache",
  "409-conflict": "optimistic_lock_cas",
};

export function getScenario(id: string): ScenarioDefinition {
  const resolvedId = SCENARIO_ALIASES[id] ?? id;
  const scenario = SCENARIOS[resolvedId];
  if (!scenario) {
    throw new Error(`Unknown scenario id: "${id}"`);
  }
  return scenario;
}

export function getAllScenarios(): ScenarioDefinition[] {
  return Object.values(SCENARIOS);
}
