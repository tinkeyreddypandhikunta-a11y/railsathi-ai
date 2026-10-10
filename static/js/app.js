// RailSathi AI - Main Application Coordinator & State Store
const App = (() => {
  // Shared Application State
  const state = {
    station: {
      id: 'CSMT_DEMO',
      name: 'Chhatrapati Shivaji Maharaj Terminus — Demo',
      code: 'CSMT',
      city: 'Mumbai'
    },
    train: {
      number: '12951',
      name: 'Rajdhani Express',
      route: 'Mumbai Central / CSMT Demo → New Delhi (NDLS)',
      platform: 6,
      coach: 'B4',
      seat: 42,
      boardingTime: '10:10 PM',
      departureTime: '10:25 PM',
      status: 'On time',
      coaches: ['ENGINE', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1']
    },
    journey: {
      startNode: 'entrance_a',
      destinationNode: 'coach_b4',
      accessibilityMode: 'normal',
      activeRoute: {
        timeMins: 5,
        distanceM: 320,
        crowdPercent: 62,
        title: 'Route A: Fastest Route'
      }
    },
    currentTab: 'dashboard',
    userRole: 'passenger' // 'passenger' or 'staff'
  };

  function init() {
    setupNavigation();
    setupJourneyPlannerForm();
    setupCoachVisualizer();
    setupStationSelector();
    setupRoleSwitcher();
    setupQuickActions();

    // Initialize Station Map
    StationMap.init('map-container', (node) => {
      showToast(`Selected Waypoint: ${node.name}`, 'info', `${node.label} • Crowd density: ${node.crowd}%`);
    });

    // Initialize sub-engines
    RouteEngine.renderRouteCards('route-cards-container');
    FacilitiesEngine.renderFacilityCards('facility-cards-container');
    CrowdEngine.renderCrowdDashboard('crowd-dashboard-container');
    AlertEngine.renderAlerts('alerts-container');
    OperationsEngine.renderOperationsDashboard('operations-dashboard-container');

    // Sync initial dashboard
    updateDashboardSummary();
  }

  function setupNavigation() {
    // Desktop Nav Items
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Mobile Bottom Nav Items
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });
  }

  function switchTab(tabName) {
    state.currentTab = tabName;

    // Update buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('text-white', match);
      btn.classList.toggle('bg-blue-600/30', match);
      btn.classList.toggle('border-blue-500/50', match);
      btn.classList.toggle('text-slate-400', !match);
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('text-blue-400', match);
      btn.classList.toggle('text-slate-400', !match);
    });

    // Show/hide view sections
    document.querySelectorAll('.tab-view-section').forEach(sec => {
      const isTarget = sec.id === `tab-${tabName}`;
      sec.classList.toggle('hidden', !isTarget);
    });

    // Smooth scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupJourneyPlannerForm() {
    const planBtn = document.getElementById('btn-plan-route');
    if (planBtn) {
      planBtn.addEventListener('click', () => {
        const startSelect = document.getElementById('select-start-point');
        if (startSelect) state.journey.startNode = startSelect.value;

        // Switch to Navigation tab & highlight route
        switchTab('navigation');
        const activeR = RouteEngine.getActiveRoute();
        if (activeR) {
          StationMap.highlightRoute(activeR.nodes, activeR.stepFree, activeR.title, `${activeR.timeMins} mins`);
        }
        showToast('Journey Route Generated', 'success', `Navigating from ${state.journey.startNode === 'entrance_a' ? 'Entrance A' : 'Entrance B'} to Coach ${state.train.coach} (Platform ${state.train.platform}).`);
      });
    }

    // Accessibility selector in planner
    const accSelect = document.getElementById('select-accessibility');
    if (accSelect) {
      accSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        state.journey.accessibilityMode = mode;
        RouteEngine.setAccessibilityMode(mode);
      });
    }

    // Start point selector
    const startSelect = document.getElementById('select-start-point');
    if (startSelect) {
      startSelect.addEventListener('change', (e) => {
        state.journey.startNode = e.target.value;
        const activeR = RouteEngine.getActiveRoute();
        if (activeR) {
          StationMap.highlightRoute(activeR.nodes, activeR.stepFree);
        }
      });
    }
  }

  function setupCoachVisualizer() {
    const container = document.getElementById('coach-sequence-container');
    if (!container) return;

    renderCoachSequence();

    // Train Selector Dropdown
    const trainSelect = document.getElementById('select-train-number');
    if (trainSelect) {
      trainSelect.addEventListener('change', (e) => {
        const num = e.target.value;
        if (num === '12951') {
          state.train.number = '12951';
          state.train.name = 'Rajdhani Express';
          state.train.platform = 6;
          state.train.coaches = ['ENGINE', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1'];
          state.train.coach = 'B4';
          state.train.boardingTime = '10:10 PM';
          state.train.departureTime = '10:25 PM';
        } else if (num === '12009') {
          state.train.number = '12009';
          state.train.name = 'Shatabdi Express';
          state.train.platform = 5;
          state.train.coaches = ['ENGINE', 'E1', 'C1', 'C2', 'C3', 'C4', 'C5'];
          state.train.coach = 'C2';
          state.train.boardingTime = '06:05 AM';
          state.train.departureTime = '06:20 AM';
        } else if (num === '22221') {
          state.train.number = '22221';
          state.train.name = 'Rajdhani Special';
          state.train.platform = 7;
          state.train.coaches = ['ENGINE', 'H1', 'A1', 'B1', 'B2', 'B3', 'B4'];
          state.train.coach = 'B2';
          state.train.boardingTime = '03:45 PM';
          state.train.departureTime = '04:00 PM';
        }

        renderCoachSequence();
        updateDashboardSummary();
        showToast(`Train Changed: ${state.train.number} ${state.train.name}`, 'info', `Platform ${state.train.platform} assigned. Coach positioning updated.`);
      });
    }
  }

  function renderCoachSequence() {
    const container = document.getElementById('coach-sequence-container');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center gap-2 overflow-x-auto py-3 px-2">
        ${state.train.coaches.map(c => {
          const isEngine = c === 'ENGINE';
          const isSelected = c === state.train.coach;

          return `
            <div 
              class="coach-box cursor-pointer shrink-0 rounded-lg border px-3 py-2 text-center text-xs font-mono font-bold ${
                isEngine 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                  : (isSelected ? 'active text-white' : 'bg-slate-900/60 border-slate-700 text-slate-300')
              }"
              onclick="App.selectCoach('${c}')"
            >
              <span class="block text-base">${isEngine ? '🚂' : '🚃'}</span>
              <span class="block mt-1">${c}</span>
              ${isSelected ? '<span class="text-[9px] text-blue-200 block font-sans">Your Coach</span>' : ''}
            </div>
            ${c !== state.train.coaches[state.train.coaches.length - 1] ? '<span class="text-slate-600 font-bold shrink-0">──</span>' : ''}
          `;
        }).join('')}
      </div>
    `;

    // Update coach indicator badge text
    const badgeEl = document.getElementById('selected-coach-indicator');
    if (badgeEl) badgeEl.textContent = `Coach ${state.train.coach} (Seat ${state.train.seat})`;
  }

  function selectCoach(coachCode) {
    if (coachCode === 'ENGINE') return;
    state.train.coach = coachCode;
    renderCoachSequence();
    updateDashboardSummary();
    showToast(`Selected Coach ${coachCode}`, 'success', `Walking distance on Platform ${state.train.platform} recalibrated for Coach ${coachCode}.`);
  }

  function setupStationSelector() {
    const select = document.getElementById('header-station-select');
    if (!select) return;

    select.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'CSMT_DEMO') {
        state.station.name = 'Chhatrapati Shivaji Maharaj Terminus — Demo';
        showToast('Station Selected', 'success', 'Loaded CSMT 3D node layout and live passenger flows.');
      } else {
        showToast('Prototype Station', 'info', `${val} is available in prototype mode with simulated data.`);
      }
    });
  }

  function setupRoleSwitcher() {
    const roleToggle = document.getElementById('role-toggle-btn');
    if (!roleToggle) return;

    roleToggle.addEventListener('click', () => {
      state.userRole = state.userRole === 'passenger' ? 'staff' : 'passenger';
      const isStaff = state.userRole === 'staff';

      roleToggle.textContent = isStaff ? '👮 Station Staff' : '👤 Passenger Mode';
      roleToggle.classList.toggle('bg-purple-600/30', isStaff);
      roleToggle.classList.toggle('border-purple-500/50', isStaff);
      roleToggle.classList.toggle('text-purple-300', isStaff);

      if (isStaff) {
        switchTab('operations');
        showToast('Station Operations View Activated', 'info', 'Switched to Station Master Command Center.');
      } else {
        switchTab('dashboard');
        showToast('Passenger Journey Mode Activated', 'info', 'Switched to passenger navigation experience.');
      }
    });
  }

  function setupQuickActions() {
    const btnNormal = document.getElementById('hero-quick-normal');
    const btnAccess = document.getElementById('hero-quick-accessible');
    const btnCrowd = document.getElementById('hero-quick-crowd');

    if (btnNormal) {
      btnNormal.addEventListener('click', () => {
        const sel = document.getElementById('select-accessibility');
        if (sel) sel.value = 'normal';
        RouteEngine.setAccessibilityMode('normal');
        switchTab('navigation');
      });
    }

    if (btnAccess) {
      btnAccess.addEventListener('click', () => {
        const sel = document.getElementById('select-accessibility');
        if (sel) sel.value = 'wheelchair';
        RouteEngine.setAccessibilityMode('wheelchair');
        switchTab('navigation');
      });
    }

    if (btnCrowd) {
      btnCrowd.addEventListener('click', () => {
        switchTab('crowd');
      });
    }
  }

  function updateActiveRouteMetrics(metrics) {
    state.journey.activeRoute = metrics;
    updateDashboardSummary();
  }

  function updateDashboardSummary() {
    // Current crowd
    const dashCrowd = document.getElementById('dash-crowd-val');
    if (dashCrowd) dashCrowd.textContent = `${state.journey.activeRoute.crowdPercent || 78}%`;

    // Platform
    const dashPlat = document.getElementById('dash-platform-val');
    if (dashPlat) dashPlat.textContent = `${state.train.platform}`;

    // Est Time
    const dashTime = document.getElementById('dash-time-val');
    if (dashTime) dashTime.textContent = `${state.journey.activeRoute.timeMins || 7} mins`;

    // Train & Coach
    const dashTrain = document.getElementById('dash-train-val');
    if (dashTrain) dashTrain.textContent = `${state.train.number} ${state.train.name}`;

    const dashCoach = document.getElementById('dash-coach-val');
    if (dashCoach) dashCoach.textContent = `Coach ${state.train.coach} (Seat ${state.train.seat})`;

    // Route title
    const dashRoute = document.getElementById('dash-route-val');
    if (dashRoute) dashRoute.textContent = state.journey.activeRoute.title;
  }

  // Toast Notification System
  function showToast(title, type = 'info', message = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let borderClass = 'border-blue-500/40 bg-slate-900/95';
    let icon = 'ℹ️';

    if (type === 'success') {
      borderClass = 'border-emerald-500/50 bg-slate-900/95';
      icon = '✅';
    } else if (type === 'critical' || type === 'error') {
      borderClass = 'border-rose-500/60 bg-rose-950/95';
      icon = '🚨';
    } else if (type === 'warning') {
      borderClass = 'border-amber-500/50 bg-slate-900/95';
      icon = '⚠️';
    }

    const toast = document.createElement('div');
    toast.className = `toast glass-panel p-3.5 rounded-xl border ${borderClass} shadow-2xl text-xs flex items-start gap-2.5`;
    toast.innerHTML = `
      <span class="text-base shrink-0 mt-0.5">${icon}</span>
      <div class="flex-1 pr-1">
        <h5 class="font-bold text-white">${title}</h5>
        ${message ? `<p class="text-slate-300 text-[11px] mt-0.5 leading-snug">${message}</p>` : ''}
      </div>
      <button class="text-slate-400 hover:text-white shrink-0 font-bold ml-1" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  }

  return {
    init,
    switchTab,
    selectCoach,
    showToast,
    updateActiveRouteMetrics
  };
})();

// Bootstrap when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
