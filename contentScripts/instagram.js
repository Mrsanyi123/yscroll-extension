// Instagram blocker (Reels and Feed)
(function() {
  'use strict';
  
  let sessionStart = Date.now();
  let isBlocked = false;
  let cooldownEnd = null;
  
  // Check if we're on Instagram Reels or main feed
  function isReelsOrFeed() {
    const path = window.location.pathname;
    return path === '/' || path.includes('/reels/');
  }
  
  // Create blocking overlay
  function createBlockOverlay(message) {
    const overlay = document.createElement('div');
    overlay.id = 'yscroll-block-overlay';
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
    
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div style="width: 80px; height: 80px; background: white; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; font-weight: bold; color: #3b82f6;">Y</span>
        </div>
        <h1 style="font-size: 36px; margin-bottom: 16px;">Time's Up!</h1>
        <p style="font-size: 18px; color: #cbd5e0; margin-bottom: 24px;">${message}</p>
        <p style="font-size: 14px; color: #9ca3af;">Get back to work and be productive! 💪</p>
      </div>
    `;
    
    // Prevent all interactions
    overlay.addEventListener('keydown', (e) => e.stopPropagation(), true);
    overlay.addEventListener('keyup', (e) => e.stopPropagation(), true);
    overlay.addEventListener('keypress', (e) => e.stopPropagation(), true);
    overlay.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false, capture: true });
    overlay.addEventListener('scroll', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false, capture: true });
    
    return overlay;
  }
  
  // Check limits and block if necessary
  async function checkAndBlock() {
    const data = await chrome.storage.local.get(['isActive', 'platforms', 'dailyLimit', 'sessionLimit', 'coolDown', 'usage']);
    
    // Check if extension is active
    if (data.isActive === false) {
      removeBlockOverlay();
      return;
    }
    
    // Check if Instagram is enabled
    if (!data.platforms || data.platforms.instagram === false) {
      removeBlockOverlay();
      return;
    }
    
    // Only block on reels or feed
    if (!isReelsOrFeed()) {
      removeBlockOverlay();
      cooldownEnd = null;
      return;
    }
    
    const usage = data.usage || { today: 0 };
    const dailyLimit = data.dailyLimit || 30;
    const sessionLimit = data.sessionLimit || 5;
    const coolDown = data.coolDown || 5;
    
    // Check daily limit
    if (usage.today >= dailyLimit) {
      showBlockOverlay(`You've reached your daily limit of ${dailyLimit} minutes.`);
      return;
    }
    
    // Check if in cooldown period
    if (cooldownEnd && Date.now() < cooldownEnd) {
      const remainingMinutes = Math.ceil((cooldownEnd - Date.now()) / 1000 / 60);
      showBlockOverlay(`Session limit reached. Cool down for ${remainingMinutes} more minute${remainingMinutes !== 1 ? 's' : ''}.`);
      return;
    } else if (cooldownEnd && Date.now() >= cooldownEnd) {
      // Cooldown ended, reset session
      cooldownEnd = null;
      sessionStart = Date.now();
    }
    
    const sessionTime = (Date.now() - sessionStart) / 1000 / 60; // minutes
    
    // Check session limit
    if (sessionTime >= sessionLimit) {
      // Start cooldown period
      if (!cooldownEnd) {
        cooldownEnd = Date.now() + (coolDown * 60 * 1000);
      }
      const remainingMinutes = Math.ceil((cooldownEnd - Date.now()) / 1000 / 60);
      showBlockOverlay(`Session limit reached. Cool down for ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`);
      return;
    }
    
    // Not blocked
    removeBlockOverlay();
  }
  
  // Show block overlay
  function showBlockOverlay(message) {
    if (isBlocked) return;
    
    const existing = document.getElementById('yscroll-block-overlay');
    if (existing) existing.remove();
    
    // Pause all videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
      video.muted = true;
      video.currentTime = 0;
    });
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    const overlay = createBlockOverlay(message);
    document.body.appendChild(overlay);
    isBlocked = true;
    
    // Notify background script
    chrome.runtime.sendMessage({ 
      type: 'CONTENT_BLOCKED', 
      platform: 'instagram' 
    });
  }
  
  // Remove block overlay
  function removeBlockOverlay() {
    const overlay = document.getElementById('yscroll-block-overlay');
    if (overlay) {
      overlay.remove();
      isBlocked = false;
      
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }
  
  // Track time spent
  function trackTime() {
    if (isReelsOrFeed() && !isBlocked) {
      chrome.runtime.sendMessage({ 
        type: 'TRACK_TIME', 
        platform: 'instagram',
        url: window.location.href
      });
    }
  }
  
  // Initialize
  checkAndBlock();
  
  // Check every 2 seconds
  setInterval(checkAndBlock, 2000);
  
  // Track time every 10 seconds
  setInterval(trackTime, 10000);
  
  // Listen for URL changes (Instagram is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkAndBlock();
    }
  }).observe(document, { subtree: true, childList: true });
  
})();
