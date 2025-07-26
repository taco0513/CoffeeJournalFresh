import { isKoreanMarket } from '../services/i18n';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Market-specific configuration for dual-market beta testing
 * Supports Korean primary market and US beta market
 */

export interface MarketConfig {
  market: 'korean' | 'us_beta';
  language: 'ko' | 'en';
  currency: 'KRW' | 'USD';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  marketName: string;
  flagEmoji: string;
  isBeta: boolean;
  features: MarketFeatures;
  analytics: AnalyticsConfig;
  roasters: string[];
  coffeeOrigins: string[];
  flavorProfiles: string[];
  supportedBrewMethods: string[];
}

export interface MarketFeatures {
  homeCafeMode: boolean;
  labMode: boolean;
  marketIntelligence: boolean;
  achievements: boolean;
  socialFeatures: boolean;
  exportData: boolean;
  offlineMode: boolean;
  premiumSubscription: boolean;
  aiCoaching: boolean;
  photoOCR: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  crashReporting: boolean;
  performanceMonitoring: boolean;
  userBehaviorTracking: boolean;
  betaFeedbackCollection: boolean;
  maxBetaUsers: number;
  feedbackChannels: string[];
}

/**
 * Korean Market Configuration (Primary Market)
 */
const KOREAN_MARKET_CONFIG: MarketConfig = {
  market: 'korean',
  language: 'ko',
  currency: 'KRW',
  dateFormat: 'YYYY.MM.DD',
  timeFormat: '24h',
  marketName: '한국 시장',
  flagEmoji: '🇰🇷',
  isBeta: false,
  
  features: {
    homeCafeMode: true,
    labMode: true, // Full Lab mode for Korean market
    marketIntelligence: true,
    achievements: true,
    socialFeatures: false, // Not yet implemented
    exportData: false, // Moved to feature backlog
    offlineMode: true,
    premiumSubscription: false, // MVP is free
    aiCoaching: false, // Phase 2 feature
    photoOCR: false, // Phase 2 feature
},
  
  analytics: {
    enabled: true,
    crashReporting: true,
    performanceMonitoring: true,
    userBehaviorTracking: true,
    betaFeedbackCollection: false, // Not beta market
    maxBetaUsers: 10000, // Korean market capacity
    feedbackChannels: ['in-app', 'email', 'kakao'],
},
  
  roasters: [
    'Coffee Libre',
    'Anthracite Coffee',
    'Terarosa Coffee',
    'Momos Coffee',
    'Fritz Coffee Company',
    'Blue Bottle Korea',
    'Felt Coffee',
    'Cafe Onion',
    'Thankyou Farmer',
    'Seesaw Coffee'
  ],
  
  coffeeOrigins: [
    '에티오피아',
    '콜롬비아', 
    '과테말라',
    '브라질',
    '케냐',
    '코스타리카',
    '파나마',
    '온두라스',
    '페루',
    '자메이카'
  ],
  
  flavorProfiles: [
    '달콤한', '신맛이 나는', '쓴맛이 강한', '고소한', '과일향이 나는',
    '꽃향이 나는', '초콜릿 맛의', '견과류 맛의', '스파이시한', '부드러운',
    '진한', '깔끔한', '복합적인', '균형잡힌', '향긋한'
  ],
  
  supportedBrewMethods: [
    'V60', 'Kalita Wave', 'Chemex', 'Origami', 'Fellow Stagg',
    'April', 'Orea', 'Flower Dripper', 'Blue Bottle', 'Crystal Eye'
  ],
};

/**
 * US Beta Market Configuration (Beta Market)
 */
const US_BETA_MARKET_CONFIG: MarketConfig = {
  market: 'us_beta',
  language: 'en',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  marketName: 'US Beta Market',
  flagEmoji: '🇺🇸',
  isBeta: true,
  
  features: {
    homeCafeMode: true,
    labMode: false, // Simplified for beta testing
    marketIntelligence: true,
    achievements: true,
    socialFeatures: false, // Not yet implemented
    exportData: false, // Moved to feature backlog
    offlineMode: true,
    premiumSubscription: false, // MVP is free
    aiCoaching: false, // Phase 2 feature
    photoOCR: false, // Phase 2 feature
},
  
  analytics: {
    enabled: true,
    crashReporting: true,
    performanceMonitoring: true,
    userBehaviorTracking: true,
    betaFeedbackCollection: true, // Beta market priority
    maxBetaUsers: 500, // Limited beta capacity
    feedbackChannels: ['in-app', 'email', 'discord'],
},
  
  roasters: [
    'Blue Bottle Coffee',
    'Stumptown Coffee',
    'Counter Culture Coffee',
    'Intelligentsia Coffee',
    'La Colombe',
    'Ritual Coffee Roasters',
    'Verve Coffee Roasters',
    'Heart Coffee Roasters',
    'George Howell Coffee',
    'Irving Farm Coffee'
  ],
  
  coffeeOrigins: [
    'Ethiopia',
    'Colombia', 
    'Guatemala',
    'Brazil',
    'Kenya',
    'Costa Rica',
    'Panama',
    'Honduras',
    'Peru',
    'Jamaica'
  ],
  
  flavorProfiles: [
    'Sweet', 'Bright', 'Bitter', 'Nutty', 'Fruity',
    'Floral', 'Chocolatey', 'Earthy', 'Spicy', 'Smooth',
    'Bold', 'Clean', 'Complex', 'Balanced', 'Aromatic'
  ],
  
  supportedBrewMethods: [
    'V60', 'Kalita Wave', 'Chemex', 'Origami', 'Fellow Stagg',
    'April', 'Orea', 'Flower Dripper', 'Blue Bottle', 'Crystal Eye'
  ],
};

/**
 * Get current market configuration based on device locale
 */
export const getCurrentMarketConfig = (): MarketConfig => {
  const timingId = performanceMonitor.startTiming('market_config_detection');
  
  try {
    const config = isKoreanMarket() ? KOREAN_MARKET_CONFIG : US_BETA_MARKET_CONFIG;
    
    performanceMonitor.endTiming(timingId, 'market_config_success', {
      market: config.market,
      isBeta: config.isBeta,
      language: config.language,
  });
    
    return config;
} catch (error) {
    performanceMonitor.endTiming(timingId, 'market_config_error');
    performanceMonitor.reportError(error as Error, 'market_config_detection', 'medium');
    
    // Fallback to Korean market on error
    return KOREAN_MARKET_CONFIG;
}
};

/**
 * Check if current market supports a specific feature
 */
export const isFeatureEnabled = (feature: keyof MarketFeatures): boolean => {
  const config = getCurrentMarketConfig();
  return config.features[feature];
};

/**
 * Get market-specific roaster suggestions
 */
export const getMarketRoasters = (): string[] => {
  const config = getCurrentMarketConfig();
  return config.roasters;
};

/**
 * Get market-specific coffee origins
 */
export const getMarketOrigins = (): string[] => {
  const config = getCurrentMarketConfig();
  return config.coffeeOrigins;
};

/**
 * Get market-specific flavor profiles
 */
export const getMarketFlavorProfiles = (): string[] => {
  const config = getCurrentMarketConfig();
  return config.flavorProfiles;
};

/**
 * Get market-specific brew method support
 */
export const getSupportedBrewMethods = (): string[] => {
  const config = getCurrentMarketConfig();
  return config.supportedBrewMethods;
};

/**
 * Check if current market is beta
 */
export const isBetaMarket = (): boolean => {
  const config = getCurrentMarketConfig();
  return config.isBeta;
};

/**
 * Get beta testing configuration
 */
export const getBetaConfig = () => {
  const config = getCurrentMarketConfig();
  
  if (!config.isBeta) {
    return null;
}
  
  return {
    maxUsers: config.analytics.maxBetaUsers,
    feedbackChannels: config.analytics.feedbackChannels,
    version: '1.0.0-beta',
    features: config.features,
    analytics: config.analytics,
};
};

/**
 * Market-specific formatting utilities
 */
export const formatCurrency = (amount: number): string => {
  const config = getCurrentMarketConfig();
  
  return new Intl.NumberFormat(
    config.language === 'ko' ? 'ko-KR' : 'en-US',
    {
      style: 'currency',
      currency: config.currency,
  }
  ).format(amount);
};

export const formatDate = (date: Date): string => {
  const config = getCurrentMarketConfig();
  const locale = config.language === 'ko' ? 'ko-KR' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
}).format(date);
};

export const formatTime = (date: Date): string => {
  const config = getCurrentMarketConfig();
  const locale = config.language === 'ko' ? 'ko-KR' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: config.timeFormat === '12h',
}).format(date);
};

/**
 * Export market configurations for testing
 */
export const MARKET_CONFIGS = {
  korean: KOREAN_MARKET_CONFIG,
  us_beta: US_BETA_MARKET_CONFIG,
} as const;