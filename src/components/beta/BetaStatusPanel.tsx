import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BetaUser, DeploymentStatus } from '../../services/BetaTestingService';
import { BetaTestingStats } from '../../types/BetaTestingTypes';
import { HIGColors } from '../../constants/HIG';

interface BetaStatusPanelProps {
  currentUser: BetaUser | null;
  deploymentStatus: DeploymentStatus | null;
  marketConfig: { market: string; features: Record<string, boolean> } | null;
  isBeta: boolean;
}

export const BetaStatusPanel: React.FC<BetaStatusPanelProps> = ({
  currentUser,
  deploymentStatus,
  marketConfig,
  isBeta,
}) => {
  const { t } = useTranslation();

  const renderStatusItem = (label: string, value: string | number, color?: string) => (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, color && { color }]}>{value}</Text>
    </View>
  );

  const renderUserStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>User Status</Text>
      <View style={styles.statusGrid}>
        {renderStatusItem('User ID', currentUser?.id || 'Not Available')}
        {renderStatusItem('Email', currentUser?.email || 'Not Available')}
        {renderStatusItem('Join Date', currentUser?.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString() : 'N/A')}
        {renderStatusItem('Status', currentUser?.isActive ? ' Active' : ' Inactive')}
        {renderStatusItem('Feedback Count', currentUser?.feedbackCount || 0)}
      </View>
    </View>
  );

  const renderMarketInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Market Configuration</Text>
      <View style={styles.statusGrid}>
        {renderStatusItem('Market', `${marketConfig.flagEmoji} ${marketConfig.market}`)}
        {renderStatusItem('Language', marketConfig.language.toUpperCase())}
        {renderStatusItem('Beta Mode', isBeta ? ' Enabled' : ' Disabled')}
        {renderStatusItem('Version', marketConfig.version || 'N/A')}
      </View>
    </View>
  );

  const renderDeploymentStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Deployment Status</Text>
      <View style={styles.statusGrid}>
        {renderStatusItem('Environment', deploymentStatus?.environment || 'Unknown')}
        {renderStatusItem('Build', deploymentStatus?.buildNumber || 'N/A')}
        {renderStatusItem('Deploy Time', deploymentStatus?.deployedAt ? new Date(deploymentStatus.deployedAt).toLocaleString() : 'N/A')}
        {renderStatusItem('Health', deploymentStatus?.isHealthy ? ' Healthy' : ' Issues', deploymentStatus?.isHealthy ? HIGColors.green : HIGColors.red)}
        {renderStatusItem('Features', deploymentStatus?.enabledFeatures?.length || 0)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beta Testing Status</Text>
      
      {currentUser && renderUserStatus()}
      {renderMarketInfo()}
      {deploymentStatus && renderDeploymentStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
},
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 16,
    textAlign: 'center',
},
  section: {
    marginBottom: 20,
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 12,
},
  statusGrid: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    padding: 12,
},
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.separator,
},
  statusLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    flex: 1,
},
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'right',
    flex: 1,
},
});

export default BetaStatusPanel;