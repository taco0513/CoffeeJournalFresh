import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase/client';
import { GoogleAuthConfig, isGoogleSignInConfigured } from '@/config/googleAuth';

export interface FirebaseAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  needsProfileUpdate?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'email' | 'google' | 'apple';
  firebase_uid?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Firebase Authentication Service
 * Integrates Firebase Auth with Supabase for unified user management
 */
export class FirebaseAuthService {
  private static isConfigured = false;

  /**
   * Initialize Firebase Auth and Google Sign-In
   */
  static async initialize(): Promise<void> {
    try {
      if (!isGoogleSignInConfigured()) {
        console.warn('Firebase Auth: Google Sign-In not configured');
        return;
      }

      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: GoogleAuthConfig.webClientId,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });

      this.isConfigured = true;
      console.log('Firebase Auth initialized successfully');
    } catch (error) {
      console.error('Firebase Auth initialization failed:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google using Firebase Auth + Supabase
   */
  static async signInWithGoogle(): Promise<FirebaseAuthResult> {
    try {
      if (!this.isConfigured) {
        await this.initialize();
      }

      if (!isGoogleSignInConfigured()) {
        return {
          success: false,
          error: 'Google Sign-In is not configured. Please set OAuth credentials.',
        };
      }

      // Check if device has Google Play Services
      await GoogleSignin.hasPlayServices();

      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();

      if (!idToken) {
        return {
          success: false,
          error: 'Google Sign-In failed: No ID token received',
        };
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the Google credential
      const firebaseResult = await auth().signInWithCredential(googleCredential);
      
      if (!firebaseResult.user) {
        return {
          success: false,
          error: 'Firebase authentication failed',
        };
      }

      // Get Firebase ID token for Supabase
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      // Sign in to Supabase using Firebase custom token
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: firebaseIdToken,
      });

      if (supabaseError) {
        console.error('Supabase authentication failed:', supabaseError);
        return {
          success: false,
          error: `Authentication failed: ${supabaseError.message}`,
        };
      }

      // Create or update user profile in Supabase
      const profileResult = await this.syncUserProfile(firebaseResult.user, 'google');

      return {
        success: true,
        user: supabaseData.user,
        needsProfileUpdate: profileResult.needsUpdate,
      };
    } catch (error: any) {
      console.error('Google Sign-In with Firebase error:', error);
      
      let errorMessage = 'Google Sign-In failed';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different sign-in method';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials. Please try again';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
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
   * Sign out from both Firebase and Supabase
   */
  static async signOut(): Promise<FirebaseAuthResult> {
    try {
      // Sign out from Google
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }

      // Sign out from Firebase
      await auth().signOut();

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
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  /**
   * Revoke access completely
   */
  static async revokeAccess(): Promise<FirebaseAuthResult> {
    try {
      // Revoke Google access
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.revokeAccess();
      }

      // Delete Firebase user
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.delete();
      }

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
   * Sync user profile between Firebase and Supabase
   */
  private static async syncUserProfile(
    firebaseUser: any,
    provider: 'google' | 'apple' | 'email'
  ): Promise<{ success: boolean; needsUpdate: boolean }> {
    try {
      const userProfile: Partial<UserProfile> = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar_url: firebaseUser.photoURL,
        provider,
        updated_at: new Date().toISOString(),
      };

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        return { success: false, needsUpdate: false };
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(userProfile)
          .eq('firebase_uid', firebaseUser.uid);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return { success: false, needsUpdate: true };
        }

        return { success: true, needsUpdate: false };
      } else {
        // Create new profile
        const newProfile = {
          ...userProfile,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return { success: false, needsUpdate: true };
        }

        return { success: true, needsUpdate: false };
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
      return { success: false, needsUpdate: true };
    }
  }

  /**
   * Get current Firebase user
   */
  static getCurrentFirebaseUser() {
    return auth().currentUser;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const firebaseUser = auth().currentUser;
      const { data: supabaseSession } = await supabase.auth.getSession();
      
      return !!(firebaseUser && supabaseSession.session);
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Refresh authentication tokens
   */
  static async refreshTokens(): Promise<FirebaseAuthResult> {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        return {
          success: false,
          error: 'No authenticated user found',
        };
      }

      // Force refresh Firebase token
      const firebaseToken = await currentUser.getIdToken(true);

      // Refresh Supabase session
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Set up auth state change listener
   */
  static onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }
}