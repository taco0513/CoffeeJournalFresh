import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceMonitor } from './PerformanceMonitor';
import { getCurrentMarketConfig, isBetaMarket, getBetaConfig } from '../config/marketConfig';
import { supabase } from './supabase/client';
import { Alert } from 'react-native';

import { Logger } from './LoggingService';
/**
 * Comprehensive Beta Testing Service
 * Handles feedback collection, user management, and deployment monitoring
 * for dual-market beta testing (Korean + US markets)
 */

export interface BetaUser {
  id: string;
  email: string;
  market: 'korean' | 'us_beta';  
  language: 'ko' | 'en';
  joinedAt: Date;
  lastActiveAt: Date;
  feedbackCount: number;
  testingLevel: 'basic' | 'advanced' | 'power_user';
  deviceInfo: DeviceInfo;
  preferences: BetaPreferences;
}

export interface DeviceInfo {
  platform: 'ios' | 'android';
  version: string;
  model: string;
  osVersion: string;
  appVersion: string;
  buildNumber: string;
}

export interface BetaPreferences {
  allowCrashReporting: boolean;
  allowPerformanceTracking: boolean;
  allowUsageAnalytics: boolean;
  feedbackFrequency: 'high' | 'medium' | 'low';
  preferredFeedbackChannel: 'in-app' | 'email' | 'discord' | 'kakao';
  betaFeatureAccess: boolean;
}

export interface BetaFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature_request' | 'improvement' | 'general';
  category: 'ui_ux' | 'performance' | 'features' | 'content' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string[];
  deviceInfo: DeviceInfo;
  marketContext: string;
  timestamp: Date;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminResponse?: string;
  resolvedAt?: Date;
}

export interface DeploymentStatus {
  version: string;
  buildNumber: string;
  releaseDate: Date;
  marketRollout: {
    korean: {
      status: 'pending' | 'rolling_out' | 'complete';
      percentage: number;
      userCount: number;
  };
    us_beta: {
      status: 'pending' | 'rolling_out' | 'complete';
      percentage: number;
      userCount: number;
  };
};
  issues: DeploymentIssue[];
  metrics: DeploymentMetrics;
}

export interface DeploymentIssue {
  id: string;
  type: 'crash' | 'performance' | 'network' | 'ui';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  market: 'korean' | 'us_beta' | 'both';
  description: string;
  status: 'investigating' | 'fixing' | 'resolved';
  reportedAt: Date;
}

export interface DeploymentMetrics {
  crashRate: number;
  averageSessionLength: number;
  userRetention24h: number;
  userRetention7d: number;
  averageLoadTime: number;
  apiErrorRate: number;
  feedbackScore: number;
}

class BetaTestingService {
  private static instance: BetaTestingService;
  private currentUser: BetaUser | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): BetaTestingService {
    if (!BetaTestingService.instance) {
      BetaTestingService.instance = new BetaTestingService();
  }
    return BetaTestingService.instance;
}

  /**
   * Initialize beta testing service
   */
  async initialize(userEmail: string): Promise<void> {
    const timingId = performanceMonitor.startTiming('beta_service_init');
    
    try {
      if (!isBetaMarket()) {
        // Korean market - not beta, but still track for comparison
        await this.initializeProductionUser(userEmail);
    } else {
        // US Beta market
        await this.initializeBetaUser(userEmail);
    }
      
      this.isInitialized = true;
      performanceMonitor.endTiming(timingId, 'beta_service_init_success');
  } catch (error) {
      performanceMonitor.endTiming(timingId, 'beta_service_init_error');
      performanceMonitor.reportError(error as Error, 'beta_service_initialization', 'high');
      throw error;
  }
}

  /**
   * Initialize production user (Korean market)
   */
  private async initializeProductionUser(email: string): Promise<void> {
    const marketConfig = getCurrentMarketConfig();
    const deviceInfo = await this.getDeviceInfo();
    
    this.currentUser = {
      id: `prod_${Date.now()}`,
      email,
      market: 'korean',
      language: 'ko',
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      feedbackCount: 0,
      testingLevel: 'basic',
      deviceInfo,
      preferences: {
        allowCrashReporting: true,
        allowPerformanceTracking: true,
        allowUsageAnalytics: true,
        feedbackFrequency: 'medium',
        preferredFeedbackChannel: 'in-app',
        betaFeatureAccess: false,
    }
  };

    await this.saveUserData();
}

  /**
   * Initialize beta user (US market)
   */
  private async initializeBetaUser(email: string): Promise<void> {
    const betaConfig = getBetaConfig();
    if (!betaConfig) {
      throw new Error('Beta configuration not available');
  }

    // Check beta capacity
    const currentBetaUsers = await this.getBetaUserCount();
    if (currentBetaUsers >= betaConfig.maxUsers) {
      throw new Error('Beta testing capacity reached');
  }

    const deviceInfo = await this.getDeviceInfo();
    
    this.currentUser = {
      id: `beta_${Date.now()}`,
      email,
      market: 'us_beta',
      language: 'en',
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      feedbackCount: 0,
      testingLevel: 'basic',
      deviceInfo,
      preferences: {
        allowCrashReporting: true,
        allowPerformanceTracking: true,
        allowUsageAnalytics: true,
        feedbackFrequency: 'high', // Beta users provide more feedback
        preferredFeedbackChannel: 'in-app',
        betaFeatureAccess: true,
    }
  };

    await this.saveUserData();
    await this.registerBetaUser();
}

  /**
   * Get device information for tracking
   */
  private async getDeviceInfo(): Promise<DeviceInfo> {
    // In a real app, you'd use react-native-device-info
    return {
      platform: 'ios', // Would be detected
      version: '1.0.0-beta',
      model: 'iPhone 14', // Would be detected
      osVersion: '17.0', // Would be detected
      appVersion: '1.0.0',
      buildNumber: '1',
  };
}

  /**
   * Register beta user in database
   */
  private async registerBetaUser(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const { error } = await supabase
        .from('beta_users')
        .insert({
          user_id: this.currentUser.id,
          email: this.currentUser.email,
          market: this.currentUser.market,
          language: this.currentUser.language,
          device_info: this.currentUser.deviceInfo,
          preferences: this.currentUser.preferences,
          joined_at: this.currentUser.joinedAt.toISOString(),
      });

      if (error) {
        Logger.error('Failed to register beta user:', 'service', { component: 'BetaTestingService', error: error });
    }
  } catch (error) {
      Logger.error('Beta user registration error:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Submit feedback
   */
  async submitFeedback(feedback: Omit<BetaFeedback, 'id' | 'userId' | 'deviceInfo' | 'marketContext' | 'timestamp' | 'status'>): Promise<string> {
    const timingId = performanceMonitor.startTiming('feedback_submission');
    
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
    }

      const feedbackId = `feedback_${Date.now()}`;
      const marketConfig = getCurrentMarketConfig();
      const deviceInfo = await this.getDeviceInfo();

      const betaFeedback: BetaFeedback = {
        ...feedback,
        id: feedbackId,
        userId: this.currentUser.id,
        deviceInfo,
        marketContext: `${marketConfig.market} (${marketConfig.language})`,
        timestamp: new Date(),
        status: 'open',
    };

      // Store locally first
      await this.storeFeedbackLocally(betaFeedback);

      // Submit to database
      await this.submitFeedbackToDatabase(betaFeedback);

      // Update user feedback count
      this.currentUser.feedbackCount++;
      await this.saveUserData();

      performanceMonitor.endTiming(timingId, 'feedback_submission_success', {
        type: feedback.type,
        category: feedback.category,
        severity: feedback.severity,
        market: this.currentUser.market,
    });

      return feedbackId;
  } catch (error) {
      performanceMonitor.endTiming(timingId, 'feedback_submission_error');
      performanceMonitor.reportError(error as Error, 'feedback_submission', 'medium');
      throw error;
  }
}

  /**
   * Store feedback locally for offline support
   */
  private async storeFeedbackLocally(feedback: BetaFeedback): Promise<void> {
    try {
      const existingFeedback = await AsyncStorage.getItem('@beta_feedback');
      const feedbackList: BetaFeedback[] = existingFeedback ? JSON.parse(existingFeedback) : [];
      
      feedbackList.push(feedback);
      
      // Keep only last 50 feedback items
      if (feedbackList.length > 50) {
        feedbackList.splice(0, feedbackList.length - 50);
    }
      
      await AsyncStorage.setItem('@beta_feedback', JSON.stringify(feedbackList));
  } catch (error) {
      Logger.error('Failed to store feedback locally:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Submit feedback to database
   */
  private async submitFeedbackToDatabase(feedback: BetaFeedback): Promise<void> {
    try {
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          id: feedback.id,
          user_id: feedback.userId,
          type: feedback.type,
          category: feedback.category,
          severity: feedback.severity,
          title: feedback.title,
          description: feedback.description,
          reproduction_steps: feedback.reproductionSteps,
          expected_behavior: feedback.expectedBehavior,
          actual_behavior: feedback.actualBehavior,
          screenshots: feedback.screenshots,
          device_info: feedback.deviceInfo,
          market_context: feedback.marketContext,
          created_at: feedback.timestamp.toISOString(),
          status: feedback.status,
      });

      if (error) {
        Logger.error('Failed to submit feedback to database:', 'service', { component: 'BetaTestingService', error: error });
    }
  } catch (error) {
      Logger.error('Database feedback submission error:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Get beta user count
   */
  private async getBetaUserCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('beta_users')
        .select('*', { count: 'exact', head: true })
        .eq('market', 'us_beta');

      if (error) {
        Logger.error('Failed to get beta user count:', 'service', { component: 'BetaTestingService', error: error });
        return 0;
    }

      return count || 0;
  } catch (error) {
      Logger.error('Beta user count error:', 'service', { component: 'BetaTestingService', error: error });
      return 0;
  }
}

  /**
   * Save user data locally
   */
  private async saveUserData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      await AsyncStorage.setItem('@beta_user', JSON.stringify(this.currentUser));
  } catch (error) {
      Logger.error('Failed to save user data:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Load user data from storage
   */
  async loadUserData(): Promise<BetaUser | null> {
    try {
      const userData = await AsyncStorage.getItem('@beta_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
    }
  } catch (error) {
      Logger.error('Failed to load user data:', 'service', { component: 'BetaTestingService', error: error });
  }
    return null;
}

  /**
   * Get current user
   */
  getCurrentUser(): BetaUser | null {
    return this.currentUser;
}

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<BetaPreferences>): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser.preferences = {
      ...this.currentUser.preferences,
      ...preferences,
  };

    await this.saveUserData();

    // Update in database
    try {
      await supabase
        .from('beta_users')
        .update({ preferences: this.currentUser.preferences })
        .eq('user_id', this.currentUser.id);
  } catch (error) {
      Logger.error('Failed to update preferences in database:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Get deployment status
   */
  async getDeploymentStatus(): Promise<DeploymentStatus | null> {
    try {
      const { data, error } = await supabase
        .from('deployment_status')
        .select('*')
        .order('release_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
    }

      return {
        version: data.version,
        buildNumber: data.build_number,
        releaseDate: new Date(data.release_date),
        marketRollout: data.market_rollout,
        issues: data.issues || [],
        metrics: data.metrics || {},
    };
  } catch (error) {
      Logger.error('Failed to get deployment status:', 'service', { component: 'BetaTestingService', error: error });
      return null;
  }
}

  /**
   * Report crash or critical issue
   */
  async reportCriticalIssue(issue: {
    type: 'crash' | 'performance' | 'network' | 'ui';
    description: string;
    stackTrace?: string;
    reproductionSteps?: string;
}): Promise<void> {
    if (!this.currentUser) return;

    try {
      const { error } = await supabase
        .from('deployment_issues')
        .insert({
          type: issue.type,
          severity: 'critical',
          description: issue.description,
          stack_trace: issue.stackTrace,
          reproduction_steps: issue.reproductionSteps,
          user_id: this.currentUser.id,
          market: this.currentUser.market,
          device_info: this.currentUser.deviceInfo,
          reported_at: new Date().toISOString(),
          status: 'investigating',
      });

      if (error) {
        Logger.error('Failed to report critical issue:', 'service', { component: 'BetaTestingService', error: error });
    }

      // Show user confirmation
      const marketConfig = getCurrentMarketConfig();
      const message = marketConfig.language === 'ko'
        ? '문제가 보고되었습니다. 빠른 시일 내에 해결하겠습니다.'
        : 'Issue reported successfully. We\'ll address it promptly.';

      Alert.alert(
        marketConfig.language === 'ko' ? '문제 보고됨' : 'Issue Reported',
        message,
        [{ text: marketConfig.language === 'ko' ? '확인' : 'OK' }]
      );
  } catch (error) {
      Logger.error('Critical issue reporting error:', 'service', { component: 'BetaTestingService', error: error });
  }
}

  /**
   * Quick feedback methods
   */
  async submitQuickFeedback(rating: 1 | 2 | 3 | 4 | 5, comment?: string): Promise<void> {
    await this.submitFeedback({
      type: 'general',
      category: 'ui_ux',
      severity: 'low',
      title: `Quick Feedback - Rating: ${rating}/5`,
      description: comment || `User rated the app ${rating}/5 stars`,
  });
}

  async reportBug(title: string, description: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    await this.submitFeedback({
      type: 'bug',
      category: 'technical',
      severity,
      title,
      description,
  });
}

  async requestFeature(title: string, description: string): Promise<void> {
    await this.submitFeedback({
      type: 'feature_request',
      category: 'features',
      severity: 'low',
      title,
      description,
  });
}

  /**
   * Check if user can access beta features
   */
  canAccessBetaFeatures(): boolean {
    return this.currentUser?.preferences.betaFeatureAccess || false;
}

  /**
   * Get feedback statistics
   */
  getFeedbackStats(): { count: number; lastSubmitted?: Date } {
    if (!this.currentUser) {
      return { count: 0 };
  }

    return {
      count: this.currentUser.feedbackCount,
      lastSubmitted: this.currentUser.lastActiveAt,
  };
}
}

export const betaTestingService = BetaTestingService.getInstance();