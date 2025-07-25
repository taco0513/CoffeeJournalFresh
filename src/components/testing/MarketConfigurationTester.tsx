import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { 
  getCurrentMarketConfig,
  isBetaMarket,
  isFeatureEnabled,
  getMarketRoasters,
  getMarketOrigins,
  getMarketFlavorProfiles,
  getSupportedBrewMethods,
  formatCurrency,
  formatDate,
  formatTime,
} from '../../config/marketConfig';
import { 
  getCurrentDeploymentConfig,
  isFeatureFlagEnabled,
  getApiEndpoint,
  getRateLimit,
  isMaintenanceMode,
  getRolloutPercentage,
} from '../../config/deploymentConfig';
import { betaTestingService } from '../../services/BetaTestingService';
import { HIGColors, HIGConstants } from '../../constants/HIG';

/**
 * Market Configuration Tester
 * Comprehensive testing of app functionality across Korean and US market configurations
 */

interface TestScenario {
  id: string;
  name: string;
  description: string;
  market: 'korean' | 'us_beta';
  language: 'ko' | 'en';
  testFunction: () => Promise<TestResult>;
}

interface TestResult {
  scenario: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const MarketConfigurationTester: React.FC = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [currentMarketInfo, setCurrentMarketInfo] = useState<any>({});

  useEffect(() => {
    loadCurrentMarketInfo();
  }, []);

  /**
   * Load current market information
   */
  const loadCurrentMarketInfo = async () => {
    try {
      const marketConfig = getCurrentMarketConfig();
      const deploymentConfig = getCurrentDeploymentConfig();
      const isBeta = isBetaMarket();
      
      setCurrentMarketInfo({
        marketConfig,
        deploymentConfig,
        isBeta,
        features: {
          homeCafeMode: isFeatureEnabled('homeCafeMode'),
          labMode: isFeatureEnabled('labMode'),
          marketIntelligence: isFeatureEnabled('marketIntelligence'),
          achievements: isFeatureEnabled('achievements'),
        },
        deploymentFeatures: {
          performanceDashboard: isFeatureFlagEnabled('performanceDashboard'),
          betaTestingDashboard: isFeatureFlagEnabled('betaTestingDashboard'),
          crashReporting: isFeatureFlagEnabled('crashReporting'),
        },
        data: {
          roasters: getMarketRoasters().slice(0, 5),
          origins: getMarketOrigins().slice(0, 5),
          flavorProfiles: getMarketFlavorProfiles().slice(0, 5),
          brewMethods: getSupportedBrewMethods().slice(0, 5),
        },
        formatting: {
          currency: formatCurrency(5000),
          date: formatDate(new Date()),
          time: formatTime(new Date()),
        },
        technical: {
          apiEndpoint: getApiEndpoint(),
          rateLimits: {
            apiCalls: getRateLimit('apiCalls', 'requestsPerMinute'),
            feedback: getRateLimit('feedback', 'requestsPerHour'),
          },
          maintenanceMode: isMaintenanceMode(),
          rolloutPercentage: getRolloutPercentage(),
        },
      });
    } catch (error: any) {
      console.error('Failed to load market info:', error);
    }
  };

  /**
   * Test scenarios for different market configurations
   */
  const testScenarios: TestScenario[] = [
    {
      id: 'korean_full_features',
      name: 'Korean Market - Full Features',
      description: 'Test all features available in Korean primary market',
      market: 'korean',
      language: 'ko',
      testFunction: async () => {
        try {
          // Test feature availability
          const features = {
            homeCafeMode: isFeatureEnabled('homeCafeMode'),
            labMode: isFeatureEnabled('labMode'),
            marketIntelligence: isFeatureEnabled('marketIntelligence'),
            achievements: isFeatureEnabled('achievements'),
          };
          
          // Test Korean data
          const roasters = getMarketRoasters();
          const hasKoreanRoasters = roasters.some(r => 
            r.includes('Coffee Libre') || r.includes('Anthracite') || r.includes('Terarosa')
          );
          
          // Test formatting
          const currencyFormat = formatCurrency(5000);
          const isKoreanCurrency = currencyFormat.includes('₩') || currencyFormat.includes('KRW');
          
          const success = features.homeCafeMode && features.labMode && hasKoreanRoasters && isKoreanCurrency;
          
          return {
            scenario: 'Korean Market - Full Features',
            success,
            message: success ? 'All Korean market features working' : 'Some features missing or incorrect',
            data: { features, roasters: roasters.slice(0, 3), currencyFormat, hasKoreanRoasters, isKoreanCurrency }
          };
        } catch (error: any) {
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
      id: 'us_beta_limited_features',
      name: 'US Beta Market - Limited Features',
      description: 'Test beta feature set for US market',
      market: 'us_beta',
      language: 'en',
      testFunction: async () => {
        try {
          // Test feature availability (Lab mode should be disabled for US beta)
          const features = {
            homeCafeMode: isFeatureEnabled('homeCafeMode'),
            labMode: isFeatureEnabled('labMode'),
            marketIntelligence: isFeatureEnabled('marketIntelligence'),
            achievements: isFeatureEnabled('achievements'),
            betaTestingDashboard: isFeatureFlagEnabled('betaTestingDashboard'),
          };
          
          // Test US data
          const roasters = getMarketRoasters();
          const hasUSRoasters = roasters.some(r => 
            r.includes('Blue Bottle') || r.includes('Stumptown') || r.includes('Counter Culture')
          );
          
          // Test formatting
          const currencyFormat = formatCurrency(5000);
          const isUSCurrency = currencyFormat.includes('$') || currencyFormat.includes('USD');
          
          const success = features.homeCafeMode && !features.labMode && features.betaTestingDashboard && hasUSRoasters && isUSCurrency;
          
          return {
            scenario: 'US Beta Market - Limited Features',
            success,
            message: success ? 'US beta configuration working correctly' : 'US beta configuration issues detected',
            data: { features, roasters: roasters.slice(0, 3), currencyFormat, hasUSRoasters, isUSCurrency }
          };
        } catch (error: any) {
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
      testFunction: async () => {
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
        } catch (error: any) {
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
      testFunction: async () => {
        try {
          // Test beta user initialization
          const testEmail = 'test@cupnote.app';
          // Note: We won't actually initialize to avoid side effects
          
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
        } catch (error: any) {
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
      testFunction: async () => {
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
        } catch (error: any) {
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
      testFunction: async () => {
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
        } catch (error: any) {
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

  /**
   * Run a specific test scenario
   */
  const runTestScenario = async (scenario: TestScenario) => {
    setIsRunning(true);
    setSelectedScenario(scenario.id);
    
    try {
      const result = await scenario.testFunction();
      setTestResults(prev => [...prev.filter(r => r.scenario !== scenario.name), result]);
    } catch (error: any) {
      const failureResult: TestResult = {
        scenario: scenario.name,
        success: false,
        message: 'Test execution failed',
        error: error.message
      };
      setTestResults(prev => [...prev.filter(r => r.scenario !== scenario.name), failureResult]);
    } finally {
      setIsRunning(false);
      setSelectedScenario(null);
    }
  };

  /**
   * Run all test scenarios
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const scenario of testScenarios) {
      await runTestScenario(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
    
    // Show summary alert
    const passCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    Alert.alert(
      'All Tests Complete',
      `${passCount}/${totalCount} tests passed`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Clear test results
   */
  const clearResults = () => {
    setTestResults([]);
    setSelectedScenario(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market Configuration Tester</Text>
        <Text style={styles.headerSubtitle}>
          Test app functionality across Korean and US market configurations
        </Text>
      </View>

      {/* Current Market Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Market Configuration</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Market: {currentMarketInfo.marketConfig?.market} {currentMarketInfo.marketConfig?.flagEmoji}</Text>
          <Text style={styles.infoText}>Language: {currentMarketInfo.marketConfig?.language}</Text>
          <Text style={styles.infoText}>Beta Market: {currentMarketInfo.isBeta ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Environment: {currentMarketInfo.deploymentConfig?.environment}</Text>
          <Text style={styles.infoText}>Version: {currentMarketInfo.deploymentConfig?.version}</Text>
        </View>
      </View>

      {/* Feature Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Features</Text>
        <View style={styles.featureGrid}>
          {Object.entries(currentMarketInfo.features || {}).map(([feature, enabled]) => (
            <View key={feature} style={[styles.featureChip, enabled ? styles.featureEnabled : styles.featureDisabled]}>
              <Text style={[styles.featureText, enabled ? styles.featureEnabledText : styles.featureDisabledText]}>
                {feature}: {enabled ? '✅' : '❌'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        <View style={styles.controlRow}>
          <Switch
            value={showDetailedResults}
            onValueChange={setShowDetailedResults}
            trackColor={{ false: HIGColors.systemGray4, true: HIGColors.systemBlue }}
            thumbColor={HIGColors.white}
          />
          <Text style={styles.controlLabel}>Show Detailed Results</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={clearResults}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Clear Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Individual Test Scenarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Test Scenarios</Text>
        {testScenarios.map((scenario) => (
          <View key={scenario.id} style={styles.scenarioCard}>
            <View style={styles.scenarioHeader}>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioName}>{scenario.name}</Text>
                <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                <Text style={styles.scenarioMeta}>
                  Market: {scenario.market} | Language: {scenario.language}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.scenarioButton, selectedScenario === scenario.id && styles.scenarioButtonActive]}
                onPress={() => runTestScenario(scenario)}
                disabled={isRunning}
              >
                {selectedScenario === scenario.id ? (
                  <ActivityIndicator size="small" color={HIGColors.white} />
                ) : (
                  <Text style={styles.scenarioButtonText}>Test</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Test Results ({testResults.filter(r => r.success).length}/{testResults.length} passed)
          </Text>
          {testResults.map((result, index) => (
            <View key={index} style={[styles.resultCard, result.success ? styles.resultSuccess : styles.resultFailure]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultScenario}>{result.scenario}</Text>
                <Text style={styles.resultStatus}>
                  {result.success ? '✅' : '❌'}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.error && (
                <Text style={styles.resultError}>Error: {result.error}</Text>
              )}
              {showDetailedResults && result.data && (
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetailsTitle}>Details:</Text>
                  <Text style={styles.resultDetailsText}>
                    {JSON.stringify(result.data, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Market Data Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Data Summary</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Sample Roasters:</Text>
          <Text style={styles.dataValue}>{currentMarketInfo.data?.roasters?.join(', ')}</Text>
          
          <Text style={styles.dataLabel}>Sample Origins:</Text>
          <Text style={styles.dataValue}>{currentMarketInfo.data?.origins?.join(', ')}</Text>
          
          <Text style={styles.dataLabel}>Currency Format:</Text>
          <Text style={styles.dataValue}>{currentMarketInfo.formatting?.currency}</Text>
          
          <Text style={styles.dataLabel}>Date/Time Format:</Text>
          <Text style={styles.dataValue}>{currentMarketInfo.formatting?.date} {currentMarketInfo.formatting?.time}</Text>
          
          <Text style={styles.dataLabel}>API Endpoint:</Text>
          <Text style={styles.dataValue}>{currentMarketInfo.technical?.apiEndpoint}</Text>
          
          <Text style={styles.dataLabel}>Rate Limits:</Text>
          <Text style={styles.dataValue}>
            API: {currentMarketInfo.technical?.rateLimits?.apiCalls}/min, 
            Feedback: {currentMarketInfo.technical?.rateLimits?.feedback}/hr
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemGreen,
  },
  headerTitle: {
    fontSize: HIGConstants.fontSizeTitle1,
    fontWeight: '700',
    color: HIGColors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.white,
    opacity: 0.9,
  },
  section: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
  },
  sectionTitle: {
    fontSize: HIGConstants.fontSizeHeadline,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  infoCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
  },
  infoText: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.label,
    marginBottom: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  featureChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    borderWidth: 1,
  },
  featureEnabled: {
    backgroundColor: HIGColors.systemGreen,
    borderColor: HIGColors.systemGreen,
  },
  featureDisabled: {
    backgroundColor: HIGColors.systemGray5,
    borderColor: HIGColors.systemGray4,
  },
  featureText: {
    fontSize: HIGConstants.fontSizeCaption1,
    fontWeight: '600',
  },
  featureEnabledText: {
    color: HIGColors.white,
  },
  featureDisabledText: {
    color: HIGColors.secondaryLabel,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  controlLabel: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.label,
    marginLeft: HIGConstants.SPACING_MD,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
  },
  button: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: HIGColors.systemBlue,
  },
  secondaryButton: {
    backgroundColor: HIGColors.systemGray5,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  buttonText: {
    fontSize: HIGConstants.fontSizeBody,
    fontWeight: '600',
    color: HIGColors.white,
  },
  secondaryButtonText: {
    color: HIGColors.label,
  },
  scenarioCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioInfo: {
    flex: 1,
    marginRight: HIGConstants.SPACING_MD,
  },
  scenarioName: {
    fontSize: HIGConstants.fontSizeSubheadline,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  scenarioMeta: {
    fontSize: HIGConstants.fontSizeCaption1,
    color: HIGColors.tertiaryLabel,
  },
  scenarioButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusSmall,
    minWidth: 60,
    alignItems: 'center',
  },
  scenarioButtonActive: {
    backgroundColor: HIGColors.systemOrange,
  },
  scenarioButtonText: {
    fontSize: HIGConstants.fontSizeBody,
    fontWeight: '600',
    color: HIGColors.white,
  },
  resultCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderLeftWidth: 4,
  },
  resultSuccess: {
    borderLeftColor: HIGColors.systemGreen,
  },
  resultFailure: {
    borderLeftColor: HIGColors.systemRed,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  resultScenario: {
    fontSize: HIGConstants.fontSizeSubheadline,
    fontWeight: '600',
    color: HIGColors.label,
  },
  resultStatus: {
    fontSize: HIGConstants.fontSizeBody,
  },
  resultMessage: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  resultError: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.systemRed,
    marginBottom: HIGConstants.SPACING_SM,
  },
  resultDetails: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
  },
  resultDetailsTitle: {
    fontSize: HIGConstants.fontSizeCaption1,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  resultDetailsText: {
    fontSize: HIGConstants.fontSizeCaption1,
    color: HIGColors.secondaryLabel,
    fontFamily: 'Menlo',
  },
  dataContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
  },
  dataLabel: {
    fontSize: HIGConstants.fontSizeBody,
    fontWeight: '600',
    color: HIGColors.label,
    marginTop: HIGConstants.SPACING_SM,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: HIGConstants.fontSizeBody,
    color: HIGColors.secondaryLabel,
    fontFamily: 'Menlo',
  },
});

export default MarketConfigurationTester;