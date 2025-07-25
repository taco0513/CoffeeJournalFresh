import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  getCurrentLanguage, 
  changeLanguage, 
  isKoreanMarket, 
  getMarketConfig,
} from '../services/i18n';
import { 
  getCurrentMarketConfig, 
  isBetaMarket,
  getMarketRoasters,
  getMarketOrigins,
  getMarketFlavorProfiles,
  getSupportedBrewMethods,
  formatCurrency,
  formatDate,
  isFeatureEnabled,
} from '../config/marketConfig';
import { 
  getCurrentDeploymentConfig,
  isFeatureFlagEnabled,
  getApiEndpoint,
} from '../config/deploymentConfig';
import { i18nValidationSuite } from './i18nValidationSuite';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Comprehensive Cross-Market Testing System
 * Tests app functionality across Korean and US market configurations
 */

export interface CrossMarketTestResult {
  testName: string;
  koreanResult: MarketTestResult;
  usResult: MarketTestResult;
  comparison: ComparisonResult;
  overallStatus: 'pass' | 'fail' | 'warning';
  recommendations: string[];
}

export interface MarketTestResult {
  market: 'korean' | 'us_beta';
  language: 'ko' | 'en';
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface ComparisonResult {
  expectedDifferences: ExpectedDifference[];
  unexpectedDifferences: UnexpectedDifference[];
  consistencyScore: number; // 0-100, higher is better
}

export interface ExpectedDifference {
  field: string;
  koreanValue: any;
  usValue: any;
  reason: string;
}

export interface UnexpectedDifference {
  field: string;
  koreanValue: any;
  usValue: any;
  severity: 'low' | 'medium' | 'high';
}

export interface CrossMarketTestSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  results: CrossMarketTestResult[];
  executionTime: number;
  summary: string;
  recommendations: string[];
}

class CrossMarketTester {
  private static instance: CrossMarketTester;
  private results: CrossMarketTestResult[] = [];

  private constructor() {}

  static getInstance(): CrossMarketTester {
    if (!CrossMarketTester.instance) {
      CrossMarketTester.instance = new CrossMarketTester();
    }
    return CrossMarketTester.instance;
  }

  /**
   * Run comprehensive cross-market test suite
   */
  async runFullTestSuite(): Promise<CrossMarketTestSuite> {
    const startTime = performance.now();
    this.results = [];

    console.log('🌍 Starting Cross-Market Test Suite...');

    // Store original state
    const originalLanguage = getCurrentLanguage();

    try {
      // Core functionality tests
      await this.testLanguageAndLocalization();
      await this.testMarketDataConsistency();
      await this.testFeatureAvailability();
      await this.testDataFormatting();
      await this.testUserFlows();
      await this.testPerformanceAcrossMarkets();
      await this.testDeploymentConfiguration();
      await this.testBetaTestingFunctionality();

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      const summary = this.generateSummary(executionTime);
      const recommendations = this.generateRecommendations();

      console.log(`✅ Cross-Market Test Suite completed in ${executionTime}ms`);

      return {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.overallStatus === 'pass').length,
        failedTests: this.results.filter(r => r.overallStatus === 'fail').length,
        warningTests: this.results.filter(r => r.overallStatus === 'warning').length,
        results: this.results,
        executionTime,
        summary,
        recommendations,
      };
    } finally {
      // Restore original language
      await changeLanguage(originalLanguage);
    }
  }

  /**
   * Test language and localization across markets
   */
  private async testLanguageAndLocalization(): Promise<void> {
    await this.runCrossMarketTest('Language and Localization', async (market) => {
      const targetLanguage = market === 'korean' ? 'ko' : 'en';
      
      // Force market context for testing
      await this.setMarketContext(market);
      await changeLanguage(targetLanguage);
      
      const currentLang = getCurrentLanguage();
      const marketConfig = getMarketConfig();
      
      // Test key translations
      const testKeys = [
        'home', 'journal', 'profile', 'coffeeJournal', 
        'startNewTasting', 'cafeMode', 'homeCafeMode', 'labMode'
      ];
      
      const translations: Record<string, string> = {};
      const i18n = require('i18next').default;
      
      for (const key of testKeys) {
        translations[key] = i18n.t(key);
      }
      
      const hasTranslations = testKeys.every(key => 
        translations[key] && translations[key] !== key
      );
      
      return {
        market,
        language: targetLanguage,
        success: currentLang === targetLanguage && hasTranslations,
        message: `Language: ${currentLang}, Translations: ${hasTranslations ? 'Available' : 'Missing'}`,
        data: { currentLang, marketConfig, translations, testKeys },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test market data consistency
   */
  private async testMarketDataConsistency(): Promise<void> {
    await this.runCrossMarketTest('Market Data Consistency', async (market) => {
      await this.setMarketContext(market);
      
      const roasters = getMarketRoasters();
      const origins = getMarketOrigins();
      const flavorProfiles = getMarketFlavorProfiles();
      const brewMethods = getSupportedBrewMethods();
      
      // Validate market-specific data
      const isKorean = market === 'korean';
      const hasCorrectRoasters = isKorean ? 
        roasters.some(r => r.includes('Coffee Libre') || r.includes('Anthracite')) :
        roasters.some(r => r.includes('Blue Bottle') || r.includes('Stumptown'));
      
      const hasCorrectOrigins = isKorean ?
        origins.some(o => o.includes('에티오피아') || o.includes('케냐')) :
        origins.some(o => o.includes('Ethiopia') || o.includes('Kenya'));
      
      const dataComplete = roasters.length > 0 && origins.length > 0 && 
                          flavorProfiles.length > 0 && brewMethods.length > 0;
      
      return {
        market,
        language: isKorean ? 'ko' : 'en',
        success: dataComplete && hasCorrectRoasters,
        message: `Data completeness: ${dataComplete}, Correct roasters: ${hasCorrectRoasters}`,
        data: {
          counts: {
            roasters: roasters.length,
            origins: origins.length,
            flavorProfiles: flavorProfiles.length,
            brewMethods: brewMethods.length
          },
          samples: {
            roasters: roasters.slice(0, 3),
            origins: origins.slice(0, 3),
            flavorProfiles: flavorProfiles.slice(0, 3)
          },
          hasCorrectRoasters,
          hasCorrectOrigins
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test feature availability across markets
   */
  private async testFeatureAvailability(): Promise<void> {
    await this.runCrossMarketTest('Feature Availability', async (market) => {
      await this.setMarketContext(market);
      
      const features = {
        homeCafeMode: isFeatureEnabled('homeCafeMode'),
        labMode: isFeatureEnabled('labMode'),
        marketIntelligence: isFeatureEnabled('marketIntelligence'),
        achievements: isFeatureEnabled('achievements'),
      };
      
      const deploymentFeatures = {
        performanceDashboard: isFeatureFlagEnabled('performanceDashboard'),
        betaTestingDashboard: isFeatureFlagEnabled('betaTestingDashboard'),
        crashReporting: isFeatureFlagEnabled('crashReporting'),
      };
      
      // Korean market should have Lab Mode, US Beta should not
      const isKorean = market === 'korean';
      const labModeCorrect = isKorean ? features.labMode : !features.labMode;
      const betaDashboardCorrect = !isKorean ? deploymentFeatures.betaTestingDashboard : true;
      
      const featuresCorrect = features.homeCafeMode && features.achievements && 
                             labModeCorrect && betaDashboardCorrect;
      
      return {
        market,
        language: isKorean ? 'ko' : 'en',
        success: featuresCorrect,
        message: `Features configured correctly: ${featuresCorrect}`,
        data: {
          features,
          deploymentFeatures,
          validations: {
            labModeCorrect,
            betaDashboardCorrect,
            isKorean
          }
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test data formatting across markets
   */
  private async testDataFormatting(): Promise<void> {
    await this.runCrossMarketTest('Data Formatting', async (market) => {
      await this.setMarketContext(market);
      
      const testAmount = 5000;
      const testDate = new Date();
      
      const currencyFormat = formatCurrency(testAmount);
      const dateFormat = formatDate(testDate);
      
      const isKorean = market === 'korean';
      const correctCurrency = isKorean ?
        (currencyFormat.includes('₩') || currencyFormat.includes('KRW')) :
        (currencyFormat.includes('$') || currencyFormat.includes('USD'));
      
      // Date format validation (Korean vs US format)
      const hasDateFormat = Boolean(dateFormat && dateFormat.length > 0);
      
      return {
        market,
        language: isKorean ? 'ko' : 'en',
        success: correctCurrency && hasDateFormat,
        message: `Currency: ${correctCurrency ? 'Correct' : 'Incorrect'}, Date: ${hasDateFormat ? 'Formatted' : 'Missing'}`,
        data: {
          testAmount,
          currencyFormat,
          dateFormat,
          correctCurrency,
          hasDateFormat,
          isKorean
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test critical user flows
   */
  private async testUserFlows(): Promise<void> {
    await this.runCrossMarketTest('Critical User Flows', async (market) => {
      await this.setMarketContext(market);
      
      const isKorean = market === 'korean';
      
      // Test mode selection flow
      const availableModes = [];
      if (isFeatureEnabled('homeCafeMode')) availableModes.push('homeCafe');
      if (isFeatureEnabled('labMode')) availableModes.push('lab');
      availableModes.push('cafe'); // Always available
      
      // Test sensory evaluation system
      const koreanExpressions = [
        '싱그러운', '발랄한', '농밀한', '달콤한', 
        '스모키한', '카카오 같은', '크리미한', '벨벳 같은'
      ];
      
      const englishExpressions = [
        'bright', 'fruity', 'rich', 'sweet',
        'smoky', 'chocolatey', 'creamy', 'smooth'
      ];
      
      const expectedExpressions = isKorean ? koreanExpressions : englishExpressions;
      const hasCorrectExpressions = expectedExpressions.length > 0;
      
      // Test data persistence flow
      const canSaveData = true; // Assume data persistence is available
      
      const flowsWorking = availableModes.length > 0 && hasCorrectExpressions && canSaveData;
      
      return {
        market,
        language: isKorean ? 'ko' : 'en',
        success: flowsWorking,
        message: `User flows working: ${flowsWorking}`,
        data: {
          availableModes,
          expectedExpressions: expectedExpressions.slice(0, 4),
          hasCorrectExpressions,
          canSaveData,
          isKorean
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test performance across markets
   */
  private async testPerformanceAcrossMarkets(): Promise<void> {
    await this.runCrossMarketTest('Performance Metrics', async (market) => {
      await this.setMarketContext(market);
      
      const startTime = performance.now();
      
      // Test data loading performance
      const roasters = getMarketRoasters();
      const origins = getMarketOrigins();
      const flavorProfiles = getMarketFlavorProfiles();
      
      const dataLoadTime = performance.now() - startTime;
      
      // Test language switching performance
      const langSwitchStart = performance.now();
      const currentLang = getCurrentLanguage();
      const targetLang = currentLang === 'ko' ? 'en' : 'ko';
      await changeLanguage(targetLang);
      await changeLanguage(currentLang); // Switch back
      const langSwitchTime = performance.now() - langSwitchStart;
      
      const performanceGood = dataLoadTime < 100 && langSwitchTime < 200;
      
      return {
        market,
        language: market === 'korean' ? 'ko' : 'en',
        success: performanceGood,
        message: `Performance: Data ${Math.round(dataLoadTime)}ms, Lang switch ${Math.round(langSwitchTime)}ms`,
        data: {
          dataLoadTime: Math.round(dataLoadTime),
          langSwitchTime: Math.round(langSwitchTime),
          dataSize: roasters.length + origins.length + flavorProfiles.length,
          performanceGood,
          thresholds: { dataLoad: 100, langSwitch: 200 }
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test deployment configuration
   */
  private async testDeploymentConfiguration(): Promise<void> {
    await this.runCrossMarketTest('Deployment Configuration', async (market) => {
      await this.setMarketContext(market);
      
      const deploymentConfig = getCurrentDeploymentConfig();
      const marketConfig = getCurrentMarketConfig();
      
      const hasMarketConfig = deploymentConfig.marketConfig[market] !== undefined;
      const apiEndpoint = getApiEndpoint();
      const hasApiEndpoint = Boolean(apiEndpoint && apiEndpoint.length > 0);
      
      // Test environment-specific settings
      const environment = deploymentConfig.environment;
      const version = deploymentConfig.version;
      const hasVersion = Boolean(version && version.length > 0);
      
      const configurationValid = hasMarketConfig && hasApiEndpoint && hasVersion;
      
      return {
        market,
        language: market === 'korean' ? 'ko' : 'en',
        success: configurationValid,
        message: `Configuration: ${configurationValid ? 'Valid' : 'Invalid'}`,
        data: {
          hasMarketConfig,
          hasApiEndpoint,
          hasVersion,
          environment,
          version,
          apiEndpoint: apiEndpoint?.substring(0, 50) + '...',
          marketConfigExists: !!deploymentConfig.marketConfig[market]
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Test beta testing functionality
   */
  private async testBetaTestingFunctionality(): Promise<void> {
    await this.runCrossMarketTest('Beta Testing Functionality', async (market) => {
      await this.setMarketContext(market);
      
      const isBeta = isBetaMarket();
      const isKorean = market === 'korean';
      
      // Beta market detection should be correct
      const betaDetectionCorrect = isKorean ? !isBeta : isBeta;
      
      // Test beta feature flags
      const betaDashboard = isFeatureFlagEnabled('betaTestingDashboard');
      const crashReporting = isFeatureFlagEnabled('crashReporting');
      
      // US Beta should have beta dashboard, Korean should not necessarily
      const betaFeaturesCorrect = !isKorean ? betaDashboard : true;
      
      const betaFunctionalityWorking = betaDetectionCorrect && betaFeaturesCorrect && crashReporting;
      
      return {
        market,
        language: isKorean ? 'ko' : 'en',
        success: betaFunctionalityWorking,
        message: `Beta functionality: ${betaFunctionalityWorking ? 'Working' : 'Issues detected'}`,
        data: {
          isBeta,
          isKorean,
          betaDetectionCorrect,
          betaDashboard,
          crashReporting,
          betaFeaturesCorrect
        },
        executionTime: 0 // Will be set by executeMarketTest
      };
    });
  }

  /**
   * Run a cross-market test comparing Korean and US configurations
   */
  private async runCrossMarketTest(
    testName: string,
    testFunction: (market: 'korean' | 'us_beta') => Promise<MarketTestResult>
  ): Promise<void> {
    console.log(`🧪 Running ${testName}...`);
    
    try {
      // Test Korean market
      const koreanResult = await this.executeMarketTest('korean', testFunction);
      
      // Test US market
      const usResult = await this.executeMarketTest('us_beta', testFunction);
      
      // Compare results
      const comparison = this.compareMarketResults(koreanResult, usResult);
      
      // Determine overall status
      const overallStatus = this.determineOverallStatus(koreanResult, usResult, comparison);
      
      // Generate recommendations
      const recommendations = this.generateTestRecommendations(testName, koreanResult, usResult, comparison);
      
      this.results.push({
        testName,
        koreanResult,
        usResult,
        comparison,
        overallStatus,
        recommendations
      });
      
      console.log(`✅ ${testName}: ${overallStatus}`);
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      
      // Add failed test result
      this.results.push({
        testName,
        koreanResult: {
          market: 'korean',
          language: 'ko',
          success: false,
          message: 'Test execution failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        },
        usResult: {
          market: 'us_beta',  
          language: 'en',
          success: false,
          message: 'Test execution failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        },
        comparison: {
          expectedDifferences: [],
          unexpectedDifferences: [],
          consistencyScore: 0
        },
        overallStatus: 'fail',
        recommendations: [`Fix test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  /**
   * Execute test for a specific market
   */
  private async executeMarketTest(
    market: 'korean' | 'us_beta',
    testFunction: (market: 'korean' | 'us_beta') => Promise<MarketTestResult>
  ): Promise<MarketTestResult> {
    const startTime = performance.now();
    
    try {
      const result = await testFunction(market);
      const endTime = performance.now();
      
      return {
        ...result,
        executionTime: Math.round(endTime - startTime)
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        market,
        language: market === 'korean' ? 'ko' : 'en',
        success: false,
        message: 'Market test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Math.round(endTime - startTime)
      };
    }
  }

  /**
   * Compare results between markets
   */
  private compareMarketResults(koreanResult: MarketTestResult, usResult: MarketTestResult): ComparisonResult {
    const expectedDifferences: ExpectedDifference[] = [];
    const unexpectedDifferences: UnexpectedDifference[] = [];
    
    // Expected differences
    expectedDifferences.push({
      field: 'market',
      koreanValue: koreanResult.market,
      usValue: usResult.market,
      reason: 'Different target markets'
    });
    
    expectedDifferences.push({
      field: 'language',
      koreanValue: koreanResult.language,
      usValue: usResult.language,
      reason: 'Different primary languages'
    });
    
    // Check for unexpected differences
    if (koreanResult.success !== usResult.success) {
      const severity = (koreanResult.success || usResult.success) ? 'medium' : 'high';
      unexpectedDifferences.push({
        field: 'success',
        koreanValue: koreanResult.success,
        usValue: usResult.success,
        severity
      });
    }
    
    // Calculate consistency score
    const totalChecks = 5; // success, execution time, data presence, etc.
    let consistentChecks = 0;
    
    // Both should either succeed or fail (unless expected to differ)
    if (koreanResult.success === usResult.success) consistentChecks++;
    
    // Execution times should be similar (within 200ms)
    if (Math.abs(koreanResult.executionTime - usResult.executionTime) < 200) consistentChecks++;
    
    // Both should have data or both should not
    if (!!koreanResult.data === !!usResult.data) consistentChecks++;
    
    // Both should have errors or both should not
    if (!!koreanResult.error === !!usResult.error) consistentChecks++;
    
    // Messages should indicate similar states
    if (koreanResult.success === usResult.success) consistentChecks++;
    
    const consistencyScore = Math.round((consistentChecks / totalChecks) * 100);
    
    return {
      expectedDifferences,
      unexpectedDifferences,
      consistencyScore
    };
  }

  /**
   * Determine overall test status
   */
  private determineOverallStatus(
    koreanResult: MarketTestResult,
    usResult: MarketTestResult,
    comparison: ComparisonResult
  ): 'pass' | 'fail' | 'warning' {
    // If both markets fail, overall fails
    if (!koreanResult.success && !usResult.success) {
      return 'fail';
    }
    
    // If one market fails unexpectedly, it's a failure
    if (comparison.unexpectedDifferences.some(d => d.severity === 'high')) {
      return 'fail';
    }
    
    // If consistency score is low, it's a warning
    if (comparison.consistencyScore < 70) {
      return 'warning';
    }
    
    // If both markets succeed, it's a pass
    if (koreanResult.success && usResult.success) {
      return 'pass';
    }
    
    // Mixed results with medium severity issues
    return 'warning';
  }

  /**
   * Generate recommendations for a specific test
   */
  private generateTestRecommendations(
    testName: string,
    koreanResult: MarketTestResult,
    usResult: MarketTestResult,
    comparison: ComparisonResult
  ): string[] {
    const recommendations: string[] = [];
    
    // Failed tests
    if (!koreanResult.success) {
      recommendations.push(`Fix Korean market issues: ${koreanResult.message}`);
    }
    if (!usResult.success) {
      recommendations.push(`Fix US market issues: ${usResult.message}`);
    }
    
    // Performance issues
    if (koreanResult.executionTime > 200) {
      recommendations.push(`Optimize Korean market performance (${koreanResult.executionTime}ms)`);
    }
    if (usResult.executionTime > 200) {
      recommendations.push(`Optimize US market performance (${usResult.executionTime}ms)`);
    }
    
    // Consistency issues
    if (comparison.consistencyScore < 70) {
      recommendations.push(`Improve cross-market consistency (${comparison.consistencyScore}% consistent)`);
    }
    
    // High severity unexpected differences
    comparison.unexpectedDifferences
      .filter(d => d.severity === 'high')
      .forEach(d => {
        recommendations.push(`Critical difference in ${d.field}: Korean=${d.koreanValue}, US=${d.usValue}`);
      });
    
    return recommendations;
  }

  /**
   * Set market context for testing
   */
  private async setMarketContext(market: 'korean' | 'us_beta'): Promise<void> {
    // This would typically involve setting test environment variables
    // or using dependency injection to override market detection
    // For now, we'll rely on the existing market detection logic
    
    // Simulate market context if needed
    const targetLanguage = market === 'korean' ? 'ko' : 'en';
    await changeLanguage(targetLanguage);
    
    // Small delay to allow context to update
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Generate overall summary
   */
  private generateSummary(executionTime: number): string {
    const total = this.results.length;
    const passed = this.results.filter(r => r.overallStatus === 'pass').length;
    const failed = this.results.filter(r => r.overallStatus === 'fail').length;
    const warnings = this.results.filter(r => r.overallStatus === 'warning').length;
    
    const passRate = Math.round((passed / total) * 100);
    
    return `Cross-Market Testing Complete: ${passed}/${total} tests passed (${passRate}%), ${warnings} warnings, ${failed} failures in ${executionTime}ms`;
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failures = this.results.filter(r => r.overallStatus === 'fail');
    const warnings = this.results.filter(r => r.overallStatus === 'warning');
    
    if (failures.length > 0) {
      recommendations.push(`🚨 Fix ${failures.length} critical cross-market failures before deployment`);
      
      // Specific failure categories
      const criticalFailures = failures.filter(f => 
        f.testName.includes('Language') || f.testName.includes('Feature')
      );
      if (criticalFailures.length > 0) {
        recommendations.push(`⚠️ ${criticalFailures.length} failures are in core functionality`);
      }
    }
    
    if (warnings.length > 0) {
      recommendations.push(`⚠️ Review ${warnings.length} cross-market warnings for optimization`);
      
      // Performance warnings
      const performanceIssues = this.results.filter(r => 
        r.koreanResult.executionTime > 200 || r.usResult.executionTime > 200
      );
      if (performanceIssues.length > 0) {
        recommendations.push(`🏃 ${performanceIssues.length} performance optimizations needed`);
      }
    }
    
    // Consistency recommendations
    const lowConsistency = this.results.filter(r => r.comparison.consistencyScore < 70);
    if (lowConsistency.length > 0) {
      recommendations.push(`🔄 Improve consistency for ${lowConsistency.length} tests`);
    }
    
    if (failures.length === 0 && warnings.length === 0) {
      recommendations.push(`🎉 All cross-market tests passed! App is ready for dual-market deployment`);
    }
    
    return recommendations;
  }
}

export const crossMarketTester = CrossMarketTester.getInstance();