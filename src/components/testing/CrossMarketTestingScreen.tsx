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
  crossMarketTester,
  CrossMarketTestSuite,
  CrossMarketTestResult,
} from '../../utils/crossMarketTester';
import { i18nValidationSuite } from '../../utils/i18nValidationSuite';
import { getCurrentMarketConfig, isBetaMarket } from '../../config/marketConfig';
import { getCurrentLanguage } from '../../services/i18n';
import { Logger } from '../../services/LoggingService';
import { HIGColors, HIGConstants } from '../../styles/common';

/**
 * Cross-Market Testing Screen
 * Comprehensive testing interface for Korean and US market configurations
 */

const CrossMarketTestingScreen: React.FC = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<CrossMarketTestSuite | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [currentMarketInfo, setCurrentMarketInfo] = useState<unknown>({});

  useEffect(() => {
    loadCurrentMarketInfo();
}, []);

  /**
   * Load current market information
   */
  const loadCurrentMarketInfo = async () => {
    try {
      const marketConfig = getCurrentMarketConfig();
      const currentLang = getCurrentLanguage();
      const isBeta = isBetaMarket();
      
      setCurrentMarketInfo({
        marketConfig,
        currentLang,
        isBeta,
        timestamp: new Date().toISOString(),
    });
  } catch (error) {
      Logger.error('Failed to load market info:', 'component', { component: 'CrossMarketTestingScreen', error: error });
  }
};

  /**
   * Run full cross-market test suite
   */
  const runFullTestSuite = async () => {
    setIsRunning(true);
    setTestSuite(null);
    setSelectedTest(null);
    
    try {
      Logger.debug(' Starting Cross-Market Test Suite...', 'component', { component: 'CrossMarketTestingScreen' });
      
      const results = await crossMarketTester.runFullTestSuite();
      setTestSuite(results);
      
      // Show summary alert
      Alert.alert(
        'Cross-Market Testing Complete',
        `${results.summary}\\n\\nRecommendations:\\n${results.recommendations.slice(0, 3).join('\\n')}`,
        [{ text: 'OK' }]
      );
      
      Logger.debug('Cross-Market Test Suite completed', 'component', { component: 'CrossMarketTestingScreen' });
  } catch (error) {
      Logger.error('Cross-market testing failed:', 'component', { component: 'CrossMarketTestingScreen', error: error });
      
      Alert.alert(
        'Testing Failed',
        `Cross-market testing encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
  } finally {
      setIsRunning(false);
  }
};

  /**
   * Run individual test category
   */
  const runIndividualTest = async (testName: string) => {
    setSelectedTest(testName);
    setIsRunning(true);
    
    try {
      // This would run only specific test category
      // For now, we'll run the full suite and filter results
      const results = await crossMarketTester.runFullTestSuite();
      
      const filteredResults = {
        ...results,
        results: results.results.filter(r => r.testName.includes(testName))
    };
      
      setTestSuite(filteredResults);
      
      Alert.alert(
        `${testName} Test Complete`,
        `${filteredResults.results.length} test(s) completed`,
        [{ text: 'OK' }]
      );
  } catch (error) {
      Alert.alert(
        'Test Failed',
        `${testName} test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
  } finally {
      setIsRunning(false);
      setSelectedTest(null);
  }
};

  /**
   * Run validation suite alongside cross-market tests
   */
  const runCombinedValidation = async () => {
    setIsRunning(true);
    
    try {
      Logger.debug('Running combined validation...', 'component', { component: 'CrossMarketTestingScreen' });
      
      // Run i18n validation first
      const i18nResults = await i18nValidationSuite.runFullValidation();
      
      // Run cross-market tests
      const crossMarketResults = await crossMarketTester.runFullTestSuite();
      
      setTestSuite(crossMarketResults);
      
      // Combined summary
      const totalTests = i18nResults.totalTests + crossMarketResults.totalTests;
      const totalPassed = i18nResults.passedTests + crossMarketResults.passedTests;
      const totalFailed = i18nResults.failedTests + crossMarketResults.failedTests;
      
      Alert.alert(
        'Complete Validation Suite',
        `Total: ${totalPassed}/${totalTests} tests passed\\n\\nI18n: ${i18nResults.passedTests}/${i18nResults.totalTests}\\nCross-Market: ${crossMarketResults.passedTests}/${crossMarketResults.totalTests}\\n\\nApp is ${totalFailed === 0 ? 'ready' : 'not ready'} for dual-market deployment`,
        [{ text: 'OK' }]
      );
  } catch (error) {
      Alert.alert(
        'Validation Failed',
        `Combined validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
  } finally {
      setIsRunning(false);
  }
};

  /**
   * Clear test results
   */
  const clearResults = () => {
    setTestSuite(null);
    setSelectedTest(null);
};

  /**
   * Get status color for test result
   */
  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return HIGColors.systemGreen;
      case 'fail': return HIGColors.systemRed;
      case 'warning': return HIGColors.systemOrange;
      default: return HIGColors.systemGray;
  }
};

  /**
   * Get status icon for test result
   */
  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return '';
      case 'fail': return '';
      case 'warning': return '';
      default: return '❓';
  }
};

  /**
   * Individual test categories for targeted testing
   */
  const testCategories = [
    { name: 'Language', description: 'Test language switching and localization' },
    { name: 'Market Data', description: 'Test market-specific data consistency' },
    { name: 'Feature', description: 'Test feature availability across markets' },
    { name: 'Formatting', description: 'Test currency and date formatting' },
    { name: 'User Flows', description: 'Test critical user workflows' },
    { name: 'Performance', description: 'Test performance across markets' },
    { name: 'Deployment', description: 'Test deployment configuration' },
    { name: 'Beta', description: 'Test beta testing functionality' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cross-Market Testing</Text>
        <Text style={styles.headerSubtitle}>
          Comprehensive testing across Korean and US market configurations
        </Text>
      </View>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Market Status</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            Market: {currentMarketInfo.marketConfig?.market} {currentMarketInfo.marketConfig?.flagEmoji}
          </Text>
          <Text style={styles.statusText}>
            Language: {currentMarketInfo.currentLang?.toUpperCase()}
          </Text>
          <Text style={styles.statusText}>
            Beta Market: {currentMarketInfo.isBeta ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.statusText}>
            Last Updated: {currentMarketInfo.timestamp ? new Date(currentMarketInfo.timestamp).toLocaleTimeString() : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show Detailed Results</Text>
          <Switch
            value={showDetailedResults}
            onValueChange={setShowDetailedResults}
            trackColor={{ false: HIGColors.systemGray4, true: HIGColors.systemBlue }}
            thumbColor={HIGColors.white}
          />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show Market Comparison</Text>
          <Switch
            value={showComparison}
            onValueChange={setShowComparison}
            trackColor={{ false: HIGColors.systemGray4, true: HIGColors.systemBlue }}
            thumbColor={HIGColors.white}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runFullTestSuite}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning && !selectedTest ? 'Running Full Suite...' : 'Run Full Test Suite'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.accentButton]}
            onPress={runCombinedValidation}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning && selectedTest === 'combined' ? 'Running Combined...' : 'Combined Validation'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Individual Test Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Test Categories</Text>
        <View style={styles.categoryGrid}>
          {testCategories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryCard,
                selectedTest === category.name && styles.categoryCardActive
              ]}
              onPress={() => runIndividualTest(category.name)}
              disabled={isRunning}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                {selectedTest === category.name && isRunning && (
                  <ActivityIndicator size="small" color={HIGColors.systemBlue} />
                )}
              </View>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Test Results Summary */}
      {testSuite && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tests:</Text>
              <Text style={styles.summaryValue}>{testSuite.totalTests}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Passed:</Text>
              <Text style={[styles.summaryValue, { color: HIGColors.systemGreen }]}>
                {testSuite.passedTests}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Warnings:</Text>
              <Text style={[styles.summaryValue, { color: HIGColors.systemOrange }]}>
                {testSuite.warningTests}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Failed:</Text>
              <Text style={[styles.summaryValue, { color: HIGColors.systemRed }]}>
                {testSuite.failedTests}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Execution Time:</Text>
              <Text style={styles.summaryValue}>{testSuite.executionTime}ms</Text>
            </View>
          </View>
          
          <Text style={styles.summaryText}>{testSuite.summary}</Text>
          
          {testSuite.recommendations && testSuite.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {testSuite.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>• {rec}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Detailed Test Results */}
      {testSuite && testSuite.results && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detailed Test Results ({testSuite.results.length} tests)
          </Text>
          {testSuite.results.map((result, index) => (
            <View key={index} style={styles.testResultCard}>
              <View style={styles.testResultHeader}>
                <Text style={styles.testResultName}>{result.testName}</Text>
                <View style={styles.testResultStatus}>
                  <Text style={[styles.statusIcon, { color: getStatusColor(result.overallStatus) }]}>
                    {getStatusIcon(result.overallStatus)}
                  </Text>
                  <Text style={[styles.statusText, { color: getStatusColor(result.overallStatus) }]}>
                    {result.overallStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Market Comparison */}
              {showComparison && (
                <View style={styles.comparisonContainer}>
                  <View style={styles.marketResult}>
                    <Text style={styles.marketTitle}> Korean Market</Text>
                    <Text style={styles.marketStatus}>
                      {result.koreanResult.success ? '' : ''} {result.koreanResult.message}
                    </Text>
                    <Text style={styles.marketTime}>
                      {result.koreanResult.executionTime}ms
                    </Text>
                  </View>
                  
                  <View style={styles.marketResult}>
                    <Text style={styles.marketTitle}> US Beta Market</Text>
                    <Text style={styles.marketStatus}>
                      {result.usResult.success ? '' : ''} {result.usResult.message}
                    </Text>
                    <Text style={styles.marketTime}>
                      {result.usResult.executionTime}ms
                    </Text>
                  </View>
                </View>
              )}

              {/* Consistency Score */}
              <View style={styles.consistencyContainer}>
                <Text style={styles.consistencyLabel}>
                  Consistency Score: {result.comparison.consistencyScore}%
                </Text>
                <View style={styles.consistencyBar}>
                  <View 
                    style={[
                      styles.consistencyFill,
                      { 
                        width: `${result.comparison.consistencyScore}%`,
                        backgroundColor: result.comparison.consistencyScore >= 80 ? 
                          HIGColors.systemGreen : 
                          result.comparison.consistencyScore >= 60 ?
                            HIGColors.systemOrange :
                            HIGColors.systemRed
                    }
                    ]}
                  />
                </View>
              </View>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <View style={styles.testRecommendations}>
                  <Text style={styles.testRecommendationsTitle}>Recommendations:</Text>
                  {result.recommendations.map((rec, recIndex) => (
                    <Text key={recIndex} style={styles.testRecommendationText}>• {rec}</Text>
                  ))}
                </View>
              )}

              {/* Detailed Data */}
              {showDetailedResults && (result.koreanResult.data || result.usResult.data) && (
                <View style={styles.detailedData}>
                  <Text style={styles.detailedDataTitle}>Detailed Data:</Text>
                  {result.koreanResult.data && (
                    <View style={styles.dataSection}>
                      <Text style={styles.dataTitle}>Korean Market Data:</Text>
                      <Text style={styles.dataText}>
                        {JSON.stringify(result.koreanResult.data, null, 2)}
                      </Text>
                    </View>
                  )}
                  {result.usResult.data && (
                    <View style={styles.dataSection}>
                      <Text style={styles.dataTitle}>US Market Data:</Text>
                      <Text style={styles.dataText}>
                        {JSON.stringify(result.usResult.data, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
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
    backgroundColor: HIGColors.systemPurple,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H1,
    fontWeight: '700',
    color: HIGColors.white,
    marginBottom: 4,
},
  headerSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    opacity: 0.9,
},
  section: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray4,
},
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
},
  statusCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
},
  statusText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: 4,
},
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
},
  switchLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
},
  buttonContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
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
  accentButton: {
    backgroundColor: HIGColors.systemPurple,
},
  secondaryButton: {
    backgroundColor: HIGColors.systemGray5,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
},
  buttonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
},
  secondaryButtonText: {
    color: HIGColors.label,
},
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_MD,
},
  categoryCard: {
    width: '48%',
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
},
  categoryCardActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue,
},
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
},
  categoryName: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
},
  categoryDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  summaryCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
},
  summaryLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    fontWeight: '600',
},
  summaryValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    fontFamily: 'Menlo',
},
  summaryText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
    textAlign: 'center',
},
  recommendationsContainer: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
},
  recommendationsTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.white,
    marginBottom: HIGConstants.SPACING_SM,
},
  recommendationText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    marginBottom: 4,
},
  testResultCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
},
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
},
  testResultName: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
},
  testResultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
},
  statusIcon: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
},
  comparisonContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
},
  marketResult: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
},
  marketTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  marketStatus: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
},
  marketTime: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.tertiaryLabel,
    fontFamily: 'Menlo',
},
  consistencyContainer: {
    marginBottom: HIGConstants.SPACING_MD,
},
  consistencyLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.label,
    marginBottom: 4,
},
  consistencyBar: {
    height: 4,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 2,
    overflow: 'hidden',
},
  consistencyFill: {
    height: '100%',
    borderRadius: 2,
},
  testRecommendations: {
    backgroundColor: HIGColors.systemOrange,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
},
  testRecommendationsTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.white,
    marginBottom: 4,
},
  testRecommendationText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    marginBottom: 2,
},
  detailedData: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
},
  detailedDataTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  dataSection: {
    marginBottom: HIGConstants.SPACING_SM,
},
  dataTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
},
  dataText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.tertiaryLabel,
    fontFamily: 'Menlo',
},
});

export default CrossMarketTestingScreen;