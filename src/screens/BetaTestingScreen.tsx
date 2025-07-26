import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { betaTestingService, BetaUser, DeploymentStatus } from '../services/BetaTestingService';
import { getCurrentMarketConfig, isBetaMarket } from '../config/marketConfig';
import { BetaTestingTab } from '../types/BetaTestingTypes';
import { BetaStatusPanel } from '../components/beta/BetaStatusPanel';
import { QuickFeedbackPanel } from '../components/beta/QuickFeedbackPanel';
import { BetaTabNavigation } from '../components/beta/BetaTabNavigation';
import { HIGColors } from '../constants/HIG';

/**
 * Beta Testing Dashboard Screen - Modularized Version
 * Comprehensive beta testing features with modular components
 */
const BetaTestingScreen: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<BetaUser | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<BetaTestingTab>('status');

  const marketConfig = getCurrentMarketConfig();
  const isBeta = isBetaMarket();

  useEffect(() => {
    loadBetaData();
  }, []);

  /**
   * Load beta testing data
   */
  const loadBetaData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Load user data
      const user = await betaTestingService.loadUserData();
      setCurrentUser(user);
      
      // Load deployment status
      const deployment = await betaTestingService.getDeploymentStatus();
      setDeploymentStatus(deployment);
      
    } catch (error) {
      console.error('Failed to load beta data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh data
   */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadBetaData();
    setRefreshing(false);
  };

  /**
   * Handle bug report submission
   */
  const handleBugReport = (): void => {
    Alert.alert(
      'Bug Report',
      'Please describe the issue you encountered:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            // In a real implementation, this would open a detailed bug report form
            Alert.alert('Success', 'Bug report submitted successfully!');
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'status':
        return (
          <BetaStatusPanel
            currentUser={currentUser}
            deploymentStatus={deploymentStatus}
            marketConfig={marketConfig}
            isBeta={isBeta}
          />
        );
      
      case 'feedback':
        return (
          <View>
            <QuickFeedbackPanel onFeedbackSubmitted={loadBetaData} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bug Reports</Text>
              <TouchableOpacity style={styles.bugReportButton} onPress={handleBugReport}>
                <Text style={styles.bugReportIcon}>🐛</Text>
                <View style={styles.bugReportContent}>
                  <Text style={styles.bugReportTitle}>Report a Bug</Text>
                  <Text style={styles.bugReportDescription}>
                    Found something not working? Let us know!
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'deployment':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deployment Information</Text>
            {deploymentStatus ? (
              <View style={styles.deploymentInfo}>
                <Text style={styles.deploymentTitle}>
                  Current Deployment: {deploymentStatus.environment}
                </Text>
                <Text style={styles.deploymentDetail}>
                  Build: {deploymentStatus.buildNumber}
                </Text>
                <Text style={styles.deploymentDetail}>
                  Deployed: {new Date(deploymentStatus.deployedAt).toLocaleString()}
                </Text>
                <Text style={[
                  styles.deploymentStatus,
                  { color: deploymentStatus.isHealthy ? HIGColors.green : HIGColors.red }
                ]}>
                  Status: {deploymentStatus.isHealthy ? 'Healthy' : 'Issues Detected'}
                </Text>
                
                {deploymentStatus.enabledFeatures && deploymentStatus.enabledFeatures.length > 0 && (
                  <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Enabled Features:</Text>
                    {deploymentStatus.enabledFeatures.map((feature, index) => (
                      <Text key={`feature-${index}`} style={styles.featureItem}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noDataText}>No deployment information available</Text>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HIGColors.systemBlue} />
        <Text style={styles.loadingText}>Loading beta testing data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Beta Testing Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {isBeta ? '🇺🇸 US Beta Environment' : '🇰🇷 Korean Production'}
        </Text>
      </View>

      <BetaTabNavigation
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      />

      {renderTabContent()}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGroupedBackground,
  },
  loadingText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    marginTop: 12,
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
  bugReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HIGColors.separator,
  },
  bugReportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bugReportContent: {
    flex: 1,
  },
  bugReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  bugReportDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  deploymentInfo: {
    backgroundColor: HIGColors.systemGray6,
    padding: 16,
    borderRadius: 8,
  },
  deploymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 8,
  },
  deploymentDetail: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  deploymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  featuresContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HIGColors.separator,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default BetaTestingScreen;