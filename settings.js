// Settings page logic
let sessionLimit = 5;
let coolDown = 5;

// Load saved settings
async function loadSettings() {
  chrome.storage.local.get(['dailyLimit', 'sessionLimit', 'coolDown'], (data) => {
    dailyLimit = data.dailyLimit || 60;
    sessionLimit = data.sessionLimit || 5;
    coolDown = data.coolDown || 30;
    
    updateDisplay();
  });
}

// Update all displays
function updateDisplay() {
  document.getElementById('dailyValue').textContent = dailyLimit;
  document.getElementById('sessionValue').textContent = sessionLimit;
  document.getElementById('coolValue').textContent = coolDown;
}

// Adjust function for all settings
function adjust(type, amount) {
  if (type === 'daily') {
    dailyLimit = Math.max(5, Math.min(180, dailyLimit + amount));
  } else if (type === 'session') {
    sessionLimit = Math.max(1, Math.min(60, sessionLimit + amount));
  } else if (type === 'cool') {
    coolDown = Math.max(1, Math.min(30, coolDown + amount));
  }
  updateDisplay();
}

// Save settings
async function saveSettings() {
  await chrome.storage.local.set({
    dailyLimit,
    sessionLimit,
    coolDown
  });
  
  // Show confirmation
  const btn = document.querySelector('.save-btn');
  const icon = btn.querySelector('i');
  const originalHTML = btn.innerHTML;
  
  btn.classList.add('saved');
  btn.innerHTML = '<i data-lucide="check-circle"></i> Saved!';
  lucide.createIcons();
  
  setTimeout(() => {
    btn.classList.remove('saved');
    btn.innerHTML = originalHTML;
    lucide.createIcons();
  }, 2000);
}

// Back button - navigate back to popup
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'popup.html';
});

// Initialize
loadSettings();
