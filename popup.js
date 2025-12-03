// Popup dashboard logic
let settings = {};
let usage = {};

// Initialize popup
async function init() {
  await loadData();
  updateUI();
  setupEventListeners();
  
  // Update every second
  setInterval(async () => {
    await loadData();
    updateUI();
  }, 1000);
}

// Load settings and usage data
async function loadData() {
  settings = await new Promise((resolve) => {
    chrome.storage.local.get(['dailyLimit', 'sessionLimit', 'isActive', 'platforms', 'usage'], (data) => {
      resolve({
        dailyLimit: data.dailyLimit || 30,
        sessionLimit: data.sessionLimit || 5,
        isActive: data.isActive !== false,
        platforms: data.platforms || {
          youtube: true,
          tiktok: true,
          linkedin: true,
          instagram: true
        },
        usage: data.usage || {
          today: 0,
          lastReset: new Date().toDateString(),
          sessions: []
        }
      });
    });
  });
  
  usage = settings.usage;
  
  // Reset if new day
  const today = new Date().toDateString();
  if (usage.lastReset !== today) {
    usage = {
      today: 0,
      lastReset: today,
      sessions: []
    };
    await chrome.storage.local.set({ usage });
  }
}

// Update UI elements
function updateUI() {
  // Update time display
  const timeUsed = Math.floor(usage.today);
  document.getElementById('timeUsed').textContent = timeUsed;
  document.getElementById('timeLimit').textContent = settings.dailyLimit;
  
  // Update progress circle
  updateProgressCircle(timeUsed, settings.dailyLimit);
  
  // Update platform toggles
  document.getElementById('toggleYoutube').checked = settings.platforms.youtube;
  document.getElementById('toggleTiktok').checked = settings.platforms.tiktok;
  document.getElementById('toggleLinkedin').checked = settings.platforms.linkedin;
  document.getElementById('toggleInstagram').checked = settings.platforms.instagram;
  
  // Update master toggle
  const masterToggle = document.querySelector('.master-toggle-circle');
  const masterText = document.querySelector('.master-toggle-text');
  const masterSubtext = document.querySelector('.master-toggle-subtext');
  
  if (settings.isActive) {
    masterToggle.classList.remove('inactive');
    masterText.textContent = 'ON';
    masterSubtext.textContent = 'YScroll is Active';
  } else {
    masterToggle.classList.add('inactive');
    masterText.textContent = 'OFF';
    masterSubtext.textContent = 'YScroll is Inactive';
  }
}

// Update circular progress indicator
function updateProgressCircle(used, limit) {
  const circle = document.getElementById('progressCircle');
  const circumference = 2 * Math.PI * 120; // radius = 120
  const progress = Math.min(used / limit, 1);
  const offset = circumference * (1 - progress);
  
  circle.style.strokeDashoffset = offset;
  
  // Change color based on usage
  if (progress >= 1) {
    circle.style.stroke = '#ef4444'; // Red when limit reached
  } else if (progress >= 0.8) {
    circle.style.stroke = '#f59e0b'; // Orange when close to limit
  } else {
    circle.style.stroke = '#3b82f6'; // Blue normally
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings button - open settings in same popup window
  document.getElementById('settingsBtn').addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
  
  // Platform toggles
  document.getElementById('toggleYoutube').addEventListener('change', async (e) => {
    settings.platforms.youtube = e.target.checked;
    await chrome.storage.local.set({ platforms: settings.platforms });
  });
  
  document.getElementById('toggleTiktok').addEventListener('change', async (e) => {
    settings.platforms.tiktok = e.target.checked;
    await chrome.storage.local.set({ platforms: settings.platforms });
  });
  
  document.getElementById('toggleLinkedin').addEventListener('change', async (e) => {
    settings.platforms.linkedin = e.target.checked;
    await chrome.storage.local.set({ platforms: settings.platforms });
  });
  
  document.getElementById('toggleInstagram').addEventListener('change', async (e) => {
    settings.platforms.instagram = e.target.checked;
    await chrome.storage.local.set({ platforms: settings.platforms });
  });
  
  // Master toggle
  document.getElementById('masterToggle').addEventListener('click', async () => {
    settings.isActive = !settings.isActive;
    await chrome.storage.local.set({ isActive: settings.isActive });
    updateUI();
  });
}

// Start the popup
init();
