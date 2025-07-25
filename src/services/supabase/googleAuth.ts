// Google Sign-In stub - replace this when adding @react-native-google-signin/google-signin package
import { supabase } from './client';
import { GoogleAuthConfig, validateGoogleConfig, isGoogleSignInConfigured } from '@/config/googleAuth';

export interface GoogleSignInResult {
  success: boolean;
  user?: any;
  error?: string;
}

// Stub status codes
const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export class GoogleAuthService {
  private static isConfigured = false;

  /**
   * Configure Google Sign-In
   */
  static configure(): void {
    try {
      if (!isGoogleSignInConfigured()) {
        console.warn('Google Sign-In: Configuration not found. Please install @react-native-google-signin/google-signin and set environment variables.');
        return;
      }

      this.isConfigured = true;
      console.log('Google Sign-In stub configured');
    } catch (error) {
      console.error('Google Sign-In configuration failed:', error);
      throw error;
    }
  }

  /**
   * Perform Google Sign-In
   */
  static async signIn(): Promise<GoogleSignInResult> {
    console.log('Google Sign-In is not available. Please install @react-native-google-signin/google-signin package.');
    return {
      success: false,
      error: 'Google Sign-In is not installed. Please install the required package.',
    };
  }

  /**
   * Sign out from Google
   */
  static async signOut(): Promise<GoogleSignInResult> {
    try {
      // Sign out from Supabase only
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
      console.error('Sign-Out error:', error);
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
    return false;
  }

  /**
   * Get current Google user info
   */
  static async getCurrentUser(): Promise<any> {
    return null;
  }

  /**
   * Revoke access (stronger than sign out)
   */
  static async revokeAccess(): Promise<GoogleSignInResult> {
    try {
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
      console.error('Revoke access error:', error);
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
    return null;
  }
}