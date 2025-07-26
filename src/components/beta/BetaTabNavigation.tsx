import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BetaTestingTab } from '../../types/BetaTestingTypes';
import { HIGColors } from '../../constants/HIG';

interface BetaTabNavigationProps {
  selectedTab: BetaTestingTab;
  onTabSelect: (tab: BetaTestingTab) => void;
}

export const BetaTabNavigation: React.FC<BetaTabNavigationProps> = ({
  selectedTab,
  onTabSelect,
}) => {
  const tabs: Array<{ key: BetaTestingTab; label: string; icon: string }> = [
    { key: 'status', label: 'Status', icon: '📊' },
    { key: 'feedback', label: 'Feedback', icon: '💬' },
    { key: 'deployment', label: 'Deployment', icon: '🚀' },
  ];

  const renderTab = (tab: { key: BetaTestingTab; label: string; icon: string }) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tab,
        selectedTab === tab.key && styles.activeTab,
      ]}
      onPress={() => onTabSelect(tab.key)}
    >
      <Text style={[
        styles.tabIcon,
        selectedTab === tab.key && styles.activeTabIcon,
      ]}>
        {tab.icon}
      </Text>
      <Text style={[
        styles.tabLabel,
        selectedTab === tab.key && styles.activeTabLabel,
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {tabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: HIGColors.systemBlue,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  activeTabIcon: {
    // Icon color doesn't change for emojis
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  activeTabLabel: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BetaTabNavigation;