import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { betaTestingService, BetaUser, DeploymentStatus } from '../services/BetaTestingService';
import { getCurrentMarketConfig, isBetaMarket } from '../config/marketConfig';
import { HIGConstants } from '../styles/common';
import { Logger } from '../services/LoggingService';
import { HIGColors } from '../constants/HIG';

/**
 * Beta Testing Dashboard Screen
 * Provides comprehensive beta testing features including:
 * - User status and preferences
 * - Feedback submission
 * - Deployment status monitoring
 * - Market-specific beta features
 */

const BetaTestingScreen: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<BetaUser | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'status' | 'feedback' | 'deployment'>('status');

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
      Logger.error('Failed to load beta data:', 'screen', { component: 'BetaTestingScreen_Original', error: error });
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
   * Quick feedback submission
   */
  const handleQuickFeedback = (rating: 1 | 2 | 3 | 4 | 5): void => {
    Alert.prompt(
      t('feedbackTitle'),
      t('feedbackPrompt'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('submit'),
          onPress: async (comment?: string) => {
            try {
              await betaTestingService.submitQuickFeedback(rating, comment);
              Alert.alert(t('success'), t('feedbackSubmitted'));
              await loadBetaData(); // Refresh to update feedback count
          } catch (error) {
              Alert.alert(t('error'), t('feedbackError'));
          }
        },
      },
      ],
      'plain-text'
    );
};

  /**
   * Report bug
   */
  const handleBugReport = (): void => {
    setShowFeedbackModal(true);
};

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isBeta ? t('loadingBetaData') : t('loadingMarketData')}
          </Text>
        </View>
      </View>
    );
}

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isBeta ? `${marketConfig.flagEmoji} ${t('betaTestingDashboard')}` : `${marketConfig.flagEmoji} ${t('marketDashboard')}`}
        </Text>
        <Text style={styles.headerSubtitle}>
          {marketConfig.marketName}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'status' && styles.activeTab]}
          onPress={() => setSelectedTab('status')}
        >
          <Text style={[styles.tabText, selectedTab === 'status' && styles.activeTabText]}>
            {t('status')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'feedback' && styles.activeTab]}
          onPress={() => setSelectedTab('feedback')}
        >
          <Text style={[styles.tabText, selectedTab === 'feedback' && styles.activeTabText]}>
            {t('feedback')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'deployment' && styles.activeTab]}
          onPress={() => setSelectedTab('deployment')}
        >
          <Text style={[styles.tabText, selectedTab === 'deployment' && styles.activeTabText]}>
            {t('deployment')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      >
        {selectedTab === 'status' && (
          <StatusTab user={currentUser} isBeta={isBeta} marketConfig={marketConfig} />
        )}
        
        {selectedTab === 'feedback' && (
          <FeedbackTab 
            user={currentUser} 
            onQuickFeedback={handleQuickFeedback}
            onBugReport={handleBugReport}
            isBeta={isBeta}
          />
        )}
        
        {selectedTab === 'deployment' && (
          <DeploymentTab 
            deploymentStatus={deploymentStatus} 
            isBeta={isBeta}
            marketConfig={marketConfig}
          />
        )}
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={async (feedback) => {
          try {
            await betaTestingService.reportBug(feedback.title, feedback.description, feedback.severity);
            Alert.alert(t('success'), t('bugReported'));
            setShowFeedbackModal(false);
            await loadBetaData();
        } catch (error) {
            Alert.alert(t('error'), t('bugReportError'));
        }
      }}
      />
    </View>
  );
};

/**
 * Status Tab Component
 */
const StatusTab: React.FC<{
  user: BetaUser | null;
  isBeta: boolean;
  marketConfig: unknown;
}> = ({ user, isBeta, marketConfig }) => {
  const { t } = useTranslation();

  if (!user) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.noDataText}>{t('noUserData')}</Text>
      </View>
    );
}

  return (
    <View style={styles.tabContent}>
      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('userInformation')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('email')}:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('market')}:</Text>
          <Text style={styles.infoValue}>
            {marketConfig.flagEmoji} {marketConfig.marketName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('userType')}:</Text>
          <Text style={[styles.infoValue, isBeta && styles.betaText]}>
            {isBeta ? t('betaTester') : t('productionUser')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('testingLevel')}:</Text>
          <Text style={styles.infoValue}>{t(user.testingLevel)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('joinedAt')}:</Text>
          <Text style={styles.infoValue}>
            {user.joinedAt.toLocaleDateString(marketConfig.language === 'ko' ? 'ko-KR' : 'en-US')}
          </Text>
        </View>
      </View>

      {/* Device Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('deviceInformation')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('platform')}:</Text>
          <Text style={styles.infoValue}>{user.deviceInfo.platform}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('appVersion')}:</Text>
          <Text style={styles.infoValue}>{user.deviceInfo.appVersion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('osVersion')}:</Text>
          <Text style={styles.infoValue}>{user.deviceInfo.osVersion}</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('statistics')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('feedbackSubmitted')}:</Text>
          <Text style={styles.infoValue}>{user.feedbackCount}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('lastActive')}:</Text>
          <Text style={styles.infoValue}>
            {user.lastActiveAt.toLocaleDateString(marketConfig.language === 'ko' ? 'ko-KR' : 'en-US')}
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Feedback Tab Component
 */
const FeedbackTab: React.FC<{
  user: BetaUser | null;
  onQuickFeedback: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onBugReport: () => void;
  isBeta: boolean;
}> = ({ user, onQuickFeedback, onBugReport, isBeta }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContent}>
      {/* Quick Feedback */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('quickFeedback')}</Text>
        <Text style={styles.cardDescription}>
          {isBeta ? t('betaFeedbackDescription') : t('productionFeedbackDescription')}
        </Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={styles.ratingButton}
              onPress={() => onQuickFeedback(rating as 1 | 2 | 3 | 4 | 5)}
            >
              <Text style={styles.ratingText}>⭐</Text>
              <Text style={styles.ratingLabel}>{rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bug Report */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('reportBug')}</Text>
        <Text style={styles.cardDescription}>
          {t('bugReportDescription')}
        </Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={onBugReport}>
          <Text style={styles.actionButtonText}>{t('reportBug')}</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Statistics */}
      {user && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('yourFeedback')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('totalFeedback')}:</Text>
            <Text style={styles.infoValue}>{user.feedbackCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('preferredChannel')}:</Text>
            <Text style={styles.infoValue}>{t(user.preferences.preferredFeedbackChannel)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Deployment Tab Component
 */
const DeploymentTab: React.FC<{
  deploymentStatus: DeploymentStatus | null;
  isBeta: boolean;
  marketConfig: unknown;
}> = ({ deploymentStatus, isBeta, marketConfig }) => {
  const { t } = useTranslation();

  if (!deploymentStatus) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.noDataText}>{t('noDeploymentData')}</Text>
      </View>
    );
}

  const currentMarket = isBeta ? 'us_beta' : 'korean';
  const marketRollout = deploymentStatus.marketRollout[currentMarket];

  return (
    <View style={styles.tabContent}>
      {/* Current Version */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('currentVersion')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('version')}:</Text>
          <Text style={styles.infoValue}>{deploymentStatus.version}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('buildNumber')}:</Text>
          <Text style={styles.infoValue}>{deploymentStatus.buildNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('releaseDate')}:</Text>
          <Text style={styles.infoValue}>
            {deploymentStatus.releaseDate.toLocaleDateString(marketConfig.language === 'ko' ? 'ko-KR' : 'en-US')}
          </Text>
        </View>
      </View>

      {/* Market Rollout */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('marketRollout')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('status')}:</Text>
          <Text style={[styles.infoValue, styles[`status_${marketRollout.status}`]]}>
            {t(marketRollout.status)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('rolloutPercentage')}:</Text>
          <Text style={styles.infoValue}>{marketRollout.percentage}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('activeUsers')}:</Text>
          <Text style={styles.infoValue}>{marketRollout.userCount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('performanceMetrics')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('crashRate')}:</Text>
          <Text style={[styles.infoValue, deploymentStatus.metrics.crashRate > 0.01 && styles.errorText]}>
            {(deploymentStatus.metrics.crashRate * 100).toFixed(2)}%
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('averageLoadTime')}:</Text>
          <Text style={styles.infoValue}>{deploymentStatus.metrics.averageLoadTime}ms</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('userRetention24h')}:</Text>
          <Text style={styles.infoValue}>{(deploymentStatus.metrics.userRetention24h * 100).toFixed(1)}%</Text>
        </View>
      </View>

      {/* Issues */}
      {deploymentStatus.issues.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('knownIssues')}</Text>
          {deploymentStatus.issues.map((issue, index) => (
            <View key={issue.id} style={styles.issueItem}>
              <View style={styles.issueHeader}>
                <Text style={[styles.issueSeverity, styles[`severity_${issue.severity}`]]}>
                  {t(issue.severity)}
                </Text>
                <Text style={styles.issueType}>{t(issue.type)}</Text>
              </View>
              <Text style={styles.issueDescription}>{issue.description}</Text>
              <Text style={styles.issueStatus}>{t('status')}: {t(issue.status)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Feedback Modal Component
 */
const FeedbackModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: { title: string; description: string; severity: 'low' | 'medium' | 'high' }) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (): void => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('error'), t('fillRequiredFields'));
      return;
  }

    onSubmit({ title, description, severity });
    setTitle('');
    setDescription('');
    setSeverity('medium');
};

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('reportBug')}</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.modalSubmitText}>{t('submit')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('bugTitle')}</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder={t('bugTitlePlaceholder')}
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('severity')}</Text>
            <View style={styles.severityContainer}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.severityButton, severity === level && styles.severityButtonActive]}
                  onPress={() => setSeverity(level)}
                >
                  <Text style={[styles.severityButtonText, severity === level && styles.severityButtonTextActive]}>
                    {t(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('bugDescription')}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('bugDescriptionPlaceholder')}
              placeholderTextColor={HIGColors.placeholderText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
  loadingText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
},
  header: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '700',
    color: HIGColors.label,
},
  headerSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginTop: 4,
},
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray6,
    margin: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: 2,
},
  tab: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
    borderRadius: HIGConstants.cornerRadiusMedium - 2,
},
  activeTab: {
    backgroundColor: HIGColors.white,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
},
  tabText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
},
  activeTabText: {
    color: HIGColors.label,
    fontWeight: '600',
},
  content: {
    flex: 1,
},
  tabContent: {
    padding: HIGConstants.SPACING_MD,
},
  card: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
},
  cardTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
},
  cardDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
    lineHeight: 20,
},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
},
  infoLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    flex: 1,
},
  infoValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
},
  betaText: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  errorText: {
    color: HIGColors.systemRed,
    fontWeight: '600',
},
  noDataText: {
    textAlign: 'center',
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XL,
},
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: HIGConstants.SPACING_MD,
},
  ratingButton: {
    alignItems: 'center',
    padding: HIGConstants.SPACING_SM,
},
  ratingText: {
    fontSize: 24,
},
  ratingLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginTop: 4,
},
  actionButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    marginTop: HIGConstants.SPACING_MD,
},
  actionButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
},
  status_pending: { color: HIGColors.systemOrange },
  status_rolling_out: { color: HIGColors.systemBlue },
  status_complete: { color: HIGColors.systemGreen },
  severity_low: { color: HIGColors.systemGreen },
  severity_medium: { color: HIGColors.systemOrange },
  severity_high: { color: HIGColors.systemRed },
  severity_critical: { color: HIGColors.systemRed, fontWeight: '700' },
  issueItem: {
    backgroundColor: HIGColors.systemGray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginBottom: HIGConstants.SPACING_SM,
},
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
},
  issueSeverity: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    textTransform: 'uppercase',
},
  issueType: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textTransform: 'uppercase',
},
  issueDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: 4,
},
  issueStatus: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
},
  modalCloseText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemRed,
},
  modalTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
},
  modalSubmitText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  modalContent: {
    flex: 1,
    padding: HIGConstants.SPACING_LG,
},
  inputGroup: {
    marginBottom: HIGConstants.SPACING_LG,
},
  inputLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  textInput: {
    borderWidth: 1,
    borderColor: HIGColors.separator,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    backgroundColor: HIGColors.white,
},
  textArea: {
    height: 120,
},
  severityContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray5,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: 2,
},
  severityButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
    borderRadius: HIGConstants.cornerRadiusMedium - 2,
},
  severityButtonActive: {
    backgroundColor: HIGColors.white,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
},
  severityButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
},
  severityButtonTextActive: {
    color: HIGColors.label,
    fontWeight: '600',
},
});

export default BetaTestingScreen;