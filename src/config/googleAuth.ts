// Google OAuth Configuration
// To set up Google Sign-In:
// 1. Go to https://console.cloud.google.com
// 2. Create a new project or select existing one
// 3. Enable Google Sign-In API
// 4. Create OAuth 2.0 credentials (iOS type)
// 5. Download the configuration file
// 6. Replace the placeholder values below

export const GoogleAuthConfig = {
  // iOS client ID from Google Cloud Console
  // This is the OAuth 2.0 Client ID of type "iOS"
  iosClientId: process.env.GOOGLE_OAUTH_IOS_CLIENT_ID || '',
  
  // Web client ID from Google Cloud Console
  // This is the OAuth 2.0 Client ID of type "Web application"
  webClientId: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID || '',
  
  // Android client ID from Google Cloud Console
  // This is the OAuth 2.0 Client ID of type "Android"
  androidClientId: process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID || '',
  
  // Configuration settings
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
};

// Legacy export for backward compatibility
export const GOOGLE_AUTH_CONFIG = {
  WEB_CLIENT_ID: GoogleAuthConfig.webClientId,
  IOS_CLIENT_ID: GoogleAuthConfig.iosClientId,
  REVERSED_CLIENT_ID: GoogleAuthConfig.iosClientId 
    ? `com.googleusercontent.apps.${GoogleAuthConfig.iosClientId.split('.')[0]}`
    : '',
};

// Validation function
export const validateGoogleConfig = (): boolean => {
  const { iosClientId, webClientId } = GoogleAuthConfig;
  
  if (!iosClientId && !webClientId) {
    console.warn('Google Sign-In: No client IDs configured. Please set GOOGLE_OAUTH_IOS_CLIENT_ID or GOOGLE_OAUTH_WEB_CLIENT_ID environment variables.');
    return false;
  }
  
  return true;
};

// Check if Google Sign-In is properly configured
export const isGoogleSignInConfigured = (): boolean => {
  return !!(GoogleAuthConfig.iosClientId || GoogleAuthConfig.webClientId);
};