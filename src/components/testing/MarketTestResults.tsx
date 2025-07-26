import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TestResult, TestSuiteStats } from '../../types/MarketTestTypes';
import { HIGColors } from '../../constants/HIG';

interface MarketTestResultsProps {
  testResults: TestResult[];
  selectedScenario: string | null;
  onScenarioSelect: (scenarioId: string | null) => void;
  showDetailedResults: boolean;
  onToggleDetailedResults: () => void;
}

export const MarketTestResults: React.FC<MarketTestResultsProps> = ({
  testResults,
  selectedScenario,
  onScenarioSelect,
  showDetailedResults,
  onToggleDetailedResults,
}) => {
  // Calculate test statistics
  const getTestStats = (): TestSuiteStats => {
    const total = testResults.length;
    const passed = testResults.filter(result => result.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, passed, failed, successRate };
  };

  const stats = getTestStats();

  const renderTestSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Test Results Summary</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: HIGColors.green }]}>
            {stats.passed}
          </Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: HIGColors.red }]}>
            {stats.failed}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statNumber, 
            { color: stats.successRate >= 80 ? HIGColors.green : HIGColors.orange }
          ]}>
            {stats.successRate}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
    </View>
  );

  const renderTestResult = (result: TestResult, index: number) => (
    <TouchableOpacity
      key={`test-result-${index}-${result.scenario}-${Date.now()}`}
      style={[
        styles.resultItem,
        result.success ? styles.successResult : styles.failureResult,
        selectedScenario === result.scenario && styles.selectedResult,
      ]}
      onPress={() => onScenarioSelect(
        selectedScenario === result.scenario ? null : result.scenario
      )}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultScenario}>{result.scenario}</Text>
        <Text style={[
          styles.resultStatus,
          result.success ? styles.successText : styles.failureText,
        ]}>
          {result.success ? '✅ PASS' : '❌ FAIL'}
        </Text>
      </View>
      
      <Text style={styles.resultMessage}>{result.message}</Text>
      
      {selectedScenario === result.scenario && showDetailedResults && result.data && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Detailed Results:</Text>
          <Text style={styles.detailsContent}>
            {JSON.stringify(result.data, null, 2)}
          </Text>
        </View>
      )}
      
      {selectedScenario === result.scenario && result.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Details:</Text>
          <Text style={styles.errorContent}>{result.error}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {testResults.length > 0 && renderTestSummary()}
      
      {testResults.length > 0 && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggleDetailedResults}
        >
          <Text style={styles.toggleButtonText}>
            {showDetailedResults ? 'Hide Details' : 'Show Details'}
          </Text>
        </TouchableOpacity>
      )}
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => renderTestResult(result, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: HIGColors.systemGray6,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
  },
  statLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginTop: 4,
  },
  toggleButton: {
    backgroundColor: HIGColors.systemBlue,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  successResult: {
    borderLeftColor: HIGColors.green,
  },
  failureResult: {
    borderLeftColor: HIGColors.red,
  },
  selectedResult: {
    backgroundColor: HIGColors.systemGray6,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultScenario: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  successText: {
    color: HIGColors.green,
  },
  failureText: {
    color: HIGColors.red,
  },
  resultMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 6,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsContent: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: HIGColors.secondaryLabel,
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: HIGColors.systemRed,
    borderRadius: 6,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  errorContent: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Courier',
  },
});

export default MarketTestResults;