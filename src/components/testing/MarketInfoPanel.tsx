import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MarketInfo } from '../../types/MarketTestTypes';
import { HIGColors } from '../../constants/HIG';

interface MarketInfoPanelProps {
  marketInfo: MarketInfo;
}

export const MarketInfoPanel: React.FC<MarketInfoPanelProps> = ({
  marketInfo,
}) => {
  const { t } = useTranslation();

  const renderInfoSection = (title: string, data: unknown) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {typeof data === 'object' && data !== null ? (
          Object.entries(data).map(([key, value]) => (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoKey}>{key}:</Text>
              <Text style={styles.infoValue}>
                {typeof value === 'boolean' 
                  ? (value ? '✅' : '❌')
                  : Array.isArray(value)
                  ? `[${value.length} items]`
                  : String(value)
              }
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.infoValue}>{String(data)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Market Configuration</Text>
      
      <View style={styles.marketBadge}>
        <Text style={styles.marketBadgeText}>
          {marketInfo.isBeta ? '🇺🇸 US Beta Market' : '🇰🇷 Korean Market'}
        </Text>
      </View>

      {renderInfoSection('Market Features', marketInfo.features)}
      {renderInfoSection('Deployment Features', marketInfo.deploymentFeatures)}
      
      <View style={styles.dataSection}>
        <Text style={styles.sectionTitle}>Market Data Preview</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Roasters</Text>
            <Text style={styles.dataCount}>{marketInfo.data.roasters.length}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Origins</Text>
            <Text style={styles.dataCount}>{marketInfo.data.origins.length}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Flavors</Text>
            <Text style={styles.dataCount}>{marketInfo.data.flavorProfiles.length}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Brew Methods</Text>
            <Text style={styles.dataCount}>{marketInfo.data.brewMethods.length}</Text>
          </View>
        </View>
      </View>
      
      {renderInfoSection('Formatting', marketInfo.formatting)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
},
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: HIGColors.label,
},
  marketBadge: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
},
  marketBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
},
  section: {
    marginBottom: 16,
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: HIGColors.label,
},
  sectionContent: {
    backgroundColor: HIGColors.systemGray6,
    padding: 12,
    borderRadius: 6,
},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
},
  infoKey: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    flex: 1,
},
  infoValue: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
},
  dataSection: {
    marginBottom: 16,
},
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: HIGColors.systemGray6,
    padding: 16,
    borderRadius: 6,
},
  dataItem: {
    alignItems: 'center',
},
  dataLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
},
  dataCount: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.systemBlue,
},
});

export default MarketInfoPanel;