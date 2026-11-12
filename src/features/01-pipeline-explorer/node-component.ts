/**
 * Reusable Pipeline Node Component & Technical Blueprint SVG Icons
 * Dedicated architectural nodes for Web Backend Request Lifecycle:
 * 01: Client Application (Browser / App)
 * 02: Load Balancer (Edge LB & TLS 1.3 Termination)
 * 03: API Gateway (Nginx / Envoy Reverse Proxy)
 * 04: Backend Application (Express / Microservice Controller)
 * 05: Database (PostgreSQL 16 ACID Engine)
 */

export interface PipelineNodeConfig {
  index: number;
  id: "client" | "network" | "gateway" | "backend" | "database";
  name: string;
  subtext: string;
  ipAddress: string;
  iconSvg: string;
}

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

  // 2. Load Balancer: Edge Traffic Distributor (Ingress splitting to balanced server conduits)
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

  // Aliased as network for backward compatibility with scenario telemetry
  network: `
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

  // 3. API Gateway: Reverse Proxy & Security Routing Appliance
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

  // 4. Backend App: Compute Server Rack Module with Modular Trays
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
      <line x1="19" y1="25" x2="23" y2="23" stroke-width="0.8" />
      <circle cx="24.2" cy="20.8" r="0.6" fill="currentColor" />
      <line x1="11" y1="23.5" x2="11" y2="25" stroke-width="1.2" />
      <line x1="17" y1="27" x2="17" y2="28.5" stroke-width="1.2" />
      <line x1="25" y1="23.5" x2="25" y2="25" stroke-width="1.2" />
    </svg>
  `.trim(),

  // 5. Database: PostgreSQL Multi-Tier Disk Storage Array with Platter Cylinders
  database: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ellipse cx="16" cy="7.5" rx="10" ry="3.5" />
      <line x1="6" y1="7.5" x2="6" y2="13" />
      <line x1="26" y1="7.5" x2="26" y2="13" />
      <path d="M6,13 C6,15.5 10.5,17 16,17 C21.5,17 26,15.5 26,13" />
      <line x1="19" y1="11.5" x2="23" y2="10" stroke-width="0.8" />
      <line x1="6" y1="13" x2="6" y2="18.5" />
      <line x1="26" y1="13" x2="26" y2="18.5" />
      <path d="M6,18.5 C6,21 10.5,22.5 16,22.5 C21.5,22.5 26,21 26,18.5" />
      <line x1="19" y1="17" x2="23" y2="15.5" stroke-width="0.8" />
      <line x1="6" y1="18.5" x2="6" y2="24" />
      <line x1="26" y1="18.5" x2="26" y2="24" />
      <path d="M6,24 C6,26.5 10.5,28 16,28 C21.5,28 26,26.5 26,24" />
      <circle cx="21" cy="25.5" r="0.75" fill="currentColor" />
    </svg>
  `.trim(),
};

export const PIPELINE_NODES: PipelineNodeConfig[] = [
  {
    index: 0,
    id: "client",
    name: "CLIENT",
    subtext: "Browser • Payload & JWT",
    ipAddress: "192.168.1.10",
    iconSvg: NODE_ICONS.client,
  },
  {
    index: 1,
    id: "network",
    name: "LOAD BALANCER",
    subtext: "Edge LB & TLS 1.3 • Traffic Routing",
    ipAddress: "198.51.100.42",
    iconSvg: NODE_ICONS.lb,
  },
  {
    index: 2,
    id: "gateway",
    name: "API GATEWAY",
    subtext: "Nginx / Envoy • Rate Limit & Proxy",
    ipAddress: "10.0.1.1",
    iconSvg: NODE_ICONS.gateway,
  },
  {
    index: 3,
    id: "backend",
    name: "BACKEND APP",
    subtext: "Express / Service • Auth & Routing",
    ipAddress: "upstream:8080",
    iconSvg: NODE_ICONS.backend,
  },
  {
    index: 4,
    id: "database",
    name: "DATABASE",
    subtext: "PostgreSQL 16 • ACID Engine",
    ipAddress: "10.0.2.15",
    iconSvg: NODE_ICONS.database,
  },
];

export interface NodeRenderState {
  state: "ACTIVE" | "PASSED" | "IDLE" | "TRANSIT" | "ERROR";
  badgeText: string;
}

/**
 * Pure template renderer for a pipeline station node card.
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
            <span class="node-ip">${config.ipAddress}</span>
          </div>
          <span class="node-role">${config.subtext}</span>
        </div>
        <span class="node-badge" id="node-badge-${config.index}">${renderState.badgeText}</span>
      </div>
    </div>
  `.trim();
}

/**
 * Pure function to render the entire subway track collection.
 * When failure occurs at a node (isErrorScenario && reached haltNode), styles that node red with FAIL badge.
 */
export function renderSubwayTrack(
  activeNodeIndex = 0,
  direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM",
  haltNode = 4,
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
 * Renders our 5 project backend nodes (Client, Load Balancer, API Gateway, Backend App, Database)
 * on a 2.5D isometric plane with animated connecting wires.
 * When failure occurs at a node, styles that node red with an error halo and red connecting wires.
 */
export function renderIsometricNetworkMap(
  activeNodeIndex = 0,
  direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM",
  haltNode = 4,
  isTransiting = false,
  transitionTarget: number | null = null,
  isErrorScenario = false
): string {
  // 5 Project Nodes on Isometric Plane (viewBox 0 0 400 215)
  const nodePositions = [
    { index: 0, x: 65,  y: 155, name: "Client",        ip: "192.168.1.10",  id: "client" },
    { index: 1, x: 155, y: 110, name: "Load Balancer", ip: "198.51.100.42", id: "network" },
    { index: 2, x: 235, y: 145, name: "API Gateway",   ip: "10.0.1.1",      id: "gateway" },
    { index: 3, x: 295, y: 80,  name: "Backend App",   ip: "upstream:8080", id: "backend" },
    { index: 4, x: 345, y: 35,  name: "Database",      ip: "10.0.2.15",     id: "database" },
  ];

  // Connecting Wires connecting our project's sequential architecture
  const wires = [
    { from: 0, to: 1, d: "M 85 145 L 135 120" },
    { from: 1, to: 2, d: "M 175 118 L 215 138" },
    { from: 2, to: 3, d: "M 248 132 L 282 92" },
    { from: 3, to: 4, d: "M 308 70 L 332 45" },
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

    return `<path d="${wire.d}" class="${strokeClass}" stroke-dasharray="4 3" fill="none" />`;
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
      <svg viewBox="0 0 400 215" class="iso-network-svg" preserveAspectRatio="xMidYMid meet">
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
