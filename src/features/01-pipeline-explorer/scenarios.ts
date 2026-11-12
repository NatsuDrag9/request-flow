export interface WireData {
  headers?: Record<string, string>;
  method?: string;
  url?: string;
  payload?: Record<string, unknown> | null;
  tls?: {
    version: string;
    cipher: string;
    sni: string;
    handshakeMs: number;
  };
  gateway?: {
    routingRule: string;
    corsAllowed: boolean;
    rateLimitRemaining: number;
    traceId: string;
  };
  backend?: {
    authStatus: string;
    userId?: number | null;
    middlewareChain: string[];
    handler: string;
  };
  database?: {
    engine: string;
    isolationLevel: string;
    sql: string;
    lockStatus: string;
    executionMs: number;
  };
  response?: {
    statusCode: number;
    statusText: string;
    body: Record<string, unknown>;
  };
}

export interface NodeTelemetry {
  nodeId: "client" | "network" | "gateway" | "backend" | "database";
  title: string;
  description: string;
  wireData: WireData;
}

export interface ScenarioDefinition {
  id: "201-created" | "401-unauthorized" | "504-timeout";
  code: "201" | "401" | "504";
  name: string;
  summary: string;
  haltNode: number; // 0..4
  resultStatus: "HALTED_SUCCESS" | "HALTED_ERROR";
  stages: Record<number, NodeTelemetry>;
}

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  "201-created": {
    id: "201-created",
    code: "201",
    name: "201 Created (Order Creation)",
    summary: "Happy path: authenticated request creates a new order in PostgreSQL and commits transaction.",
    haltNode: 4,
    resultStatus: "HALTED_SUCCESS",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Browser constructs POST /api/v1/orders with JSON payload and Bearer JWT token.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/orders",
          headers: {
            "Host": "api.cloudcrane.ai",
            "User-Agent": "RequestFlow/1.0 (Mobile Web)",
            "Authorization": "Bearer eyJhbGciOi...",
            "Content-Type": "application/json"
          },
          payload: { item: "vintage_crt_monitor", quantity: 1, currency: "USD" }
        }
      },
      1: {
        nodeId: "network",
        title: "Network & TLS 1.3 Handshake",
        description: "DNS resolution to 198.51.100.42, TCP 3-way handshake, and TLS 1.3 cryptographic session setup.",
        wireData: {
          tls: {
            version: "TLS 1.3",
            cipher: "TLS_AES_256_GCM_SHA384",
            sni: "api.cloudcrane.ai",
            handshakeMs: 42
          }
        }
      },
      2: {
        nodeId: "gateway",
        title: "API Gateway (Nginx / Envoy)",
        description: "Terminates TLS, evaluates rate limit quotas, attaches X-Request-ID, and forwards to backend upstream.",
        wireData: {
          gateway: {
            routingRule: "/v1/orders -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 98,
            traceId: "req_trc_9a8f21cd"
          }
        }
      },
      3: {
        nodeId: "backend",
        title: "Backend Application (Express)",
        description: "Validates JWT signature, checks user role, parses request body, and opens a database connection.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 42,
            middlewareChain: ["cors()", "jwtVerify()", "rateLimiter()", "orderController()"],
            handler: "OrderService.createOrder()"
          }
        }
      },
      4: {
        nodeId: "database",
        title: "Database Engine (PostgreSQL)",
        description: "ACID transaction BEGIN -> INSERT row into orders table -> COMMIT transaction.",
        wireData: {
          database: {
            engine: "PostgreSQL 16",
            isolationLevel: "READ COMMITTED",
            sql: "INSERT INTO orders (user_id, item, qty, status) VALUES (42, 'vintage_crt_monitor', 1, 'CONFIRMED') RETURNING id;",
            lockStatus: "EXCLUSIVE_ROW_LOCK_GRANTED",
            executionMs: 8
          },
          response: {
            statusCode: 201,
            statusText: "Created",
            body: { orderId: 8912, status: "created", createdAt: "2026-11-12T16:00:00Z" }
          }
        }
      }
    }
  },
  "401-unauthorized": {
    id: "401-unauthorized",
    code: "401",
    name: "401 Unauthorized (Auth Rejection)",
    summary: "Rejection: expired or missing Bearer token caught at backend middleware layer before reaching database.",
    haltNode: 3,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Browser sends request with an expired JWT access token in the Authorization header.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/orders",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer expired_or_malformed_token"
          }
        }
      },
      1: {
        nodeId: "network",
        title: "Network & TLS 1.3 Handshake",
        description: "Transport connection established normally; transport encryption does not validate application tokens.",
        wireData: {
          tls: {
            version: "TLS 1.3",
            cipher: "TLS_AES_256_GCM_SHA384",
            sni: "api.cloudcrane.ai",
            handshakeMs: 38
          }
        }
      },
      2: {
        nodeId: "gateway",
        title: "API Gateway (Nginx / Envoy)",
        description: "Gateway routes request to application tier as path /v1/orders requires application-level JWT parsing.",
        wireData: {
          gateway: {
            routingRule: "/v1/orders -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 97,
            traceId: "req_trc_401bad9a"
          }
        }
      },
      3: {
        nodeId: "backend",
        title: "Backend Application (Express)",
        description: "JWT verification fails: TokenExpiredError. Execution halts immediately; database is never reached.",
        wireData: {
          backend: {
            authStatus: "REJECTED (TokenExpiredError)",
            userId: null,
            middlewareChain: ["cors()", "jwtVerify() [FAILED]"],
            handler: "ErrorHandler.unauthorized()"
          },
          response: {
            statusCode: 401,
            statusText: "Unauthorized",
            body: { error: "invalid_token", message: "JWT token expired at 2026-11-12T15:00:00Z" }
          }
        }
      },
      4: {
        nodeId: "database",
        title: "Database Engine (PostgreSQL)",
        description: "UNREACHED: Request halted at auth middleware, preventing database query execution.",
        wireData: {
          database: {
            engine: "PostgreSQL 16",
            isolationLevel: "NONE",
            sql: "-- UNREACHED --",
            lockStatus: "IDLE",
            executionMs: 0
          }
        }
      }
    }
  },
  "504-timeout": {
    id: "504-timeout",
    code: "504",
    name: "504 Gateway Timeout (DB Lock Deadlock)",
    summary: "Infrastructure failure: database query hangs on table lock until API Gateway upstream timeout fires.",
    haltNode: 4,
    resultStatus: "HALTED_ERROR",
    stages: {
      0: {
        nodeId: "client",
        title: "Client Application",
        description: "Browser initiates order placement and awaits HTTP response.",
        wireData: {
          method: "POST",
          url: "https://api.cloudcrane.ai/v1/orders",
          headers: {
            "Host": "api.cloudcrane.ai",
            "Authorization": "Bearer eyJhbGciOi..."
          }
        }
      },
      1: {
        nodeId: "network",
        title: "Network & TLS 1.3 Handshake",
        description: "Network transport connected normally.",
        wireData: {
          tls: {
            version: "TLS 1.3",
            cipher: "TLS_AES_256_GCM_SHA384",
            sni: "api.cloudcrane.ai",
            handshakeMs: 40
          }
        }
      },
      2: {
        nodeId: "gateway",
        title: "API Gateway (Nginx / Envoy)",
        description: "Proxies request to backend upstream with a 5000ms upstream_timeout guard.",
        wireData: {
          gateway: {
            routingRule: "/v1/orders -> upstream_backend:8080",
            corsAllowed: true,
            rateLimitRemaining: 96,
            traceId: "req_trc_504tmout"
          }
        }
      },
      3: {
        nodeId: "backend",
        title: "Backend Application (Express)",
        description: "Authentication passes; backend submits SQL query to PostgreSQL and blocks awaiting result.",
        wireData: {
          backend: {
            authStatus: "AUTHENTICATED",
            userId: 42,
            middlewareChain: ["cors()", "jwtVerify()", "orderController()"],
            handler: "OrderService.createOrderWithInventoryLock()"
          }
        }
      },
      4: {
        nodeId: "database",
        title: "Database Engine (PostgreSQL)",
        description: "Query waits on an uncommitted exclusive row lock from another transaction until gateway terminates connection.",
        wireData: {
          database: {
            engine: "PostgreSQL 16",
            isolationLevel: "SERIALIZABLE",
            sql: "SELECT * FROM inventory WHERE id = 101 FOR UPDATE; -- BLOCKED ON LOCK",
            lockStatus: "LOCK_WAIT_TIMEOUT (>5000ms)",
            executionMs: 5002
          },
          response: {
            statusCode: 504,
            statusText: "Gateway Timeout",
            body: { error: "gateway_timeout", message: "Upstream application timed out after 5000ms" }
          }
        }
      }
    }
  }
};

export function getScenario(id: string): ScenarioDefinition {
  const scenario = SCENARIOS[id];
  if (!scenario) {
    throw new Error(`Unknown scenario: "${id}". Available: ${Object.keys(SCENARIOS).join(", ")}`);
  }
  return scenario;
}

export function getAllScenarios(): ScenarioDefinition[] {
  return Object.values(SCENARIOS);
}
