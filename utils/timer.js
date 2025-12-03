// Timer utility for tracking time spent on platforms
const Timer = {
  activeTimers: new Map(),
  
  // Start tracking time for a tab
  startTimer(tabId, platform) {
    if (!this.activeTimers.has(tabId)) {
      this.activeTimers.set(tabId, {
        platform,
        startTime: Date.now(),
        lastUpdate: Date.now()
      });
    }
  },
  
  // Stop tracking time for a tab
  stopTimer(tabId) {
    if (this.activeTimers.has(tabId)) {
      const timer = this.activeTimers.get(tabId);
      const elapsed = (Date.now() - timer.startTime) / 1000 / 60; // Convert to minutes
      this.activeTimers.delete(tabId);
      return elapsed;
    }
    return 0;
  },
  
  // Get elapsed time for a tab
  getElapsed(tabId) {
    if (this.activeTimers.has(tabId)) {
      const timer = this.activeTimers.get(tabId);
      return (Date.now() - timer.startTime) / 1000 / 60; // Convert to minutes
    }
    return 0;
  },
  
  // Update timer (called periodically)
  updateTimer(tabId) {
    if (this.activeTimers.has(tabId)) {
      const timer = this.activeTimers.get(tabId);
      const now = Date.now();
      const elapsed = (now - timer.lastUpdate) / 1000 / 60; // Minutes since last update
      timer.lastUpdate = now;
      return elapsed;
    }
    return 0;
  },
  
  // Check if timer is active for tab
  isActive(tabId) {
    return this.activeTimers.has(tabId);
  },
  
  // Get all active timers
  getActiveTimers() {
    return Array.from(this.activeTimers.entries()).map(([tabId, timer]) => ({
      tabId,
      platform: timer.platform,
      elapsed: (Date.now() - timer.startTime) / 1000 / 60
    }));
  },
  
  // Clear all timers
  clearAll() {
    this.activeTimers.clear();
  }
};
