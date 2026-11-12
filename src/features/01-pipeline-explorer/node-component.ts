/**
 * Reusable Pipeline Node Component & Technical Blueprint SVG Icons
 * Inspired by retro isometric networking diagnostics (e.g. protocol-explorer).
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
 */
export const NODE_ICONS: Record<string, string> = {
  // 1. Client: Technical isometric workstation laptop with screen & keyboard
  client: `
    <svg viewBox="0 0 32 32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Screen display -->
      <polygon points="16,3 28,9 28,19 16,13" />
      <polygon points="16,3 4,9 4,19 16,13" />
      <!-- Screen content lines -->
      <line x1="8" y1="11" x2="14" y2="14" />
      <line x1="8" y1="13.5" x2="12" y2="15.5" />
      <!-- Keyboard base -->
      <polygon points="16,13 28,19 16,25 4,19" />
      <polygon points="4,19 16,25 16,27 4,21" />
      <polygon points="16,25 28,19 28,21 16,27" />
      <!-- Keyboard keys detail -->
      <line x1="12" y1="18.5" x2="20" y2="22.5" />
    </svg>
  `.trim(),

  // 2. Network & TLS: Technical isometric Internet cloud with wireframe globe
  network: `
    <svg viewBox="0 0 32 32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Isometric Cloud Outline -->
      <path d="M10,21 C6,21 4,18 5,14 C5.5,11.5 8,10 11,10.5 C12.5,7 16.5,6 20,7.5 C23,9 24.5,12 24,14.5 C26.5,15 28,17.5 27,20 C26,22 23.5,22.5 21,22 L10,22 Z" />
      <!-- Embedded Wireframe Globe -->
      <circle cx="16" cy="15" r="4.5" />
      <ellipse cx="16" cy="15" rx="2" ry="4.5" />
      <line x1="11.5" y1="15" x2="20.5" y2="15" />
      <!-- Transport Waves -->
      <path d="M7,26 L16,29 L25,26" stroke-dasharray="2 2" />
    </svg>
  `.trim(),

  // 3. API Gateway: Technical isometric network router appliance with antenna & LED array
  gateway: `
    <svg viewBox="0 0 32 32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Router top surface -->
      <polygon points="16,9 27,14 16,19 5,14" />
      <!-- Router front left & right chassis -->
      <polygon points="5,14 16,19 16,25 5,20" />
      <polygon points="16,19 27,14 27,20 16,25" />
      <!-- Router Antenna -->
      <line x1="16" y1="9" x2="16" y2="3" />
      <circle cx="16" cy="2.5" r="1" fill="currentColor" />
      <!-- LED indicators & port vents -->
      <circle cx="8" cy="18" r="0.75" fill="currentColor" />
      <circle cx="11" cy="19.5" r="0.75" fill="currentColor" />
      <circle cx="14" cy="21" r="0.75" fill="currentColor" />
      <line x1="19" y1="21.5" x2="24" y2="19" />
    </svg>
  `.trim(),

  // 4. Backend App: Technical isometric server rack / compute module with slots & CPU
  backend: `
    <svg viewBox="0 0 32 32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Top rack server -->
      <polygon points="16,4 27,9 16,14 5,9" />
      <polygon points="5,9 16,14 16,18 5,13" />
      <polygon points="16,14 27,9 27,13 16,18" />
      <!-- Middle rack shelf -->
      <polygon points="5,14.5 16,19.5 16,23.5 5,18.5" />
      <polygon points="16,19.5 27,14.5 27,18.5 16,23.5" />
      <!-- Bottom rack shelf -->
      <polygon points="5,20 16,25 16,29 5,24" />
      <polygon points="16,25 27,20 27,24 16,29" />
      <!-- Status LEDs on shelves -->
      <circle cx="8" cy="12" r="0.75" fill="currentColor" />
      <circle cx="8" cy="17.5" r="0.75" fill="currentColor" />
      <circle cx="8" cy="23" r="0.75" fill="currentColor" />
    </svg>
  `.trim(),

  // 5. Database: Technical isometric PostgreSQL storage cylinder stack with platters
  database: `
    <svg viewBox="0 0 32 32" class="node-tech-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Top magnetic disk cylinder -->
      <ellipse cx="16" cy="7" rx="10" ry="4" />
      <path d="M6,7 L6,13 C6,15.2 10.5,17 16,17 C21.5,17 26,15.2 26,13 L26,7" />
      <!-- Middle platter tier -->
      <path d="M6,13 L6,19 C6,21.2 10.5,23 16,23 C21.5,23 26,21.2 26,19 L26,13" />
      <!-- Bottom platter tier -->
      <path d="M6,19 L6,25 C6,27.2 10.5,29 16,29 C21.5,29 26,27.2 26,25 L26,19" />
      <!-- Platter center line / read head -->
      <line x1="21" y1="13" x2="25" y2="11" />
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
