# Google OAuth Setup Steps - CupNote

## Current Status ✅
- ✅ Google Sign-In package installed (@react-native-google-signin/google-signin)
- ✅ Info.plist configured with GOOGLE_REVERSED_CLIENT_ID placeholder
- ✅ CocoaPods dependencies installed
- ⏳ Google Cloud Console setup needed
- ⏳ Environment variables needed

## Step-by-Step Instructions

### 1. Google Cloud Console Setup (15 minutes)

1. **Go to Google Cloud Console**
   - Open: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Project name: `CupNote`
   - Click "Create"

3. **Configure OAuth Consent Screen**
   - Navigate to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in:
     ```
     App name: CupNote
     User support email: [Your email]
     Developer contact: [Your email]
     ```
   - Add scopes: `openid`, `profile`, `email`
   - Add your email as a test user
   - Save and continue

4. **Enable Google Sign-In API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sign-In API"
   - Click and enable it

5. **Create iOS OAuth Client**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **iOS**
   - Name: `CupNote iOS`
   - Bundle ID: `com.cupnote.app`
   - Click "Create"
   - **COPY THE CLIENT ID** (format: 123456789-xxxxx.apps.googleusercontent.com)

6. **Create Web OAuth Client (for Supabase)**
   - Click "Create Credentials" → "OAuth client ID" again
   - Application type: **Web application**
   - Name: `CupNote Web`
   - Authorized redirect URIs:
     ```
     https://iyccdzymklcedzzikwhv.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - **COPY BOTH CLIENT ID AND CLIENT SECRET**

### 2. Update Environment Variables (2 minutes)

Edit your `.env` file and uncomment/update these lines:

```bash
# Google OAuth Configuration
GOOGLE_OAUTH_IOS_CLIENT_ID=[YOUR_IOS_CLIENT_ID_HERE]
GOOGLE_OAUTH_WEB_CLIENT_ID=[YOUR_WEB_CLIENT_ID_HERE]
```

Example:
```bash
GOOGLE_OAUTH_IOS_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=987654321-ghijkl.apps.googleusercontent.com
```

### 3. Configure Supabase (5 minutes)

1. **Go to Supabase Dashboard**
   - https://app.supabase.com/project/iyccdzymklcedzzikwhv/auth/providers

2. **Enable Google Provider**
   - Find "Google" in the providers list
   - Toggle it ON
   - Add:
     - Client ID: [Your Web Client ID from step 6]
     - Client Secret: [Your Web Client Secret from step 6]
   - Click "Save"

### 4. Configure Xcode (5 minutes)

1. **Open Xcode**
   ```bash
   open ios/CupNote.xcworkspace
   ```

2. **Add GOOGLE_REVERSED_CLIENT_ID**
   - Select "CupNote" project in navigator
   - Select "CupNote" target
   - Go to "Build Settings" tab
   - Click "+" → "Add User-Defined Setting"
   - Name: `GOOGLE_REVERSED_CLIENT_ID`
   - Value: `com.googleusercontent.apps.[YOUR_IOS_CLIENT_ID_NUMBER]`
   
   Example: If your iOS client ID is `123456789-abcdef.apps.googleusercontent.com`
   Then GOOGLE_REVERSED_CLIENT_ID = `com.googleusercontent.apps.123456789-abcdef`

### 5. Test the Integration (5 minutes)

1. **Rebuild the app**
   ```bash
   npx react-native run-ios
   ```

2. **Test Google Sign-In**
   - Open the app
   - Go to Sign In screen
   - Tap "Continue with Google"
   - Should open Google sign-in flow

## Troubleshooting

### "OAuth client not found" Error
- Verify the iOS client ID in .env matches Google Cloud Console
- Ensure GOOGLE_REVERSED_CLIENT_ID in Xcode is correct

### "This app isn't verified" Warning
- Normal for development
- Make sure your email is added as a test user in OAuth consent screen

### Build Errors
- Clean build: `cd ios && rm -rf build && cd ..`
- Reset pods: `cd ios && pod deintegrate && pod install && cd ..`

## Quick Checklist

- [ ] Created Google Cloud Project
- [ ] Configured OAuth consent screen
- [ ] Created iOS OAuth client
- [ ] Created Web OAuth client (for Supabase)
- [ ] Updated .env with both client IDs
- [ ] Configured Supabase Google provider
- [ ] Added GOOGLE_REVERSED_CLIENT_ID to Xcode
- [ ] Tested Google Sign-In flow

## Need Help?

The full guide is available at: `docs/GOOGLE_CLOUD_SETUP_GUIDE.md`

Once you complete these steps, Google Sign-In will be fully functional!