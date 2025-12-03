// Background service worker for YScroll
const TRACKING_INTERVAL = 10000; // 10 seconds
const activeTabs = new Map();

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('YScroll installed');
  
  // Check if this is a fresh install
  chrome.storage.local.get(['setupComplete'], (data) => {
    if (!data.setupComplete && details.reason === 'install') {
      // Open setup page on first install
      chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
    } else if (!data.setupComplete) {
      // Set default values if setup hasn't been completed
      chrome.storage.local.set({
        dailyLimit: 30,
        sessionLimit: 5,
        isActive: true,
        platforms: {
          youtube: true,
          tiktok: true,
          linkedin: true,
          instagram: true
        },
        usage: {
          today: 0,
          lastReset: new Date().toDateString(),
          sessions: []
        }
      });
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRACK_TIME') {
    handleTimeTracking(sender.tab.id, message.platform, message.url);
  } else if (message.type === 'CONTENT_BLOCKED') {
    console.log(`Content blocked on ${message.platform}`);
  }
});

// Handle time tracking
async function handleTimeTracking(tabId, platform, url) {
  // Get current settings
  const data = await chrome.storage.local.get(['isActive', 'platforms', 'usage']);
  
  if (!data.isActive) return;
  if (!data.platforms || !data.platforms[platform]) return;
  
  // Track active tab
  if (!activeTabs.has(tabId)) {
    activeTabs.set(tabId, {
      platform,
      startTime: Date.now(),
      lastUpdate: Date.now()
    });
  }
  
  const tabData = activeTabs.get(tabId);
  const now = Date.now();
  const elapsed = (now - tabData.lastUpdate) / 1000 / 60; // minutes
  
  // Update usage
  let usage = data.usage || {
    today: 0,
    lastReset: new Date().toDateString(),
    sessions: []
  };
  
  // Reset if new day
  const today = new Date().toDateString();
  if (usage.lastReset !== today) {
    usage = {
      today: 0,
      lastReset: today,
      sessions: []
    };
  }
  
  // Add elapsed time
  usage.today += elapsed;
  
  // Save updated usage
  await chrome.storage.local.set({ usage });
  
  // Update last update time
  tabData.lastUpdate = now;
  activeTabs.set(tabId, tabData);
}

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs.has(tabId)) {
    activeTabs.delete(tabId);
  }
});

// Clean up when tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Check if still on a tracked platform
    const isTrackedUrl = 
      changeInfo.url.includes('youtubeshorts.com/shorts') ||
      changeInfo.url.includes('tiktok.com') ||
      changeInfo.url.includes('linkedin.com/feed') ||
      changeInfo.url.includes('instagram.com');
    
    if (!isTrackedUrl && activeTabs.has(tabId)) {
      activeTabs.delete(tabId);
    }
  }
});

// Reset usage at midnight
chrome.alarms.create('resetDaily', {
  when: getNextMidnight(),
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetDaily') {
    chrome.storage.local.set({
      usage: {
        today: 0,
        lastReset: new Date().toDateString(),
        sessions: []
      }
    });
    console.log('Daily usage reset');
  }
});

// Helper function to get next midnight
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  return midnight.getTime();
}

// Update badge with usage
async function updateBadge() {
  const data = await chrome.storage.local.get(['usage', 'dailyLimit', 'isActive']);
  
  if (!data.isActive) {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    return;
  }
  
  const usage = data.usage || { today: 0 };
  const limit = data.dailyLimit || 30;
  const used = Math.floor(usage.today);
  
  if (used >= limit) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  } else if (used >= limit * 0.8) {
    chrome.action.setBadgeText({ text: String(used) });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else {
    chrome.action.setBadgeText({ text: String(used) });
    chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
  }
}

// Update badge every 10 seconds
setInterval(updateBadge, 10000);
updateBadge(); // Initial update
