import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../supabase/client';
import { SecureStorage } from './SecureStorage';
import { BiometricAuth } from './BiometricAuth';

import { Logger } from '../LoggingService';
export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: unknown;
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
  private appStateSubscription?: unknown;
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
      Logger.debug('SessionManager initialized successfully', 'auth', { component: 'SessionManager' });
  } catch (error) {
      Logger.error('SessionManager initialization failed:', 'auth', { component: 'SessionManager', error: error });
      throw error;
  }
}

  /**
   * Create and store a new session
   */
  async createSession(
    user: unknown,
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
      
      Logger.debug('Session created successfully', 'auth', { component: 'SessionManager' });
  } catch (error) {
      Logger.error('Failed to create session:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Authentication check failed:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Session refresh check failed:', 'auth', { component: 'SessionManager', error: error });
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

      Logger.debug('Refreshing session...', 'auth', { component: 'SessionManager' });

      // Use Supabase to refresh the session
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.currentSession.refreshToken,
    });

      if (error || !data.session) {
        Logger.error('Session refresh failed:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.debug('Session refreshed successfully', 'auth', { component: 'SessionManager' });
      return true;
  } catch (error) {
      Logger.error('Session refresh failed:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Session validation failed:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.debug('Session cleared', 'auth', { component: 'SessionManager' });
  } catch (error) {
      Logger.error('Failed to clear session:', 'auth', { component: 'SessionManager', error: error });
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
      
      Logger.debug('Session config updated', 'auth', { component: 'SessionManager' });
  } catch (error) {
      Logger.error('Failed to update session config:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('App resume handling failed:', 'auth', { component: 'SessionManager', error: error });
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
        Logger.debug('Session loaded from storage', 'auth', { component: 'SessionManager' });
    }
  } catch (error) {
      Logger.error('Failed to load session:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Failed to store session:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Failed to load config:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('Failed to store config:', 'auth', { component: 'SessionManager', error: error });
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
        Logger.error('Auto-refresh failed:', 'auth', { component: 'SessionManager', error: error });
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
        Logger.error('Session validation failed:', 'auth', { component: 'SessionManager', error: error });
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
      Logger.error('App state change handling failed:', 'auth', { component: 'SessionManager', error: error });
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
        'CupNote',
        '1.0.0', // App version
        Date.now().toString().substring(0, 10), // Day-level timestamp for some variability
      ].join('|');

      return fingerprint;
  } catch (error) {
      Logger.error('Failed to generate device fingerprint:', 'auth', { component: 'SessionManager', error: error });
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