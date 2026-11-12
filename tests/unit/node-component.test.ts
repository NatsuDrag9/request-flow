import { describe, it, expect } from "vitest";
import {
  PIPELINE_NODES,
  NODE_ICONS,
  renderNodeComponent,
  renderSubwayTrack,
} from "../../src/features/01-pipeline-explorer/node-component";

describe("Reusable Pipeline Node Component & Technical Blueprint Icons", () => {
  it("should have 5 defined technical nodes with distinct blueprint SVGs", () => {
    expect(PIPELINE_NODES).toHaveLength(5);
    const expectedIds = ["client", "network", "gateway", "backend", "database"];
    PIPELINE_NODES.forEach((node, idx) => {
      expect(node.id).toBe(expectedIds[idx]);
      expect(node.iconSvg).toContain("<svg");
      expect(node.iconSvg).toContain("viewBox=\"0 0 32 32\"");
      expect(node.ipAddress).toBeDefined();
    });
  });

  it("should render an active node card with IP address and badge", () => {
    const clientConfig = PIPELINE_NODES[0];
    const html = renderNodeComponent(clientConfig, { state: "ACTIVE", badgeText: "▼ REQ" });
    expect(html).toContain("node-row active");
    expect(html).toContain("[01] CLIENT");
    expect(html).toContain("192.168.1.10");
    expect(html).toContain("▼ REQ");
    expect(html).toContain("node-tech-icon");
  });

  it("should render passed and idle states correctly", () => {
    const gatewayConfig = PIPELINE_NODES[2];
    const passedHtml = renderNodeComponent(gatewayConfig, { state: "PASSED", badgeText: "PASS" });
    expect(passedHtml).toContain("node-row passed");
    expect(passedHtml).toContain("PASS");

    const idleHtml = renderNodeComponent(gatewayConfig, { state: "IDLE", badgeText: "IDLE" });
    expect(idleHtml).not.toContain("node-row active");
    expect(idleHtml).not.toContain("node-row passed");
    expect(idleHtml).toContain("IDLE");
  });

  it("should render the full subway track dynamically based on active hop", () => {
    // When at Node 2 downstream, Nodes 0 and 1 are PASSED, Node 2 is ACTIVE, Nodes 3 and 4 are IDLE
    const trackHtml = renderSubwayTrack(2, "DOWNSTREAM", 4);
    expect(trackHtml).toContain('id="node-row-0"');
    expect(trackHtml).toContain('id="node-row-1"');
    expect(trackHtml).toContain('id="node-row-2"');
    expect(trackHtml).toContain('id="node-row-3"');
    expect(trackHtml).toContain('id="node-row-4"');
  });
});
