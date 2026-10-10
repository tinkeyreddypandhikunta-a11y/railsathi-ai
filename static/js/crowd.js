// RailSathi AI - AI Crowd Prediction Dashboard & Explainable Forecasting
const CrowdEngine = (() => {
  const PREDICTION_DATA = {
    currentCrowd: 78,
    predicted15m: 88,
    status: 'High Crowd',
    meterLevel: 'High',
    stationTotal: 68,
    timeline: [
      { label: 't - 30m', time: '09:40 PM', val: 65, isProjected: false },
      { label: 't - 20m', time: '09:50 PM', val: 70, isProjected: false },
      { label: 't - 10m', time: '10:00 PM', val: 74, isProjected: false },
      { label: 'Now', time: '10:10 PM', val: 78, isProjected: false },
      { label: 't + 10m', time: '10:20 PM', val: 84, isProjected: true },
      { label: 't + 15m', time: '10:25 PM', val: 88, isProjected: true },
      { label: 't + 20m', time: '10:30 PM', val: 86, isProjected: true },
      { label: 't + 30m', time: '10:40 PM', val: 79, isProjected: true }
    ],
    heuristicFactors: [
      { factor: 'Evening Departure Peak', impact: '+35%', detail: 'Scheduled 10:25 PM departure of 12951 Rajdhani on Platform 6', icon: '🚆' },
      { factor: 'Historical Station Flow', impact: '+22%', detail: 'Historical weekend passenger movement model for CSMT', icon: '📊' },
      { factor: 'Inter-Platform Inflow', impact: '+15%', detail: 'Arrival transfer from Platform 5 (12009 Shatabdi Express)', icon: '🔄' },
      { factor: 'Festival / Weekend Surge', impact: '+6%', detail: 'Pre-holiday travel demand coefficient', icon: '🗓️' }
    ]
  };

  function renderCrowdDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Current Density Card -->
          <div class="glass-panel rounded-xl p-4 border border-slate-800">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Platform 6 Density</span>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-4xl font-extrabold text-rose-400 font-mono">${PREDICTION_DATA.currentCrowd}%</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ${PREDICTION_DATA.status}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">Live density index across Platform 6 concourse & boarding bays.</p>
          </div>

          <!-- 15-Minute AI Prediction Card -->
          <div class="glass-panel rounded-xl p-4 border border-rose-500/40 bg-rose-950/20 shadow-lg">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-rose-300 uppercase tracking-wider">AI Forecast in 15 Mins</span>
              <span class="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 font-mono text-[11px] font-bold">+10% Surge</span>
            </div>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-4xl font-extrabold text-rose-400 font-mono">${PREDICTION_DATA.predicted15m}%</span>
              <span class="text-xs text-slate-300">Predicted at 10:25 PM</span>
            </div>
            <p class="text-xs text-slate-300 mt-2 font-medium">⚠️ Critical Boarding Rush: Recommend entering via Entrance B.</p>
          </div>

          <!-- Crowd Meter Card -->
          <div class="glass-panel rounded-xl p-4 border border-slate-800">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Station-Wide Meter</span>
            
            <div class="mt-3">
              <div class="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>Low (&lt;40%)</span>
                <span>Med (65%)</span>
                <span class="text-rose-400">High (78%)</span>
                <span>Very High (&gt;85%)</span>
              </div>
              <div class="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
                <div class="h-full bg-emerald-500 rounded-l-full" style="width: 25%"></div>
                <div class="h-full bg-amber-500" style="width: 25%"></div>
                <div class="h-full bg-rose-500 ring-2 ring-white animate-pulse" style="width: 28%"></div>
                <div class="h-full bg-purple-600 rounded-r-full" style="width: 22%"></div>
              </div>
            </div>
            
            <p class="text-xs text-slate-400 mt-2.5">Overall CSMT Station Congestion: <strong class="text-white">${PREDICTION_DATA.stationTotal}%</strong></p>
          </div>
        </div>

        <!-- Visual Timeline Chart (Past 30m, Current, Next 30m) -->
        <div class="glass-panel rounded-xl p-5 border border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-bold text-white">Passenger Flow Predictive Horizon</h4>
                <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold">Simulated Model</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Chronological flow: Past 30 mins observation vs. Next 30 mins AI projection.</p>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-blue-500"></span> Recorded Flow</div>
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-rose-500"></span> Projected Rush</div>
            </div>
          </div>

          <!-- SVG Flow Chart -->
          <div class="mt-5 w-full overflow-x-auto">
            <div class="min-w-[620px]">
              <svg viewBox="0 0 680 180" class="w-full h-44">
                <!-- Grid horizontal lines -->
                <line x1="40" y1="30" x2="660" y2="30" stroke="#1E293B" stroke-dasharray="3 3"/>
                <line x1="40" y1="80" x2="660" y2="80" stroke="#1E293B" stroke-dasharray="3 3"/>
                <line x1="40" y1="130" x2="660" y2="130" stroke="#1E293B" stroke-dasharray="3 3"/>

                <text x="15" y="35" fill="#64748B" font-size="10" font-family="monospace">100%</text>
                <text x="15" y="85" fill="#64748B" font-size="10" font-family="monospace">60%</text>
                <text x="15" y="135" fill="#64748B" font-size="10" font-family="monospace">20%</text>

                <!-- Divider between past and projected -->
                <line x1="330" y1="20" x2="330" y2="140" stroke="#F43F5E" stroke-width="1.5" stroke-dasharray="4 2"/>
                <text x="335" y="25" fill="#F43F5E" font-size="10" font-weight="700">NOW (10:10 PM)</text>

                <!-- Area Fill / Bars for each point -->
                ${PREDICTION_DATA.timeline.map((pt, idx) => {
                  const x = 70 + idx * 75;
                  const barHeight = (pt.val / 100) * 110;
                  const y = 140 - barHeight;
                  const color = pt.isProjected ? '#F43F5E' : '#3B82F6';
                  const isPeak = pt.val === 88;

                  return `
                    <g class="cursor-pointer group">
                      <!-- Bar -->
                      <rect 
                        x="${x - 14}" y="${y}" width="28" height="${barHeight}" 
                        rx="5" fill="${color}" fill-opacity="${pt.isProjected ? '0.75' : '0.6'}"
                        class="transition hover:fill-opacity-100"
                      />
                      ${isPeak ? `
                        <circle cx="${x}" cy="${y - 8}" r="4" fill="#EF4444" class="animate-ping"/>
                        <circle cx="${x}" cy="${y - 8}" r="4" fill="#EF4444"/>
                      ` : ''}

                      <!-- Value above bar -->
                      <text 
                        x="${x}" y="${y - 6}" 
                        fill="${isPeak ? '#F87171' : '#E2E8F0'}" 
                        font-size="11" font-weight="700" text-anchor="middle" font-family="monospace"
                      >
                        ${pt.val}%
                      </text>

                      <!-- X axis Label -->
                      <text x="${x}" y="158" fill="#94A3B8" font-size="10" text-anchor="middle" font-weight="600">
                        ${pt.label}
                      </text>
                      <text x="${x}" y="172" fill="#64748B" font-size="9" text-anchor="middle">
                        ${pt.time}
                      </text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
          </div>
        </div>

        <!-- Heuristic AI Explanation Breakdown (Transparency) -->
        <div class="glass-panel rounded-xl p-5 border border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-lg">🧠</span>
            <h4 class="text-base font-bold text-white">Transparent AI Heuristic Attribution</h4>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            "The prediction uses simulated passenger flow, train schedules, time of day and historical station patterns."
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            ${PREDICTION_DATA.heuristicFactors.map(h => `
              <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div class="flex items-center justify-between">
                  <span class="text-base">${h.icon}</span>
                  <span class="font-mono text-xs font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">${h.impact}</span>
                </div>
                <h5 class="text-xs font-bold text-slate-100 mt-2">${h.factor}</h5>
                <p class="text-[11px] text-slate-400 mt-1 leading-normal">${h.detail}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderCrowdDashboard
  };
})();
