/**
 * Setup Page
 * First-time setup wizard for configuring initial limits
 */
let dailyLimit = 30;
let sessionLimit = 5;
let coolDown = 5;

/**
 * Update all display values
 */
function updateDisplay() {
  document.getElementById("dailyValue").textContent = dailyLimit;
  document.getElementById("sessionValue").textContent = sessionLimit;
  document.getElementById("coolValue").textContent = coolDown;
}

/**
 * Save settings and mark setup as complete
 */
async function finishSetup() {
  await chrome.storage.local.set({
    dailyLimit,
    sessionLimit,
    coolDown,
    isActive: true,
    setupComplete: true,
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

  const btn = document.querySelector(".finish-btn");
  const originalHTML = btn.innerHTML;

  btn.classList.add("saved");
  btn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Setup Complete!';

  setTimeout(() => {
    window.close();
  }, 1000);
}

// Event listeners
document.getElementById("dailyDecrement").addEventListener("click", () => {
  dailyLimit = Math.max(5, dailyLimit - 5);
  updateDisplay();
});

document.getElementById("dailyIncrement").addEventListener("click", () => {
  dailyLimit = Math.min(90, dailyLimit + 5);
  updateDisplay();
});

document.getElementById("sessionDecrement").addEventListener("click", () => {
  sessionLimit = Math.max(1, sessionLimit - 1);
  updateDisplay();
});

document.getElementById("sessionIncrement").addEventListener("click", () => {
  sessionLimit = Math.min(20, sessionLimit + 1);
  updateDisplay();
});

document.getElementById("coolDecrement").addEventListener("click", () => {
  coolDown = Math.max(1, coolDown - 1);
  updateDisplay();
});

document.getElementById("coolIncrement").addEventListener("click", () => {
  coolDown = Math.min(30, coolDown + 1);
  updateDisplay();
});

document.getElementById("finishBtn").addEventListener("click", finishSetup);

updateDisplay();
