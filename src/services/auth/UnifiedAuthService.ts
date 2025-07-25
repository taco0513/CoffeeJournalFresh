import { Alert } from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase/client';
import { GoogleAuthConfig, isGoogleSignInConfigured } from '../../config/googleAuth';
import { SecureStorage } from './SecureStorage';
import { BiometricAuth } from './BiometricAuth';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresBiometric?: boolean;
  needsProfileUpdate?: boolean;
}

export interface UserSession {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  provider: 'email' | 'google' | 'apple';
}

export interface AuthOptions {
  enableBiometric?: boolean;
  rememberMe?: boolean;
  skipEmailVerification?: boolean;
}

/**
 * Unified Authentication Service
 * Handles all authentication methods with enhanced security and error handling
 */
export class UnifiedAuthService {
  private static isInitialized = false;
  private static sessionCheckInterval?: NodeJS.Timeout;

  /**
   * Initialize the authentication service
   */
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Initialize Google Sign-In if configured
      if (isGoogleSignInConfigured()) {
        GoogleSignin.configure({
          webClientId: GoogleAuthConfig.webClientId,
          iosClientId: GoogleAuthConfig.iosClientId,
          offlineAccess: GoogleAuthConfig.offlineAccess,
          hostedDomain: GoogleAuthConfig.hostedDomain,
          forceCodeForRefreshToken: GoogleAuthConfig.forceCodeForRefreshToken,
        });
      }

      // Initialize secure storage
      await SecureStorage.initialize();

      // Initialize biometric authentication
      await BiometricAuth.initialize();

      // Set up session monitoring
      this.startSessionMonitoring();

      this.isInitialized = true;
      console.log('UnifiedAuthService initialized successfully');
    } catch (error) {
      console.error('UnifiedAuthService initialization failed:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(
    email: string,
    password: string,
    options: AuthOptions = {}
  ): Promise<AuthResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        return {
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.',
        };
      }

      // Check if biometric authentication is required and available
      if (options.enableBiometric && await BiometricAuth.isAvailable()) {
        const biometricResult = await BiometricAuth.authenticate();
        if (!biometricResult.success) {
          return {
            success: false,
            error: biometricResult.error || '생체 인증이 필요합니다.',
            requiresBiometric: true,
          };
        }
      }

      // Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return this.handleAuthError(error, 'email');
      }

      if (!data.user) {
        return {
          success: false,
          error: '로그인에 실패했습니다. 다시 시도해주세요.',
        };
      }

      // Store session securely if remember me is enabled
      if (options.rememberMe && data.session) {
        await this.storeSession({
          user: data.user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at || 0).getTime(),
          provider: 'email',
        });
      }

      // Store biometric preference
      if (options.enableBiometric) {
        await SecureStorage.setItem('biometric_enabled', 'true');
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error, 'email'),
      };
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(options: AuthOptions = {}): Promise<AuthResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!isGoogleSignInConfigured()) {
        return {
          success: false,
          error: 'Google 로그인이 설정되지 않았습니다. 개발자에게 문의해주세요.',
        };
      }

      // Check Google Play Services
      await GoogleSignin.hasPlayServices();

      // Get Google user info
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.idToken) {
        return {
          success: false,
          error: 'Google 인증 토큰을 받을 수 없습니다.',
        };
      }

      // Sign in to Supabase with Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken,
      });

      if (error) {
        return this.handleAuthError(error, 'google');
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Google 로그인에 실패했습니다.',
        };
      }

      // Store session if remember me is enabled
      if (options.rememberMe && data.session) {
        await this.storeSession({
          user: data.user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at || 0).getTime(),
          provider: 'google',
        });
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      if (error.code === '-5' || error.message?.includes('cancelled')) { // User cancelled
        return {
          success: false,
          error: '로그인이 취소되었습니다.',
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(error, 'google'),
      };
    }
  }

  /**
   * Sign in with Apple
   */
  static async signInWithApple(options: AuthOptions = {}): Promise<AuthResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const isSupported = await appleAuth.isSupported;
      if (!isSupported) {
        return {
          success: false,
          error: 'Apple 로그인은 이 기기에서 지원되지 않습니다.',
        };
      }

      // Perform Apple authentication
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        return {
          success: false,
          error: 'Apple 인증 토큰을 받을 수 없습니다.',
        };
      }

      // Sign in to Supabase with Apple token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken,
      });

      if (error) {
        return this.handleAuthError(error, 'apple');
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Apple 로그인에 실패했습니다.',
        };
      }

      // Store session if remember me is enabled
      if (options.rememberMe && data.session) {
        await this.storeSession({
          user: data.user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at || 0).getTime(),
          provider: 'apple',
        });
      }

      return {
        success: true,
        user: data.user,
        needsProfileUpdate: !data.user.user_metadata?.full_name,
      };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error, 'apple'),
      };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
    options: AuthOptions = {}
  ): Promise<AuthResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        return {
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.',
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error: '비밀번호는 8자 이상이어야 합니다.',
        };
      }

      // Attempt Supabase sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return this.handleAuthError(error, 'signup');
      }

      if (!data.user) {
        return {
          success: false,
          error: '회원가입에 실패했습니다. 다시 시도해주세요.',
        };
      }

      // Check if email confirmation is required
      if (!data.session && !options.skipEmailVerification) {
        return {
          success: true,
          user: data.user,
          error: '이메일 확인이 필요합니다. 받은 메일을 확인해주세요.',
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error, 'signup'),
      };
    }
  }

  /**
   * Sign out from all services
   */
  static async signOut(): Promise<AuthResult> {
    try {
      // Sign out from Google if signed in
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear stored session
      await this.clearStoredSession();

      // Stop session monitoring
      this.stopSessionMonitoring();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Sign out failed',
      };
    }
  }

  /**
   * Refresh the current session
   */
  static async refreshSession(): Promise<AuthResult> {
    try {
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
      console.error('Session refresh error:', error);
      return {
        success: false,
        error: 'Session refresh failed',
      };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<UserSession | null> {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session && data.session.user) {
        return {
          user: data.session.user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at || 0).getTime(),
          provider: (data.session.user.app_metadata?.provider as 'email' | 'google' | 'apple') || 'email',
        };
      }

      return null;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return !!session && session.expiresAt > Date.now();
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

      if (error) {
        return this.handleAuthError(error, 'reset');
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Password reset failed',
      };
    }
  }

  /**
   * Store session securely
   */
  private static async storeSession(session: UserSession): Promise<void> {
    try {
      await SecureStorage.setItem('user_session', JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Clear stored session
   */
  private static async clearStoredSession(): Promise<void> {
    try {
      await SecureStorage.removeItem('user_session');
      await SecureStorage.removeItem('biometric_enabled');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Start session monitoring
   */
  private static startSessionMonitoring(): void {
    this.sessionCheckInterval = setInterval(async () => {
      try {
        const session = await this.getCurrentSession();
        if (session && session.expiresAt <= Date.now() + 5 * 60 * 1000) { // 5 minutes before expiry
          await this.refreshSession();
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop session monitoring
   */
  private static stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = undefined;
    }
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private static handleAuthError(error: any, provider: string): AuthResult {
    console.error(`${provider} auth error:`, error);

    let errorMessage = '로그인에 실패했습니다.';

    switch (error.message || error.error_description) {
      case 'Invalid login credentials':
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        break;
      case 'Email not confirmed':
        errorMessage = '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
        break;
      case 'User already registered':
        errorMessage = '이미 가입된 이메일입니다.';
        break;
      case 'Password should be at least 6 characters':
        errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
        break;
      case 'Invalid email':
        errorMessage = '올바른 이메일 주소를 입력해주세요.';
        break;
      case 'Too many requests':
        errorMessage = '너무 많은 시도로 인해 잠시 후 다시 시도해주세요.';
        break;
      default:
        if (error.message?.includes('network')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: any, context: string): string {
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }

    if (error.message?.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    switch (context) {
      case 'google':
        return 'Google 로그인에 실패했습니다. 다시 시도해주세요.';
      case 'apple':
        return 'Apple 로그인에 실패했습니다. 다시 시도해주세요.';
      case 'email':
        return '이메일 로그인에 실패했습니다. 다시 시도해주세요.';
      case 'signup':
        return '회원가입에 실패했습니다. 다시 시도해주세요.';
      default:
        return '인증에 실패했습니다. 다시 시도해주세요.';
    }
  }
}