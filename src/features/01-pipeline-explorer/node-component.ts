/**
 * Reusable Pipeline Node Component & Technical Blueprint SVG Icons
 * Modeled directly after isometric networking diagnostics (protocol-explorer).
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
 * Technical Blueprint Isometric SVG Icons (viewBox="0 0 32 32", stroke="currentColor", fill="none")
 * Precisely crafted 2:1 isometric projections for Client, Network, Gateway, Backend, and Database.
 */
export const NODE_ICONS: Record<string, string> = {
  // 1. Client: Isometric Workstation Laptop with tilted screen, content lines & keyboard deck
  client: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Laptop Screen Bezel -->
      <polygon points="6,5 22,1 22,13 6,17" />
      <!-- Screen Display Area -->
      <polygon points="8,6.5 20,3.5 20,12 8,15" stroke-width="1" />
      <!-- Window Titlebar & Content Lines -->
      <line x1="9" y1="7.5" x2="19" y2="5" stroke-width="1" />
      <line x1="9" y1="9.5" x2="15" y2="8" stroke-width="1" />
      <line x1="9" y1="11.5" x2="14" y2="10.2" stroke-width="1" />
      <line x1="9" y1="13.5" x2="17" y2="11.5" stroke-width="1" />
      <!-- Keyboard Base -->
      <polygon points="6,17 22,13 27,21 11,25" />
      <!-- Base Chassis Drop Thickness -->
      <polyline points="11,25 11,27 27,23 27,21" />
      <!-- Trackpad -->
      <polygon points="16,22 20,21 21.5,23.5 17.5,24.5" stroke-width="0.8" />
      <!-- Keyboard Key Rows -->
      <line x1="9.5" y1="18.5" x2="21" y2="15.5" stroke-width="0.8" />
      <line x1="11" y1="20.5" x2="22.5" y2="17.5" stroke-width="0.8" />
    </svg>
  `.trim(),

  // 2. Network & TLS: Isometric Internet Cloud with Embedded Wireframe Globe
  network: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Cloud Perimeter -->
      <path d="M8,22 C4.5,22 3.5,19 4.5,15.5 C5.2,13 7.5,11.5 10,12 C11.5,8 15.5,7 19,8.5 C22.5,10 23.5,13 23,15.5 C25.5,16 27.5,18 27,20.5 C26.5,22.2 24.5,22.5 22.5,22.5 L8,22.5 Z" />
      <!-- Embedded Wireframe Globe -->
      <circle cx="15.5" cy="15.5" r="5" stroke-width="1.2" />
      <ellipse cx="15.5" cy="15.5" rx="2.2" ry="5" stroke-width="1" />
      <line x1="10.5" y1="15.5" x2="20.5" y2="15.5" stroke-width="1" />
      <line x1="15.5" y1="10.5" x2="15.5" y2="20.5" stroke-width="1" />
      <!-- Signal Pulse Waves -->
      <path d="M7,26 L15.5,28.5 L24,26" stroke-dasharray="2 1.5" stroke-width="1.2" />
    </svg>
  `.trim(),

  // 3. API Gateway: Isometric Network Router with Vertical Antenna, LEDs & Ethernet Port
  gateway: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Router Top Face -->
      <polygon points="7,13 18,9 27,14 16,18" />
      <!-- Router Left Chassis Wall -->
      <polygon points="7,13 16,18 16,24 7,19" />
      <!-- Router Right Front Panel -->
      <polygon points="16,18 27,14 27,20 16,24" />
      <!-- Vertical Antenna with Node Tip -->
      <line x1="13" y1="11" x2="13" y2="3.5" stroke-width="1.5" />
      <circle cx="13" cy="3" r="1.2" fill="currentColor" />
      <!-- Front RJ45 Ethernet Port -->
      <polygon points="9.5,17.5 13.5,19.5 13.5,21.5 9.5,19.5" stroke-width="0.8" />
      <!-- Activity Vent Slit -->
      <line x1="18.5" y1="21.5" x2="24.5" y2="18.5" stroke-width="1" />
      <!-- Status LED Indicators -->
      <circle cx="18" cy="19.5" r="0.6" fill="currentColor" />
      <circle cx="20" cy="18.5" r="0.6" fill="currentColor" />
      <circle cx="22" cy="17.5" r="0.6" fill="currentColor" />
      <circle cx="24" cy="16.5" r="0.6" fill="currentColor" />
      <!-- Top Vent Slits -->
      <line x1="18.5" y1="11.5" x2="20" y2="12.2" stroke-width="0.8" />
      <line x1="20.5" y1="12.5" x2="22" y2="13.2" stroke-width="0.8" />
      <line x1="22.5" y1="13.5" x2="24" y2="14.2" stroke-width="0.8" />
    </svg>
  `.trim(),

  // 4. Backend App: Isometric Server Rack Tower with 3 Modular Blade Trays & Dual LEDs
  backend: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Server Cabinet Top Plate -->
      <polygon points="9,9 18,5 26,9 17,13" />
      <!-- Server Left Side Panel -->
      <polygon points="9,9 17,13 17,27 9,23" />
      <!-- Server Front Right Panel -->
      <polygon points="17,13 26,9 26,23 17,27" />
      <!-- Blade 1 Divider & Vents -->
      <line x1="17" y1="17.5" x2="26" y2="13.5" stroke-width="1" />
      <line x1="19" y1="16" x2="23" y2="14" stroke-width="0.8" />
      <circle cx="24.2" cy="11.8" r="0.6" fill="currentColor" />
      <circle cx="25.2" cy="11.3" r="0.6" fill="currentColor" />
      <!-- Blade 2 Divider & Vents -->
      <line x1="17" y1="22" x2="26" y2="18" stroke-width="1" />
      <line x1="19" y1="20.5" x2="23" y2="18.5" stroke-width="0.8" />
      <circle cx="24.2" cy="16.3" r="0.6" fill="currentColor" />
      <circle cx="25.2" cy="15.8" r="0.6" fill="currentColor" />
      <!-- Blade 3 Vents & LEDs -->
      <line x1="19" y1="25" x2="23" y2="23" stroke-width="0.8" />
      <circle cx="24.2" cy="20.8" r="0.6" fill="currentColor" />
      <circle cx="25.2" cy="20.3" r="0.6" fill="currentColor" />
      <!-- Chassis Feet -->
      <line x1="11" y1="23.5" x2="11" y2="25" stroke-width="1.2" />
      <line x1="17" y1="27" x2="17" y2="28.5" stroke-width="1.2" />
      <line x1="25" y1="23.5" x2="25" y2="25" stroke-width="1.2" />
    </svg>
  `.trim(),

  // 5. Database: Isometric Multi-Tier PostgreSQL Cylinders with Platters & Read Heads
  database: `
    <svg viewBox="0 0 32 32" width="32" height="32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Top Disk Platter Cap -->
      <ellipse cx="16" cy="7.5" rx="10" ry="3.5" />
      <!-- Tier 1 Cylinder -->
      <line x1="6" y1="7.5" x2="6" y2="13" />
      <line x1="26" y1="7.5" x2="26" y2="13" />
      <path d="M6,13 C6,15.5 10.5,17 16,17 C21.5,17 26,15.5 26,13" />
      <line x1="19" y1="11.5" x2="23" y2="10" stroke-width="0.8" />
      <!-- Tier 2 Cylinder -->
      <line x1="6" y1="13" x2="6" y2="18.5" />
      <line x1="26" y1="13" x2="26" y2="18.5" />
      <path d="M6,18.5 C6,21 10.5,22.5 16,22.5 C21.5,22.5 26,21 26,18.5" />
      <line x1="19" y1="17" x2="23" y2="15.5" stroke-width="0.8" />
      <!-- Tier 3 Cylinder Base -->
      <line x1="6" y1="18.5" x2="6" y2="24" />
      <line x1="26" y1="18.5" x2="26" y2="24" />
      <path d="M6,24 C6,26.5 10.5,28 16,28 C21.5,28 26,26.5 26,24" />
      <line x1="19" y1="22.5" x2="23" y2="21" stroke-width="0.8" />
      <!-- Database Status LED -->
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
    name: "NETWORK & TLS",
    subtext: "DNS (8.8.8.8) • TLS 1.3",
    ipAddress: "198.51.100.42",
    iconSvg: NODE_ICONS.network,
  },
  {
    index: 2,
    id: "gateway",
    name: "API GATEWAY",
    subtext: "Nginx • Rate Limit & Proxy",
    ipAddress: "192.168.1.1",
    iconSvg: NODE_ICONS.gateway,
  },
  {
    index: 3,
    id: "backend",
    name: "BACKEND APP",
    subtext: "Express • Auth & Routing",
    ipAddress: "upstream:8080",
    iconSvg: NODE_ICONS.backend,
  },
  {
    index: 4,
    id: "database",
    name: "DATABASE",
    subtext: "PostgreSQL 16 • ACID Engine",
    ipAddress: "203.0.113.10",
    iconSvg: NODE_ICONS.database,
  },
];

export interface NodeRenderState {
  state: "ACTIVE" | "PASSED" | "IDLE";
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
    renderState.state === "ACTIVE"
      ? "active"
      : renderState.state === "PASSED"
      ? "passed"
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
 */
export function renderSubwayTrack(activeNodeIndex = 0, direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM", haltNode = 4): string {
  return PIPELINE_NODES.map((config) => {
    let state: "ACTIVE" | "PASSED" | "IDLE" = "IDLE";
    let badgeText = "IDLE";

    if (config.index === activeNodeIndex) {
      state = "ACTIVE";
      badgeText = direction === "DOWNSTREAM" ? "▼ REQ" : "▲ RES";
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
 * Isometric Blueprint Network Map Renderer (protocol-explorer style).
 * Generates an interactive SVG network topology diagram with nodes positioned along isometric axes.
 */
export function renderIsometricNetworkMap(activeNodeIndex = 0, direction: "DOWNSTREAM" | "UPSTREAM" = "DOWNSTREAM", haltNode = 4): string {
  // 5 Node Isometric Coordinates on a 420x220 canvas
  const nodePositions = [
    { index: 0, x: 65,  y: 155, name: "Client",       ip: "192.168.1.10",   id: "client" },
    { index: 1, x: 260, y: 150, name: "Network",      ip: "198.51.100.42",  id: "network" },
    { index: 2, x: 165, y: 105, name: "Router",       ip: "192.168.1.1",    id: "gateway" },
    { index: 3, x: 340, y: 70,  name: "Web Server",   ip: "upstream:8080",  id: "backend" },
    { index: 4, x: 250, y: 35,  name: "Database",     ip: "203.0.113.10",   id: "database" },
  ];

  const wires = [
    { from: 0, to: 2, d: "M 85 140 L 145 115" },
    { from: 2, to: 1, d: "M 185 115 L 240 140" },
    { from: 1, to: 3, d: "M 275 135 L 325 85" },
    { from: 3, to: 4, d: "M 320 65 L 270 45" },
  ];

  const wireSvg = wires.map((wire, idx) => {
    const isWireActive =
      (direction === "DOWNSTREAM" && activeNodeIndex > idx) ||
      (direction === "UPSTREAM" && activeNodeIndex <= idx && idx < haltNode);
    const strokeClass = isWireActive ? "iso-wire-active" : "iso-wire-idle";
    return `<path d="${wire.d}" class="iso-wire ${strokeClass}" stroke-dasharray="4 3" fill="none" />`;
  }).join("\n");

  const nodesSvg = nodePositions.map((pos) => {
    let state = "IDLE";
    if (pos.index === activeNodeIndex) {
      state = "ACTIVE";
    } else if (
      (direction === "DOWNSTREAM" && pos.index < activeNodeIndex) ||
      (direction === "UPSTREAM" && pos.index > activeNodeIndex && pos.index <= haltNode)
    ) {
      state = "PASSED";
    }

    const nodeClass = state === "ACTIVE" ? "iso-node active" : state === "PASSED" ? "iso-node passed" : "iso-node idle";
    const icon = NODE_ICONS[pos.id] || "";

    return `
      <g class="${nodeClass}" id="iso-node-${pos.index}" onclick="inspectNode(${pos.index})" cursor="pointer" role="button" tabindex="0" aria-label="Inspect ${pos.name}">
        <!-- Invisible Touch Target (>= 48x48px for mobile tap compliance) -->
        <rect x="${pos.x - 24}" y="${pos.y - 10}" width="48" height="48" fill="transparent" class="iso-node-hitbox" />
        <!-- Isometric Ambient Halo -->
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
      <svg viewBox="0 0 400 210" class="iso-network-svg" preserveAspectRatio="xMidYMid meet">
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
