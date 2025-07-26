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
} from '../../config/deploymentConfig';
import { TestScenario, TestResult, MarketInfo } from '../../types/MarketTestTypes';
import { MarketTestResults } from './MarketTestResults';
import { MarketInfoPanel } from './MarketInfoPanel';
import createTestScenarios from '../../utils/MarketTestScenarios';
import { Logger } from '../../services/LoggingService';
import { HIGColors, HIGConstants } from '../../constants/HIG';

/**
 * Market Configuration Tester - Modularized Version
 * Comprehensive testing of app functionality across Korean and US market configurations
 */
const MarketConfigurationTester: React.FC = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [currentMarketInfo, setCurrentMarketInfo] = useState<MarketInfo>({} as MarketInfo);
  
  const testScenarios = createTestScenarios();

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
    });
  } catch (error) {
      Logger.error('Failed to load market info:', 'component', { component: 'MarketConfigurationTester', error: error });
  }
};

  /**
   * Run a specific test scenario
   */
  const runTestScenario = async (scenario: TestScenario) => {
    setIsRunning(true);
    setSelectedScenario(scenario.id);
    
    try {
      const result = await scenario.testFunction();
      setTestResults(prev => [...prev.filter(r => r.scenario !== scenario.name), result]);
  } catch (error) {
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
    const updatedResults = testResults;
    const passCount = updatedResults.filter(r => r.success).length;
    const totalCount = updatedResults.length;
    
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Market Configuration Tester</Text>
      <Text style={styles.headerSubtitle}>
        Test app functionality across Korean and US market configurations
      </Text>
    </View>
  );

  const renderTestControls = () => (
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
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isRunning && styles.disabledButton]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
          disabled={isRunning}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Clear Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTestScenarios = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Individual Test Scenarios</Text>
      {testScenarios.map((scenario, index) => (
        <TouchableOpacity
          key={`scenario-${scenario.id}-${index}`}
          style={[
            styles.scenarioItem,
            selectedScenario === scenario.id && styles.runningScenario
          ]}
          onPress={() => runTestScenario(scenario)}
          disabled={isRunning}
        >
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioName}>{scenario.name}</Text>
            <Text style={styles.scenarioMarket}>
              {scenario.market === 'korean' ? '' : ''} {scenario.language.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.scenarioDescription}>{scenario.description}</Text>
          
          {selectedScenario === scenario.id && isRunning && (
            <View style={styles.scenarioLoading}>
              <ActivityIndicator size="small" color={HIGColors.systemBlue} />
              <Text style={styles.scenarioLoadingText}>Running test...</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}
      
      {Object.keys(currentMarketInfo).length > 0 && (
        <MarketInfoPanel marketInfo={currentMarketInfo} />
      )}
      
      {renderTestControls()}
      {renderTestScenarios()}
      
      <MarketTestResults
        testResults={testResults}
        selectedScenario={selectedScenario}
        onScenarioSelect={setSelectedScenario}
        showDetailedResults={showDetailedResults}
        onToggleDetailedResults={() => setShowDetailedResults(!showDetailedResults)}
      />
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemGroupedBackground,
    padding: 16,
},
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
},
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: 8,
},
  headerSubtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
},
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 12,
},
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
},
  controlLabel: {
    fontSize: 16,
    color: HIGColors.label,
    marginLeft: 12,
},
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
},
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
},
  primaryButton: {
    backgroundColor: HIGColors.systemBlue,
},
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
},
  disabledButton: {
    backgroundColor: HIGColors.systemGray4,
},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
},
  secondaryButtonText: {
    color: HIGColors.systemBlue,
},
  scenarioItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: HIGColors.separator,
    borderRadius: 8,
    marginBottom: 8,
},
  runningScenario: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
},
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
},
  scenarioName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
},
  scenarioMarket: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.systemBlue,
},
  scenarioDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
},
  scenarioLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HIGColors.separator,
},
  scenarioLoadingText: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    marginLeft: 8,
},
  bottomSpacer: {
    height: 40,
},
});

export default MarketConfigurationTester;