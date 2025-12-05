# YScroll Testing Guide

## ✅ Extension is Ready!

All files have been created and configured. Follow this guide to test the extension.

## Installation Steps

1. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load Extension**
   - Click "Load unpacked"
   - Select the `YScroll` folder
   - Extension should load without errors

3. **Check for Errors**
   - Look for any red error messages
   - Click "Errors" button if present to see details
   - All should be green ✅

## First-Time Setup Test

1. **Setup Page Should Open**
   - On first install, `setup.html` should open automatically
   - If not, check browser console for errors

2. **Configure Limits**
   - Test + and - buttons for Daily Limit
   - Test + and - buttons for Session Limit
   - Click "Finish"
   - Page should close after showing "Setup Complete!"

3. **Verify Storage**
   - Open DevTools (F12)
   - Go to Application > Storage > Local Storage > chrome-extension://...
   - Should see: `dailyLimit`, `sessionLimit`, `setupComplete: true`, `platforms`, `usage`

## Dashboard Popup Test

1. **Open Popup**
   - Click YScroll icon in Chrome toolbar
   - Popup should display without errors

2. **Check UI Elements**
   - ✅ Logo and branding visible
   - ✅ Settings gear icon clickable
   - ✅ Circular progress indicator showing 0/30
   - ✅ All 4 platform toggles visible (YouTube, TikTok, LinkedIn, Instagram)
   - ✅ Master toggle showing "ON" in green

3. **Test Settings Button**
   - Click gear icon
   - Should open `settings.html` in new tab
   - Change limits and click "Finish"
   - Should show "Saved!" confirmation

4. **Test Platform Toggles**
   - Toggle each platform on/off
   - Changes should persist when reopening popup

5. **Test Master Toggle**
   - Click the green ON circle
   - Should turn red and say "OFF"
   - Click again to turn back ON

## Content Script Tests

### YouTube Shorts Test
1. Go to `youtube.com`
2. Navigate to any Shorts video (URL contains `/shorts/`)
3. **Expected Behavior:**
   - Time tracking starts
   - After 5 minutes (session limit), blocking overlay appears
   - Overlay shows "Time's Up!" message with YScroll logo

### TikTok Test
1. Go to `tiktok.com`
2. **Expected Behavior:**
   - Time tracking starts immediately
   - After 5 minutes, blocking overlay appears

### LinkedIn Test
1. Go to `linkedin.com/feed`
2. **Expected Behavior:**
   - Time tracking starts on feed page
   - After 5 minutes, blocking overlay appears
   - Other LinkedIn pages (messages, profile) should NOT be blocked

### Instagram Test
1. Go to `instagram.com`
2. Navigate to Reels or main feed
3. **Expected Behavior:**
   - Time tracking starts
   - After 5 minutes, blocking overlay appears
   - Other pages (DMs, profile) should NOT be blocked

## Time Tracking Test

1. **Quick Test (Use 1-minute limits)**
   - Open settings
   - Set Daily Limit to 5 minutes
   - Set Session Limit to 1 minute
   - Click Finish

2. **Visit YouTube Shorts**
   - Go to any Shorts video
   - Wait 1 minute
   - Should see blocking overlay

3. **Check Popup**
   - Open popup
   - Should show 1/5 minutes used
   - Progress circle should show ~20% filled

4. **Test Daily Limit**
   - Visit different platforms
   - Accumulate 5 minutes total
   - All platforms should be blocked

## Background Script Test

1. **Check Badge**
   - Extension icon should show a number badge
   - Badge shows minutes used today
   - Color changes: Blue (normal) → Orange (80%+) → Red (limit reached)

2. **Check Console**
   - Right-click extension icon > "Inspect popup"
   - Go to Console tab
   - Should see "YScroll installed" message
   - No error messages

## Common Issues & Fixes

### Setup Page Doesn't Open
- **Fix**: Manually open `chrome-extension://[YOUR-ID]/setup.html`
- Check background.js console for errors

### Blocking Not Working
- **Fix**: Refresh the page after installing extension
- Check that platform is enabled in popup
- Check that master toggle is ON
- Verify you're on the correct page (e.g., /shorts/ for YouTube)

### Time Not Tracking
- **Fix**: Open background service worker console
  - Go to `chrome://extensions/`
  - Click "service worker" under YScroll
  - Check for errors
- Verify content script is injected (check page console)

### Popup Not Opening
- **Fix**: Check manifest.json for syntax errors
- Verify popup.html, popup.css, popup.js exist
- Check browser console for errors

### Icons Not Showing
- **Fix**: Icons should be auto-generated
- If missing, run: `python3 create_icons.py`
- Or create manually: 16x16, 48x48, 128x128 PNG files

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Setup page opens on first install
- [ ] Settings can be configured and saved
- [ ] Popup displays correctly
- [ ] All toggles work (platforms + master)
- [ ] YouTube Shorts blocking works
- [ ] TikTok blocking works
- [ ] LinkedIn Feed blocking works
- [ ] Instagram blocking works
- [ ] Time tracking accumulates correctly
- [ ] Session limit triggers blocking
- [ ] Daily limit triggers blocking
- [ ] Badge updates with usage
- [ ] Blocking overlay displays correctly
- [ ] Settings persist after browser restart

## Performance Check

- **Memory Usage**: Should be ~10-20 MB
- **CPU Usage**: Minimal (only checks every 2-10 seconds)
- **No Lag**: Pages should load normally
- **No Conflicts**: Should not interfere with other extensions

## Final Verification

1. **Uninstall & Reinstall**
   - Remove extension
   - Reload unpacked
   - Setup should run again
   - All features should work

2. **Test in Incognito**
   - Enable extension in incognito mode
   - Test all features
   - Should work identically

3. **Test Across Sessions**
   - Set limits and use extension
   - Close browser completely
   - Reopen and check if usage persisted
   - Should reset at midnight

## Success Criteria

✅ **Extension is ready for use if:**
- All tests pass
- No console errors
- Blocking works on all platforms
- Time tracking is accurate
- Settings persist correctly
- UI matches design mockups

## Next Steps

Once all tests pass:
1. Use the extension daily to find edge cases
2. Adjust limits as needed
3. Report any bugs for fixing
4. Consider publishing to Chrome Web Store

---

**Happy Testing!** 🚀
