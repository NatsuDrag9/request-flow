import type { ScenarioDefinition, NodeTelemetry, WireData } from "../01-pipeline-explorer/scenarios";

export type InspectorTab = "OVERVIEW" | "WIRE";

export interface InspectorStageDetails {
  nodeIndex: number;
  nodeId: string;
  title: string;
  description: string;
  direction: "DOWNSTREAM" | "UPSTREAM";
  scenarioId: string;
  scenarioCode: string;
  wireData: WireData;
  formattedWireText: string;
}

/**
 * Pure function to format stage wire data into an authentic monospace retro protocol trace.
 */
export function formatWireProtocol(nodeIndex: number, stage: NodeTelemetry, direction: "DOWNSTREAM" | "UPSTREAM"): string {
  const wire = stage.wireData;
  const lines: string[] = [];

  lines.push(`// --- PROTOCOL TELEMETRY: NODE 0${nodeIndex + 1} (${stage.title.toUpperCase()}) ---`);
  lines.push(`// DIRECTION: ${direction}`);
  lines.push(`// NODE ID:   ${stage.nodeId}`);
  lines.push("");

  switch (nodeIndex) {
    case 0: { // Client
      lines.push(`${wire.method ?? "POST"} ${wire.url ?? "/api/v1/checkout"} HTTP/1.1`);
      if (wire.headers) {
        Object.entries(wire.headers).forEach(([k, v]) => {
          lines.push(`${k}: ${v}`);
        });
      }
      if (wire.payload) {
        lines.push("");
        lines.push(JSON.stringify(wire.payload, null, 2));
      }
      break;
    }

    case 1: { // DNS & TLS 1.3 Handshake
      if (wire.dns) {
        lines.push(`DNS_DOMAIN:  ${wire.dns.domain}`);
        lines.push(`RESOLVED_IP: ${wire.dns.resolvedIp}`);
        lines.push(`DNSSEC:      ${wire.dns.dnsSec ? "VERIFIED" : "NONE"}`);
        lines.push(`QUERY_LAT:   ${wire.dns.queryMs}ms`);
        lines.push("");
      }
      if (wire.tls) {
        lines.push(`PROTOCOL:    ${wire.tls.version}`);
        lines.push(`CIPHER:      ${wire.tls.cipher}`);
        lines.push(`SNI:         ${wire.tls.sni}`);
        lines.push(`HANDSHAKE:   ${wire.tls.handshakeMs}ms`);
      }
      lines.push(`SESSION:     ESTABLISHED (TLS 1.3 1-RTT Complete)`);
      break;
    }

    case 2: { // Load Balancer (Edge LB)
      if (wire.lb) {
        lines.push(`ALGORITHM:   ${wire.lb.algorithm}`);
        lines.push(`TARGET:      ${wire.lb.targetInstance}`);
        lines.push(`HEALTHCHECK: ${wire.lb.healthCheck}`);
        lines.push(`X_FWD_FOR:   ${wire.lb.forwardedFor}`);
      }
      break;
    }

    case 3: { // API Gateway
      if (wire.gateway) {
        lines.push(`ROUTING:     ${wire.gateway.routingRule}`);
        lines.push(`CORS_ALLOW:  ${wire.gateway.corsAllowed}`);
        lines.push(`RATE_LIMIT:  ${wire.gateway.rateLimitRemaining} req remaining`);
        if (wire.gateway.rateLimitCapacity) {
          lines.push(`BUCKET_CAP:  ${wire.gateway.rateLimitCapacity} tokens`);
        }
        if (wire.gateway.retryAfter) {
          lines.push(`RETRY_AFTER: ${wire.gateway.retryAfter}s`);
        }
        if (wire.gateway.idempotencyStatus) {
          lines.push(`IDEMPOTENCY: ${wire.gateway.idempotencyStatus}`);
        }
        lines.push(`TRACE_ID:    ${wire.gateway.traceId}`);
      }
      if (wire.response) {
        lines.push("");
        lines.push(`HTTP/1.1 ${wire.response.statusCode} ${wire.response.statusText}`);
        if (wire.response.headers) {
          Object.entries(wire.response.headers).forEach(([k, v]) => {
            lines.push(`${k}: ${v}`);
          });
          lines.push("");
        }
        lines.push(JSON.stringify(wire.response.body, null, 2));
      }
      break;
    }

    case 4: { // Backend App / Auth Controller
      if (wire.backend) {
        lines.push(`AUTH_STATUS: ${wire.backend.authStatus}`);
        lines.push(`USER_ID:     ${wire.backend.userId ?? "NULL"}`);
        if (wire.backend.userRole) {
          lines.push(`USER_ROLE:   ${wire.backend.userRole}`);
        }
        if (wire.backend.requiredRoles) {
          lines.push(`REQ_ROLES:   [${wire.backend.requiredRoles.join(", ")}]`);
        }
        lines.push(`CHAIN:       ${wire.backend.middlewareChain.join(" -> ")}`);
        lines.push(`HANDLER:     ${wire.backend.handler}`);
      }
      if (wire.response) {
        lines.push("");
        lines.push(`HTTP/1.1 ${wire.response.statusCode} ${wire.response.statusText}`);
        lines.push(JSON.stringify(wire.response.body, null, 2));
      }
      break;
    }

    case 5: { // Database
      if (wire.database) {
        lines.push(`ENGINE:      ${wire.database.engine}`);
        lines.push(`ISOLATION:   ${wire.database.isolationLevel}`);
        lines.push(`LOCK_STATUS: ${wire.database.lockStatus}`);
        lines.push(`EXEC_TIME:   ${wire.database.executionMs}ms`);
        if (wire.database.rowsAffected !== undefined) {
          lines.push(`ROWS_AFFECT: ${wire.database.rowsAffected}`);
        }
        if (wire.database.casVersion !== undefined) {
          lines.push(`CAS_VERSION: ${wire.database.casVersion}`);
        }
        lines.push("");
        lines.push(`SQL:`);
        lines.push(wire.database.sql);
      }
      if (wire.response) {
        lines.push("");
        lines.push(`HTTP/1.1 ${wire.response.statusCode} ${wire.response.statusText}`);
        if (wire.response.headers) {
          Object.entries(wire.response.headers).forEach(([k, v]) => {
            lines.push(`${k}: ${v}`);
          });
          lines.push("");
        }
        lines.push(`RESPONSE BODY:`);
        lines.push(JSON.stringify(wire.response.body, null, 2));
      }
      break;
    }

    default:
      lines.push(JSON.stringify(wire, null, 2));
  }

  return lines.join("\n");
}

/**
 * Pure builder function to extract complete stage inspector details for a given node.
 */
export function buildInspectorDetails(
  scenario: ScenarioDefinition,
  nodeIndex: number,
  direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM"
): InspectorStageDetails {
  if (nodeIndex < 0 || nodeIndex > 5 || !scenario.stages[nodeIndex]) {
    throw new Error(`Node index ${nodeIndex} out of bounds (0..5)`);
  }

  const stage = scenario.stages[nodeIndex];
  const formattedWireText = formatWireProtocol(nodeIndex, stage, direction);

  return {
    nodeIndex,
    nodeId: stage.nodeId,
    title: stage.title,
    description: stage.description,
    direction,
    scenarioId: scenario.id,
    scenarioCode: scenario.code,
    wireData: stage.wireData,
    formattedWireText,
  };
}
