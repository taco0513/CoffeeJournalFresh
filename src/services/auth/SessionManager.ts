import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../supabase/supabase';
import { SecureStorage } from './SecureStorage';
import { BiometricAuth } from './BiometricAuth';

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: any;
  provider: 'email' | 'google' | 'apple';
  createdAt: number;
  lastRefresh: number;
  deviceFingerprint: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  shouldReauthenticate: boolean;
  error?: string;
}

export interface SessionManagerConfig {
  autoRefreshEnabled: boolean;
  refreshThresholdMinutes: number;
  maxInactiveMinutes: number;
  requireBiometricOnResume: boolean;
  sessionTimeoutMinutes: number;
  deviceFingerprintValidation: boolean;
}

/**
 * Session Manager
 * Handles session lifecycle, automatic refresh, validation, and security
 */
export class SessionManager {
  private static instance: SessionManager;
  private static readonly SESSION_KEY = 'user_session_v2';
  private static readonly CONFIG_KEY = 'session_config_v2';
  
  private currentSession: SessionData | null = null;
  private refreshTimer?: NodeJS.Timeout;
  private validationTimer?: NodeJS.Timeout;
  private appStateSubscription?: any;
  private lastActiveTime: number = Date.now();
  private config: SessionManagerConfig;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session manager
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Load configuration
      await this.loadConfig();

      // Load existing session
      await this.loadSession();

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      // Start session monitoring
      this.startSessionMonitoring();

      // Validate current session
      if (this.currentSession) {
        await this.validateSession();
      }

      this.isInitialized = true;
      console.log('SessionManager initialized successfully');
    } catch (error) {
      console.error('SessionManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create and store a new session
   */
  async createSession(
    user: any,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
    provider: 'email' | 'google' | 'apple'
  ): Promise<void> {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint();
      
      const sessionData: SessionData = {
        accessToken,
        refreshToken,
        expiresAt,
        user,
        provider,
        createdAt: Date.now(),
        lastRefresh: Date.now(),
        deviceFingerprint,
      };

      this.currentSession = sessionData;
      await this.storeSession(sessionData);
      
      // Start monitoring this session
      this.startSessionMonitoring();
      
      console.log('Session created successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        await this.loadSession();
      }

      if (!this.currentSession) {
        return false;
      }

      const validation = await this.validateSession();
      return validation.isValid;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Refresh session if needed
   */
  async refreshSessionIfNeeded(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        return false;
      }

      const validation = await this.validateSession();
      
      if (validation.needsRefresh) {
        return await this.refreshSession();
      }

      return validation.isValid;
    } catch (error) {
      console.error('Session refresh check failed:', error);
      return false;
    }
  }

  /**
   * Force refresh session
   */
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        return false;
      }

      console.log('Refreshing session...');

      // Use Supabase to refresh the session
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.currentSession.refreshToken,
      });

      if (error || !data.session) {
        console.error('Session refresh failed:', error);
        await this.clearSession();
        return false;
      }

      // Update session data
      this.currentSession = {
        ...this.currentSession,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at || 0).getTime(),
        user: data.user,
        lastRefresh: Date.now(),
      };

      await this.storeSession(this.currentSession);
      console.log('Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      await this.clearSession();
      return false;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<SessionValidationResult> {
    try {
      if (!this.currentSession) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldReauthenticate: true,
          error: 'No session found',
        };
      }

      const now = Date.now();
      const expiresAt = this.currentSession.expiresAt;
      const refreshThreshold = this.config.refreshThresholdMinutes * 60 * 1000;
      const sessionTimeout = this.config.sessionTimeoutMinutes * 60 * 1000;
      const maxInactive = this.config.maxInactiveMinutes * 60 * 1000;

      // Check if session has expired
      if (now >= expiresAt) {
        return {
          isValid: false,
          needsRefresh: true,
          shouldReauthenticate: false,
          error: 'Session expired',
        };
      }

      // Check if session needs refresh soon
      const needsRefresh = (expiresAt - now) <= refreshThreshold;

      // Check session timeout
      if (sessionTimeout > 0 && (now - this.currentSession.createdAt) >= sessionTimeout) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldReauthenticate: true,
          error: 'Session timeout reached',
        };
      }

      // Check inactivity timeout
      if (maxInactive > 0 && (now - this.lastActiveTime) >= maxInactive) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldReauthenticate: true,
          error: 'Maximum inactivity time exceeded',
        };
      }

      // Validate device fingerprint if enabled
      if (this.config.deviceFingerprintValidation) {
        const currentFingerprint = await this.generateDeviceFingerprint();
        if (currentFingerprint !== this.currentSession.deviceFingerprint) {
          return {
            isValid: false,
            needsRefresh: false,
            shouldReauthenticate: true,
            error: 'Device fingerprint mismatch',
          };
        }
      }

      // Validate with Supabase
      const { data, error } = await supabase.auth.getUser(this.currentSession.accessToken);
      
      if (error || !data.user) {
        return {
          isValid: false,
          needsRefresh: true,
          shouldReauthenticate: false,
          error: 'Token validation failed',
        };
      }

      return {
        isValid: true,
        needsRefresh,
        shouldReauthenticate: false,
      };
    } catch (error) {
      console.error('Session validation failed:', error);
      return {
        isValid: false,
        needsRefresh: false,
        shouldReauthenticate: true,
        error: 'Validation error',
      };
    }
  }

  /**
   * Clear session and clean up
   */
  async clearSession(): Promise<void> {
    try {
      this.currentSession = null;
      await SecureStorage.removeItem(SessionManager.SESSION_KEY);
      this.stopSessionMonitoring();
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Update session configuration
   */
  async updateConfig(newConfig: Partial<SessionManagerConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
      await this.storeConfig();
      
      // Restart monitoring with new config
      this.stopSessionMonitoring();
      this.startSessionMonitoring();
      
      console.log('Session config updated');
    } catch (error) {
      console.error('Failed to update session config:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SessionManagerConfig {
    return { ...this.config };
  }

  /**
   * Update last activity time
   */
  updateActivity(): void {
    this.lastActiveTime = Date.now();
  }

  /**
   * Handle app resume - may require biometric authentication
   */
  async handleAppResume(): Promise<boolean> {
    try {
      this.updateActivity();

      if (!this.currentSession) {
        return false;
      }

      // Check if biometric authentication is required
      if (this.config.requireBiometricOnResume) {
        const biometricResult = await BiometricAuth.authenticate(
          '앱에 다시 접근하기 위해 생체 인증이 필요합니다.'
        );

        if (!biometricResult.success) {
          await this.clearSession();
          return false;
        }
      }

      // Validate and refresh session if needed
      return await this.refreshSessionIfNeeded();
    } catch (error) {
      console.error('App resume handling failed:', error);
      return false;
    }
  }

  /**
   * Load session from secure storage
   */
  private async loadSession(): Promise<void> {
    try {
      const result = await SecureStorage.getAuthData(SessionManager.SESSION_KEY);
      
      if (result.success && result.data) {
        this.currentSession = result.data;
        console.log('Session loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  /**
   * Store session to secure storage
   */
  private async storeSession(sessionData: SessionData): Promise<void> {
    try {
      await SecureStorage.storeAuthData(
        SessionManager.SESSION_KEY,
        sessionData,
        this.config.requireBiometricOnResume
      );
    } catch (error) {
      console.error('Failed to store session:', error);
      throw error;
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await SecureStorage.getItem(SessionManager.CONFIG_KEY);
      
      if (result.success && result.value) {
        const storedConfig = JSON.parse(result.value);
        this.config = { ...this.getDefaultConfig(), ...storedConfig };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Store configuration
   */
  private async storeConfig(): Promise<void> {
    try {
      await SecureStorage.setItem(
        SessionManager.CONFIG_KEY,
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.error('Failed to store config:', error);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): SessionManagerConfig {
    return {
      autoRefreshEnabled: true,
      refreshThresholdMinutes: 5, // Refresh 5 minutes before expiry
      maxInactiveMinutes: 30, // 30 minutes of inactivity
      requireBiometricOnResume: false,
      sessionTimeoutMinutes: 0, // 0 = no timeout
      deviceFingerprintValidation: true,
    };
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    if (!this.config.autoRefreshEnabled) {
      return;
    }

    // Clear existing timers
    this.stopSessionMonitoring();

    // Set up refresh timer (check every minute)
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshSessionIfNeeded();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 60000);

    // Set up validation timer (check every 5 minutes)
    this.validationTimer = setInterval(async () => {
      try {
        const validation = await this.validateSession();
        if (!validation.isValid && validation.shouldReauthenticate) {
          await this.clearSession();
        }
      } catch (error) {
        console.error('Session validation failed:', error);
      }
    }, 300000);
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = undefined;
    }
  }

  /**
   * Set up app state monitoring
   */
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  /**
   * Handle app state changes
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    try {
      if (nextAppState === 'active') {
        await this.handleAppResume();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - update last active time
        this.updateActivity();
      }
    } catch (error) {
      console.error('App state change handling failed:', error);
    }
  }

  /**
   * Generate device fingerprint for security
   */
  private async generateDeviceFingerprint(): Promise<string> {
    try {
      // This is a simple implementation - in production, you might want to use
      // device-specific identifiers like device ID, app version, etc.
      const fingerprint = [
        'CoffeeJournalFresh',
        '1.0.0', // App version
        Date.now().toString().substring(0, 10), // Day-level timestamp for some variability
      ].join('|');

      return fingerprint;
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error);
      return 'unknown_device';
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopSessionMonitoring();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = undefined;
    }
    
    this.currentSession = null;
    this.isInitialized = false;
  }
}