import { getCurrentMarketConfig, isBetaMarket } from './marketConfig';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Deployment Configuration for Dual-Market Beta Testing
 * Manages deployment settings, feature flags, and rollout strategies
 * for Korean primary market and US beta market
 */

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildNumber: string;
  releaseDate: Date;
  marketConfig: MarketDeploymentConfig;
  featureFlags: FeatureFlags;
  rolloutStrategy: RolloutStrategy;
  monitoring: MonitoringConfig;
  apiEndpoints: ApiEndpoints;
  crashReporting: CrashReportingConfig;
}

export interface MarketDeploymentConfig {
  korean: MarketSpecificConfig;
  us_beta: MarketSpecificConfig;
}

export interface MarketSpecificConfig {
  enabled: boolean;
  maxUsers: number;
  rolloutPercentage: number;
  maintenanceMode: boolean;
  apiBaseUrl: string;
  cdnUrl: string;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  performanceMonitoringEnabled: boolean;
  betaFeedbackEnabled: boolean;
  rateLimits: RateLimits;
}

export interface FeatureFlags {
  // Core Features
  homeCafeMode: boolean;
  labMode: boolean;
  marketIntelligence: boolean;
  achievements: boolean;
  
  // Beta Features
  advancedAnalytics: boolean;
  photoOCR: boolean;
  aiCoaching: boolean;
  socialFeatures: boolean;
  exportData: boolean;
  offlineSync: boolean;
  
  // Market Specific
  koreanSensoryEvaluation: boolean;
  usCoffeeDatabase: boolean;
  dualLanguageSupport: boolean;
  
  // Technical Features
  performanceDashboard: boolean;
  betaTestingDashboard: boolean;
  crashReporting: boolean;
  remoteConfig: boolean;
}

export interface RolloutStrategy {
  type: 'immediate' | 'gradual' | 'canary' | 'blue_green';
  stages: RolloutStage[];
  rollbackThreshold: {
    crashRate: number;
    errorRate: number;
    performanceDegradation: number;
    userComplaintRate: number;
};
  autoRollback: boolean;
  notificationChannels: string[];
}

export interface RolloutStage {
  name: string;
  percentage: number;
  duration: number; // in minutes
  criteria: StageCriteria;
  marketFilter?: 'korean' | 'us_beta' | 'both';
}

export interface StageCriteria {
  maxCrashRate: number;
  maxErrorRate: number;
  minUserSatisfaction: number;
  requiredSuccessMetrics: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  realTimeAlerts: boolean;
  dashboardUrl: string;
  alertChannels: AlertChannel[];
  healthCheckInterval: number; // in seconds
  metricsRetention: number; // in days
  criticalMetrics: string[];
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'discord' | 'webhook';
  endpoint: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApiEndpoints {
  production: string;
  staging: string;
  development: string;
  supabase: string;
  analytics: string;
  crashReporting: string;
  featureFlags: string;
}

export interface CrashReportingConfig {
  enabled: boolean;
  apiKey: string;
  environment: string;
  userId?: string;
  sessionTracking: boolean;
  performanceTracking: boolean;
  networkTracking: boolean;
  automaticSessionTracking: boolean;
}

export interface RateLimits {
  apiCalls: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
};
  feedback: {
    submissionsPerHour: number;
    submissionsPerDay: number;
};
  uploads: {
    filesPerHour: number;
    maxFileSize: number; // in MB
    totalSizePerDay: number; // in MB
};
}

/**
 * Production Deployment Configuration
 */
const PRODUCTION_CONFIG: DeploymentConfig = {
  environment: 'production',
  version: '1.0.0',
  buildNumber: '1',
  releaseDate: new Date('2025-01-15'),
  
  marketConfig: {
    korean: {
      enabled: true,
      maxUsers: 100000,
      rolloutPercentage: 100,
      maintenanceMode: false,
      apiBaseUrl: 'https://api.cupnote.app',
      cdnUrl: 'https://cdn.cupnote.app',
      analyticsEnabled: true,
      crashReportingEnabled: true,
      performanceMonitoringEnabled: true,
      betaFeedbackEnabled: false,
      rateLimits: {
        apiCalls: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
      },
        feedback: {
          submissionsPerHour: 5,
          submissionsPerDay: 20,
      },
        uploads: {
          filesPerHour: 10,
          maxFileSize: 10,
          totalSizePerDay: 100,
      },
    },
  },
    us_beta: {
      enabled: true,
      maxUsers: 500,
      rolloutPercentage: 100,
      maintenanceMode: false,
      apiBaseUrl: 'https://beta-api.cupnote.app',
      cdnUrl: 'https://beta-cdn.cupnote.app',
      analyticsEnabled: true,
      crashReportingEnabled: true,
      performanceMonitoringEnabled: true,
      betaFeedbackEnabled: true,
      rateLimits: {
        apiCalls: {
          requestsPerMinute: 30,
          requestsPerHour: 500,
          requestsPerDay: 5000,
      },
        feedback: {
          submissionsPerHour: 10,
          submissionsPerDay: 50,
      },
        uploads: {
          filesPerHour: 20,
          maxFileSize: 20,
          totalSizePerDay: 200,
      },
    },
  },
},
  
  featureFlags: {
    // Core Features - Enabled for both markets
    homeCafeMode: true,
    labMode: true, // Korean only initially
    marketIntelligence: true,
    achievements: true,
    
    // Beta Features - Disabled for production launch
    advancedAnalytics: false,
    photoOCR: false,
    aiCoaching: false,
    socialFeatures: false,
    exportData: false,
    offlineSync: true,
    
    // Market Specific
    koreanSensoryEvaluation: true,
    usCoffeeDatabase: true,
    dualLanguageSupport: true,
    
    // Technical Features
    performanceDashboard: true,
    betaTestingDashboard: true,
    crashReporting: true,
    remoteConfig: true,
},
  
  rolloutStrategy: {
    type: 'gradual',
    stages: [
      {
        name: 'canary',
        percentage: 5,
        duration: 60, // 1 hour
        criteria: {
          maxCrashRate: 0.01,
          maxErrorRate: 0.05,
          minUserSatisfaction: 4.0,
          requiredSuccessMetrics: ['app_start_success', 'tasting_save_success'],
      },
    },
      {
        name: 'early_rollout',
        percentage: 25,
        duration: 240, // 4 hours
        criteria: {
          maxCrashRate: 0.005,
          maxErrorRate: 0.03,
          minUserSatisfaction: 4.2,
          requiredSuccessMetrics: ['app_start_success', 'tasting_save_success', 'search_performance'],
      },
    },
      {
        name: 'full_rollout',
        percentage: 100,
        duration: 720, // 12 hours
        criteria: {
          maxCrashRate: 0.003,
          maxErrorRate: 0.02,
          minUserSatisfaction: 4.0,
          requiredSuccessMetrics: ['app_start_success', 'tasting_save_success', 'search_performance', 'user_retention'],
      },
    },
    ],
    rollbackThreshold: {
      crashRate: 0.02,
      errorRate: 0.1,
      performanceDegradation: 0.3,
      userComplaintRate: 0.05,
  },
    autoRollback: true,
    notificationChannels: ['email', 'slack'],
},
  
  monitoring: {
    enabled: true,
    realTimeAlerts: true,
    dashboardUrl: 'https://monitoring.cupnote.app',
    alertChannels: [
      {
        type: 'email',
        endpoint: 'alerts@cupnote.app',
        enabled: true,
        severity: 'critical',
    },
      {
        type: 'slack',
        endpoint: 'https://hooks.slack.com/services/...',
        enabled: true,
        severity: 'high',
    },
    ],
    healthCheckInterval: 30,
    metricsRetention: 90,
    criticalMetrics: [
      'crash_rate',
      'error_rate',
      'response_time',
      'user_satisfaction',
      'daily_active_users',
      'retention_rate',
    ],
},
  
  apiEndpoints: {
    production: 'https://api.cupnote.app/v1',
    staging: 'https://staging-api.cupnote.app/v1',
    development: 'http://localhost:3000/v1',
    supabase: 'https://your-project.supabase.co',
    analytics: 'https://analytics.cupnote.app',
    crashReporting: 'https://crashreporting.cupnote.app',
    featureFlags: 'https://featureflags.cupnote.app',
},
  
  crashReporting: {
    enabled: true,
    apiKey: 'your-crash-reporting-api-key',
    environment: 'production',
    sessionTracking: true,
    performanceTracking: true,
    networkTracking: true,
    automaticSessionTracking: true,
},
};

/**
 * Staging Deployment Configuration
 */
const STAGING_CONFIG: DeploymentConfig = {
  ...PRODUCTION_CONFIG,
  environment: 'staging',
  version: '1.0.0-staging',
  
  marketConfig: {
    korean: {
      ...PRODUCTION_CONFIG.marketConfig.korean,
      maxUsers: 1000,
      apiBaseUrl: 'https://staging-api.cupnote.app',
      cdnUrl: 'https://staging-cdn.cupnote.app',
  },
    us_beta: {
      ...PRODUCTION_CONFIG.marketConfig.us_beta,
      maxUsers: 100,
      apiBaseUrl: 'https://staging-beta-api.cupnote.app',
      cdnUrl: 'https://staging-beta-cdn.cupnote.app',
  },
},
  
  featureFlags: {
    ...PRODUCTION_CONFIG.featureFlags,
    // Enable beta features in staging
    advancedAnalytics: true,
    photoOCR: true,
    aiCoaching: true,
    exportData: true,
},
  
  crashReporting: {
    ...PRODUCTION_CONFIG.crashReporting,
    environment: 'staging',
},
};

/**
 * Development Deployment Configuration
 */
const DEVELOPMENT_CONFIG: DeploymentConfig = {
  ...PRODUCTION_CONFIG,
  environment: 'development',
  version: '1.0.0-dev',
  
  marketConfig: {
    korean: {
      ...PRODUCTION_CONFIG.marketConfig.korean,
      maxUsers: 50,
      apiBaseUrl: 'http://localhost:3000',
      cdnUrl: 'http://localhost:3001',
      rolloutPercentage: 100,
  },
    us_beta: {
      ...PRODUCTION_CONFIG.marketConfig.us_beta,
      maxUsers: 20,
      apiBaseUrl: 'http://localhost:3000',
      cdnUrl: 'http://localhost:3001',
      rolloutPercentage: 100,
  },
},
  
  featureFlags: {
    ...PRODUCTION_CONFIG.featureFlags,
    // Enable all features in development
    advancedAnalytics: true,
    photoOCR: true,
    aiCoaching: true,
    socialFeatures: true,
    exportData: true,
    performanceDashboard: true,
    betaTestingDashboard: true,
},
  
  rolloutStrategy: {
    ...PRODUCTION_CONFIG.rolloutStrategy,
    type: 'immediate',
    autoRollback: false,
},
  
  crashReporting: {
    ...PRODUCTION_CONFIG.crashReporting,
    enabled: false, // Disable in development
    environment: 'development',
},
};

/**
 * Get current deployment configuration based on environment
 */
export const getCurrentDeploymentConfig = (): DeploymentConfig => {
  const timingId = performanceMonitor.startTiming('deployment_config_load');
  
  try {
    let config: DeploymentConfig;
    
    if (__DEV__) {
      config = DEVELOPMENT_CONFIG;
  } else {
      // In production, you might determine this from build settings or environment variables
      const isStaging = false; // This would be determined by your build process
      config = isStaging ? STAGING_CONFIG : PRODUCTION_CONFIG;
  }
    
    performanceMonitor.endTiming(timingId, 'deployment_config_success', {
      environment: config.environment,
      version: config.version,
  });
    
    return config;
} catch (error) {
    performanceMonitor.endTiming(timingId, 'deployment_config_error');
    performanceMonitor.reportError(error as Error, 'deployment_config_load', 'high');
    
    // Fallback to development config
    return DEVELOPMENT_CONFIG;
}
};

/**
 * Get market-specific deployment configuration
 */
export const getMarketDeploymentConfig = (): MarketSpecificConfig => {
  const deploymentConfig = getCurrentDeploymentConfig();
  const isBeta = isBetaMarket();
  
  return isBeta ? deploymentConfig.marketConfig.us_beta : deploymentConfig.marketConfig.korean;
};

/**
 * Check if a feature is enabled
 */
export const isFeatureFlagEnabled = (flag: keyof FeatureFlags): boolean => {
  const config = getCurrentDeploymentConfig();
  return config.featureFlags[flag];
};

/**
 * Get API endpoint for current environment
 */
export const getApiEndpoint = (type: keyof ApiEndpoints = 'production'): string => {
  const config = getCurrentDeploymentConfig();
  
  // Use environment-specific endpoint
  if (config.environment === 'development') {
    return config.apiEndpoints.development;
} else if (config.environment === 'staging') {
    return config.apiEndpoints.staging;
} else {
    return config.apiEndpoints.production;
}
};

/**
 * Get rate limit for current market and request type
 */
export const getRateLimit = (type: keyof RateLimits, period: string): number => {
  const marketConfig = getMarketDeploymentConfig();
  const rateLimits = marketConfig.rateLimits[type];
  
  if (type === 'apiCalls') {
    return (rateLimits as RateLimits['apiCalls'])[period as keyof RateLimits['apiCalls']] || 0;
} else if (type === 'feedback') {
    return (rateLimits as RateLimits['feedback'])[period as keyof RateLimits['feedback']] || 0;
} else if (type === 'uploads') {
    return (rateLimits as RateLimits['uploads'])[period as keyof RateLimits['uploads']] || 0;
}
  
  return 0;
};

/**
 * Check if deployment is in maintenance mode
 */
export const isMaintenanceMode = (): boolean => {
  const marketConfig = getMarketDeploymentConfig();
  return marketConfig.maintenanceMode;
};

/**
 * Get rollout percentage for current market
 */
export const getRolloutPercentage = (): number => {
  const marketConfig = getMarketDeploymentConfig();
  return marketConfig.rolloutPercentage;
};

/**
 * Check if user should receive the rollout
 */
export const shouldReceiveRollout = (userId: string): boolean => {
  const rolloutPercentage = getRolloutPercentage();
  
  if (rolloutPercentage >= 100) {
    return true;
}
  
  // Consistent rollout based on user ID hash
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const userPercentile = hash % 100;
  
  return userPercentile < rolloutPercentage;
};

/**
 * Get monitoring configuration
 */
export const getMonitoringConfig = (): MonitoringConfig => {
  const config = getCurrentDeploymentConfig();
  return config.monitoring;
};

/**
 * Get crash reporting configuration
 */
export const getCrashReportingConfig = (): CrashReportingConfig => {
  const config = getCurrentDeploymentConfig();
  return config.crashReporting;
};

/**
 * Export configurations for testing
 */
export const DEPLOYMENT_CONFIGS = {
  production: PRODUCTION_CONFIG,
  staging: STAGING_CONFIG,
  development: DEVELOPMENT_CONFIG,
} as const;