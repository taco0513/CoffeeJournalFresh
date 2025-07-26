/**
 * Market Test Scenarios
 * Test scenarios for market configuration validation
 */

import { TestScenario, TestResult } from '../types/MarketTestTypes';
import { 
  getCurrentMarketConfig,
  isBetaMarket,
  isFeatureEnabled,
  getMarketRoasters,
  getMarketOrigins,
  getMarketFlavorProfiles,
  getSupportedBrewMethods,
  formatCurrency,
} from '../config/marketConfig';
import { 
  getCurrentDeploymentConfig,
  isFeatureFlagEnabled,
  getApiEndpoint,
} from '../config/deploymentConfig';
import { betaTestingService } from '../services/BetaTestingService';

export const createTestScenarios = (): TestScenario[] => [
  {
    id: 'korean_market_config',
    name: 'Korean Market - Full Features',
    description: 'Test Korean market configuration with all features enabled',
    market: 'korean',
    language: 'ko',
    testFunction: async (): Promise<TestResult> => {
      try {
        const marketConfig = getCurrentMarketConfig();
        const features = {
          homeCafeMode: isFeatureEnabled('homeCafeMode'),
          labMode: isFeatureEnabled('labMode'),
          marketIntelligence: isFeatureEnabled('marketIntelligence'),
          achievements: isFeatureEnabled('achievements'),
      };
        
        const roasters = getMarketRoasters();
        const currencyFormat = formatCurrency(5000);
        
        const isKoreanMarket = marketConfig.market === 'korean';
        const hasKoreanRoasters = roasters.some(r => r.includes('Coffee Libre'));
        const isKoreanCurrency = currencyFormat.includes('원') || currencyFormat.includes('₩');
        
        const allFeaturesEnabled = Object.values(features).every(f => f === true);
        const success = isKoreanMarket && hasKoreanRoasters && isKoreanCurrency && allFeaturesEnabled;
        
        return {
          scenario: 'Korean Market - Full Features',
          success,
          message: success ? 'Korean market configuration working correctly' : 'Korean market configuration issues detected',
          data: { features, roasters: roasters.slice(0, 3), currencyFormat, hasKoreanRoasters, isKoreanCurrency }
      };
    } catch (error) {
        return {
          scenario: 'Korean Market - Full Features',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
},

  {
    id: 'us_beta_config',
    name: 'US Beta Market - Limited Features',
    description: 'Test US beta market configuration with limited features',
    market: 'us_beta',
    language: 'en',
    testFunction: async (): Promise<TestResult> => {
      try {
        const marketConfig = getCurrentMarketConfig();
        const features = {
          homeCafeMode: isFeatureEnabled('homeCafeMode'),
          labMode: isFeatureEnabled('labMode'), // Should be false for beta
          marketIntelligence: isFeatureEnabled('marketIntelligence'),
          achievements: isFeatureEnabled('achievements'),
      };
        
        const roasters = getMarketRoasters();
        const currencyFormat = formatCurrency(25.99);
        
        const isUSMarket = marketConfig.market === 'us_beta';
        const hasUSRoasters = roasters.some(r => r.includes('Blue Bottle') || r.includes('Intelligentsia'));
        const isUSCurrency = currencyFormat.includes('$');
        
        // For beta, lab mode should be disabled
        const betaFeaturesCorrect = !features.labMode;
        const success = isUSMarket && hasUSRoasters && isUSCurrency && betaFeaturesCorrect;
        
        return {
          scenario: 'US Beta Market - Limited Features',
          success,
          message: success ? 'US beta configuration working correctly' : 'US beta configuration issues detected',
          data: { features, roasters: roasters.slice(0, 3), currencyFormat, hasUSRoasters, isUSCurrency }
      };
    } catch (error) {
        return {
          scenario: 'US Beta Market - Limited Features',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
},

  {
    id: 'data_consistency',
    name: 'Market Data Consistency',
    description: 'Test consistency between market config and i18n data',
    market: 'korean',
    language: 'ko',
    testFunction: async (): Promise<TestResult> => {
      try {
        const marketConfig = getCurrentMarketConfig();
        const roasters = getMarketRoasters();
        const origins = getMarketOrigins();
        const flavorProfiles = getMarketFlavorProfiles();
        const brewMethods = getSupportedBrewMethods();
        
        // Test data completeness
        const hasData = roasters.length > 0 && origins.length > 0 && flavorProfiles.length > 0 && brewMethods.length > 0;
        
        // Test market-specific data
        const isKoreanMarket = marketConfig.market === 'korean';
        const hasKoreanRoasters = roasters.some(r => r.includes('Coffee Libre'));
        const hasKoreanOrigins = origins.some(o => o.includes('에티오피아') || o.includes('케냐'));
        
        const consistency = isKoreanMarket ? (hasKoreanRoasters && hasKoreanOrigins) : (!hasKoreanRoasters && !hasKoreanOrigins);
        
        return {
          scenario: 'Market Data Consistency',
          success: hasData && consistency,
          message: hasData && consistency ? 'Market data is consistent' : 'Market data inconsistencies detected',
          data: { 
            marketConfig: marketConfig.market,
            dataLength: { roasters: roasters.length, origins: origins.length, flavorProfiles: flavorProfiles.length },
            isKoreanMarket,
            hasKoreanRoasters,
            hasKoreanOrigins,
            consistency
        }
      };
    } catch (error) {
        return {
          scenario: 'Market Data Consistency',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
},

  {
    id: 'beta_testing_functionality',
    name: 'Beta Testing Functionality',
    description: 'Test beta testing service functionality',
    market: 'us_beta',
    language: 'en',
    testFunction: async (): Promise<TestResult> => {
      try {
        // Test feedback functionality
        const feedbackStats = betaTestingService.getFeedbackStats();
        const canAccessBeta = betaTestingService.canAccessBetaFeatures();
        
        // Test deployment configuration
        const deploymentConfig = getCurrentDeploymentConfig();
        const hasBetaConfig = deploymentConfig.marketConfig.us_beta !== undefined;
        const betaEnabled = deploymentConfig.marketConfig.us_beta.enabled;
        
        const success = hasBetaConfig && betaEnabled;
        
        return {
          scenario: 'Beta Testing Functionality',
          success,
          message: success ? 'Beta testing functionality available' : 'Beta testing functionality issues',
          data: { feedbackStats, canAccessBeta, hasBetaConfig, betaEnabled }
      };
    } catch (error) {
        return {
          scenario: 'Beta Testing Functionality',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
},

  {
    id: 'performance_monitoring',
    name: 'Performance Monitoring',
    description: 'Test performance monitoring across markets',
    market: 'korean',
    language: 'ko',
    testFunction: async (): Promise<TestResult> => {
      try {
        const deploymentConfig = getCurrentDeploymentConfig();
        
        // Test performance monitoring flags
        const koreanPerfEnabled = deploymentConfig.marketConfig.korean.performanceMonitoringEnabled;
        const usPerfEnabled = deploymentConfig.marketConfig.us_beta.performanceMonitoringEnabled;
        const crashReportingFlag = isFeatureFlagEnabled('crashReporting');
        const performanceDashboard = isFeatureFlagEnabled('performanceDashboard');
        
        // Test rate limits
        const koreanRateLimit = deploymentConfig.marketConfig.korean.rateLimits.apiCalls.requestsPerMinute;
        const usRateLimit = deploymentConfig.marketConfig.us_beta.rateLimits.apiCalls.requestsPerMinute;
        
        const success = koreanPerfEnabled && usPerfEnabled && crashReportingFlag && performanceDashboard;
        
        return {
          scenario: 'Performance Monitoring',
          success,
          message: success ? 'Performance monitoring configured correctly' : 'Performance monitoring configuration issues',
          data: { 
            koreanPerfEnabled, 
            usPerfEnabled, 
            crashReportingFlag, 
            performanceDashboard,
            rateLimits: { korean: koreanRateLimit, us: usRateLimit }
        }
      };
    } catch (error) {
        return {
          scenario: 'Performance Monitoring',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
},

  {
    id: 'api_endpoints',
    name: 'API Endpoints Configuration',
    description: 'Test API endpoint configuration for different environments',
    market: 'korean',
    language: 'ko',
    testFunction: async (): Promise<TestResult> => {
      try {
        const deploymentConfig = getCurrentDeploymentConfig();
        
        // Test API endpoints
        const productionEndpoint = getApiEndpoint('production');
        const stagingEndpoint = getApiEndpoint('staging');
        const developmentEndpoint = getApiEndpoint('development');
        
        // Test market-specific endpoints
        const koreanApiUrl = deploymentConfig.marketConfig.korean.apiBaseUrl;
        const usApiUrl = deploymentConfig.marketConfig.us_beta.apiBaseUrl;
        
        const hasEndpoints = !!(productionEndpoint && stagingEndpoint && developmentEndpoint);
        const hasMarketEndpoints = !!(koreanApiUrl && usApiUrl);
        const endpointsDiffer = koreanApiUrl !== usApiUrl;
        
        const success = hasEndpoints && hasMarketEndpoints && endpointsDiffer;
        
        return {
          scenario: 'API Endpoints Configuration',
          success,
          message: success ? 'API endpoints configured correctly' : 'API endpoint configuration issues',
          data: { 
            endpoints: { production: productionEndpoint, staging: stagingEndpoint, development: developmentEndpoint },
            marketEndpoints: { korean: koreanApiUrl, us: usApiUrl },
            hasEndpoints,
            hasMarketEndpoints,
            endpointsDiffer
        }
      };
    } catch (error) {
        return {
          scenario: 'API Endpoints Configuration',
          success: false,
          message: 'Test failed with error',
          error: error.message
      };
    }
  }
}
];

export default createTestScenarios;