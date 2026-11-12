import { describe, it, expect } from "vitest";
import { getScenario } from "../../src/features/01-pipeline-explorer/scenarios";
import { buildInspectorDetails } from "../../src/features/02-stage-inspector/inspector";

describe("Stage Wire Inspector (Feature 02)", () => {
  const scenario201 = getScenario("201-created");
  const scenario401 = getScenario("401-unauthorized");
  const scenario504 = getScenario("504-timeout");

  it("should extract complete inspector details for Node 01 (Client)", () => {
    const details = buildInspectorDetails(scenario201, 0, "DOWNSTREAM");
    expect(details.nodeIndex).toBe(0);
    expect(details.nodeId).toBe("client");
    expect(details.direction).toBe("DOWNSTREAM");
    expect(details.scenarioCode).toBe("201");
    expect(details.formattedWireText).toContain("POST https://api.cloudcrane.ai/v1/orders HTTP/1.1");
    expect(details.formattedWireText).toContain("Authorization: Bearer eyJhbGciOi...");
  });

  it("should format TLS 1.3 telemetry for Node 02 (Network)", () => {
    const details = buildInspectorDetails(scenario201, 1, "DOWNSTREAM");
    expect(details.nodeId).toBe("network");
    expect(details.formattedWireText).toContain("PROTOCOL:    TLS 1.3");
    expect(details.formattedWireText).toContain("CIPHER:      TLS_AES_256_GCM_SHA384");
    expect(details.formattedWireText).toContain("HANDSHAKE:   42ms");
  });

  it("should format API Gateway reverse proxy telemetry for Node 03", () => {
    const details = buildInspectorDetails(scenario201, 2, "DOWNSTREAM");
    expect(details.nodeId).toBe("gateway");
    expect(details.formattedWireText).toContain("ROUTING:     /v1/orders -> upstream_backend:8080");
    expect(details.formattedWireText).toContain("RATE_LIMIT:  98 req remaining");
  });

  it("should format PostgreSQL ACID transaction for Node 05 (Database)", () => {
    const details = buildInspectorDetails(scenario201, 4, "DOWNSTREAM");
    expect(details.nodeId).toBe("database");
    expect(details.formattedWireText).toContain("ENGINE:      PostgreSQL 16");
    expect(details.formattedWireText).toContain("ISOLATION:   READ COMMITTED");
    expect(details.formattedWireText).toContain("INSERT INTO orders (user_id, item, qty, status)");
  });

  it("should format auth rejection traces when 401 scenario halts at Node 04", () => {
    const details = buildInspectorDetails(scenario401, 3, "DOWNSTREAM");
    expect(details.nodeId).toBe("backend");
    expect(details.formattedWireText).toContain("AUTH_STATUS: REJECTED (TokenExpiredError)");
    expect(details.formattedWireText).toContain("HTTP/1.1 401 Unauthorized");
  });

  it("should indicate unreached status for Node 05 when 401 scenario halts early", () => {
    const details = buildInspectorDetails(scenario401, 4, "DOWNSTREAM");
    expect(details.nodeId).toBe("database");
    expect(details.formattedWireText).toContain("SQL:\n-- UNREACHED --");
  });

  it("should throw error for out-of-bounds node index", () => {
    expect(() => buildInspectorDetails(scenario201, 99)).toThrowError(/out of bounds/);
  });
});
