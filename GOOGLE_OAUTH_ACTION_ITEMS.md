# Google OAuth Setup - Action Items

## 🎯 What You Need to Do

### 1. Google Cloud Console (15 minutes)
1. Go to https://console.cloud.google.com
2. Create a new project called "Coffee Journal Fresh"
3. Configure OAuth consent screen (External type)
4. Enable "Google Sign-In API"
5. Create **TWO** OAuth clients:
   - **iOS client**: Bundle ID = `com.brianjin.CoffeeJournalFresh`
   - **Web client**: Redirect URI = `https://iyccdzymklcedzzikwhv.supabase.co/auth/v1/callback`

### 2. Copy Your Credentials
After creating the OAuth clients, you'll get:
- iOS Client ID: `[number]-[string].apps.googleusercontent.com`
- Web Client ID: `[number]-[string].apps.googleusercontent.com`
- Web Client Secret: `[string]` (only for web client)

### 3. Update .env File
```bash
# Replace these lines in your .env file:
GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID_HERE
GOOGLE_OAUTH_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```

### 4. Configure Supabase
1. Go to: https://app.supabase.com/project/iyccdzymklcedzzikwhv/auth/providers
2. Enable Google provider
3. Add your Web Client ID and Secret

### 5. Configure Xcode
1. Open: `open ios/CoffeeJournalFresh.xcworkspace`
2. Add User-Defined Setting: `GOOGLE_REVERSED_CLIENT_ID`
3. Value: `com.googleusercontent.apps.[YOUR_IOS_CLIENT_NUMBER]`

### 6. Test
```bash
npx react-native run-ios
```

## 📋 Quick Copy-Paste Template

Once you have your credentials, use this template for .env:

```bash
# Google OAuth Configuration
GOOGLE_OAUTH_IOS_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=987654321-qrstuvwxyzabcdef.apps.googleusercontent.com
```

## ⏱️ Estimated Time: 30 minutes total

## 🚨 Important Notes
- The iOS client ID goes in .env AND Xcode
- The Web client ID/Secret goes in .env AND Supabase
- Your Supabase project ID is: `iyccdzymklcedzzikwhv`
- Test with your email first (add as test user in Google Console)

## ✅ Success Indicators
- Google Sign-In button appears on login screen
- Clicking it opens Google's auth flow
- After auth, user is logged into the app
- User data appears in Supabase dashboard

Need help? The full guide is at: `docs/GOOGLE_CLOUD_SETUP_GUIDE.md`