/**
 * Background Service Worker
 * Handles time tracking, storage, and badge updates
 */
const TRACKING_INTERVAL = 10000;
const activeTabs = new Map();
const blockedTabs = new Set();

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("YScroll installed");

  const data = await chrome.storage.local.get(["setupComplete", "isActive"]);

  if (!data.setupComplete && details.reason === "install") {
    await chrome.storage.local.set({
      dailyLimit: 30,
      sessionLimit: 5,
      coolDown: 5,
      isActive: true,
      platforms: {
        youtube: true,
        tiktok: true,
        linkedin: true,
        instagram: true,
        twitter: true,
      },
      usage: {
        today: 0,
        lastReset: new Date().toDateString(),
        sessions: [],
      },
    });
    updateBadge();
    chrome.tabs.create({ url: chrome.runtime.getURL("setup.html") });
  } else if (!data.setupComplete) {
    await chrome.storage.local.set({
      dailyLimit: 30,
      sessionLimit: 5,
      coolDown: 5,
      isActive: true,
      platforms: {
        youtube: true,
        tiktok: true,
        linkedin: true,
        instagram: true,
        twitter: true,
      },
      usage: {
        today: 0,
        lastReset: new Date().toDateString(),
        sessions: [],
      },
    });
    updateBadge();
  } else if (data.isActive === undefined) {
    await chrome.storage.local.set({ isActive: true });
    updateBadge();
  }
});

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACK_TIME") {
    if (!blockedTabs.has(sender.tab.id)) {
      handleTimeTracking(
        sender.tab.id,
        message.platform,
        message.url,
        message.isActive || false,
        message.videoPlaying
      );
    }
  } else if (message.type === "TRACK_SESSION_TIME") {
    handleSessionTimeTracking(
      sender.tab.id,
      message.platform,
      message.sessionTime
    );
  } else if (message.type === "CONTENT_BLOCKED") {
    console.log(`Content blocked on ${message.platform}`);
    blockedTabs.add(sender.tab.id);

    if (activeTabs.has(sender.tab.id)) {
      const tabData = activeTabs.get(sender.tab.id);
      tabData.isTracking = false;
      activeTabs.set(sender.tab.id, tabData);
    }
  } else if (message.type === "CONTENT_UNBLOCKED") {
    blockedTabs.delete(sender.tab.id);
  }
});

/**
 * Track time spent on platforms using timestamp-based approach
 */
async function handleTimeTracking(
  tabId,
  platform,
  url,
  isActive,
  videoPlaying
) {
  if (blockedTabs.has(tabId)) {
    return;
  }

  const data = await chrome.storage.local.get([
    "isActive",
    "platforms",
    "usage",
  ]);

  if (!data.isActive) return;
  if (!data.platforms || !data.platforms[platform]) return;

  if (!isActive || (videoPlaying !== undefined && !videoPlaying)) {
    if (activeTabs.has(tabId)) {
      const tabData = activeTabs.get(tabId);
      if (tabData.isTracking) {
        const elapsed = (Date.now() - tabData.lastUpdate) / 1000 / 60;
        if (elapsed > 0) {
          let usage = data.usage || {
            today: 0,
            lastReset: new Date().toDateString(),
            sessions: [],
          };
          const today = new Date().toDateString();
          if (usage.lastReset !== today) {
            usage = {
              today: 0,
              lastReset: today,
              sessions: [],
            };
          }
          const dailyLimit =
            (await chrome.storage.local.get(["dailyLimit"])).dailyLimit || 30;
          usage.today = Math.min(usage.today + elapsed, dailyLimit);
          await chrome.storage.local.set({ usage });
          console.log(
            `[TIMER STOPPED] Tab ${tabId} - ${platform}: Final +${elapsed.toFixed(
              2
            )}min (Total: ${usage.today.toFixed(2)}/${dailyLimit})`
          );
        }
        tabData.isTracking = false;
        console.log(
          `[TIMER STOPPED] Tab ${tabId} - ${platform}: Conditions not met`
        );
      }
      tabData.lastUpdate = Date.now();
      activeTabs.set(tabId, tabData);
    }
    return;
  }

  const now = Date.now();
  let elapsed = 0;

  if (!activeTabs.has(tabId)) {
    activeTabs.set(tabId, {
      platform,
      startTime: now,
      lastUpdate: now,
      isTracking: true,
    });
    console.log(`[TIMER STARTED] Tab ${tabId} - ${platform}`);
    return;
  }

  const tabData = activeTabs.get(tabId);

  if (tabData.isTracking) {
    elapsed = (now - tabData.lastUpdate) / 1000 / 60;

    let usage = data.usage || {
      today: 0,
      lastReset: new Date().toDateString(),
      sessions: [],
    };

    const today = new Date().toDateString();
    if (usage.lastReset !== today) {
      usage = {
        today: 0,
        lastReset: today,
        sessions: [],
      };
    }

    const dailyLimit =
      (await chrome.storage.local.get(["dailyLimit"])).dailyLimit || 30;
    usage.today = Math.min(usage.today + elapsed, dailyLimit);

    await chrome.storage.local.set({ usage });

    if (elapsed > 0) {
      console.log(
        `[TIMER] Tab ${tabId} - ${platform}: +${elapsed.toFixed(
          2
        )}min (Total: ${usage.today.toFixed(2)}/${dailyLimit})`
      );
    }
  }

  tabData.lastUpdate = now;
  tabData.isTracking = true;
  activeTabs.set(tabId, tabData);
}

/**
 * Handle session time tracking when limit is reached
 */
async function handleSessionTimeTracking(tabId, platform, sessionTime) {
  const data = await chrome.storage.local.get([
    "isActive",
    "platforms",
    "usage",
    "sessionLimit",
  ]);

  if (!data.isActive) return;
  if (!data.platforms || !data.platforms[platform]) return;

  let usage = data.usage || {
    today: 0,
    lastReset: new Date().toDateString(),
    sessions: [],
  };

  const today = new Date().toDateString();
  if (usage.lastReset !== today) {
    usage = {
      today: 0,
      lastReset: today,
      sessions: [],
    };
  }

  const dailyLimit =
    (await chrome.storage.local.get(["dailyLimit"])).dailyLimit || 30;

  if (activeTabs.has(tabId)) {
    const tabData = activeTabs.get(tabId);
    const now = Date.now();
    const elapsedSinceLastUpdate = (now - tabData.lastUpdate) / 1000 / 60;

    if (elapsedSinceLastUpdate > 0) {
      usage.today = Math.min(usage.today + elapsedSinceLastUpdate, dailyLimit);
      console.log(
        `[SESSION TIME] Tab ${tabId} - ${platform}: Added ${elapsedSinceLastUpdate.toFixed(
          2
        )}min (Total: ${usage.today.toFixed(2)}/${dailyLimit})`
      );
    }
    tabData.lastUpdate = now;
    tabData.isTracking = false;
    activeTabs.set(tabId, tabData);
  } else {
    console.warn(
      `[SESSION TIME IGNORED] Tab ${tabId} - ${platform}: no active timer`
    );
  }

  await chrome.storage.local.set({ usage });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs.has(tabId)) {
    console.log(`[TIMER STOPPED] Tab ${tabId} - removed`);
    activeTabs.delete(tabId);
  }
  if (blockedTabs.has(tabId)) {
    blockedTabs.delete(tabId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const isTrackedUrl =
      changeInfo.url.includes("youtube.com/shorts") ||
      changeInfo.url.includes("youtube.com/watch") ||
      changeInfo.url.includes("tiktok.com") ||
      changeInfo.url.includes("linkedin.com/feed") ||
      changeInfo.url.includes("instagram.com") ||
      changeInfo.url.includes("x.com") ||
      changeInfo.url.includes("twitter.com");

    if (!isTrackedUrl) {
      if (activeTabs.has(tabId)) {
        console.log(
          `[TIMER STOPPED] Tab ${tabId} - URL changed to non-tracked`
        );
        activeTabs.delete(tabId);
      }
      if (blockedTabs.has(tabId)) {
        blockedTabs.delete(tabId);
      }
    }
  }
});

/**
 * Reset daily usage at midnight
 */
chrome.alarms.create("resetDaily", {
  when: getNextMidnight(),
  periodInMinutes: 1440,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetDaily") {
    chrome.storage.local.set({
      usage: {
        today: 0,
        lastReset: new Date().toDateString(),
        sessions: [],
      },
    });
    console.log("Daily usage reset");
  }
});

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return midnight.getTime();
}

/**
 * Round up minutes for display (e.g., 1.97 -> 2)
 */
function displayMinutes(used) {
  return Math.ceil(used);
}

/**
 * Update extension badge with current usage
 */
async function updateBadge() {
  const data = await chrome.storage.local.get([
    "usage",
    "dailyLimit",
    "isActive",
  ]);

  if (!data.isActive) {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    return;
  }

  const usage = data.usage || { today: 0 };
  const limit = data.dailyLimit || 30;
  const used = displayMinutes(usage.today);

  if (used >= limit) {
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  } else if (used >= limit * 0.8) {
    chrome.action.setBadgeText({ text: String(used) });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
  } else {
    chrome.action.setBadgeText({ text: String(used) });
    chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" });
  }
}

setInterval(updateBadge, 10000);
updateBadge();
