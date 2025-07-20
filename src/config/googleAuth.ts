// Google OAuth Configuration
// To set up Google Sign-In:
// 1. Go to https://console.cloud.google.com
// 2. Create a new project or select existing one
// 3. Enable Google Sign-In API
// 4. Create OAuth 2.0 credentials (iOS type)
// 5. Download the configuration file
// 6. Replace the placeholder values below

export const GOOGLE_AUTH_CONFIG = {
  // Web client ID from Google Cloud Console
  // This is the OAuth 2.0 Client ID of type "Web application"
  WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  
  // iOS client ID (optional, for iOS-specific features)
  IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  
  // Reversed client ID for iOS URL scheme
  // Format: com.googleusercontent.apps.YOUR_CLIENT_ID
  REVERSED_CLIENT_ID: process.env.GOOGLE_REVERSED_CLIENT_ID || 'com.googleusercontent.apps.YOUR_CLIENT_ID',
};

// Validation function
export const validateGoogleConfig = (): boolean => {
  const { WEB_CLIENT_ID, REVERSED_CLIENT_ID } = GOOGLE_AUTH_CONFIG;
  
  if (WEB_CLIENT_ID.includes('YOUR_') || REVERSED_CLIENT_ID.includes('YOUR_')) {
    console.warn('Google Sign-In: Configuration not set. Please update googleAuth.ts with your credentials.');
    return false;
  }
  
  return true;
};