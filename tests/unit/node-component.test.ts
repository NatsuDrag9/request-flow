import { describe, it, expect } from "vitest";
import {
  PIPELINE_NODES,
  NODE_ICONS,
  renderNodeComponent,
  renderSubwayTrack,
  renderIsometricNetworkMap,
} from "../../src/features/01-pipeline-explorer/node-component";

describe("Reusable Pipeline Node Component & Technical Blueprint Icons (6-Node Architecture)", () => {
  it("should define 6 backend architectural nodes: Client, DNS & TLS 1.3, Load Balancer, Gateway, Backend, Database", () => {
    expect(PIPELINE_NODES).toHaveLength(6);
    const expectedIds = ["client", "dns_tls", "lb", "gateway", "backend", "database"];
    PIPELINE_NODES.forEach((node, idx) => {
      expect(node.id).toBe(expectedIds[idx]);
      expect(node.iconSvg).toContain("<svg");
      expect(node.iconSvg).toContain("viewBox=\"0 0 32 32\"");
      expect(node.ipAddress).toBeDefined();
    });

    expect(PIPELINE_NODES[0].name).toBe("CLIENT");
    expect(PIPELINE_NODES[1].name).toBe("DNS & TLS 1.3");
    expect(PIPELINE_NODES[2].name).toBe("LOAD BALANCER");
    expect(PIPELINE_NODES[3].name).toBe("API GATEWAY");
    expect(PIPELINE_NODES[4].name).toBe("BACKEND APP");
    expect(PIPELINE_NODES[5].name).toBe("DATABASE");
  });

  it("should render client icon with workstation terminal details", () => {
    const clientIcon = NODE_ICONS.client;
    expect(clientIcon).toContain("polygon");
    expect(clientIcon).toContain("node-tech-icon");
  });

  it("should render dns_tls icon with cryptographic handshake details", () => {
    const dnsIcon = NODE_ICONS.dns_tls;
    expect(dnsIcon).toContain("circle");
    expect(dnsIcon).toContain("node-tech-icon");
  });

  it("should render load balancer icon with traffic routing distributor", () => {
    const lbIcon = NODE_ICONS.lb;
    expect(lbIcon).toContain("polygon");
    expect(lbIcon).toContain("circle");
    expect(lbIcon).toContain("node-tech-icon");
  });

  it("should render gateway icon with reverse proxy shield", () => {
    const gatewayIcon = NODE_ICONS.gateway;
    expect(gatewayIcon).toContain("polygon");
    expect(gatewayIcon).toContain("node-tech-icon");
  });

  it("should render active node card with IP address and badge", () => {
    const clientConfig = PIPELINE_NODES[0];
    const html = renderNodeComponent(clientConfig, { state: "ACTIVE", badgeText: "▼ REQ" });
    expect(html).toContain("node-row active");
    expect(html).toContain("[01] CLIENT");
    expect(html).toContain("192.168.1.104");
    expect(html).toContain("▼ REQ");
    expect(html).toContain("node-tech-icon");
  });

  it("should render passed and idle states correctly", () => {
    const gatewayConfig = PIPELINE_NODES[3];
    const passedHtml = renderNodeComponent(gatewayConfig, { state: "PASSED", badgeText: "PASS" });
    expect(passedHtml).toContain("node-row passed");
    expect(passedHtml).toContain("PASS");

    const idleHtml = renderNodeComponent(gatewayConfig, { state: "IDLE", badgeText: "IDLE" });
    expect(idleHtml).not.toContain("node-row active");
    expect(idleHtml).not.toContain("node-row passed");
    expect(idleHtml).toContain("IDLE");
  });

  it("should render the full subway track dynamically based on active hop across all 6 nodes", () => {
    const trackHtml = renderSubwayTrack(2, "DOWNSTREAM", 5);
    expect(trackHtml).toContain('id="node-row-0"');
    expect(trackHtml).toContain('id="node-row-1"');
    expect(trackHtml).toContain('id="node-row-2"');
    expect(trackHtml).toContain('id="node-row-3"');
    expect(trackHtml).toContain('id="node-row-4"');
    expect(trackHtml).toContain('id="node-row-5"');
  });

  it("should render in-transit status when packet is traveling between stations", () => {
    const trackHtml = renderSubwayTrack(1, "DOWNSTREAM", 5, true, 2);
    expect(trackHtml).toContain("PROPAGATING...");
    expect(trackHtml).toContain("INCOMING");
  });

  it("should render the isometric network map with all 6 project nodes", () => {
    const isoHtml = renderIsometricNetworkMap(1, "DOWNSTREAM", 5);
    expect(isoHtml).toContain("isometric-canvas-wrapper");
    expect(isoHtml).toContain('id="iso-node-0"');
    expect(isoHtml).toContain('id="iso-node-1"');
    expect(isoHtml).toContain('id="iso-node-2"');
    expect(isoHtml).toContain('id="iso-node-3"');
    expect(isoHtml).toContain('id="iso-node-4"');
    expect(isoHtml).toContain('id="iso-node-5"');
    expect(isoHtml).toContain("Client");
    expect(isoHtml).toContain("DNS & TLS");
    expect(isoHtml).toContain("Load Balancer");
    expect(isoHtml).toContain("API Gateway");
    expect(isoHtml).toContain("Backend App");
    expect(isoHtml).toContain("Database");
    expect(isoHtml).toContain("iso-wire");
  });

  it("should style the failure node with error class and red badge when failure occurs", () => {
    // 401 Unauthorized scenario halts at node 4 (Backend App)
    const subwayHtml = renderSubwayTrack(4, "UPSTREAM", 4, false, null, true);
    expect(subwayHtml).toContain('class="node-row error" id="node-row-4"');
    expect(subwayHtml).toContain("✖ FAIL");

    // Isometric map should mark the failure node with iso-node error
    const isoHtml = renderIsometricNetworkMap(4, "UPSTREAM", 4, false, null, true);
    expect(isoHtml).toContain('class="iso-node error" id="iso-node-4"');
    expect(isoHtml).toContain("iso-wire-error");
  });
});
