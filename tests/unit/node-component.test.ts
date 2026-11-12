import { describe, it, expect } from "vitest";
import {
  PIPELINE_NODES,
  NODE_ICONS,
  renderNodeComponent,
  renderSubwayTrack,
  renderIsometricNetworkMap,
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

  it("should render client icon with workstation laptop details", () => {
    const clientIcon = NODE_ICONS.client;
    expect(clientIcon).toContain("polygon");
    // Should have keyboard trackpad and screen details
    expect(clientIcon).toContain("node-tech-icon");
  });

  it("should render gateway router icon with antenna and LEDs", () => {
    const gatewayIcon = NODE_ICONS.gateway;
    expect(gatewayIcon).toContain("circle");
    expect(gatewayIcon).toContain("polygon");
  });

  it("should render active node card with IP address and badge", () => {
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
    const trackHtml = renderSubwayTrack(2, "DOWNSTREAM", 4);
    expect(trackHtml).toContain('id="node-row-0"');
    expect(trackHtml).toContain('id="node-row-1"');
    expect(trackHtml).toContain('id="node-row-2"');
    expect(trackHtml).toContain('id="node-row-3"');
    expect(trackHtml).toContain('id="node-row-4"');
  });

  it("should render the isometric network map with all 5 nodes and isometric wires", () => {
    const isoHtml = renderIsometricNetworkMap(1, "DOWNSTREAM", 4);
    expect(isoHtml).toContain("isometric-canvas-wrapper");
    expect(isoHtml).toContain('id="iso-node-0"');
    expect(isoHtml).toContain('id="iso-node-1"');
    expect(isoHtml).toContain('id="iso-node-2"');
    expect(isoHtml).toContain('id="iso-node-3"');
    expect(isoHtml).toContain('id="iso-node-4"');
    expect(isoHtml).toContain("iso-wire");
    expect(isoHtml).toContain("iso-grid-line");
    // Node 1 should be active
    expect(isoHtml).toContain('class="iso-node active" id="iso-node-1"');
    // Node 0 should be passed
    expect(isoHtml).toContain('class="iso-node passed" id="iso-node-0"');
  });
});
