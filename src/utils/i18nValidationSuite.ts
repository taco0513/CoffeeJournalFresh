import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18next';
import { 
  getCurrentLanguage, 
  changeLanguage, 
  isKoreanMarket, 
  isKorean,
  getMarketConfig,
} from '../services/i18n';
import { 
  getCurrentMarketConfig, 
  isBetaMarket,
  getMarketRoasters,
  getMarketOrigins,
  formatCurrency,
  formatDate,
} from '../config/marketConfig';
import { 
  getCurrentDeploymentConfig,
  isFeatureFlagEnabled,
  getApiEndpoint,
} from '../config/deploymentConfig';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Comprehensive I18n Validation Suite
 * Runs automated tests to validate dual-market functionality
 */

export interface ValidationSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  results: ValidationTestResult[];
  summary: string;
  recommendations: string[];
}

export interface ValidationTestResult {
  testName: string;
  category: 'core' | 'market' | 'integration' | 'performance';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  errorMessage?: string;
  executionTime?: number;
}

class I18nValidationSuite {
  private static instance: I18nValidationSuite;
  private results: ValidationTestResult[] = [];

  private constructor() {}

  static getInstance(): I18nValidationSuite {
    if (!I18nValidationSuite.instance) {
      I18nValidationSuite.instance = new I18nValidationSuite();
    }
    return I18nValidationSuite.instance;
  }

  /**
   * Run comprehensive validation suite
   */
  async runFullValidation(): Promise<ValidationSuiteResult> {
    const startTime = performance.now();
    this.results = [];

    console.log('🔍 Starting I18n Validation Suite...');

    // Core i18n functionality tests
    await this.runCoreTests();
    
    // Market configuration tests
    await this.runMarketTests();
    
    // Integration tests
    await this.runIntegrationTests();
    
    // Performance tests
    await this.runPerformanceTests();

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);

    const summary = this.generateSummary(totalTime);
    const recommendations = this.generateRecommendations();

    console.log(`✅ I18n Validation Suite completed in ${totalTime}ms`);

    return {
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.status === 'pass').length,
      failedTests: this.results.filter(r => r.status === 'fail').length,
      warningTests: this.results.filter(r => r.status === 'warning').length,
      results: this.results,
      summary,
      recommendations,
    };
  }

  /**
   * Core i18n functionality tests
   */
  private async runCoreTests(): Promise<void> {
    // Test 1: Language Detection
    await this.runTest('Language Detection', 'core', async () => {
      const currentLang = getCurrentLanguage();
      const isValidLang = currentLang === 'ko' || currentLang === 'en';
      
      if (!isValidLang) {
        throw new Error(`Invalid language detected: ${currentLang}`);
      }

      return {
        message: `Language correctly detected: ${currentLang}`,
        details: { currentLang, isValidLang }
      };
    });

    // Test 2: Language Switching
    await this.runTest('Language Switching', 'core', async () => {
      const originalLang = getCurrentLanguage();
      const targetLang = originalLang === 'ko' ? 'en' : 'ko';
      
      await changeLanguage(targetLang);
      const newLang = getCurrentLanguage();
      
      // Switch back
      await changeLanguage(originalLang);
      
      if (newLang !== targetLang) {
        throw new Error(`Language switch failed: expected ${targetLang}, got ${newLang}`);
      }

      return {
        message: `Language switching works: ${originalLang} ↔ ${targetLang}`,
        details: { originalLang, targetLang, newLang }
      };
    });

    // Test 3: Translation Keys
    await this.runTest('Translation Keys', 'core', async () => {
      const testKeys = [
        'home', 'journal', 'profile',
        'coffeeJournal', 'startNewTasting',
        'cafeMode', 'homeCafeMode', 'labMode',
        'save', 'cancel', 'next', 'back'
      ];
      
      const koreanTranslations: Record<string, string> = {};
      const englishTranslations: Record<string, string> = {};
      
      // Test Korean translations
      await changeLanguage('ko');
      for (const key of testKeys) {
        koreanTranslations[key] = i18n.t(key);
      }
      
      // Test English translations
      await changeLanguage('en');
      for (const key of testKeys) {
        englishTranslations[key] = i18n.t(key);
      }
      
      const missingKorean = testKeys.filter(key => 
        !koreanTranslations[key] || koreanTranslations[key] === key
      );
      const missingEnglish = testKeys.filter(key => 
        !englishTranslations[key] || englishTranslations[key] === key
      );
      
      const totalMissing = missingKorean.length + missingEnglish.length;
      
      if (totalMissing > 0) {
        return {
          status: 'warning' as const,
          message: `${totalMissing} missing translations found`,
          details: { missingKorean, missingEnglish, testKeys }
        };
      }

      return {
        message: `All ${testKeys.length} translation keys found`,
        details: { testKeys, koreanTranslations, englishTranslations }
      };
    });

    // Test 4: AsyncStorage Persistence
    await this.runTest('AsyncStorage Persistence', 'core', async () => {
      const originalLang = getCurrentLanguage();
      const testLang = originalLang === 'ko' ? 'en' : 'ko';
      
      await changeLanguage(testLang);
      const storedLang = await AsyncStorage.getItem('@app_language');
      
      // Restore original
      await changeLanguage(originalLang);
      
      if (storedLang !== testLang) {
        throw new Error(`Storage failed: expected ${testLang}, stored ${storedLang}`);
      }

      return {
        message: `Language preferences persist correctly`,
        details: { originalLang, testLang, storedLang }
      };
    });
  }

  /**
   * Market configuration tests
   */
  private async runMarketTests(): Promise<void> {
    // Test 5: Market Detection
    await this.runTest('Market Detection', 'market', async () => {
      const isKorean = isKoreanMarket();
      const isBeta = isBetaMarket();
      const locales = RNLocalize.getLocales();
      
      // Markets should be mutually exclusive
      if (isKorean === isBeta) {
        throw new Error(`Market detection conflict: Korean=${isKorean}, Beta=${isBeta}`);
      }

      return {
        message: `Market correctly detected: ${isKorean ? 'Korean' : 'US Beta'}`,
        details: { isKorean, isBeta, locales: locales.slice(0, 2) }
      };
    });

    // Test 6: Market Data Consistency
    await this.runTest('Market Data Consistency', 'market', async () => {
      const marketConfig = getCurrentMarketConfig();
      const i18nMarketConfig = getMarketConfig();
      const roasters = getMarketRoasters();
      const origins = getMarketOrigins();
      
      const isKorean = marketConfig.market === 'korean';
      const hasKoreanRoasters = roasters.some(r => r.includes('Coffee Libre') || r.includes('Anthracite'));
      const hasUSRoasters = roasters.some(r => r.includes('Blue Bottle') || r.includes('Stumptown'));
      
      const dataConsistent = isKorean ? hasKoreanRoasters : hasUSRoasters;
      
      if (!dataConsistent) {
        throw new Error(`Market data inconsistent: Korean=${isKorean}, Korean roasters=${hasKoreanRoasters}, US roasters=${hasUSRoasters}`);
      }

      return {
        message: `Market data is consistent with detected market`,
        details: { 
          market: marketConfig.market,
          roasterSample: roasters.slice(0, 3),
          originSample: origins.slice(0, 3),
          isKorean,
          hasKoreanRoasters,
          hasUSRoasters
        }
      };
    });

    // Test 7: Currency and Date Formatting
    await this.runTest('Currency and Date Formatting', 'market', async () => {
      const testAmount = 5000;
      const testDate = new Date();
      
      const currencyFormat = formatCurrency(testAmount);
      const dateFormat = formatDate(testDate);
      
      const marketConfig = getCurrentMarketConfig();
      const isKorean = marketConfig.market === 'korean';
      
      const correctCurrency = isKorean ? 
        (currencyFormat.includes('₩') || currencyFormat.includes('KRW')) :
        (currencyFormat.includes('$') || currencyFormat.includes('USD'));
      
      if (!correctCurrency) {
        return {
          status: 'warning' as const,
          message: `Currency format may be incorrect for ${marketConfig.market} market`,
          details: { currencyFormat, dateFormat, isKorean, testAmount }
        };
      }

      return {
        message: `Currency and date formatting correct for ${marketConfig.market} market`,
        details: { currencyFormat, dateFormat, isKorean }
      };
    });
  }

  /**
   * Integration tests
   */
  private async runIntegrationTests(): Promise<void> {
    // Test 8: Deployment Configuration Integration
    await this.runTest('Deployment Configuration Integration', 'integration', async () => {
      const deploymentConfig = getCurrentDeploymentConfig();
      const marketConfig = getCurrentMarketConfig();
      
      const isBeta = isBetaMarket();
      const hasMarketConfig = isBeta ? 
        (deploymentConfig.marketConfig as any).us_beta !== undefined :
        (deploymentConfig.marketConfig as any).korean !== undefined;
      
      if (!hasMarketConfig) {
        throw new Error(`Missing deployment config for ${marketConfig.market} market`);
      }

      const apiEndpoint = getApiEndpoint();
      const hasApiEndpoint = apiEndpoint && apiEndpoint.length > 0;
      
      if (!hasApiEndpoint) {
        throw new Error(`Missing API endpoint configuration`);
      }

      return {
        message: `Deployment configuration properly integrated`,
        details: { 
          environment: deploymentConfig.environment,
          market: marketConfig.market,
          apiEndpoint,
          hasMarketConfig,
          hasApiEndpoint
        }
      };
    });

    // Test 9: Feature Flag Integration  
    await this.runTest('Feature Flag Integration', 'integration', async () => {
      const testFlags = [
        'homeCafeMode',
        'labMode', 
        'marketIntelligence',
        'achievements',
        'crashReporting'
      ];
      
      const flagResults: Record<string, boolean> = {};
      for (const flag of testFlags) {
        flagResults[flag] = isFeatureFlagEnabled(flag as any);
      }
      
      const marketConfig = getCurrentMarketConfig();
      const isKorean = marketConfig.market === 'korean';
      
      // Lab mode should only be enabled for Korean market
      if (flagResults['labMode'] && !isKorean) {
        return {
          status: 'warning' as const,
          message: `Lab mode enabled for US Beta market (should be Korean only)`,
          details: { flagResults, isKorean }
        };
      }

      return {
        message: `Feature flags properly configured for ${marketConfig.market}`,
        details: { flagResults, isKorean }
      };
    });

    // Test 10: Component Integration
    await this.runTest('Component Integration', 'integration', async () => {
      try {
        // Test i18n hook functionality
        const currentLang = getCurrentLanguage();
        const isValidLang = currentLang === 'ko' || currentLang === 'en';
        
        // Test market config functions
        const marketConfig = getCurrentMarketConfig();
        const hasMarketConfig = marketConfig && marketConfig.market && marketConfig.language;
        
        if (!isValidLang || !hasMarketConfig) {
          throw new Error(`Component integration issues: lang=${isValidLang}, market=${hasMarketConfig}`);
        }

        return {
          message: `Components properly integrated with i18n system`,
          details: { currentLang, marketConfig: marketConfig.market, isValidLang, hasMarketConfig }
        };
      } catch (error) {
        throw new Error(`Component integration failed: ${(error as any).message}`);
      }
    });
  }

  /**
   * Performance tests
   */
  private async runPerformanceTests(): Promise<void> {
    // Test 11: Language Switch Performance
    await this.runTest('Language Switch Performance', 'performance', async () => {
      const originalLang = getCurrentLanguage();
      const targetLang = originalLang === 'ko' ? 'en' : 'ko';
      
      const startTime = performance.now();
      await changeLanguage(targetLang);
      const endTime = performance.now();
      
      // Switch back
      await changeLanguage(originalLang);
      
      const switchTime = endTime - startTime;
      const isPerformant = switchTime < 100; // Should be under 100ms
      
      if (!isPerformant) {
        return {
          status: 'warning' as const,
          message: `Language switch took ${Math.round(switchTime)}ms (target: <100ms)`,
          details: { switchTime, target: 100 }
        };
      }

      return {
        message: `Language switch performance good: ${Math.round(switchTime)}ms`,
        details: { switchTime, target: 100 }
      };
    });

    // Test 12: Market Data Loading Performance
    await this.runTest('Market Data Loading Performance', 'performance', async () => {
      const startTime = performance.now();
      
      const roasters = getMarketRoasters();
      const origins = getMarketOrigins();
      const marketConfig = getCurrentMarketConfig();
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      const isPerformant = loadTime < 50; // Should be under 50ms
      
      if (!isPerformant) {
        return {
          status: 'warning' as const,
          message: `Market data loading took ${Math.round(loadTime)}ms (target: <50ms)`,
          details: { loadTime, target: 50, dataSize: roasters.length + origins.length }
        };
      }

      return {
        message: `Market data loading performance good: ${Math.round(loadTime)}ms`,
        details: { loadTime, target: 50, dataSize: roasters.length + origins.length }
      };
    });
  }

  /**
   * Run individual test with error handling and timing
   */
  private async runTest(
    testName: string, 
    category: ValidationTestResult['category'], 
    testFunction: () => Promise<{ message: string; details?: any; status?: 'pass' | 'warning' }>
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const result = await testFunction();
      const endTime = performance.now();
      
      this.results.push({
        testName,
        category,
        status: result.status || 'pass',
        message: result.message,
        details: result.details,
        executionTime: Math.round(endTime - startTime)
      });
      
      console.log(`✅ ${testName}: ${result.message}`);
    } catch (error) {
      const endTime = performance.now();
      
      this.results.push({
        testName,
        category,
        status: 'fail',
        message: 'Test failed',
        errorMessage: (error as any).message,
        executionTime: Math.round(endTime - startTime)
      });
      
      console.error(`❌ ${testName}: ${(error as any).message}`);
      
      // Report critical failures to performance monitor
      if (performanceMonitor) {
        performanceMonitor.reportError(error as Error, `i18n_validation_${testName.toLowerCase().replace(/\s+/g, '_')}`, 'medium');
      }
    }
  }

  /**
   * Generate summary report
   */
  private generateSummary(totalTime: number): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;
    
    const passRate = Math.round((passed / total) * 100);
    
    return `I18n Validation Complete: ${passed}/${total} tests passed (${passRate}%), ${warnings} warnings, ${failed} failures in ${totalTime}ms`;
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failures = this.results.filter(r => r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warning');
    
    if (failures.length > 0) {
      recommendations.push(`🚨 Fix ${failures.length} critical failures before deployment`);
      
      const criticalFailures = failures.filter(f => f.category === 'core' || f.category === 'market');
      if (criticalFailures.length > 0) {
        recommendations.push(`⚠️ ${criticalFailures.length} failures are in core/market functionality`);
      }
    }
    
    if (warnings.length > 0) {
      recommendations.push(`⚠️ Review ${warnings.length} warnings for optimization opportunities`);
      
      const performanceWarnings = warnings.filter(w => w.category === 'performance');
      if (performanceWarnings.length > 0) {
        recommendations.push(`🏃 ${performanceWarnings.length} performance optimizations available`);
      }
    }
    
    const avgExecutionTime = this.results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / this.results.length;
    if (avgExecutionTime > 100) {
      recommendations.push(`🐌 Average test execution time is ${Math.round(avgExecutionTime)}ms (optimize for <50ms)`);
    }
    
    if (failures.length === 0 && warnings.length === 0) {
      recommendations.push(`🎉 All tests passed! Dual-market i18n system is ready for deployment`);
    }
    
    return recommendations;
  }
}

export const i18nValidationSuite = I18nValidationSuite.getInstance();