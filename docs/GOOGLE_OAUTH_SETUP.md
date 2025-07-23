# Google OAuth Setup Guide

This guide walks you through setting up Google Sign-In for the CupNote app.

## Prerequisites

- Google Cloud Console account
- iOS app bundle ID: `com.cupnote.app`
- Access to Supabase dashboard

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable **Google Sign-In API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

### Create iOS OAuth Client

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "iOS" as Application type
4. Configure:
   - Name: `CupNote iOS`
   - Bundle ID: `com.cupnote.app`
5. Click "Create" and save the iOS Client ID

### Create Web Application OAuth Client (Required for Supabase)

1. Click "Create Credentials" → "OAuth client ID" again
2. Select "Web application" as Application type
3. Configure:
   - Name: `Coffee Journal Fresh Web (for Supabase)`
   - Authorized redirect URIs: 
     ```
     https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
     ```
4. Click "Create" and save the Web Client ID

## Step 3: Configure Supabase

1. Go to your Supabase dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable Google provider
4. Add your Web Client ID and Client Secret from Google Cloud Console
5. Save the configuration

## Step 4: Update App Configuration

1. Open `/src/config/googleAuth.ts`
2. Replace the placeholder values:
   ```typescript
   export const GOOGLE_AUTH_CONFIG = {
     // Use the Web Client ID (not iOS Client ID)
     WEB_CLIENT_ID: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     
     // Optional: iOS client ID for enhanced features
     IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
     
     // Reversed client ID for iOS URL scheme
     // Format: com.googleusercontent.apps.YOUR_CLIENT_ID_NUMBER
     REVERSED_CLIENT_ID: 'com.googleusercontent.apps.YOUR_CLIENT_ID_NUMBER',
   };
   ```

3. The REVERSED_CLIENT_ID is derived from your iOS Client ID:
   - If your iOS Client ID is: `123456789-abcdef.apps.googleusercontent.com`
   - Your REVERSED_CLIENT_ID is: `com.googleusercontent.apps.123456789-abcdef`

## Step 5: Update iOS Configuration

1. Open `/ios/CoffeeJournalFresh/Info.plist`
2. Add Google Sign-In URL scheme to existing CFBundleURLTypes:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <!-- Existing Apple Sign-In URL scheme -->
     <dict>
       <key>CFBundleURLName</key>
       <string>com.cupnote.app</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.cupnote.app</string>
       </array>
     </dict>
     <!-- Add Google Sign-In URL scheme -->
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>YOUR_REVERSED_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```

## Step 6: Rebuild the App

```bash
# Clean build
cd ios && rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/CoffeeJournalFresh-*

# Reinstall pods
pod install

# Build and run
cd ..
npx react-native run-ios
```

## Testing

1. Launch the app
2. Go to Sign In screen
3. You should see "Google로 계속하기" button (blue)
4. Tap the button to test Google Sign-In flow

## Troubleshooting

### "Google 로그인 설정 필요" Alert
- Ensure you've updated `/src/config/googleAuth.ts` with valid credentials
- Check that WEB_CLIENT_ID is from the Web application OAuth client (not iOS)

### Sign-In Fails with Network Error
- Verify Supabase Google provider is enabled
- Check that the redirect URI in Google Console matches your Supabase project URL

### iOS Build Fails
- Ensure you've run `pod install` after adding the package
- Check that Info.plist has the correct REVERSED_CLIENT_ID

## Security Notes

- Never commit actual client IDs to version control
- Use environment variables for production deployments
- The Web Client ID is safe to include in client code (it's public)
- Never expose the Client Secret (only needed in Supabase dashboard)

## Additional Resources

- [Google Sign-In iOS Documentation](https://developers.google.com/identity/sign-in/ios/start)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)