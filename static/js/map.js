// RailSathi AI - Interactive SVG Station Map Engine
const StationMap = (() => {
  let svgEl = null;
  let currentPath = [];
  let currentStart = 'entrance_a';
  let currentDest = 'coach_b4';
  let heatmapActive = false;
  let zoomLevel = 1.0;
  let panX = 0;
  let panY = 0;
  let onNodeClickCallback = null;

  // Station Node Definitions with precise coordinate layout
  const NODES = {
    entrance_a: { id: 'entrance_a', name: 'Entrance A', type: 'entrance', x: 90, y: 440, label: 'Entrance A (South)', crowd: 75, icon: '🚪' },
    entrance_b: { id: 'entrance_b', name: 'Entrance B', type: 'entrance', x: 90, y: 150, label: 'Entrance B (North)', crowd: 34, icon: '♿' },
    main_hall: { id: 'main_hall', name: 'Main Hall', type: 'hall', x: 230, y: 440, label: 'Main Heritage Hall', crowd: 65, icon: '🏛️' },
    concourse: { id: 'concourse', name: 'Concourse Central', type: 'concourse', x: 410, y: 290, label: 'Central Concourse', crowd: 72, icon: '🔄' },
    fob_1: { id: 'fob_1', name: 'FOB 1 (North Bridge)', type: 'fob', x: 640, y: 160, label: 'FOB 1 (North)', crowd: 38, icon: '🌉' },
    fob_2: { id: 'fob_2', name: 'FOB 2 (South Bridge)', type: 'fob', x: 640, y: 420, label: 'FOB 2 (South)', crowd: 68, icon: '🌉' },
    ramp: { id: 'ramp', name: 'Accessibility Ramp', type: 'ramp', x: 230, y: 150, label: 'Gentle Ramp (1:12)', crowd: 25, icon: '♿' },
    lift_1: { id: 'lift_1', name: 'Lift 1 (North)', type: 'lift', x: 490, y: 160, label: 'Lift 1 (North FOB)', crowd: 30, icon: '🛗' },
    lift_2: { id: 'lift_2', name: 'Lift 2 (Central)', type: 'lift', x: 490, y: 380, label: 'Lift 2 (Central/P6)', crowd: 42, icon: '🛗' },
    escalator: { id: 'escalator', name: 'Central Escalator', type: 'escalator', x: 530, y: 290, label: 'Escalator', crowd: 60, icon: '⚡' },
    platform_5: { id: 'platform_5', name: 'Platform 5', type: 'platform', x: 800, y: 180, label: 'Platform 5 (61%)', crowd: 61, icon: '🚉' },
    platform_6: { id: 'platform_6', name: 'Platform 6', type: 'platform', x: 800, y: 290, label: 'Platform 6 (78%)', crowd: 78, icon: '🚉' },
    platform_7: { id: 'platform_7', name: 'Platform 7', type: 'platform', x: 800, y: 410, label: 'Platform 7 (48%)', crowd: 48, icon: '🚉' },
    coach_b4: { id: 'coach_b4', name: 'Coach Zone B4', type: 'coach_zone', x: 960, y: 290, label: 'Coach B4 Position', crowd: 74, icon: '🎯' },
    
    // Facilities
    washroom_p6: { id: 'washroom_p6', name: 'Washroom', type: 'facility', x: 860, y: 240, label: 'Washroom (Platform 6)', crowd: 40, icon: '🚻' },
    water_concourse: { id: 'water_concourse', name: 'Drinking Water', type: 'facility', x: 360, y: 230, label: 'RO Water (Concourse)', crowd: 32, icon: '💧' },
    helpdesk_main: { id: 'helpdesk_main', name: 'Help Desk', type: 'facility', x: 230, y: 520, label: 'Help Desk (Main Hall)', crowd: 35, icon: 'ℹ️' },
    holding_gate_b: { id: 'holding_gate_b', name: 'Holding Area', type: 'facility', x: 140, y: 80, label: 'Holding Area (Gate B)', crowd: 44, icon: '🛋️' },
    food_concourse: { id: 'food_concourse', name: 'Food Outlet', type: 'facility', x: 440, y: 350, label: 'IRCTC Food Plaza', crowd: 58, icon: '🍲' },
  };

  // Static corridor connections
  const EDGES = [
    ['entrance_a', 'main_hall'],
    ['main_hall', 'concourse'],
    ['main_hall', 'helpdesk_main'],
    ['concourse', 'fob_2'],
    ['fob_2', 'platform_6'],
    ['platform_6', 'coach_b4'],
    ['entrance_b', 'ramp'],
    ['entrance_b', 'holding_gate_b'],
    ['ramp', 'lift_1'],
    ['ramp', 'concourse'],
    ['ramp', 'lift_2'],
    ['lift_1', 'fob_1'],
    ['lift_1', 'platform_6'],
    ['fob_1', 'platform_5'],
    ['fob_1', 'platform_6'],
    ['concourse', 'escalator'],
    ['escalator', 'fob_2'],
    ['concourse', 'lift_2'],
    ['lift_2', 'platform_6'],
    ['concourse', 'platform_6'],
    ['concourse', 'water_concourse'],
    ['concourse', 'food_concourse'],
    ['platform_6', 'washroom_p6'],
    ['fob_2', 'platform_7'],
    ['platform_5', 'platform_6'],
    ['platform_6', 'platform_7'],
  ];

  function init(containerId, onNodeClick = null) {
    onNodeClickCallback = onNodeClick;
    const container = document.getElementById(containerId);
    if (!container) return;

    render(container);
  }

  function render(container) {
    container.innerHTML = `
      <div class="relative w-full overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800 shadow-2xl">
        <!-- Map Utility Toolbar -->
        <div class="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
          <span class="font-semibold text-blue-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> CSMT Station Live Layout
          </span>
          <div class="h-3.5 w-px bg-slate-700"></div>
          <button id="btn-zoom-in" class="hover:text-blue-400 px-1.5 py-0.5 rounded transition font-bold" title="Zoom in">+</button>
          <button id="btn-zoom-out" class="hover:text-blue-400 px-1.5 py-0.5 rounded transition font-bold" title="Zoom out">-</button>
          <button id="btn-zoom-reset" class="hover:text-blue-400 px-1.5 py-0.5 rounded transition" title="Reset View">Reset</button>
          <div class="h-3.5 w-px bg-slate-700"></div>
          <button id="btn-toggle-heat" class="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition">
            <span>🔥</span> Heatmap
          </button>
        </div>

        <!-- Legend -->
        <div class="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Start</div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Destination</div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Step-Free Lift/Ramp</div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Crowd (>70%)</div>
        </div>

        <!-- Active Route / Facility Banner -->
        <div id="map-route-banner" class="absolute top-3 right-3 z-20 max-w-xs bg-blue-950/90 border border-blue-500/40 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg text-xs">
          <div class="flex items-center justify-between gap-2">
            <span id="map-banner-title" class="font-bold text-blue-200">Active Route: Entrance A → Coach B4</span>
            <span id="map-banner-badge" class="px-1.5 py-0.5 rounded bg-blue-600/40 text-blue-300 text-[10px] font-semibold">5 mins</span>
          </div>
          <p id="map-banner-desc" class="text-slate-300 text-[11px] mt-0.5">Shortest direct corridor via Concourse & FOB 2.</p>
        </div>

        <!-- SVG Station Canvas -->
        <svg id="station-svg" viewBox="0 0 1060 580" class="w-full h-auto max-h-[560px] select-none cursor-grab active:cursor-grabbing">
          <defs>
            <!-- Glow Filters -->
            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="track-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#1E293B" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#0F172A" stop-opacity="0.2"/>
            </linearGradient>
            <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="50%" stop-color="#3B82F6" />
              <stop offset="100%" stop-color="#60A5FA" />
            </linearGradient>
          </defs>

          <!-- Group for transform (pan/zoom) -->
          <g id="map-viewport" transform="translate(0, 0) scale(1)">
            <!-- Architectural Background -->
            <rect x="40" y="30" width="980" height="520" rx="16" fill="#0B132B" stroke="#1E293B" stroke-width="2"/>
            
            <!-- Concourse & Hall Zoning Backgrounds -->
            <rect x="60" y="360" width="280" height="170" rx="12" fill="#111E3D" stroke="#1E3E62" stroke-width="1.5" stroke-dasharray="4 4"/>
            <text x="75" y="385" fill="#475569" font-size="12" font-weight="700">SOUTH TERMINAL WING</text>

            <rect x="60" y="50" width="280" height="160" rx="12" fill="#111E3D" stroke="#1E3E62" stroke-width="1.5" stroke-dasharray="4 4"/>
            <text x="75" y="75" fill="#475569" font-size="12" font-weight="700">NORTH ENTRANCE WING (STEP-FREE)</text>

            <rect x="330" y="120" width="240" height="340" rx="14" fill="#0F1F38" stroke="#2563EB" stroke-width="1.2" stroke-opacity="0.4"/>
            <text x="350" y="145" fill="#3B82F6" font-size="13" font-weight="700">CENTRAL CONCOURSE</text>

            <!-- Railway Tracks & Platforms Background -->
            <!-- Platform 5 -->
            <rect x="740" y="145" width="260" height="65" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
            <rect x="740" y="140" width="260" height="4" fill="#EAB308" fill-opacity="0.6"/> <!-- Tactile warning line -->
            <text x="755" y="170" fill="#94A3B8" font-size="12" font-weight="700">PLATFORM 5</text>

            <!-- Platform 6 (Selected Platform) -->
            <rect x="740" y="255" width="260" height="70" rx="6" fill="#182A4D" stroke="#3B82F6" stroke-width="1.8"/>
            <rect x="740" y="250" width="260" height="4" fill="#EAB308"/> <!-- Yellow safety edge -->
            <rect x="740" y="322" width="260" height="4" fill="#EAB308"/>
            <text x="755" y="280" fill="#60A5FA" font-size="13" font-weight="800">PLATFORM 6 ★ (12951 RAJDHANI)</text>

            <!-- Platform 7 -->
            <rect x="740" y="375" width="260" height="65" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
            <rect x="740" y="370" width="260" height="4" fill="#EAB308" fill-opacity="0.6"/>
            <text x="755" y="400" fill="#94A3B8" font-size="12" font-weight="700">PLATFORM 7</text>

            <!-- Rail lines -->
            <line x1="720" y1="125" x2="1010" y2="125" stroke="#334155" stroke-width="3" stroke-dasharray="12 4"/>
            <line x1="720" y1="235" x2="1010" y2="235" stroke="#475569" stroke-width="3.5" stroke-dasharray="12 4"/>
            <line x1="720" y1="350" x2="1010" y2="350" stroke="#475569" stroke-width="3.5" stroke-dasharray="12 4"/>
            <line x1="720" y1="460" x2="1010" y2="460" stroke="#334155" stroke-width="3" stroke-dasharray="12 4"/>

            <!-- Foot Over Bridges Graphic -->
            <!-- FOB 1 -->
            <rect x="600" y="130" width="80" height="70" rx="8" fill="#1E293B" stroke="#0284C7" stroke-width="1.5" stroke-opacity="0.6"/>
            <text x="612" y="150" fill="#38BDF8" font-size="10" font-weight="700">FOB 1 (NORTH)</text>

            <!-- FOB 2 -->
            <rect x="600" y="390" width="80" height="70" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.6"/>
            <text x="612" y="410" fill="#FBBF24" font-size="10" font-weight="700">FOB 2 (SOUTH)</text>

            <!-- Heatmap Layer (Hidden by default) -->
            <g id="heatmap-layer" opacity="0" class="transition-opacity duration-300">
              <!-- Platform 6 High Crowd Heatmap -->
              <circle cx="800" cy="290" r="85" fill="#EF4444" fill-opacity="0.25" filter="url(#route-glow)"/>
              <circle cx="960" cy="290" r="60" fill="#EF4444" fill-opacity="0.3" filter="url(#route-glow)"/>
              <!-- Concourse Heatmap -->
              <circle cx="410" cy="290" r="75" fill="#F59E0B" fill-opacity="0.22" filter="url(#route-glow)"/>
              <!-- Entrance A Heatmap -->
              <circle cx="90" cy="440" r="55" fill="#F59E0B" fill-opacity="0.2" filter="url(#route-glow)"/>
              <!-- Entrance B Cool Zone -->
              <circle cx="90" cy="150" r="55" fill="#10B981" fill-opacity="0.25" filter="url(#route-glow)"/>
            </g>

            <!-- Background Network Edges -->
            <g id="map-edges-layer">
              ${renderEdgesSvg()}
            </g>

            <!-- Active Glowing Highlighted Route Line -->
            <g id="map-active-route-layer"></g>

            <!-- Station Nodes Layer -->
            <g id="map-nodes-layer">
              ${renderNodesSvg()}
            </g>
          </g>
        </svg>
      </div>
    `;

    svgEl = document.getElementById('station-svg');
    setupEventListeners();
    // Default initial route highlight
    highlightRoute(['entrance_a', 'main_hall', 'concourse', 'fob_2', 'platform_6', 'coach_b4'], false);
  }

  function renderEdgesSvg() {
    return EDGES.map(([uId, vId]) => {
      const u = NODES[uId];
      const v = NODES[vId];
      if (!u || !v) return '';
      return `
        <line 
          x1="${u.x}" y1="${u.y}" 
          x2="${v.x}" y2="${v.y}" 
          stroke="#1E3E62" 
          stroke-width="3" 
          stroke-linecap="round" 
          opacity="0.6"
        />
      `;
    }).join('');
  }

  function renderNodesSvg() {
    return Object.values(NODES).map(node => {
      let fillColor = '#1E293B';
      let strokeColor = '#475569';
      let radius = 18;

      if (node.type === 'entrance') {
        fillColor = node.id === 'entrance_a' ? '#1E3A8A' : '#065F46';
        strokeColor = node.id === 'entrance_a' ? '#3B82F6' : '#10B981';
        radius = 22;
      } else if (node.type === 'coach_zone') {
        fillColor = '#831843';
        strokeColor = '#F43F5E';
        radius = 24;
      } else if (node.type === 'lift' || node.type === 'ramp') {
        fillColor = '#065F46';
        strokeColor = '#10B981';
        radius = 19;
      } else if (node.type === 'platform') {
        fillColor = node.id === 'platform_6' ? '#1E3A8A' : '#1E293B';
        strokeColor = node.id === 'platform_6' ? '#60A5FA' : '#64748B';
        radius = 21;
      } else if (node.type === 'facility') {
        fillColor = '#312E81';
        strokeColor = '#818CF8';
        radius = 16;
      }

      return `
        <g class="station-node cursor-pointer group" data-node-id="${node.id}" transform="translate(${node.x}, ${node.y})">
          <!-- Outer hover circle -->
          <circle r="${radius + 4}" fill="none" stroke="transparent" class="group-hover:stroke-blue-400 group-hover:stroke-2 transition" />
          
          <!-- Node circle -->
          <circle 
            r="${radius}" 
            fill="${fillColor}" 
            stroke="${strokeColor}" 
            stroke-width="2.5" 
            class="transition-all duration-200 group-hover:scale-110"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          />

          <!-- Icon / Glyph -->
          <text text-anchor="middle" dominant-baseline="central" font-size="12" y="0">
            ${node.icon}
          </text>

          <!-- Label below or above -->
          <text 
            text-anchor="middle" 
            y="${node.y > 450 ? -radius - 8 : radius + 15}" 
            fill="#CBD5E1" 
            font-size="10.5" 
            font-weight="600"
            class="pointer-events-none group-hover:fill-white group-hover:font-bold"
          >
            ${node.name}
          </text>
        </g>
      `;
    }).join('');
  }

  function setupEventListeners() {
    const zoomIn = document.getElementById('btn-zoom-in');
    const zoomOut = document.getElementById('btn-zoom-out');
    const zoomReset = document.getElementById('btn-zoom-reset');
    const toggleHeat = document.getElementById('btn-toggle-heat');
    const viewport = document.getElementById('map-viewport');

    function updateTransform() {
      if (viewport) {
        viewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomLevel})`);
      }
    }

    if (zoomIn) zoomIn.addEventListener('click', () => {
      zoomLevel = Math.min(2.0, zoomLevel + 0.15);
      updateTransform();
    });

    if (zoomOut) zoomOut.addEventListener('click', () => {
      zoomLevel = Math.max(0.7, zoomLevel - 0.15);
      updateTransform();
    });

    if (zoomReset) zoomReset.addEventListener('click', () => {
      zoomLevel = 1.0;
      panX = 0;
      panY = 0;
      updateTransform();
    });

    if (toggleHeat) toggleHeat.addEventListener('click', () => {
      heatmapActive = !heatmapActive;
      const heatLayer = document.getElementById('heatmap-layer');
      if (heatLayer) {
        heatLayer.setAttribute('opacity', heatmapActive ? '1' : '0');
      }
      toggleHeat.classList.toggle('bg-amber-500/20', heatmapActive);
      toggleHeat.classList.toggle('text-amber-300', heatmapActive);
    });

    // Node click handlers
    document.querySelectorAll('.station-node').forEach(el => {
      el.addEventListener('click', () => {
        const nodeId = el.getAttribute('data-node-id');
        const node = NODES[nodeId];
        if (onNodeClickCallback) {
          onNodeClickCallback(node);
        }
      });
    });
  }

  function highlightRoute(pathNodeIds, isAccessible = false, customTitle = null, customBadge = null, customDesc = null) {
    if (!pathNodeIds || pathNodeIds.length === 0) return;
    currentPath = pathNodeIds;
    currentStart = pathNodeIds[0];
    currentDest = pathNodeIds[pathNodeIds.length - 1];

    const routeLayer = document.getElementById('map-active-route-layer');
    if (!routeLayer) return;

    // Build SVG path data connecting nodes
    let d = '';
    const points = pathNodeIds.map(id => NODES[id]).filter(Boolean);
    if (points.length < 2) return;

    d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    const startNode = points[0];
    const endNode = points[points.length - 1];
    const pathColor = isAccessible ? '#10B981' : '#3B82F6';

    routeLayer.innerHTML = `
      <!-- Glowing Route halo -->
      <path 
        d="${d}" 
        fill="none" 
        stroke="${pathColor}" 
        stroke-width="10" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        opacity="0.3"
        filter="url(#route-glow)"
      />

      <!-- Core animated path -->
      <path 
        d="${d}" 
        class="animated-path"
        fill="none" 
        stroke="${pathColor}" 
        stroke-width="4.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />

      <!-- Start beacon -->
      <g transform="translate(${startNode.x}, ${startNode.y})">
        <circle class="pulse-beacon" fill="#10B981" />
        <circle r="7" fill="#10B981" stroke="#FFFFFF" stroke-width="2" />
      </g>

      <!-- Destination beacon -->
      <g transform="translate(${endNode.x}, ${endNode.y})">
        <circle class="pulse-beacon" fill="#EF4444" />
        <circle r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" />
      </g>
    `;

    // Update banner text
    const bannerTitle = document.getElementById('map-banner-title');
    const bannerBadge = document.getElementById('map-banner-badge');
    const bannerDesc = document.getElementById('map-banner-desc');

    if (bannerTitle) bannerTitle.textContent = customTitle || `Active Route: ${startNode.name} → ${endNode.name}`;
    if (bannerBadge) bannerBadge.textContent = customBadge || (isAccessible ? '100% Step-Free' : 'Active Route');
    if (bannerDesc) bannerDesc.textContent = customDesc || `Passes via ${points.slice(1, -1).map(p => p.name).join(' → ')}`;
  }

  function highlightFacility(facilityNodeId, startNodeId = 'entrance_a', facName = 'Facility', walkingTime = '2 mins', location = 'Station') {
    // Determine path from start to facility
    const path = [startNodeId];
    if (startNodeId === 'entrance_a') {
      if (facilityNodeId === 'washroom_p6') {
        path.push('main_hall', 'concourse', 'platform_6', 'washroom_p6');
      } else if (facilityNodeId === 'water_concourse') {
        path.push('main_hall', 'concourse', 'water_concourse');
      } else if (facilityNodeId === 'lift_1') {
        path.push('main_hall', 'concourse', 'ramp', 'lift_1');
      } else if (facilityNodeId === 'helpdesk_main') {
        path.push('main_hall', 'helpdesk_main');
      } else if (facilityNodeId === 'holding_gate_b') {
        path.push('main_hall', 'concourse', 'ramp', 'entrance_b', 'holding_gate_b');
      } else if (facilityNodeId === 'food_concourse') {
        path.push('main_hall', 'concourse', 'food_concourse');
      } else {
        path.push('main_hall', 'concourse', facilityNodeId);
      }
    } else {
      // Entrance B
      if (facilityNodeId === 'holding_gate_b') {
        path.push('holding_gate_b');
      } else if (facilityNodeId === 'lift_1') {
        path.push('ramp', 'lift_1');
      } else if (facilityNodeId === 'water_concourse') {
        path.push('ramp', 'concourse', 'water_concourse');
      } else if (facilityNodeId === 'washroom_p6') {
        path.push('ramp', 'lift_1', 'platform_6', 'washroom_p6');
      } else {
        path.push('ramp', 'concourse', facilityNodeId);
      }
    }

    highlightRoute(
      path, 
      true, 
      `Direct Route to ${facName}`, 
      walkingTime, 
      `Destination: ${location}. Walk step-free from ${NODES[startNodeId]?.name || 'Entrance'}.`
    );
  }

  return {
    init,
    highlightRoute,
    highlightFacility,
    NODES
  };
})();
