/**
 * Reusable Pipeline Node Component & Technical Blueprint SVG Icons
 * Dedicated architectural nodes for Web Backend Request Lifecycle:
 * 01: Client Application (Browser / App)
 * 02: DNS & TLS 1.3 (Domain & Crypto Handshake Edge)
 * 03: Load Balancer (Edge LB & Traffic Distributor)
 * 04: API Gateway (Nginx / Envoy Reverse Proxy & Rate Limiter)
 * 05: Backend Application (Express / JWT Auth & Controller)
 * 06: Database (PostgreSQL 16 ACID Engine)
 */

import type { PipelineNodeConfig, NodeRenderState } from "./types";

export type { PipelineNodeConfig, NodeRenderState };

/**
 * Technical Blueprint SVG Icons (viewBox="0 0 32 32", stroke="currentColor", fill="none")
 * Authentic isometric technical projections for enterprise backend architecture.
 */
export const NODE_ICONS: Record<string, string> = {
  // 1. Client: Workstation Laptop / Terminal Screen
  client: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="6,5 22,1 22,13 6,17" />
      <polygon points="8,6.5 20,3.5 20,12 8,15" stroke-width="1" />
      <line x1="9" y1="7.5" x2="19" y2="5" stroke-width="1" />
      <line x1="9" y1="9.5" x2="15" y2="8" stroke-width="1" />
      <line x1="9" y1="11.5" x2="14" y2="10.2" stroke-width="1" />
      <polygon points="6,17 22,13 27,21 11,25" />
      <polyline points="11,25 11,27 27,23 27,21" />
      <polygon points="16,22 20,21 21.5,23.5 17.5,24.5" stroke-width="0.8" />
      <line x1="9.5" y1="18.5" x2="21" y2="15.5" stroke-width="0.8" />
    </svg>
  `.trim(),

  // 2. DNS & TLS 1.3: Cryptographic Handshake & Domain Resolver
  dns_tls: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="15" cy="15" r="10" />
      <ellipse cx="15" cy="15" rx="5" ry="10" stroke-width="1.2" />
      <line x1="5" y1="15" x2="25" y2="15" stroke-width="1.2" />
      <line x1="7.5" y1="10" x2="22.5" y2="10" stroke-width="0.8" />
      <line x1="7.5" y1="20" x2="22.5" y2="20" stroke-width="0.8" />
      <polygon points="19,17 28,17 28,26 19,26" fill="var(--bg-card)" stroke-width="1.3" />
      <path d="M21.5,17 L21.5,14 C21.5,12.9 22.4,12 23.5,12 C24.6,12 25.5,12.9 25.5,14 L25.5,17" stroke-width="1.2" />
    </svg>
  `.trim(),

  // 3. Load Balancer: Edge Traffic Distributor (Ingress splitting to balanced server conduits)
  lb: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="16,4 25,8 16,12 7,8" />
      <polygon points="7,8 16,12 16,16 7,12" />
      <polygon points="16,12 25,8 25,12 16,16" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      <line x1="16" y1="1" x2="16" y2="4" stroke-width="1.5" />
      <path d="M11,14 L6,19 L6,25" stroke-width="1.2" />
      <path d="M16,16 L16,25" stroke-width="1.2" />
      <path d="M21,14 L26,19 L26,25" stroke-width="1.2" />
      <circle cx="6" cy="27" r="1.5" />
      <circle cx="16" cy="27" r="1.5" />
      <circle cx="26" cy="27" r="1.5" />
    </svg>
  `.trim(),

  // Aliased as network for backward compatibility
  network: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="15" cy="15" r="10" />
      <ellipse cx="15" cy="15" rx="5" ry="10" stroke-width="1.2" />
      <line x1="5" y1="15" x2="25" y2="15" stroke-width="1.2" />
      <polygon points="19,17 28,17 28,26 19,26" fill="var(--bg-card)" stroke-width="1.3" />
      <path d="M21.5,17 L21.5,14 C21.5,12.9 22.4,12 23.5,12 C24.6,12 25.5,12.9 25.5,14 L25.5,17" stroke-width="1.2" />
    </svg>
  `.trim(),

  // 4. API Gateway: Reverse Proxy & Security Routing Appliance
  gateway: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="16,6 26,11 16,16 6,11" />
      <polygon points="6,11 16,16 16,24 6,19" />
      <polygon points="16,16 26,11 26,19 16,24" />
      <path d="M12,14 L16,16 L20,14" stroke-width="1" />
      <path d="M16,10 L20,12 L20,16 C20,19 16,21 16,21 C16,21 12,19 12,16 L12,12 Z" stroke-width="1" />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" />
      <circle cx="8" cy="17" r="0.6" fill="currentColor" />
      <circle cx="10" cy="18" r="0.6" fill="currentColor" />
      <circle cx="22" cy="17" r="0.6" fill="currentColor" />
      <circle cx="24" cy="16" r="0.6" fill="currentColor" />
    </svg>
  `.trim(),

  // 5. Backend App: Compute Server Rack Module with Modular Trays
  backend: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="9,9 18,5 26,9 17,13" />
      <polygon points="9,9 17,13 17,27 9,23" />
      <polygon points="17,13 26,9 26,23 17,27" />
      <line x1="17" y1="17.5" x2="26" y2="13.5" stroke-width="1" />
      <line x1="19" y1="16" x2="23" y2="14" stroke-width="0.8" />
      <circle cx="24.2" cy="11.8" r="0.6" fill="currentColor" />
      <line x1="17" y1="22" x2="26" y2="18" stroke-width="1" />
      <circle cx="24.2" cy="16.3" r="0.6" fill="currentColor" />
      <line x1="11" y1="12" x2="15" y2="14" stroke-width="0.8" />
      <line x1="11" y1="16.5" x2="15" y2="18.5" stroke-width="0.8" />
      <line x1="11" y1="21" x2="15" y2="23" stroke-width="0.8" />
    </svg>
  `.trim(),

  // 6. Database: PostgreSQL 16 ACID Isometric Storage Cylinder
  database: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ellipse cx="16" cy="7" rx="11" ry="4.5" />
      <path d="M5,7 C5,10 10,11.5 16,11.5 C22,11.5 27,10 27,7" stroke-width="1" />
      <path d="M5,12 C5,15 10,16.5 16,16.5 C22,16.5 27,15 27,12" stroke-width="1" />
      <path d="M5,17 C5,20 10,21.5 16,21.5 C22,21.5 27,20 27,17" stroke-width="1" />
      <path d="M5,7 L5,23 C5,26.5 10,28 16,28 C22,28 27,26.5 27,23 L27,7" />
      <circle cx="16" cy="7" r="1.5" fill="currentColor" />
      <circle cx="9" cy="19.5" r="0.6" fill="currentColor" />
      <circle cx="11.5" cy="20.2" r="0.6" fill="currentColor" />
      <circle cx="21" cy="20" r="0.6" fill="currentColor" />
      <circle cx="23.5" cy="19" r="0.6" fill="currentColor" />
      <line x1="16" y1="14" x2="16" y2="16.5" stroke-width="1.2" />
      <line x1="16" y1="19" x2="16" y2="21.5" stroke-width="1.2" />
    </svg>
  `.trim(),
};

/**
 * 6 Architectural Project Nodes for RequestFlow
 */
export const PIPELINE_NODES: PipelineNodeConfig[] = [
  {
    index: 0,
    id: "client",
    name: "CLIENT",
    subtext: "Browser / App",
    ipAddress: "192.168.1.104",
    iconSvg: NODE_ICONS.client,
  },
  {
    index: 1,
    id: "dns_tls",
    name: "DNS & TLS 1.3",
    subtext: "Domain & Crypto Edge",
    ipAddress: "1.1.1.1 / TLS 1.3",
    iconSvg: NODE_ICONS.dns_tls,
  },
  {
    index: 2,
    id: "lb",
    name: "LOAD BALANCER",
    subtext: "L4/L7 Traffic Ingress",
    ipAddress: "198.51.100.1",
    iconSvg: NODE_ICONS.lb,
  },
  {
    index: 3,
    id: "gateway",
    name: "API GATEWAY",
    subtext: "Reverse Proxy & Limits",
    ipAddress: "10.0.0.1",
    iconSvg: NODE_ICONS.gateway,
  },
  {
    index: 4,
    id: "backend",
    name: "BACKEND APP",
    subtext: "Express / JWT Auth",
    ipAddress: "10.0.1.25",
    iconSvg: NODE_ICONS.backend,
  },
  {
    index: 5,
    id: "database",
    name: "DATABASE",
    subtext: "PostgreSQL 16 ACID",
    ipAddress: "10.0.2.80",
    iconSvg: NODE_ICONS.database,
  },
];

/**
 * Pure function to render an individual node row in the subway sequence.
 */
export function renderNodeComponent(
  config: PipelineNodeConfig,
  renderState: NodeRenderState = { state: "IDLE", badgeText: "IDLE" }
): string {
  const activeClass =
    renderState.state === "ERROR"
      ? "error"
      : renderState.state === "ACTIVE"
      ? "active"
      : renderState.state === "PASSED"
      ? "passed"
      : renderState.state === "TRANSIT"
      ? "in-transit"
      : "";

  return `
    <div class="node-row ${activeClass}" id="node-row-${config.index}" onclick="inspectNode(${config.index})" role="button" tabindex="0" aria-label="Inspect ${config.name} node">
      <div class="node-station-dot" title="${config.name} (${config.ipAddress})">
        ${config.iconSvg}
      </div>
      <div class="node-card">
        <div class="node-info-col">
          <div class="node-header-line">
            <span class="node-name">[0${config.index + 1}] ${config.name}</span>
            <div class="node-meta-group">
              <span class="node-ip">${config.ipAddress}</span>
              <span class="node-badge" id="node-badge-${config.index}">${renderState.badgeText}</span>
            </div>
          </div>
          <span class="node-role">${config.subtext}</span>
        </div>
      </div>
    </div>
  `.trim();
}

/**
 * Pure function to render the entire subway track collection (6 nodes).
 */
export function renderSubwayTrack(
  activeNodeIndex = 0,
  direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM",
  haltNode = 5,
  isTransiting = false,
  transitionTarget: number | null = null,
  isErrorScenario = false
): string {
  return PIPELINE_NODES.map((config) => {
    let state: "ACTIVE" | "PASSED" | "IDLE" | "TRANSIT" | "ERROR" = "IDLE";
    let badgeText = "IDLE";

    // Detect if failure occurred at this node
    const isFailureNode =
      isErrorScenario &&
      config.index === haltNode &&
      (activeNodeIndex >= haltNode || direction === "UPSTREAM");

    if (isFailureNode) {
      state = "ERROR";
      badgeText = "✖ FAIL";
    } else if (config.index === activeNodeIndex) {
      if (isTransiting) {
        state = "TRANSIT";
        badgeText = "PROPAGATING...";
      } else {
        state = "ACTIVE";
        badgeText = direction === "DOWNSTREAM" ? "▼ REQ" : "▲ RES";
      }
    } else if (isTransiting && transitionTarget !== null && config.index === transitionTarget) {
      state = "TRANSIT";
      badgeText = "INCOMING";
    } else if (
      (direction === "DOWNSTREAM" && config.index < activeNodeIndex) ||
      (direction === "UPSTREAM" && config.index > activeNodeIndex && config.index <= haltNode)
    ) {
      state = "PASSED";
      badgeText = "PASS";
    }

    return renderNodeComponent(config, { state, badgeText });
  }).join("\n");
}

/**
 * Isometric Architectural Network Map Renderer.
 * Renders all 6 project nodes on a 2.5D isometric plane with animated connecting wires.
 */
export function renderIsometricNetworkMap(
  activeNodeIndex = 0,
  direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM",
  haltNode = 5,
  isTransiting = false,
  transitionTarget: number | null = null,
  isErrorScenario = false
): string {
  // 6 Project Nodes on Isometric Plane (viewBox 0 0 420 220)
  const nodePositions = [
    { index: 0, x: 45,  y: 155, name: "Client",        ip: "192.168.1.104", id: "client" },
    { index: 1, x: 110, y: 125, name: "DNS & TLS",     ip: "1.1.1.1 / TLS", id: "dns_tls" },
    { index: 2, x: 175, y: 85,  name: "Load Balancer", ip: "198.51.100.1",  id: "lb" },
    { index: 3, x: 240, y: 125, name: "API Gateway",   ip: "10.0.0.1",      id: "gateway" },
    { index: 4, x: 305, y: 85,  name: "Backend App",   ip: "10.0.1.25",     id: "backend" },
    { index: 5, x: 365, y: 45,  name: "Database",      ip: "10.0.2.80",     id: "database" },
  ];

  // Connecting Wires connecting our sequential architecture
  const wires = [
    { from: 0, to: 1, d: "M 65 145 L 95 130" },
    { from: 1, to: 2, d: "M 130 115 L 160 95" },
    { from: 2, to: 3, d: "M 195 95 L 225 115" },
    { from: 3, to: 4, d: "M 260 115 L 290 95" },
    { from: 4, to: 5, d: "M 325 75 L 350 55" },
  ];

  const wireSvg = wires.map((wire, idx) => {
    // Check if this wire is in transit right now
    const isThisWireInTransit =
      isTransiting &&
      ((activeNodeIndex === wire.from && transitionTarget === wire.to) ||
       (activeNodeIndex === wire.to && transitionTarget === wire.from));

    const isWireActive =
      isThisWireInTransit ||
      (direction === "DOWNSTREAM" && activeNodeIndex > idx) ||
      (direction === "UPSTREAM" && activeNodeIndex <= idx && idx < haltNode);

    // During upstream return in error scenario, wires carry error status
    const isErrorReturnWire =
      isErrorScenario &&
      direction === "UPSTREAM" &&
      idx < haltNode;

    const strokeClass = isThisWireInTransit
      ? (isErrorReturnWire ? "iso-wire iso-wire-in-transit iso-wire-error" : "iso-wire iso-wire-in-transit")
      : isErrorReturnWire
      ? "iso-wire iso-wire-active iso-wire-error"
      : isWireActive
      ? "iso-wire iso-wire-active"
      : "iso-wire iso-wire-idle";

    return `<path d="${wire.d}" class="${strokeClass}" stroke-dasharray="4 3" fill="none" id="iso-wire-${idx}" />`;
  }).join("\n");

  const nodesSvg = nodePositions.map((pos) => {
    let state = "IDLE";
    const isFailureNode =
      isErrorScenario &&
      pos.index === haltNode &&
      (activeNodeIndex >= haltNode || direction === "UPSTREAM");

    if (isFailureNode) {
      state = "ERROR";
    } else if (pos.index === activeNodeIndex) {
      state = isTransiting ? "TRANSIT" : "ACTIVE";
    } else if (isTransiting && transitionTarget !== null && pos.index === transitionTarget) {
      state = "TRANSIT";
    } else if (
      (direction === "DOWNSTREAM" && pos.index < activeNodeIndex) ||
      (direction === "UPSTREAM" && pos.index > activeNodeIndex && pos.index <= haltNode)
    ) {
      state = "PASSED";
    }

    const nodeClass =
      state === "ERROR"
        ? "iso-node error"
        : state === "ACTIVE"
        ? "iso-node active"
        : state === "TRANSIT"
        ? "iso-node in-transit"
        : state === "PASSED"
        ? "iso-node passed"
        : "iso-node idle";

    const icon = NODE_ICONS[pos.id] || "";

    return `
      <g class="${nodeClass}" id="iso-node-${pos.index}" onclick="inspectNode(${pos.index})" cursor="pointer" role="button" tabindex="0" aria-label="Inspect ${pos.name}">
        <!-- Invisible Touch Target (>= 48x48px for mobile tap compliance) -->
        <rect x="${pos.x - 24}" y="${pos.y - 12}" width="48" height="48" fill="transparent" class="iso-node-hitbox" />
        <!-- Isometric Ambient Halo (Pulsing Red on Failure) -->
        <ellipse cx="${pos.x}" cy="${pos.y + 8}" rx="24" ry="12" class="iso-node-halo" />
        <!-- Technical Node Icon Container -->
        <g transform="translate(${pos.x - 16}, ${pos.y - 12})">
          ${icon}
        </g>
        <!-- Technical Labels -->
        <text x="${pos.x}" y="${pos.y + 26}" class="iso-node-label" text-anchor="middle">${pos.name}</text>
        <text x="${pos.x}" y="${pos.y + 36}" class="iso-node-ip" text-anchor="middle">${pos.ip}</text>
      </g>
    `;
  }).join("\n");

  return `
    <div class="isometric-canvas-wrapper" id="isometricCanvas">
      <svg viewBox="0 0 420 220" class="iso-network-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="isoGrid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 20 0 L 40 10 L 20 20 Z" fill="none" class="iso-grid-line" stroke-width="0.5" />
          </pattern>
        </defs>
        <!-- Isometric Grid Background -->
        <rect width="100%" height="100%" fill="url(#isoGrid)" opacity="0.65" />
        <!-- Connecting Isometric Wires -->
        <g class="iso-wires-group">
          ${wireSvg}
        </g>
        <!-- Isometric Nodes -->
        <g class="iso-nodes-group">
          ${nodesSvg}
        </g>
      </svg>
    </div>
  `.trim();
}
