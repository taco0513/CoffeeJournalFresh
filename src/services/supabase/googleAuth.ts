import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';
import { GoogleAuthConfig, validateGoogleConfig, isGoogleSignInConfigured } from '@/config/googleAuth';

export interface GoogleSignInResult {
  success: boolean;
  user?: any;
  error?: string;
}

export class GoogleAuthService {
  private static isConfigured = false;

  /**
   * Configure Google Sign-In
   */
  static configure(): void {
    try {
      if (!isGoogleSignInConfigured()) {
        console.warn('Google Sign-In: Configuration not found. Please set environment variables.');
        return;
      }

      GoogleSignin.configure({
        iosClientId: GoogleAuthConfig.iosClientId,
        webClientId: GoogleAuthConfig.webClientId,
        offlineAccess: GoogleAuthConfig.offlineAccess,
        hostedDomain: GoogleAuthConfig.hostedDomain,
        forceCodeForRefreshToken: GoogleAuthConfig.forceCodeForRefreshToken,
      });

      this.isConfigured = true;
      console.log('Google Sign-In configured successfully');
    } catch (error) {
      console.error('Google Sign-In configuration failed:', error);
      throw error;
    }
  }

  /**
   * Perform Google Sign-In
   */
  static async signIn(): Promise<GoogleSignInResult> {
    try {
      if (!this.isConfigured) {
        this.configure();
      }

      if (!isGoogleSignInConfigured()) {
        return {
          success: false,
          error: 'Google Sign-In is not configured. Please set OAuth credentials.',
        };
      }

      // Check if device has Google Play Services (Android) or is supported (iOS)
      await GoogleSignin.hasPlayServices();

      // Perform sign-in
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.idToken) {
        return {
          success: false,
          error: 'Google Sign-In failed: No ID token received',
        };
      }

      // Sign in to Supabase with Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken,
      });

      if (error) {
        console.error('Supabase Google Sign-In error:', error);
        return {
          success: false,
          error: `Authentication failed: ${error.message}`,
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      let errorMessage = 'Google Sign-In failed';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in is already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sign out from Google
   */
  static async signOut(): Promise<GoogleSignInResult> {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Google Sign-Out error:', error);
      return {
        success: false,
        error: error.message || 'Sign-out failed',
      };
    }
  }

  /**
   * Check if user is signed in to Google
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      if (!this.isConfigured || !isGoogleSignInConfigured()) {
        return false;
      }
      
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Google Sign-In status check failed:', error);
      return false;
    }
  }

  /**
   * Get current Google user info
   */
  static async getCurrentUser(): Promise<any> {
    try {
      if (!this.isConfigured || !isGoogleSignInConfigured()) {
        return null;
      }

      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.error('Get current Google user failed:', error);
      return null;
    }
  }

  /**
   * Revoke access (stronger than sign out)
   */
  static async revokeAccess(): Promise<GoogleSignInResult> {
    try {
      await GoogleSignin.revokeAccess();
      
      // Also sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Google revoke access error:', error);
      return {
        success: false,
        error: error.message || 'Revoke access failed',
      };
    }
  }

  /**
   * Get available scopes
   */
  static async getTokens(): Promise<any> {
    try {
      if (!this.isConfigured || !isGoogleSignInConfigured()) {
        return null;
      }

      const tokens = await GoogleSignin.getTokens();
      return tokens;
    } catch (error) {
      console.error('Get Google tokens failed:', error);
      return null;
    }
  }
}