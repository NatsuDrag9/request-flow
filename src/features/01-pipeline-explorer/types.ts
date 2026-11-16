export type NodeId = "client" | "dns_tls" | "lb" | "gateway" | "backend" | "database";

export interface WireData {
  headers?: Record<string, string>;
  method?: string;
  url?: string;
  payload?: Record<string, unknown> | null;
  dns?: {
    domain: string;
    resolvedIp: string;
    dnsSec: boolean;
    queryMs: number;
  };
  tls?: {
    version: string;
    cipher: string;
    sni: string;
    handshakeMs: number;
  };
  lb?: {
    algorithm: string;
    targetInstance: string;
    healthCheck: string;
    forwardedFor: string;
  };
  gateway?: {
    routingRule: string;
    corsAllowed: boolean;
    rateLimitRemaining: number;
    rateLimitCapacity?: number;
    traceId: string;
    retryAfter?: number;
    idempotencyStatus?: string;
  };
  backend?: {
    authStatus: string;
    userId?: number | null;
    userRole?: string;
    requiredRoles?: string[];
    middlewareChain: string[];
    handler: string;
  };
  database?: {
    engine: string;
    isolationLevel: string;
    sql: string;
    lockStatus: string;
    executionMs: number;
    rowsAffected?: number;
    casVersion?: number;
  };
  response?: {
    statusCode: number;
    statusText: string;
    body: Record<string, unknown>;
    headers?: Record<string, string>;
  };
}

export interface NodeTelemetry {
  nodeId: NodeId;
  title: string;
  description: string;
  wireData: WireData;
}

export interface ScenarioDefinition {
  id: string;
  code: string;
  name: string;
  summary: string;
  description: string;
  category: "auth" | "perimeter" | "database";
  haltNode: number; // 0..5
  resultStatus: "HALTED_SUCCESS" | "HALTED_ERROR";
  stages: Record<number, NodeTelemetry>;
}

export type EngineStatus = "READY" | "IN_FLIGHT" | "STEPPING" | "HALTED_SUCCESS" | "HALTED_ERROR";
export type Direction = "DOWNSTREAM" | "UPSTREAM";

export interface EngineState {
  status: EngineStatus;
  currentNode: number;
  direction: Direction;
  scenarioId: string;
  haltNode: number;
  isCompleted: boolean;
  isTransiting: boolean;
  transitionTarget: number | null;
}

export interface PipelineEngineOptions {
  scenarioId?: string;
  hopDelayMs?: number;
  stayDurationMs?: number;
  transitionDurationMs?: number;
  labOverrides?: {
    rateLimiter?: boolean;
    userRole?: "viewer" | "member" | "admin";
    latency?: "normal" | "lag";
    concurrency?: "idempotent" | "cas";
  } | null;
}

export type EngineEvent = "stateChange" | "nodeActivate" | "complete";
export type EventListener = (...args: unknown[]) => void;

export interface PipelineNodeConfig {
  index: number;
  id: NodeId;
  name: string;
  subtext: string;
  ipAddress: string;
  iconSvg: string;
}

export interface NodeRenderState {
  state: "ACTIVE" | "PASSED" | "IDLE" | "TRANSIT" | "ERROR";
  badgeText: string;
}
