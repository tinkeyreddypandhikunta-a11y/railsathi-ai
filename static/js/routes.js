// RailSathi AI - Route Engine & Planner UI
const RouteEngine = (() => {
  let activeRouteId = 'route_fastest';
  let accessibilityMode = 'normal'; // normal, wheelchair, elderly, family
  let currentRoutes = [];

  // Default routes matching specifications exactly
  const DEFAULT_ROUTES = {
    normal: [
      {
        id: 'route_fastest',
        title: 'Route A: Fastest Route',
        badge: '⚡ Fastest',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        timeMins: 5,
        distanceM: 320,
        crowdPercent: 62,
        stepFree: false,
        nodes: ['entrance_a', 'main_hall', 'concourse', 'fob_2', 'platform_6', 'coach_b4'],
        summary: 'Entrance A → Concourse → FOB 2 → Platform 6 → Coach B4',
        details: 'Direct path through Main Hall & South FOB 2. Ideal for quick walking with light luggage.',
        steps: [
          { icon: '🚪', text: 'Enter via Entrance A (Main South Portico)', sub: '60 meters • 50s' },
          { icon: '🏛️', text: 'Walk through Main Heritage Concourse', sub: '110 meters • 90s' },
          { icon: '🌉', text: 'Take FOB 2 stairs up and cross to Platform 6 descent', sub: '90 meters • 80s' },
          { icon: '🚉', text: 'Step down onto Platform 6 walkway', sub: '60 meters • 60s' },
          { icon: '🎯', text: 'Arrive at Coach Zone B4 indicator position', sub: 'Final destination • Coach B4' }
        ]
      },
      {
        id: 'route_low_crowd',
        title: 'Route B: Lowest-Crowd Route',
        badge: '🟢 Lowest Crowd',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        timeMins: 8,
        distanceM: 410,
        crowdPercent: 34,
        stepFree: true,
        nodes: ['entrance_b', 'lift_1', 'fob_1', 'platform_6', 'coach_b4'],
        summary: 'Entrance B → Lift 1 → FOB 1 → Platform 6 → Coach B4',
        details: 'Calm suburban entrance corridor bypassing central crowd. Uses Lift 1 and North bridge.',
        steps: [
          { icon: '🚪', text: 'Enter via North Suburban Entrance B (Low Density)', sub: '45 meters • 40s' },
          { icon: '🛗', text: 'Take spacious Lift 1 to North FOB 1 walkway', sub: '30 meters • 35s' },
          { icon: '🌉', text: 'Cross over serene North Bridge FOB 1', sub: '120 meters • 110s' },
          { icon: '🚉', text: 'Take elevator/ramp down directly to Platform 6', sub: '140 meters • 120s' },
          { icon: '🎯', text: 'Arrive safely at Coach Zone B4', sub: 'Final destination • Coach B4' }
        ]
      },
      {
        id: 'route_accessible',
        title: 'Route C: Accessible Route',
        badge: '♿ 100% Step-Free',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        timeMins: 9,
        distanceM: 380,
        crowdPercent: 35,
        stepFree: true,
        nodes: ['entrance_b', 'ramp', 'lift_2', 'platform_6', 'coach_b4'],
        summary: 'Entrance B → Ramp → Lift 2 → Platform 6 → Coach B4',
        details: 'Completely step-free tactile route with gentle 1:12 ramp and operational priority Lift 2.',
        steps: [
          { icon: '♿', text: 'Enter Entrance B with wide wheelchair gate', sub: '45 meters • Gentle slope' },
          { icon: '📐', text: 'Follow rubber tactile Accessibility Ramp (1:12 grade)', sub: '110 meters • Non-slip' },
          { icon: '🛗', text: 'Board Lift 2 (Braille buttons & audio guidance)', sub: '70 meters • Priority access' },
          { icon: '🚉', text: 'Exit Lift 2 directly onto Platform 6 smooth concourse', sub: '95 meters • Zero steps' },
          { icon: '🎯', text: 'Board at Coach B4 designated wheelchair bay', sub: 'Step-free coach access' }
        ]
      }
    ]
  };

  function getRoutesForMode(mode) {
    let routes = [...DEFAULT_ROUTES.normal];
    if (mode === 'wheelchair' || mode === 'elderly') {
      // Re-order so accessible route is primary Route A, remove or heavily flag stairs
      const accRoute = { ...routes[2], id: 'route_accessible', title: 'Route A: Step-Free Accessible Route (Recommended)', badge: '♿ Recommended • Step-Free' };
      const lowCrowd = { ...routes[1], id: 'route_low_crowd', title: 'Route B: Low-Crowd Step-Free Corridor' };
      const fastRoute = { ...routes[0], id: 'route_fastest', title: 'Route C: Standard Corridor (Contains Stairs)', badge: '⚠️ Contains Stairs', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      return [accRoute, lowCrowd, fastRoute];
    } else if (mode === 'family') {
      const lowCrowd = { ...routes[1], id: 'route_low_crowd', title: 'Route A: Family Friendly & Low Crowd (Recommended)', badge: '👨‍👩‍👧 Recommended' };
      const accRoute = { ...routes[2], id: 'route_accessible', title: 'Route B: Stroller Step-Free Ramp Route' };
      const fastRoute = { ...routes[0], id: 'route_fastest', title: 'Route C: Fastest Route' };
      return [lowCrowd, accRoute, fastRoute];
    }
    return routes;
  }

  function renderRouteCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    currentRoutes = getRoutesForMode(accessibilityMode);

    container.innerHTML = currentRoutes.map(route => {
      const isSelected = route.id === activeRouteId;
      const crowdBadgeClass = route.crowdPercent < 45 ? 'text-emerald-400' : (route.crowdPercent < 70 ? 'text-amber-400' : 'text-rose-400');

      return `
        <div class="glass-panel rounded-xl p-4 transition-all duration-300 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/40 shadow-xl' : 'hover:border-slate-600'}">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold px-2 py-0.5 rounded border ${route.badgeColor}">${route.badge}</span>
                ${route.stepFree ? '<span class="text-xs text-teal-400 flex items-center gap-1 font-medium">♿ Step-Free</span>' : ''}
              </div>
              <h4 class="text-base font-bold text-white mt-1.5">${route.title}</h4>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black text-blue-400 font-mono">${route.timeMins}</span>
              <span class="text-xs text-slate-400 block font-medium">mins</span>
            </div>
          </div>

          <!-- Route Path Chips -->
          <div class="mt-3 py-2 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-1 overflow-x-auto">
            <span>${route.summary.split(' → ').join(' <span class="text-blue-400 font-bold">→</span> ')}</span>
          </div>

          <p class="text-xs text-slate-400 mt-2.5 leading-relaxed">${route.details}</p>

          <!-- Metrics Row -->
          <div class="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
            <div class="bg-slate-900/40 p-2 rounded text-center">
              <span class="text-slate-400 text-[10px] block">Distance</span>
              <span class="font-bold text-slate-200 font-mono">${route.distanceM} m</span>
            </div>
            <div class="bg-slate-900/40 p-2 rounded text-center">
              <span class="text-slate-400 text-[10px] block">Crowd Exposure</span>
              <span class="font-bold ${crowdBadgeClass} font-mono">${route.crowdPercent}%</span>
            </div>
            <div class="bg-slate-900/40 p-2 rounded text-center">
              <span class="text-slate-400 text-[10px] block">Vertical Transit</span>
              <span class="font-bold text-slate-200">${route.stepFree ? 'Lift / Ramp' : 'Stairs'}</span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="mt-4">
            <button 
              class="w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 cursor-default' 
                  : 'bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200'
              }"
              onclick="RouteEngine.selectRoute('${route.id}')"
            >
              ${isSelected ? '<span>✓ Active Selected Route</span>' : '<span>Use this route →</span>'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    renderTurnByTurnSteps();
  }

  function renderTurnByTurnSteps() {
    const container = document.getElementById('turn-by-turn-container');
    if (!container) return;

    const current = currentRoutes.find(r => r.id === activeRouteId) || currentRoutes[0];
    if (!current) return;

    container.innerHTML = `
      <div class="glass-panel rounded-xl p-5 border border-slate-800">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="text-xs text-blue-400 font-semibold tracking-wider uppercase">Live Turn-by-Turn Waypoints</span>
            <h4 class="text-base font-bold text-white mt-0.5">${current.title}</h4>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ${current.timeMins} mins • ${current.distanceM} m
          </span>
        </div>

        <div class="mt-4 space-y-3.5">
          ${current.steps.map((st, idx) => `
            <div class="flex items-start gap-3 relative">
              ${idx < current.steps.length - 1 ? '<div class="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-800"></div>' : ''}
              <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm z-10 shrink-0">
                ${st.icon}
              </div>
              <div class="pt-0.5">
                <p class="text-xs font-semibold text-slate-100">${st.text}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">${st.sub}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function selectRoute(routeId, showToastAlert = true) {
    activeRouteId = routeId;
    const selected = currentRoutes.find(r => r.id === routeId);
    if (!selected) return;

    // 1. Highlight on Station Map
    StationMap.highlightRoute(
      selected.nodes, 
      selected.stepFree,
      selected.title,
      `${selected.timeMins} mins`,
      `Estimated distance: ${selected.distanceM}m • Crowd: ${selected.crowdPercent}%`
    );

    // 2. Update Dashboard metrics
    if (window.App) {
      window.App.updateActiveRouteMetrics({
        timeMins: selected.timeMins,
        distanceM: selected.distanceM,
        crowdPercent: selected.crowdPercent,
        title: selected.title,
        routeId: selected.id
      });
    }

    // 3. Re-render cards and steps
    renderRouteCards('route-cards-container');

    // 4. Success Toast
    if (showToastAlert && window.App) {
      window.App.showToast(`Selected ${selected.title}`, 'success', `Walking time: ${selected.timeMins} mins (${selected.distanceM}m). Station map updated.`);
    }
  }

  function setAccessibilityMode(mode) {
    accessibilityMode = mode;
    currentRoutes = getRoutesForMode(mode);
    
    // Auto-select the top recommended route for this mode
    const bestRoute = currentRoutes[0];
    activeRouteId = bestRoute.id;
    
    renderRouteCards('route-cards-container');
    selectRoute(bestRoute.id, false);

    if (mode === 'wheelchair' || mode === 'elderly') {
      window.App?.showToast('Step-Free Accessibility Activated', 'info', 'Step-free route selected. Lift 2 and Ramp are operational in the simulated station. Estimated walking time: 9 minutes.');
    } else if (mode === 'family') {
      window.App?.showToast('Family Mode Activated', 'info', 'Optimized for stroller mobility and minimal crowd bottlenecks.');
    } else {
      window.App?.showToast('Standard Navigation Mode', 'info', 'Fastest corridors restored.');
    }
  }

  return {
    renderRouteCards,
    selectRoute,
    setAccessibilityMode,
    getActiveRoute: () => currentRoutes.find(r => r.id === activeRouteId) || currentRoutes[0]
  };
})();
