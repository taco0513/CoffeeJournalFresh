# Troubleshooting Guide
## Coffee Journal Fresh - Common Issues & Solutions

### 🚨 Critical Issues & Quick Fixes

#### JavaScript Bridge Error
**Error:** `Failed to call into JavaScript module method RCTEventEmitter.receiveEvent()`

**Quick Fix:**
```bash
# Kill Metro processes
pkill -f "node.*metro" || true

# Clean and reinstall
rm -rf node_modules
npm install

# Reset Metro cache
npx react-native start --reset-cache

# In another terminal, build
npm run ios-device
```

**Root Cause:** Metro cache conflicts or dependency version mismatches

#### iOS Build Crash - NSException
**Error:** `NSException * '*** -[__NSPlaceholderDictionary initWithObjects:forKeys:count:]: attempt to insert nil object'`

**Quick Fix:**
```bash
# Run the automated fix script
cd ios
ruby fix_rct_provider.rb

# Clean and rebuild
xcodebuild clean
cd ..
npm run ios-device
```

**Root Cause:** NSClassFromString returning nil values in generated code

#### Metro Bundler Won't Start
**Error:** `EADDRINUSE: address already in use :::8081`

**Quick Fix:**
```bash
# Kill process using port 8081
lsof -ti:8081 | xargs kill -9

# Start Metro with clean cache
npx react-native start --reset-cache
```

### 🔧 Build Issues

#### iOS Build Fails with Sandbox Errors
**Error:** `Sandbox: rsync(xxxxx) deny(1) file-read-data`

**Solution:**
1. Open Xcode project: `ios/CoffeeJournalFresh.xcworkspace`
2. Go to Build Settings
3. Search for "ENABLE_USER_SCRIPT_SANDBOXING"
4. Set to "NO" for all targets

**Or use automated fix in Podfile:**
```ruby
config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
```

#### CocoaPods Issues
**Error:** Various pod install failures

**Solution:**
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod deintegrate
pod install
```

#### React Native Version Conflicts
**Error:** Version mismatches between React and React Native

**Current Working Versions:**
- React: 19.1.0
- React Native: 0.80.1

**Solution:**
```bash
# Check versions
npm ls react react-native

# Fix if needed
npm install react@19.1.0 react-native@0.80.1
```

### 📱 Device & Simulator Issues

#### App Won't Launch on Device
**Symptoms:** Build succeeds but app crashes immediately

**Check List:**
1. ✅ Developer certificate valid
2. ✅ Device in developer mode
3. ✅ Bundle identifier matches
4. ✅ iOS version compatibility (15.1+)

**Solution:**
```bash
# Check device connection
xcrun devicectl list devices

# Rebuild with device target
npm run ios-device
```

#### Simulator Issues
**Error:** Simulator crashes or won't load

**Solution:**
```bash
# Reset simulator
xcrun simctl erase all

# Use specific simulator
npm run ios -- --simulator="iPhone 15"
```

### 🐛 Development Issues

#### TypeScript Errors
**Error:** Various TypeScript compilation errors

**Common Fixes:**
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Reinstall types
npm install --save-dev @types/react@^19.1.8 @types/react-native@^0.73.0
```

#### Metro Cache Issues
**Symptoms:** Changes not reflecting, build errors

**Solution:**
```bash
# Clear all caches
npx react-native start --reset-cache
rm -rf /tmp/metro-*
rm -rf node_modules/.cache
```

### 🔍 Debugging Steps

#### For Any Build Issue:
1. **Clean Everything:**
   ```bash
   # Clean all caches and builds
   rm -rf node_modules
   rm -rf ios/build
   rm -rf ios/Pods
   npm install
   cd ios && pod install
   ```

2. **Check Dependencies:**
   ```bash
   # Verify package versions
   npm ls
   
   # Check for vulnerabilities
   npm audit
   ```

3. **Test Minimal Build:**
   ```bash
   # Test with clean Metro
   npx react-native start --reset-cache
   
   # Build in another terminal
   npm run ios-device
   ```

#### For Runtime Issues:
1. **Check Console Logs:**
   - Open Xcode Console
   - Filter by device/simulator
   - Look for crash logs

2. **Debug JavaScript:**
   ```bash
   # Enable JS debugging
   npx react-native start --reset-cache
   # Shake device → Debug → Chrome DevTools
   ```

### ⚠️ Known Limitations

#### Dependencies to Avoid:
- ❌ `react-native-vision-camera` (incompatible with RN 0.80.1)
- ❌ `@react-navigation/*` (causes iOS 18.5 crashes)
- ❌ `react-native-screens` (iOS 18.5 compatibility issues)
- ❌ New Architecture packages (not stable)

#### Platform Limitations:
- ✅ iOS 15.1+ supported
- ⚠️ Android not tested (likely needs work)
- ✅ Simulator and device both work
- ✅ Xcode 15+ required

### 🛠️ Emergency Recovery

#### Complete Project Reset:
```bash
# Nuclear option - reset everything
git stash
rm -rf node_modules
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf package-lock.json

# Fresh install
npm install
cd ios && pod install
cd ..

# Test build
npm run ios-device
```

#### Restore from Working State:
```bash
# Return to last known good commit
git log --oneline -5
git reset --hard 70c467f  # Latest stable commit
npm install
cd ios && pod install
```

### 📞 When to Ask for Help

#### Escalate If:
- Build fails after complete reset
- iOS crashes with new error patterns
- Unable to run fix scripts
- Dependency conflicts can't be resolved
- New errors not covered in this guide

#### Before Escalating:
1. ✅ Tried complete clean build
2. ✅ Ran fix scripts
3. ✅ Checked recent git commits
4. ✅ Verified system requirements
5. ✅ Documented exact error messages

### 🎯 Success Indicators

#### Build Success:
- ✅ No TypeScript errors
- ✅ Metro bundler starts without errors
- ✅ iOS build completes successfully
- ✅ App launches on device/simulator
- ✅ Navigation works between screens

#### Runtime Success:
- ✅ No JavaScript bridge errors
- ✅ No crash logs in console
- ✅ Smooth navigation transitions
- ✅ UI renders correctly
- ✅ Touch interactions work

---

**Last Updated:** July 18, 2025  
**Tested On:** iOS 18.5, Xcode 16, React Native 0.80.1  
**Status:** ✅ All major issues resolved