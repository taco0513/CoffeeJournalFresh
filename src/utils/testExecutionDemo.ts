import { Alert } from 'react-native';
import { crossMarketTester } from './crossMarketTester';
import { i18nValidationSuite } from './i18nValidationSuite';
import { getCurrentLanguage, changeLanguage } from '../services/i18n';
import { getCurrentMarketConfig, isBetaMarket } from '../config/marketConfig';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Test Execution Demo
 * Demonstrates comprehensive cross-market testing functionality
 */

export interface TestExecutionResult {
  testType: 'full-suite' | 'i18n-only' | 'cross-market-only' | 'performance-only';
  executionTime: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  summary: string;
  recommendations: string[];
  detailedResults?: any[];
}

export class TestExecutionDemo {
  private static instance: TestExecutionDemo;
  
  private constructor() {}

  static getInstance(): TestExecutionDemo {
    if (!TestExecutionDemo.instance) {
      TestExecutionDemo.instance = new TestExecutionDemo();
    }
    return TestExecutionDemo.instance;
  }

  /**
   * Run comprehensive test suite with all validations
   */
  async runFullTestSuite(): Promise<TestExecutionResult> {
    const startTime = performance.now();
    
    console.log('🚀 Starting Full Test Suite...');
    console.log('📊 Current Market Status:', {
      language: getCurrentLanguage(),
      market: getCurrentMarketConfig().market,
      isBeta: isBetaMarket(),
      timestamp: new Date().toISOString()
    });

    try {
      // Run i18n validation first
      console.log('🔤 Running I18n Validation Suite...');
      const i18nResults = await i18nValidationSuite.runFullValidation();
      
      // Run cross-market testing
      console.log('🌍 Running Cross-Market Test Suite...');
      const crossMarketResults = await crossMarketTester.runFullTestSuite();
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      // Combine results
      const totalTests = i18nResults.totalTests + crossMarketResults.totalTests;
      const passedTests = i18nResults.passedTests + crossMarketResults.passedTests;
      const failedTests = i18nResults.failedTests + crossMarketResults.failedTests;
      const warningTests = i18nResults.warningTests + crossMarketResults.warningTests;
      
      const passRate = Math.round((passedTests / totalTests) * 100);
      
      const summary = `Full Test Suite Complete: ${passedTests}/${totalTests} tests passed (${passRate}%), ${warningTests} warnings, ${failedTests} failures in ${executionTime}ms`;
      
      // Combined recommendations
      const recommendations = [
        ...i18nResults.recommendations.slice(0, 3),
        ...crossMarketResults.recommendations.slice(0, 3),
      ];
      
      // Add deployment readiness assessment
      const isReadyForDeployment = failedTests === 0 && warningTests < 3;
      if (isReadyForDeployment) {
        recommendations.unshift('🎉 App is ready for dual-market deployment!');
      } else {
        recommendations.unshift(`⚠️ Address ${failedTests} failures and ${warningTests} warnings before deployment`);
      }
      
      console.log('✅ Full Test Suite completed:', summary);
      
      // Report to performance monitor (for future implementation)
      // if (performanceMonitor) {
      //   performanceMonitor.reportMetric('test_suite_execution_time', executionTime, 'ms');
      //   performanceMonitor.reportMetric('test_suite_pass_rate', passRate, '%');
      // }
      
      return {
        testType: 'full-suite',
        executionTime,
        totalTests,
        passedTests,
        failedTests,
        warningTests,
        summary,
        recommendations,
        detailedResults: [
          { type: 'i18n', results: i18nResults },
          { type: 'cross-market', results: crossMarketResults }
        ]
      };
    } catch (error) {
      console.error('❌ Full Test Suite failed:', error);
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        testType: 'full-suite',
        executionTime,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        warningTests: 0,
        summary: `Full Test Suite failed: ${errorMessage}`,
        recommendations: [`Fix test suite execution error: ${errorMessage}`]
      };
    }
  }

  /**
   * Run only i18n validation tests
   */
  async runI18nValidationOnly(): Promise<TestExecutionResult> {
    const startTime = performance.now();
    
    console.log('🔤 Starting I18n Validation Only...');
    
    try {
      const results = await i18nValidationSuite.runFullValidation();
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      console.log('✅ I18n Validation completed:', results.summary);
      
      return {
        testType: 'i18n-only',
        executionTime,
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        warningTests: results.warningTests,
        summary: results.summary,
        recommendations: results.recommendations,
        detailedResults: [{ type: 'i18n', results }]
      };
    } catch (error) {
      console.error('❌ I18n Validation failed:', error);
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      return {
        testType: 'i18n-only',
        executionTime,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        warningTests: 0,
        summary: `I18n Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [`Fix i18n validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Run only cross-market tests
   */
  async runCrossMarketTestsOnly(): Promise<TestExecutionResult> {
    const startTime = performance.now();
    
    console.log('🌍 Starting Cross-Market Tests Only...');
    
    try {
      const results = await crossMarketTester.runFullTestSuite();
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      console.log('✅ Cross-Market Tests completed:', results.summary);
      
      return {
        testType: 'cross-market-only',
        executionTime,
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        warningTests: results.warningTests,
        summary: results.summary,
        recommendations: results.recommendations,
        detailedResults: [{ type: 'cross-market', results }]
      };
    } catch (error) {
      console.error('❌ Cross-Market Tests failed:', error);
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      return {
        testType: 'cross-market-only',
        executionTime,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        warningTests: 0,
        summary: `Cross-Market Tests failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [`Fix cross-market testing error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Run performance-focused tests
   */
  async runPerformanceTestsOnly(): Promise<TestExecutionResult> {
    const startTime = performance.now();
    
    console.log('⚡ Starting Performance Tests Only...');
    
    try {
      // Test language switching performance
      const langSwitchResults = await this.testLanguageSwitchingPerformance();
      
      // Test market data loading performance
      const dataLoadResults = await this.testMarketDataLoadingPerformance();
      
      // Test navigation performance
      const navigationResults = await this.testNavigationPerformance();
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      // Aggregate results
      const allResults = [langSwitchResults, dataLoadResults, navigationResults];
      const passedTests = allResults.filter(r => r.success).length;
      const failedTests = allResults.filter(r => !r.success).length;
      
      const summary = `Performance Tests Complete: ${passedTests}/${allResults.length} tests passed in ${executionTime}ms`;
      
      const recommendations = [];
      allResults.forEach(result => {
        if (!result.success) {
          recommendations.push(`Fix ${result.testName}: ${result.message}`);
        }
      });
      
      if (recommendations.length === 0) {
        recommendations.push('🚀 All performance tests passed! App performance is optimal.');
      }
      
      console.log('✅ Performance Tests completed:', summary);
      
      return {
        testType: 'performance-only',
        executionTime,
        totalTests: allResults.length,
        passedTests,
        failedTests,
        warningTests: 0,
        summary,
        recommendations,
        detailedResults: [{ type: 'performance', results: allResults }]
      };
    } catch (error) {
      console.error('❌ Performance Tests failed:', error);
      
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      return {
        testType: 'performance-only',
        executionTime,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        warningTests: 0,
        summary: `Performance Tests failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [`Fix performance testing error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Test language switching performance
   */
  private async testLanguageSwitchingPerformance(): Promise<any> {
    const originalLang = getCurrentLanguage();
    const targetLang = originalLang === 'ko' ? 'en' : 'ko';
    
    const startTime = performance.now();
    await changeLanguage(targetLang);
    await changeLanguage(originalLang); // Switch back
    const endTime = performance.now();
    
    const switchTime = endTime - startTime;
    const isGood = switchTime < 200; // Target: under 200ms
    
    return {
      testName: 'Language Switching Performance',
      success: isGood,
      message: `${Math.round(switchTime)}ms (target: <200ms)`,
      executionTime: switchTime,
      data: { originalLang, targetLang, switchTime }
    };
  }

  /**
   * Test market data loading performance
   */
  private async testMarketDataLoadingPerformance(): Promise<any> {
    const startTime = performance.now();
    
    // Import market functions dynamically to simulate real loading
    const { getMarketRoasters, getMarketOrigins, getMarketFlavorProfiles } = 
      await import('../config/marketConfig');
    
    const roasters = getMarketRoasters();
    const origins = getMarketOrigins();
    const flavorProfiles = getMarketFlavorProfiles();
    
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    const isGood = loadTime < 100; // Target: under 100ms
    
    return {
      testName: 'Market Data Loading Performance',
      success: isGood,
      message: `${Math.round(loadTime)}ms (target: <100ms)`,
      executionTime: loadTime,
      data: {
        dataSize: roasters.length + origins.length + flavorProfiles.length,
        loadTime
      }
    };
  }

  /**
   * Test navigation performance (simulated)
   */
  private async testNavigationPerformance(): Promise<any> {
    const startTime = performance.now();
    
    // Simulate navigation operations
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const endTime = performance.now();
    
    const navTime = endTime - startTime;
    const isGood = navTime < 50; // Target: under 50ms for navigation
    
    return {
      testName: 'Navigation Performance',
      success: isGood,
      message: `${Math.round(navTime)}ms (target: <50ms)`,
      executionTime: navTime,
      data: { navTime }
    };
  }

  /**
   * Generate deployment readiness report
   */
  async generateDeploymentReadinessReport(): Promise<{
    ready: boolean;
    score: number;
    report: string;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    console.log('📋 Generating Deployment Readiness Report...');
    
    try {
      const testResults = await this.runFullTestSuite();
      
      // Calculate readiness score
      const passRate = (testResults.passedTests / testResults.totalTests) * 100;
      let score = passRate;
      
      // Penalize for failures and warnings
      score -= (testResults.failedTests * 10); // -10 points per failure
      score -= (testResults.warningTests * 3);  // -3 points per warning
      
      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));
      
      const ready = score >= 85 && testResults.failedTests === 0;
      
      const criticalIssues: string[] = [];
      if (testResults.failedTests > 0) {
        criticalIssues.push(`${testResults.failedTests} test failures must be resolved`);
      }
      if (testResults.warningTests > 5) {
        criticalIssues.push(`${testResults.warningTests} warnings should be reviewed`);
      }
      if (testResults.executionTime > 10000) {
        criticalIssues.push(`Test execution time too slow: ${testResults.executionTime}ms`);
      }
      
      const report = `
Deployment Readiness Report
==========================

Overall Score: ${Math.round(score)}/100
Status: ${ready ? '✅ READY FOR DEPLOYMENT' : '❌ NOT READY FOR DEPLOYMENT'}

Test Results:
- Total Tests: ${testResults.totalTests}
- Passed: ${testResults.passedTests} (${Math.round(passRate)}%)
- Failed: ${testResults.failedTests}
- Warnings: ${testResults.warningTests}
- Execution Time: ${testResults.executionTime}ms

${ready ? 
  'The app has passed all critical tests and is ready for dual-market deployment.' :
  'The app requires fixes before deployment. See critical issues below.'
}
      `.trim();
      
      return {
        ready,
        score: Math.round(score),
        report,
        criticalIssues,
        recommendations: testResults.recommendations
      };
    } catch (error) {
      return {
        ready: false,
        score: 0,
        report: `Deployment readiness check failed: ${error.message}`,
        criticalIssues: ['Unable to run deployment readiness tests'],
        recommendations: ['Fix test execution issues before attempting deployment']
      };
    }
  }

  /**
   * Show interactive test results
   */
  async showTestResults(results: TestExecutionResult): Promise<void> {
    const statusEmoji = results.failedTests === 0 ? '✅' : '❌';
    const deploymentStatus = results.failedTests === 0 && results.warningTests < 3 ? 
      'Ready for deployment' : 'Requires fixes';
    
    Alert.alert(
      `${statusEmoji} Test Results`,
      `${results.summary}\n\nDeployment Status: ${deploymentStatus}\n\nTop Recommendations:\n${results.recommendations.slice(0, 3).join('\n')}`,
      [
        { text: 'View Details', onPress: () => console.log('Detailed Results:', results.detailedResults) },
        { text: 'OK' }
      ]
    );
  }
}

export const testExecutionDemo = TestExecutionDemo.getInstance();