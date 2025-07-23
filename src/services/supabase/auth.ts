import { supabase } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorHandler } from '../../utils/errorHandler';
import NetworkUtils from '../../utils/NetworkUtils';
import { AuthLogger, logError, PerformanceTimer } from '../../utils/logger';

const AUTH_STORAGE_KEY = '@coffee_journal_auth';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
}

class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await NetworkUtils.retry(
        async () => {
          const result = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (result.error) {
            const authError = new Error(result.error.message);
            (authError as any).code = 'AUTH_ERROR';
            throw authError;
          }
          
          return result;
        },
        {
          maxRetries: 2,
          onRetry: (attempt, error) => {
            AuthLogger.warn(`Retrying sign up (attempt ${attempt})`, {
              function: 'signUp',
              error,
              attempt,
              email
            });
          }
        }
      );
      
      if (error) {
        const authError = new Error((error as any).message || 'Sign up failed');
        (authError as any).code = 'AUTH_ERROR';
        throw authError;
      }
      if (!data.user) {
        const authError = new Error('No user returned from signup');
        (authError as any).code = 'AUTH_ERROR';
        throw authError;
      }
      
      // Store auth state
      await this.saveAuthState(data.user.id);
      
      return {
        id: data.user.id,
        email: data.user.email,
      };
    } catch (error: any) {
      if (error.message?.includes('fetch')) {
        error.code = 'NETWORK_ERROR';
      }
      throw error;
    }
  }
  
  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await NetworkUtils.retry(
        async () => {
          const result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (result.error) throw result.error;
          if (!result.data.user) throw new Error('No user returned from signin');
          
          return result;
        },
        {
          maxRetries: 2,
          onRetry: (attempt, error) => {
            console.log(`[Auth] Retrying sign in (attempt ${attempt}):`, error.message);
          }
        }
      );
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signin');
      
      // Store auth state
      await this.saveAuthState(data.user.id);
      
      return {
        id: data.user.id,
        email: data.user.email,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear auth state
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email || undefined,
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
  
  /**
   * Restore auth session on app startup
   */
  async restoreSession(): Promise<AuthUser | null> {
    try {
      const storedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedUserId) return null;
      
      // Verify session is still valid
      const user = await this.getCurrentUser();
      if (!user || user.id !== storedUserId) {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      
      return user;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.saveAuthState(session.user.id);
        callback({
          id: session.user.id,
          email: session.user.email || undefined,
        });
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        callback(null);
      }
    });
  }
  
  /**
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'coffeejournalapp://reset-password',
      });
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }
  
  private async saveAuthState(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, userId);
    } catch (error) {
    }
  }
}

export default AuthService.getInstance();