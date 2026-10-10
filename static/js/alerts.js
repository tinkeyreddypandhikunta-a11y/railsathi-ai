// RailSathi AI - Smart Alert Engine & Toast Notification Dispatcher
const AlertEngine = (() => {
  let alerts = [
    {
      id: 'alt-1',
      severity: 'critical',
      category: 'crowd',
      title: 'Platform 6 Congestion Alert',
      description: 'Platform 6 is currently crowded at 78% capacity. Congestion is predicted to surge to 88% in 15 minutes due to boarding.',
      location: 'Platform 6',
      time: 'Just now',
      action: 'Consider approaching via North Entrance B & FOB 1 to bypass the central concourse rush.',
      isRead: false
    },
    {
      id: 'alt-2',
      severity: 'warning',
      category: 'route',
      title: 'Alternative Low-Crowd Entrance Recommended',
      description: 'Entrance B offers a 34% lower crowd density compared to Main Hall Entrance A (75%).',
      location: 'Entrance B',
      time: '3 mins ago',
      action: 'Use Entrance B for a significantly calmer boarding walk with ramp access.',
      isRead: false
    },
    {
      id: 'alt-3',
      severity: 'success',
      category: 'train',
      title: 'Train 12951 On Time Confirmation',
      description: 'Train 12951 Rajdhani Express is confirmed arriving on Platform 6. Departure scheduled at 10:25 PM.',
      location: 'Platform 6',
      time: '8 mins ago',
      action: 'Proceed towards Coach Zone B4 ahead of boarding time (10:10 PM).',
      isRead: false
    },
    {
      id: 'alt-4',
      severity: 'info',
      category: 'facility',
      title: 'Step-Free Lift 2 Operational',
      description: 'Lift 2 at Concourse South is operational with voice announcement & braille keypad.',
      location: 'Lift 2',
      time: '14 mins ago',
      action: 'Recommended for wheelchair users, elderly passengers, and heavy luggage.',
      isRead: false
    },
    {
      id: 'alt-5',
      severity: 'warning',
      category: 'crowd',
      title: 'FOB 2 Stairs Bottleneck',
      description: 'FOB 2 stairways are experiencing heavy two-way pedestrian movement.',
      location: 'FOB 2',
      time: '20 mins ago',
      action: 'Use FOB 1 North Bridge or Central Escalator for smoother transit.',
      isRead: false
    }
  ];

  let currentFilter = 'all'; // all, critical, warning, info
  let isReplaying = false;

  function renderAlerts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = currentFilter === 'all' 
      ? alerts 
      : alerts.filter(a => a.severity === currentFilter);

    const unreadCount = alerts.filter(a => !a.isRead).length;

    // Update global badge in header
    const badgeEl = document.getElementById('header-alert-badge');
    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Controls Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <!-- Filters -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button 
              class="px-2.5 py-1 rounded-lg font-semibold transition ${currentFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
              onclick="AlertEngine.setFilter('all')"
            >
              All (${alerts.length})
            </button>
            <button 
              class="px-2.5 py-1 rounded-lg font-semibold transition ${currentFilter === 'critical' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
              onclick="AlertEngine.setFilter('critical')"
            >
              🔴 Critical
            </button>
            <button 
              class="px-2.5 py-1 rounded-lg font-semibold transition ${currentFilter === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
              onclick="AlertEngine.setFilter('warning')"
            >
              🟡 Warnings
            </button>
            <button 
              class="px-2.5 py-1 rounded-lg font-semibold transition ${currentFilter === 'info' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
              onclick="AlertEngine.setFilter('info')"
            >
              🔵 Info
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button 
              id="btn-replay-notifications"
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition flex items-center gap-1.5"
              onclick="AlertEngine.replayAsNotifications()"
              ${isReplaying ? 'disabled' : ''}
            >
              <span>🔔</span>
              <span>${isReplaying ? 'Replaying...' : 'Replay as notifications'}</span>
            </button>
            <button 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              onclick="AlertEngine.markAllRead()"
            >
              Mark all read
            </button>
          </div>
        </div>

        <!-- Alert Cards List -->
        <div class="space-y-3">
          ${filtered.length === 0 ? `
            <div class="text-center py-8 text-slate-400 text-xs">
              No alerts matching the selected filter.
            </div>
          ` : filtered.map(a => {
            let borderClass = 'border-slate-800';
            let badgeBg = 'bg-slate-800 text-slate-300';
            let icon = 'ℹ️';

            if (a.severity === 'critical') {
              borderClass = 'border-rose-500/40 bg-rose-950/20';
              badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
              icon = '🚨';
            } else if (a.severity === 'warning') {
              borderClass = 'border-amber-500/40 bg-amber-950/15';
              badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
              icon = '⚠️';
            } else if (a.severity === 'success') {
              borderClass = 'border-emerald-500/40 bg-emerald-950/15';
              badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
              icon = '✅';
            }

            return `
              <div class="glass-panel rounded-xl p-4 ${borderClass} transition relative ${a.isRead ? 'opacity-70' : ''}">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-2.5">
                    <span class="text-lg shrink-0 mt-0.5">${icon}</span>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold ${badgeBg} px-2 py-0.5 rounded uppercase">
                          ${a.severity}
                        </span>
                        <span class="text-xs text-slate-400">📍 ${a.location}</span>
                        <span class="text-xs text-slate-500">• ${a.time}</span>
                      </div>
                      <h4 class="text-sm font-bold text-white mt-1">${a.title}</h4>
                      <p class="text-xs text-slate-300 mt-1 leading-relaxed">${a.description}</p>
                      
                      <!-- Suggested action banner -->
                      <div class="mt-2.5 py-1.5 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-blue-300 flex items-center gap-1.5 font-medium">
                        <span>💡 Recommendation:</span>
                        <span>${a.action}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Dismiss / Mark Read Actions -->
                  <div class="flex flex-col items-end gap-1 shrink-0">
                    <button 
                      class="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-slate-800 transition"
                      title="Dismiss alert"
                      onclick="AlertEngine.dismissAlert('${a.id}')"
                    >
                      ✕
                    </button>
                    ${!a.isRead ? `
                      <button 
                        class="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                        onclick="AlertEngine.markRead('${a.id}')"
                      >
                        Mark read
                      </button>
                    ` : '<span class="text-[10px] text-slate-500">Read</span>'}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function setFilter(filt) {
    currentFilter = filt;
    renderAlerts('alerts-container');
  }

  function dismissAlert(id) {
    alerts = alerts.filter(a => a.id !== id);
    renderAlerts('alerts-container');
    window.App?.showToast('Alert Dismissed', 'info', 'Removed alert from your station notification queue.');
  }

  function markRead(id) {
    const a = alerts.find(item => item.id === id);
    if (a) a.isRead = true;
    renderAlerts('alerts-container');
  }

  function markAllRead() {
    alerts.forEach(a => a.isRead = true);
    renderAlerts('alerts-container');
    window.App?.showToast('All Alerts Marked as Read', 'success', 'All station advisory notifications marked read.');
  }

  // Replay as notifications behavior (as specified in Section 10)
  function replayAsNotifications() {
    if (isReplaying) return;
    isReplaying = true;
    renderAlerts('alerts-container');

    const activeList = alerts.slice(0, 4); // Replay top active alerts
    let idx = 0;

    function dispatchNext() {
      if (idx >= activeList.length) {
        isReplaying = false;
        renderAlerts('alerts-container');
        return;
      }

      const alert = activeList[idx];
      let toastType = 'info';
      if (alert.severity === 'critical') toastType = 'critical';
      else if (alert.severity === 'warning') toastType = 'warning';
      else if (alert.severity === 'success') toastType = 'success';

      window.App?.showToast(alert.title, toastType, alert.description);
      idx++;
      setTimeout(dispatchNext, 1200); // 1.2s cadence to avoid duplicate simultaneous spam
    }

    dispatchNext();
  }

  return {
    renderAlerts,
    setFilter,
    dismissAlert,
    markRead,
    markAllRead,
    replayAsNotifications,
    getUnreadCount: () => alerts.filter(a => !a.isRead).length
  };
})();
