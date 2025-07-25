import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { HIGColors, HIGConstants } from '../styles/common';
import { performanceAnalyzer, PerformanceReport } from '../utils/performanceAnalysis';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { flavorDataOptimizer } from '../services/FlavorDataOptimizer';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = HIGColors.systemBlue,
  onPress 
}) => (
  <TouchableOpacity 
    style={[styles.metricCard, onPress && styles.clickableCard]} 
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

const IssueCard: React.FC<{
  issue: PerformanceReport['criticalIssues'][0];
}> = ({ issue }) => {
  const severityColor = {
    high: HIGColors.systemRed,
    medium: HIGColors.systemOrange,
    low: HIGColors.systemYellow,
  }[issue.severity];

  return (
    <View style={styles.issueCard}>
      <View style={styles.issueHeader}>
        <Text style={styles.issueType}>{issue.type.replace(/_/g, ' ').toUpperCase()}</Text>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{issue.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.issueDescription}>{issue.description}</Text>
    </View>
  );
};

export default function PerformanceDashboardScreen() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'cache'>('overview');

  const loadReport = useCallback(async () => {
    try {
      const newReport = performanceAnalyzer.generateReport();
      setReport(newReport);
    } catch (error) {
      console.error('Failed to load performance report:', error);
      Alert.alert('Error', 'Failed to load performance data');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  }, [loadReport]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached performance data and flavor data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            performanceAnalyzer.clearMetrics();
            flavorDataOptimizer.clearCache();
            loadReport();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  }, [loadReport]);

  const handleExportData = useCallback(() => {
    const exportData = performanceAnalyzer.exportData();
    console.log('Performance Export:', JSON.stringify(exportData, null, 2));
    Alert.alert(
      'Data Exported',
      'Performance data has been logged to console. In production, this would be shared or uploaded.'
    );
  }, []);

  const handleFlushQueue = useCallback(async () => {
    try {
      await performanceMonitor.flushQueue();
      Alert.alert('Success', 'Performance queue flushed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to flush performance queue');
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  const renderOverview = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Summary Metrics */}
      <Text style={styles.sectionTitle}>Performance Summary</Text>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Operations"
          value={report.summary.totalOperations}
          subtitle="Last 24 hours"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${report.summary.averageResponseTime.toFixed(0)}ms`}
          color={report.summary.averageResponseTime > 1000 ? HIGColors.systemRed : HIGColors.systemGreen}
        />
        <MetricCard
          title="Error Rate"
          value={`${(report.summary.errorRate * 100).toFixed(1)}%`}
          color={report.summary.errorRate > 0.05 ? HIGColors.systemRed : HIGColors.systemGreen}
        />
        <MetricCard
          title="Memory Issues"
          value={report.summary.memoryIssues}
          color={report.summary.memoryIssues > 0 ? HIGColors.systemOrange : HIGColors.systemGreen}
        />
      </View>

      {/* Slowest Operations */}
      {report.summary.slowestOperations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Slowest Operations</Text>
          {report.summary.slowestOperations.map((op, index) => (
            <View key={index} style={styles.operationCard}>
              <Text style={styles.operationName}>{op.name}</Text>
              <Text style={[
                styles.operationTime,
                { color: op.duration > 2000 ? HIGColors.systemRed : HIGColors.systemOrange }
              ]}>
                {op.duration.toFixed(0)}ms
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Critical Issues */}
      {report.criticalIssues.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Critical Issues</Text>
          {report.criticalIssues.map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {report.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationText}>• {rec}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderDetails = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Fastest Operations</Text>
      {report.summary.fastestOperations.map((op, index) => (
        <View key={index} style={styles.operationCard}>
          <Text style={styles.operationName}>{op.name}</Text>
          <Text style={[styles.operationTime, { color: HIGColors.systemGreen }]}>
            {op.duration.toFixed(0)}ms
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Performance Actions</Text>
      <TouchableOpacity style={styles.actionButton} onPress={handleFlushQueue}>
        <Text style={styles.actionButtonText}>Flush Performance Queue</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
        <Text style={styles.actionButtonText}>Export Performance Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCache = () => {
    const cacheStats = flavorDataOptimizer.getCacheStats();
    
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Cache Statistics</Text>
        
        <MetricCard
          title="Flavor Cache Entries"
          value={cacheStats.size}
          subtitle={`${cacheStats.entries.join(', ')}`}
        />

        <Text style={styles.sectionTitle}>Cache Management</Text>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleClearCache}
        >
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            Clear All Caches
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Cache Entries</Text>
        {cacheStats.entries.map((entry, index) => (
          <View key={index} style={styles.cacheEntryCard}>
            <Text style={styles.cacheEntryName}>{entry}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Dashboard</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Text style={styles.refreshButton}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['overview', 'details', 'cache'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'details' && renderDetails()}
      {selectedTab === 'cache' && renderCache()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  refreshButton: {
    fontSize: 16,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
  },
  tab: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: HIGColors.systemBlue,
  },
  tabText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  activeTabText: {
    color: HIGColors.systemBlue,
  },
  tabContent: {
    flex: 1,
    padding: HIGConstants.SPACING_LG,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_LG,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_LG,
  },
  metricCard: {
    width: '48%',
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    alignItems: 'center',
  },
  clickableCard: {
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
  },
  metricTitle: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: HIGConstants.SPACING_XS,
  },
  metricSubtitle: {
    fontSize: 10,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
  },
  operationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  operationName: {
    fontSize: 14,
    color: HIGColors.label,
    flex: 1,
  },
  operationTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  issueCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderLeftWidth: 4,
    borderLeftColor: HIGColors.systemRed,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  issueType: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
  },
  severityBadge: {
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  issueDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  recommendationCard: {
    backgroundColor: HIGColors.systemGreen + '20',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginBottom: HIGConstants.SPACING_XS,
    borderLeftWidth: 4,
    borderLeftColor: HIGColors.systemGreen,
  },
  recommendationText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  actionButton: {
    backgroundColor: HIGColors.systemBlue,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: HIGColors.systemRed,
  },
  dangerButtonText: {
    color: 'white',
  },
  cacheEntryCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  cacheEntryName: {
    fontSize: 14,
    color: HIGColors.label,
    fontFamily: 'monospace',
  },
});