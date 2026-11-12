import { describe, it, expect } from "vitest";
import { getScenario } from "../../src/features/01-pipeline-explorer/scenarios";
import { buildInspectorDetails } from "../../src/features/02-stage-inspector/inspector";

describe("Stage Wire Inspector (Feature 02 - 6-Node Architecture)", () => {
  const scenario201 = getScenario("order_create");
  const scenario401 = getScenario("auth_token_expired");
  const scenario403 = getScenario("rbac_restriction");
  const scenario429 = getScenario("token_bucket_empty");
  const scenario504 = getScenario("db_pool_timeout");
  const scenarioCas = getScenario("optimistic_lock_cas");

  it("should extract complete inspector details for Node 01 (Client)", () => {
    const details = buildInspectorDetails(scenario201, 0, "DOWNSTREAM");
    expect(details.nodeIndex).toBe(0);
    expect(details.nodeId).toBe("client");
    expect(details.direction).toBe("DOWNSTREAM");
    expect(details.scenarioCode).toBe("201");
    expect(details.formattedWireText).toContain("POST https://api.cloudcrane.ai/v1/checkout HTTP/1.1");
    expect(details.formattedWireText).toContain("Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
  });

  it("should format DNS & TLS 1.3 telemetry for Node 02", () => {
    const details = buildInspectorDetails(scenario201, 1, "DOWNSTREAM");
    expect(details.nodeId).toBe("dns_tls");
    expect(details.formattedWireText).toContain("DNS_DOMAIN:  api.cloudcrane.ai");
    expect(details.formattedWireText).toContain("RESOLVED_IP: 198.51.100.1");
    expect(details.formattedWireText).toContain("PROTOCOL:    TLS 1.3");
    expect(details.formattedWireText).toContain("CIPHER:      TLS_AES_256_GCM_SHA384");
    expect(details.formattedWireText).toContain("HANDSHAKE:   38ms");
  });

  it("should format Load Balancer telemetry for Node 03", () => {
    const details = buildInspectorDetails(scenario201, 2, "DOWNSTREAM");
    expect(details.nodeId).toBe("lb");
    expect(details.formattedWireText).toContain("ALGORITHM:   round-robin");
    expect(details.formattedWireText).toContain("TARGET:      gateway-node-02:443");
    expect(details.formattedWireText).toContain("X_FWD_FOR:   192.168.1.104");
  });

  it("should format API Gateway telemetry for Node 04", () => {
    const details = buildInspectorDetails(scenario201, 3, "DOWNSTREAM");
    expect(details.nodeId).toBe("gateway");
    expect(details.formattedWireText).toContain("ROUTING:     /v1/checkout -> upstream_app:8080");
    expect(details.formattedWireText).toContain("RATE_LIMIT:  98 req remaining");
  });

  it("should format Backend Controller telemetry for Node 05", () => {
    const details = buildInspectorDetails(scenario201, 4, "DOWNSTREAM");
    expect(details.nodeId).toBe("backend");
    expect(details.formattedWireText).toContain("AUTH_STATUS: AUTHENTICATED (JWT RS256)");
    expect(details.formattedWireText).toContain("USER_ROLE:   member");
    expect(details.formattedWireText).toContain("REQ_ROLES:   [member, admin]");
  });

  it("should format PostgreSQL ACID transaction for Node 06 (Database)", () => {
    const details = buildInspectorDetails(scenario201, 5, "DOWNSTREAM");
    expect(details.nodeId).toBe("database");
    expect(details.formattedWireText).toContain("ENGINE:      PostgreSQL 16.2");
    expect(details.formattedWireText).toContain("ISOLATION:   READ COMMITTED");
    expect(details.formattedWireText).toContain("INSERT INTO orders");
  });

  it("should format auth rejection traces when 401 scenario halts at Node 05 (Backend)", () => {
    const details = buildInspectorDetails(scenario401, 4, "DOWNSTREAM");
    expect(details.nodeId).toBe("backend");
    expect(details.formattedWireText).toContain("AUTH_STATUS: REJECTED (TokenExpiredError)");
    expect(details.formattedWireText).toContain("HTTP/1.1 401 Unauthorized");
  });

  it("should format RBAC 403 Forbidden payload with required roles", () => {
    const details = buildInspectorDetails(scenario403, 4, "DOWNSTREAM");
    expect(details.nodeId).toBe("backend");
    expect(details.formattedWireText).toContain("USER_ROLE:   viewer");
    expect(details.formattedWireText).toContain("HTTP/1.1 403 Forbidden");
    expect(details.formattedWireText).toContain("insufficient_permissions");
  });

  it("should format Rate Limiting 429 payload at API Gateway", () => {
    const details = buildInspectorDetails(scenario429, 3, "DOWNSTREAM");
    expect(details.nodeId).toBe("gateway");
    expect(details.formattedWireText).toContain("RATE_LIMIT:  0 req remaining");
    expect(details.formattedWireText).toContain("HTTP/1.1 429 Too Many Requests");
    expect(details.formattedWireText).toContain("Retry-After: 1");
  });

  it("should format CAS optimistic concurrency conflict on Node 06", () => {
    const details = buildInspectorDetails(scenarioCas, 5, "DOWNSTREAM");
    expect(details.nodeId).toBe("database");
    expect(details.formattedWireText).toContain("ROWS_AFFECT: 0");
    expect(details.formattedWireText).toContain("HTTP/1.1 409 Conflict");
    expect(details.formattedWireText).toContain("optimistic_lock_conflict");
  });

  it("should throw error for out-of-bounds node index", () => {
    expect(() => buildInspectorDetails(scenario201, 99)).toThrowError(/out of bounds/);
  });
});
