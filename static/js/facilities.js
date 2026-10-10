// RailSathi AI - Facilities & Interactive Facility-to-Map Navigation Engine
const FacilitiesEngine = (() => {
  let activeFacilityId = null;

  const FACILITIES = [
    {
      id: 'fac_washroom',
      nodeId: 'washroom_p6',
      name: 'Washroom',
      icon: '🚻',
      location: 'Platform 6',
      walkingTime: '2 mins',
      distanceM: 140,
      status: 'Open',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Wheelchair accessible, infant nursing desk, touchless hygiene faucets.',
      actionLabel: 'Route to Washroom'
    },
    {
      id: 'fac_water',
      nodeId: 'water_concourse',
      name: 'Drinking Water',
      icon: '💧',
      location: 'Concourse',
      walkingTime: '1 min',
      distanceM: 70,
      status: 'Available',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'RO purified cold & ambient water kiosk, sensor-operated bottle refill.',
      actionLabel: 'Route to Water Point'
    },
    {
      id: 'fac_lift',
      nodeId: 'lift_1',
      name: 'Lift',
      icon: '🛗',
      location: 'FOB 1',
      walkingTime: '3 mins',
      distanceM: 210,
      status: 'Available',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'North FOB glass elevator. Priority for senior citizens & passengers with luggage.',
      actionLabel: 'Route to Lift 1'
    },
    {
      id: 'fac_helpdesk',
      nodeId: 'helpdesk_main',
      name: 'Help Desk',
      icon: 'ℹ️',
      location: 'Main Hall',
      walkingTime: '3 mins',
      distanceM: 190,
      status: 'Available 24/7',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Sahayata Counter: Porter assistance, wheelchair issue, station inquiry.',
      actionLabel: 'Route to Help Desk'
    },
    {
      id: 'fac_holding',
      nodeId: 'holding_gate_b',
      name: 'Holding Area',
      icon: '🛋️',
      location: 'Gate B',
      walkingTime: '4 mins',
      distanceM: 290,
      status: 'Moderate',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Air-conditioned waiting lounge with mobile charging stations & live displays.',
      actionLabel: 'Route to Holding Lounge'
    },
    {
      id: 'fac_food',
      nodeId: 'food_concourse',
      name: 'Food',
      icon: '🍲',
      location: 'Concourse',
      walkingTime: '2 mins',
      distanceM: 110,
      status: 'Open',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'IRCTC Food Plaza: packaged snacks, coffee, meals and refreshments.',
      actionLabel: 'Route to Food Plaza'
    }
  ];

  function renderFacilityCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = FACILITIES.map(fac => {
      const isSelected = fac.id === activeFacilityId;

      return `
        <div class="glass-panel rounded-xl p-4 transition-all duration-300 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/40 shadow-xl' : 'hover:border-slate-600'}">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
              ${fac.icon}
            </div>
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border ${fac.statusColor}">
              ${fac.status}
            </span>
          </div>

          <div class="mt-3">
            <h4 class="text-base font-bold text-white">${fac.name}</h4>
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span class="flex items-center gap-1 font-medium text-slate-300">📍 ${fac.location}</span>
              <span>•</span>
              <span class="font-mono text-blue-400 font-semibold">⏱️ ${fac.walkingTime}</span>
            </div>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">${fac.description}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80">
            <button 
              class="w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200'
              }"
              onclick="FacilitiesEngine.navigateToFacility('${fac.id}')"
            >
              <span>${isSelected ? '✓ Showing Route on Map' : `${fac.actionLabel} →`}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function navigateToFacility(facId) {
    const fac = FACILITIES.find(f => f.id === facId);
    if (!fac) return;

    activeFacilityId = facId;

    // Trigger map highlight
    StationMap.highlightFacility(fac.nodeId, 'entrance_a', fac.name, fac.walkingTime, fac.location);

    // Switch view to Navigation / Map section if not already visible
    if (window.App) {
      window.App.switchTab('navigation');
      window.App.showToast(
        `Facility Route: ${fac.name}`,
        'info',
        `Navigating to ${fac.location} (${fac.walkingTime}, ${fac.distanceM}m). Path highlighted on station map.`
      );
      // Show return banner
      const banner = document.getElementById('facility-active-return-banner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.innerHTML = `
          <div class="glass-panel p-3 rounded-xl border border-indigo-500/40 bg-indigo-950/60 flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-lg">${fac.icon}</span>
              <div>
                <span class="font-bold text-white">Viewing waypoint: ${fac.name} (${fac.location})</span>
                <span class="text-slate-300 block text-[11px]">${fac.walkingTime} estimated walking time • ${fac.distanceM}m</span>
              </div>
            </div>
            <button 
              class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
              onclick="FacilitiesEngine.clearFacilityRoute()"
            >
              Return to Coach Route
            </button>
          </div>
        `;
      }
    }

    renderFacilityCards('facility-cards-container');
  }

  function clearFacilityRoute() {
    activeFacilityId = null;
    const banner = document.getElementById('facility-active-return-banner');
    if (banner) banner.classList.add('hidden');

    // Restore active train route
    const activeRoute = RouteEngine.getActiveRoute();
    if (activeRoute) {
      StationMap.highlightRoute(activeRoute.nodes, activeRoute.stepFree, activeRoute.title, `${activeRoute.timeMins} mins`);
      window.App?.showToast('Restored Coach Journey Route', 'success', 'Showing route to Coach B4 on Platform 6.');
    }
    renderFacilityCards('facility-cards-container');
  }

  return {
    renderFacilityCards,
    navigateToFacility,
    clearFacilityRoute
  };
})();
