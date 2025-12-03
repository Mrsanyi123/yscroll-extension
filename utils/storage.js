// Storage utility for managing Chrome storage API
const Storage = {
  // Default settings
  defaults: {
    dailyLimit: 30, // minutes
    sessionLimit: 5, // minutes
    isActive: true,
    platforms: {
      youtube: true,
      tiktok: true,
      linkedin: true,
      instagram: true
    },

    usage: {
      today: 0, // minutes used today
      lastReset: new Date().toDateString(),
      sessions: []
    }
  },

  // Get all settings
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.defaults, (data) => {
        resolve(data);
      });
    });
  },

  // Save settings
  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set(settings, () => {
        resolve();
      });
    });
  },

  // Get specific value
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (data) => {
        resolve(data[key]);
      });
    });
  },

  // Set specific value
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  // Update usage
  async updateUsage(minutes) {
    const settings = await this.getSettings();
    const today = new Date().toDateString();
    
    // Reset if new day
    if (settings.usage.lastReset !== today) {
      settings.usage = {
        today: 0,
        lastReset: today,
        sessions: []
      };
    }
    
    settings.usage.today += minutes;
    await this.saveSettings(settings);
    return settings.usage;
  },

  // Get current usage
  async getUsage() {
    const settings = await this.getSettings();
    const today = new Date().toDateString();
    
    // Reset if new day
    if (settings.usage.lastReset !== today) {
      settings.usage = {
        today: 0,
        lastReset: today,
        sessions: []
      };
      await this.saveSettings(settings);
    }
    
    return settings.usage;
  },

  // Reset usage
  async resetUsage() {
    const settings = await this.getSettings();
    settings.usage = {
      today: 0,
      lastReset: new Date().toDateString(),
      sessions: []
    };
    await this.saveSettings(settings);
  }
};
