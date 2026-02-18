/**
 * LinkedIn Feed Content Blocker
 * Monitors and limits time spent on LinkedIn feed
 */
(function () {
  "use strict";

  let sessionStart = null;
  let isBlocked = false;
  let cooldownEnd = null;
  let trackingIntervalId = null;
  let lastActiveTimestamp = null;
  const PLATFORM = "linkedin";

  function isFeedPage() {
    return (
      window.location.pathname === "/feed/" || window.location.pathname === "/"
    );
  }

  /**
   * Creates a blocking overlay with message and home button
   */
  function createBlockOverlay(message) {
    const overlay = document.createElement("div");
    overlay.id = "yscroll-block-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const logoUrl = chrome.runtime.getURL("icons/logo.png");
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div class="go-home-btn" style="margin-bottom: 20px;">
          <a href="https://www.linkedin.com/feed" target="_blank" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s;">
            Go to Homepage
          </a>
        </div>
       <div style="width: 80px; height: 80px; background: white; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <img src="${logoUrl}" alt="YScroll" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <h1 style="font-size: 36px; margin-bottom: 16px; color: white;">Time's Up!</h1>
        <p style="font-size: 18px; color: #cbd5e0; margin-bottom: 24px;">${message}</p>
        <p style="font-size: 14px; color: #9ca3af;">Get back to work and be productive! 💪</p>
      </div>
    `;

    overlay.addEventListener("keydown", (e) => e.stopPropagation(), true);
    overlay.addEventListener("keyup", (e) => e.stopPropagation(), true);
    overlay.addEventListener("keypress", (e) => e.stopPropagation(), true);
    overlay.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false, capture: true }
    );
    overlay.addEventListener(
      "scroll",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false, capture: true }
    );

    return overlay;
  }

  async function loadSessionState() {
    const data = await chrome.storage.local.get(["sessionState"]);
    const sessionState = data.sessionState || {};
    const platformState = sessionState[PLATFORM] || {};

    if (platformState.sessionStart) {
      sessionStart = platformState.sessionStart;
    }
    if (platformState.cooldownEnd) {
      cooldownEnd = platformState.cooldownEnd;
    }
  }

  async function saveSessionState() {
    const data = await chrome.storage.local.get(["sessionState"]);
    const sessionState = data.sessionState || {};
    sessionState[PLATFORM] = {
      sessionStart: sessionStart,
      cooldownEnd: cooldownEnd,
    };
    await chrome.storage.local.set({ sessionState });
  }

  /**
   * Checks limits and blocks content if necessary
   */
  async function checkAndBlock() {
    await loadSessionState();

    const data = await chrome.storage.local.get([
      "isActive",
      "platforms",
      "dailyLimit",
      "sessionLimit",
      "coolDown",
      "usage",
    ]);

    if (data.isActive === false) {
      removeBlockOverlay();
      return;
    }

    if (!data.platforms || data.platforms.linkedin === false) {
      removeBlockOverlay();
      return;
    }

    if (!isFeedPage()) {
      removeBlockOverlay();
      sessionStart = null;
      cooldownEnd = null;
      await saveSessionState();
      return;
    }

    const usage = data.usage || { today: 0 };
    const dailyLimit = data.dailyLimit || 30;
    const sessionLimit = data.sessionLimit || 5;
    const coolDown = data.coolDown || 5;

    if (usage.today >= dailyLimit) {
      showBlockOverlay(
        `You've reached your daily limit of ${dailyLimit} minutes.`
      );
      return;
    }

    if (cooldownEnd && Date.now() < cooldownEnd) {
      const remainingMinutes = Math.ceil(
        (cooldownEnd - Date.now()) / 1000 / 60
      );
      showBlockOverlay(
        `Session limit reached. Cool down for ${remainingMinutes} more minute${remainingMinutes !== 1 ? "s" : ""
        }.`
      );
      lastActiveTimestamp = null;
      return;
    } else if (cooldownEnd && Date.now() >= cooldownEnd) {
      cooldownEnd = null;
      sessionStart = null;
      lastActiveTimestamp = null;
      await saveSessionState();
    }

    if (!sessionStart) {
      sessionStart = Date.now();
      await saveSessionState();
    }

    const sessionTime = (Date.now() - sessionStart) / 1000 / 60;

    if (sessionTime >= sessionLimit) {
      if (!cooldownEnd) {
        cooldownEnd = Date.now() + coolDown * 60 * 1000;
        await saveSessionState();
        lastActiveTimestamp = null;

        chrome.runtime.sendMessage({
          type: "TRACK_SESSION_TIME",
          platform: PLATFORM,
          sessionTime: Math.min(sessionTime, sessionLimit),
        });
      }
      const remainingMinutes = Math.ceil(
        (cooldownEnd - Date.now()) / 1000 / 60
      );
      if (remainingMinutes > 0) {
        showBlockOverlay(
          `Session limit reached. Cool down for ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""
          }.`
        );
      }
      return;
    }

    removeBlockOverlay();
  }

  /**
   * Shows blocking overlay
   */
  function showBlockOverlay(message) {
    if (isBlocked) return;

    const existing = document.getElementById("yscroll-block-overlay");
    if (existing) existing.remove();

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.muted = true;
      video.currentTime = 0;
    });

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const overlay = createBlockOverlay(message);
    document.body.appendChild(overlay);
    isBlocked = true;

    chrome.runtime.sendMessage({
      type: "CONTENT_BLOCKED",
      platform: "linkedin",
    });

    const blockInterval = setInterval(() => {
      if (!isBlocked) {
        clearInterval(blockInterval);
        return;
      }
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        if (!video.paused) {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
        }
      });
    }, 500);
  }

  function removeBlockOverlay() {
    const overlay = document.getElementById("yscroll-block-overlay");
    if (overlay) {
      overlay.remove();
      const wasBlocked = isBlocked;
      isBlocked = false;

      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";

      if (wasBlocked) {
        chrome.runtime.sendMessage({
          type: "CONTENT_UNBLOCKED",
          platform: "linkedin",
        });
      }
    }
  }

  function isVideoPlaying() {
    const videos = document.querySelectorAll("video");
    if (videos.length === 0) return false;

    for (const video of videos) {
      if (!video.paused && !video.ended && video.readyState > 2) {
        // Check if video is somewhat visible in viewport
        const rect = video.getBoundingClientRect();
        const isVisible = (
          rect.top >= -rect.height &&
          rect.left >= -rect.width &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width
        );
        if (isVisible) return true;
      }
    }
    return false;
  }

  /**
   * Determines if time tracking should occur
   */
  function shouldTrackTime() {
    if (isBlocked || (cooldownEnd && Date.now() < cooldownEnd)) {
      return false;
    }

    if (!isFeedPage()) {
      return false;
    }

    if (document.visibilityState !== "visible") {
      return false;
    }

    if (!isVideoPlaying()) {
      return false;
    }

    return true;
  }

  /**
   * Tracks time spent on feed
   */
  async function trackTime() {
    const shouldTrack = shouldTrackTime();

    if (!shouldTrack) {
      if (lastActiveTimestamp !== null) {
        lastActiveTimestamp = null;
      }
      return;
    }

    const data = await chrome.storage.local.get(["isActive", "platforms"]);
    if (data.isActive === false) {
      return;
    }
    if (!data.platforms || data.platforms.linkedin === false) {
      return;
    }

    if (!sessionStart) {
      sessionStart = Date.now();
      await saveSessionState();
    }

    chrome.runtime.sendMessage({
      type: "TRACK_TIME",
      platform: "linkedin",
      url: window.location.href,
      isActive: document.visibilityState === "visible",
      videoPlaying: isVideoPlaying(),
    });
  }

  // Initialize
  loadSessionState().then(() => {
    checkAndBlock();
  });

  setInterval(checkAndBlock, 2000);

  if (trackingIntervalId) {
    clearInterval(trackingIntervalId);
  }
  trackingIntervalId = setInterval(trackTime, 1000);

  window.addEventListener("beforeunload", () => {
    if (trackingIntervalId) {
      clearInterval(trackingIntervalId);
      trackingIntervalId = null;
    }
  });

  // Monitor URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (!isFeedPage()) {
        sessionStart = null;
        saveSessionState();
      }
      checkAndBlock();
    }
  }).observe(document, { subtree: true, childList: true });
})();
