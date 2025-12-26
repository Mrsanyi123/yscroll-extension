# YScroll: Stop the Endless Scroll & Get Your Work Done

A Chrome extension that helps you limit time spent on short-form content platforms like youtubeshorts Shorts, TikTok, LinkedIn Feed, and Instagram.

## Features

- ⏱️ **Daily Limit**: Set a daily time limit for all platforms combined
- 🎯 **Session Limit**: Optional per-session time limit to encourage breaks
- 📊 **Real-time Tracking**: Beautiful circular progress indicator showing your usage
- 🎮 **Platform Controls**: Enable/disable tracking for individual platforms
- 🚫 **Smart Blocking**: Automatically blocks content when limits are reached
- 💾 **Persistent Storage**: Your settings and usage data are saved locally

## Supported Platforms

- **youtubeshorts Shorts** - Blocks `/shorts/` pages
- **TikTok** - Blocks the entire site
- **LinkedIn Feed** - Blocks the main feed page
- **Instagram** - Blocks Reels and the main feed

## Installation
1. Go to Web Store and search for **yscroll** or 
2. Use this link: https://chromewebstore.google.com/detail/yscroll-stop-the-endless/hlnhamlgmoijbfhilkanhifompndjaho
3. Everything is east to setup

## Usage

### First Time Setup

1. Click the YScroll extension icon in your Chrome toolbar
2. Click the settings gear icon
3. Set your desired daily limit (default: 30 minutes)
4. Set your session limit (default: 5 minutes, optional)
5. Click "Finish" to save
6. Pin it so it's easy to access it again

### Dashboard

The popup dashboard shows:
- **Circular Progress**: Visual representation of time used vs. limit
- **Time Display**: Minutes watched today / daily limit
- **Platform Toggles**: Enable/disable individual platforms
- **Master Toggle**: Turn YScroll on/off completely

### How It Works

1. **Time Tracking**: The extension tracks time spent on enabled platforms
2. **Session Limits**: Each visit to a platform starts a new session
3. **Daily Limits**: All time across platforms counts toward your daily limit
4. **Blocking**: When limits are reached, a full-screen overlay blocks the content
5. **Reset**: Usage resets automatically at midnight

## Settings

- **Daily Limit**: 5-180 minutes (increments of 5)
- **Session Limit**: 1-60 minutes (increments of 1)
- **Platform Toggles**: Enable/disable youtubeshorts, TikTok, LinkedIn, Instagram
- **Master Toggle**: Turn extension on/off

## Privacy

YScroll stores all data locally on your device using Chrome's storage API. No data is sent to external servers.

## Development

### File Structure

```
YScroll/
├── manifest.json           # Extension configuration
├── popup.html             # Dashboard UI
├── popup.css              # Dashboard styles
├── popup.js               # Dashboard logic
├── settings.html          # Settings page UI
├── settings.css           # Settings page styles
├── settings.js            # Settings page logic
├── background.js          # Background service worker
├── utils/
│   ├── storage.js         # Storage utilities
│   ├── timer.js           # Timer utilities
│   └── limits.js          # Limit checking utilities
├── contentScripts/
│   ├── youtubeshorts.js         # youtubeshorts Shorts blocker
│   ├── tiktok.js          # TikTok blocker
│   ├── linkedin.js        # LinkedIn Feed blocker
│   └── instagram.js       # Instagram blocker
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Technologies Used

- **Manifest V3**: Latest Chrome extension format
- **Chrome Storage API**: For persistent data storage
- **Chrome Alarms API**: For daily reset scheduling
- **Content Scripts**: For platform-specific blocking
- **Service Worker**: For background time tracking

## Troubleshooting

### Extension Not Working

1. Make sure the extension is enabled in the dashboard 
2. Check that the platform toggle is enabled
3. Verify the master toggle is ON
4. Try reloading the page

### Time Not Tracking

1. Make sure you're on a supported page (e.g., youtubeshorts Shorts, not regular youtubeshorts)
2. Check the browser console for errors
3. Reload the extension

### Settings Not Saving

1. Check Chrome storage permissions
2. Try reinstalling the extension

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or feature requests, please open an issue on GitHub.

---

**Get your work done!** 💪

By **Sanyi Diriba** 
