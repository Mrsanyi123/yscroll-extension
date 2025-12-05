# YScroll Installation Guide

## Quick Start

Follow these steps to install and use YScroll:

### 1. Load the Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right corner)
4. Click **"Load unpacked"**
5. Select the `YScroll` folder (this folder)
6. The extension should now appear in your extensions list

### 2. Pin the Extension (Optional but Recommended)

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "YScroll" in the list
3. Click the pin icon to keep it visible in your toolbar

### 3. Configure Your Limits

1. Click the YScroll icon in your toolbar
2. Click the settings gear icon (⚙️) in the top right
3. Set your **Daily Limit** (default: 30 minutes)
   - Use + and - buttons to adjust in 5-minute increments
   - Range: 5-180 minutes
4. Set your **Session Limit** (default: 5 minutes)
   - Use + and - buttons to adjust in 1-minute increments
   - Range: 1-60 minutes
5. Click **"Finish"** to save your settings

### 4. Start Using YScroll

The extension is now active! Visit any of these platforms:
- **youtubeshorts Shorts** (`youtubeshorts.com/shorts/...`)
- **TikTok** (`tiktok.com`)
- **LinkedIn Feed** (`linkedin.com/feed`)
- **Instagram** (`instagram.com` or `/reels/`)

### 5. Monitor Your Usage

Click the YScroll icon to see:
- ⏱️ Time used today
- 📊 Circular progress indicator
- 🎮 Platform toggles
- 🔄 Master ON/OFF toggle

## Features Explained

### Daily Limit
- Tracks total time across **all enabled platforms**
- Resets automatically at midnight
- When reached, all enabled platforms are blocked

### Session Limit (Optional)
- Tracks time per continuous visit
- Resets when you leave the platform
- Helps enforce regular breaks

### Platform Toggles
- Enable/disable tracking for individual platforms
- Disabled platforms won't count toward your limits
- Changes take effect immediately

### Master Toggle
- Large green/red circle at the bottom
- **Green (ON)**: YScroll is actively tracking and blocking
- **Red (OFF)**: YScroll is paused (no tracking or blocking)

## What Gets Blocked?

When limits are reached, you'll see a full-screen overlay with:
- YScroll logo
- "Time's Up!" message
- Explanation of which limit was reached
- Motivational message to get back to work

## Troubleshooting

### Extension Not Loading
- Make sure all files are present in the folder
- Check that icons exist in the `icons/` folder
- Try reloading the extension in `chrome://extensions/`

### Time Not Tracking
- Verify you're on a supported page:
  - youtubeshorts: Must be on `/shorts/` pages (not regular videos)
  - TikTok: Any page on tiktok.com
  - LinkedIn: Must be on `/feed/` page
  - Instagram: Main feed or `/reels/` pages
- Check that the platform toggle is enabled
- Ensure the master toggle is ON

### Settings Not Saving
- Make sure you clicked "Finish" after changing settings
- Check Chrome's storage permissions
- Try reinstalling the extension

### Block Not Working
- Refresh the page after enabling YScroll
- Check your current usage in the popup
- Verify limits are set correctly

## Uninstalling

1. Go to `chrome://extensions/`
2. Find YScroll
3. Click "Remove"
4. Confirm removal

All stored data will be deleted automatically.

## Tips for Success

1. **Start Conservative**: Begin with lower limits and adjust as needed
2. **Use Session Limits**: They help enforce regular breaks
3. **Disable When Needed**: Turn off specific platforms when you need them for work
4. **Check Your Stats**: Regularly review your usage in the popup
5. **Be Honest**: Don't disable the extension to bypass limits - that defeats the purpose!

## Need Help?

- Check the main README.md for detailed documentation
- Review the code in the project files
- Open an issue on GitHub for bugs or feature requests

---

**Now get back to work!** 💪
