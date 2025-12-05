// Settings page logic
let dailyLimit = 30;
let sessionLimit = 5;
let coolDown = 5;

// Load saved settings
async function loadSettings() {
  chrome.storage.local.get(['dailyLimit', 'sessionLimit', 'coolDown'], (data) => {
    dailyLimit = data.dailyLimit || 30;
    sessionLimit = data.sessionLimit || 5;
    coolDown = data.coolDown || 5;
    
    updateDisplay();
  });
}

// Update all displays
function updateDisplay() {
  document.getElementById('dailyValue').textContent = dailyLimit;
  document.getElementById('sessionValue').textContent = sessionLimit;
  document.getElementById('coolValue').textContent = coolDown;
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
  const originalHTML = btn.innerHTML;
  
  btn.classList.add('saved');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Saved!';
  
  setTimeout(() => {
    btn.classList.remove('saved');
    btn.innerHTML = originalHTML;
  }, 2000);
}

// Event listeners for buttons
document.getElementById('dailyDecrement').addEventListener('click', () => {
  dailyLimit = Math.max(5, dailyLimit - 5);
  updateDisplay();
});

document.getElementById('dailyIncrement').addEventListener('click', () => {
  dailyLimit = Math.min(180, dailyLimit + 5);
  updateDisplay();
});

document.getElementById('sessionDecrement').addEventListener('click', () => {
  sessionLimit = Math.max(1, sessionLimit - 1);
  updateDisplay();
});

document.getElementById('sessionIncrement').addEventListener('click', () => {
  sessionLimit = Math.min(60, sessionLimit + 1);
  updateDisplay();
});

document.getElementById('coolDecrement').addEventListener('click', () => {
  coolDown = Math.max(1, coolDown - 1);
  updateDisplay();
});

document.getElementById('coolIncrement').addEventListener('click', () => {
  coolDown = Math.min(30, coolDown + 1);
  updateDisplay();
});

document.getElementById('saveBtn').addEventListener('click', saveSettings);

// Back button - navigate back to popup
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'popup.html';
});

// Initialize
loadSettings();
