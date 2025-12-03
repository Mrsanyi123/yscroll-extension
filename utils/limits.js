// Limits utility for checking and enforcing time limits
const Limits = {
  // Check if daily limit is reached
  async isDailyLimitReached() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['dailyLimit', 'usage'], (data) => {
        const dailyLimit = data.dailyLimit || 30;
        const usage = data.usage || { today: 0 };
        resolve(usage.today >= dailyLimit);
      });
    });
  },

  // Check if session limit is reached
  async isSessionLimitReached(sessionTime) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['sessionLimit'], (data) => {
        const sessionLimit = data.sessionLimit || 5;
        resolve(sessionTime >= sessionLimit);
      });
    });
  },

  // Get remaining time for daily limit
  async getRemainingDailyTime() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['dailyLimit', 'usage'], (data) => {
        const dailyLimit = data.dailyLimit || 30;
        const usage = data.usage || { today: 0 };
        const remaining = Math.max(0, dailyLimit - usage.today);
        resolve(remaining);
      });
    });
  },

  // Get remaining time for session limit
  async getRemainingSessionTime(sessionTime) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['sessionLimit'], (data) => {
        const sessionLimit = data.sessionLimit || 5;
        const remaining = Math.max(0, sessionLimit - sessionTime);
        resolve(remaining);
      });
    });
  },

  // Check if platform is enabled
  async isPlatformEnabled(platform) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['platforms'], (data) => {
        const platforms = data.platforms || {
          youtube: true,
          tiktok: true,
          linkedin: true,
          instagram: true
        };
        resolve(platforms[platform] || false);
      });
    });
  },

  // Check if extension is active
  async isExtensionActive() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['isActive'], (data) => {
        resolve(data.isActive !== false); // Default to true
      });
    });
  },

  // Check if blocking should occur
  async shouldBlock(platform, sessionTime = 0) {
    const isActive = await this.isExtensionActive();
    if (!isActive) return false;

    const isPlatformEnabled = await this.isPlatformEnabled(platform);
    if (!isPlatformEnabled) return false;

    const dailyLimitReached = await this.isDailyLimitReached();
    if (dailyLimitReached) return true;

    const sessionLimitReached = await this.isSessionLimitReached(sessionTime);
    if (sessionLimitReached) return true;

    return false;
  }
};
