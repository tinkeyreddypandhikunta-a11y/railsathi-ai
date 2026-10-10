// RailSathi AI - Station Operations Dashboard (Station Staff Command Center)
const OperationsEngine = (() => {
  const OPS_DATA = {
    totalCrowd: 68,
    platformCrowds: [
      { name: 'Platform 1', val: 32, status: 'Normal', trains: 'Local Suburban' },
      { name: 'Platform 2', val: 51, status: 'Moderate', trains: 'Local Fast' },
      { name: 'Platform 3', val: 45, status: 'Normal', trains: 'Harbour Line' },
      { name: 'Platform 4', val: 37, status: 'Normal', trains: 'Punjab Mail (19:35)' },
      { name: 'Platform 5', val: 61, status: 'Elevated', trains: '12009 Shatabdi Express' },
      { name: 'Platform 6', val: 78, status: 'Congested', trains: '12951 Rajdhani Express (Boarding)' },
      { name: 'Platform 7', val: 48, status: 'Normal', trains: '22221 Rajdhani Special' },
    ],
    bottlenecks: [
      {
        location: 'Platform 6 Boarding Sector',
        current: '78%',
        predicted: '88%',
        horizon: '15 minutes',
        recommendation: 'Redirect passengers toward Entrance B and FOB 1.',
        severity: 'Critical'
      },
      {
        location: 'Concourse to FOB 2 Stairs',
        current: '68%',
        predicted: '75%',
        horizon: '20 minutes',
        recommendation: 'Deploy station marshal to regulate two-way stairway bottleneck.',
        severity: 'Warning'
      }
    ],
    facilitiesHealth: [
      { name: 'Lift 1 (North FOB)', status: 'Operational', uptime: '99.8%', type: 'Elevator', tag: 'OK' },
      { name: 'Lift 2 (Central Concourse)', status: 'Operational', uptime: '100%', type: 'Elevator', tag: 'Braille Active' },
      { name: 'Central Escalator', status: 'Operational', uptime: '98.5%', type: 'Escalator', tag: 'Upward Sync' },
      { name: 'Entrance B Ramp', status: 'Clear & Inspected', uptime: '100%', type: 'Tactile Ramp', tag: 'Step-Free' },
      { name: 'Concourse RO Water Kiosks', status: '4/4 Operational', uptime: '100%', type: 'Drinking Water', tag: 'Normal Flow' },
      { name: 'Platform 6 Washrooms', status: 'Inspected 12m ago', uptime: 'Clean', type: 'Sanitation', tag: 'Clean' }
    ],
    trainMovementBoard: [
      {"number": "12951", "name": "Rajdhani Express", "platform": "6", "time": "22:25", "status": "Boarding", "action": "Coach Position B4 Active"},
      {"number": "12009", "name": "Shatabdi Express", "platform": "5", "time": "06:20", "status": "Arrived", "action": "Passenger Egress via FOB 1"},
      {"number": "22221", "name": "Rajdhani Spl", "platform": "7", "time": "16:00", "status": "Scheduled", "action": "Rake Positioned"},
      {"number": "12137", "name": "Punjab Mail", "platform": "4", "time": "19:35", "status": "On Time", "action": "Platform Ready"}
    ]
  };

  function renderOperationsDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Staff Operations Header Banner -->
        <div class="glass-panel rounded-xl p-5 border border-indigo-500/40 bg-indigo-950/30">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 class="text-lg font-bold text-white">CSMT Central Station Operations Center</h3>
                <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">Staff Console</span>
              </div>
              <p class="text-xs text-slate-300 mt-1">
                Real-time station monitoring, platform crowd heatmaps, vertical mobility health and passenger dispatch advisory.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-2"
                onclick="OperationsEngine.triggerRerouteAdvisory()"
              >
                <span>📢</span>
                <span>Broadcast Rerouting Advisory</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Top Overview Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-4 rounded-xl border border-slate-800">
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Station Aggregate Density</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-3xl font-extrabold text-blue-400 font-mono">${OPS_DATA.totalCrowd}%</span>
              <span class="text-xs text-emerald-400 font-semibold">Within Capacity</span>
            </div>
            <span class="text-[11px] text-slate-500 mt-1 block">18,420 estimated passengers</span>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/15">
            <span class="text-xs text-rose-300 font-semibold uppercase tracking-wider block">Peak Bottleneck</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-3xl font-extrabold text-rose-400 font-mono">Platform 6</span>
              <span class="text-xs text-rose-300 font-mono font-bold">78%</span>
            </div>
            <span class="text-[11px] text-rose-300/80 mt-1 block">Forecast: 88% surge in 15 mins</span>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-slate-800">
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Vertical Mobility Status</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
              <span class="text-xs text-slate-300">All 3 Lifts/Ramps Active</span>
            </div>
            <span class="text-[11px] text-slate-500 mt-1 block">Zero mobility outages recorded</span>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-slate-800">
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Departing Trains (Next 1h)</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-3xl font-extrabold text-indigo-400 font-mono">4 Trains</span>
              <span class="text-xs text-slate-300 font-semibold">12951 Priority</span>
            </div>
            <span class="text-[11px] text-slate-500 mt-1 block">All platforms assigned</span>
          </div>
        </div>

        <!-- Platform Crowd Heat Levels (Bar Visualizer) -->
        <div class="glass-panel rounded-xl p-5 border border-slate-800">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h4 class="text-base font-bold text-white">Platform Density Distribution</h4>
              <p class="text-xs text-slate-400 mt-0.5">Live passenger occupancy metrics across express and suburban platforms.</p>
            </div>
            <span class="text-xs font-mono text-slate-400">Updated: Live</span>
          </div>

          <div class="mt-4 space-y-3.5">
            ${OPS_DATA.platformCrowds.map(p => {
              let barColor = 'bg-emerald-500';
              let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
              if (p.val > 70) {
                barColor = 'bg-rose-500';
                badgeColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
              } else if (p.val > 50) {
                barColor = 'bg-amber-500';
                badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
              }

              return `
                <div>
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white">${p.name}</span>
                      <span class="text-slate-400 text-[11px]">(${p.trains})</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}">${p.status}</span>
                      <span class="font-mono font-bold text-slate-200">${p.val}%</span>
                    </div>
                  </div>
                  <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${p.val}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Predicted Congestion & Staff Recommendations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Bottleneck Advisory -->
          <div class="glass-panel rounded-xl p-5 border border-rose-500/30 bg-rose-950/15">
            <div class="flex items-center gap-2">
              <span class="text-lg">⚠️</span>
              <h4 class="text-base font-bold text-white">Predicted Congestion Bottlenecks</h4>
            </div>
            <div class="mt-4 space-y-3">
              ${OPS_DATA.bottlenecks.map(b => `
                <div class="bg-slate-900/80 rounded-xl p-3.5 border border-rose-500/20">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold text-rose-300">${b.location}</h5>
                    <span class="text-xs font-mono font-bold text-rose-400">${b.current} → ${b.predicted} (${b.horizon})</span>
                  </div>
                  <div class="mt-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                    <span class="text-amber-400">👉</span>
                    <div>
                      <strong class="text-amber-300">Staff Recommendation:</strong>
                      <span>"${b.recommendation}"</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Vertical Mobility & Station Facilities -->
          <div class="glass-panel rounded-xl p-5 border border-slate-800">
            <h4 class="text-base font-bold text-white">Vertical Mobility & Facility Audit</h4>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${OPS_DATA.facilitiesHealth.map(f => `
                <div class="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-200">${f.name}</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div class="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>${f.status}</span>
                    <span class="text-emerald-400 font-semibold">${f.tag}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Train Status & Boarding Control Board -->
        <div class="glass-panel rounded-xl p-5 border border-slate-800">
          <h4 class="text-base font-bold text-white">Live Operations Train Boarding Schedule</h4>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <tr>
                  <th class="py-2.5 px-3">Train Number & Name</th>
                  <th class="py-2.5 px-3">Platform</th>
                  <th class="py-2.5 px-3">Departure</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Operations Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-200">
                ${OPS_DATA.trainMovementBoard.map(t => `
                  <tr class="hover:bg-slate-800/30 transition">
                    <td class="py-3 px-3 font-semibold text-white">${t.number} - ${t.name}</td>
                    <td class="py-3 px-3 font-mono font-bold text-blue-400">Platform ${t.platform}</td>
                    <td class="py-3 px-3 font-mono">${t.time}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Boarding' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                        ${t.status}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-slate-300 text-[11px]">${t.action}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function triggerRerouteAdvisory() {
    window.App?.showToast(
      'Passenger Advisory Dispatched', 
      'critical', 
      'Broadcasted: "Redirect passengers toward Entrance B and FOB 1 to mitigate Platform 6 congestion."'
    );
  }

  return {
    renderOperationsDashboard,
    triggerRerouteAdvisory
  };
})();
