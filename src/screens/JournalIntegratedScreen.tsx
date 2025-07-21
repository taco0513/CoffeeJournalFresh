import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
// import { useTranslation } from 'react-i18next'; // Removed - using static Korean strings
import { HIGConstants, HIGColors } from '../styles/common';
import HistoryScreen from './HistoryScreen';
import StatsScreen from './StatsScreen';
import StatusBadge from '../components/StatusBadge';

const { width } = Dimensions.get('window');

type TabType = 'history' | 'stats';

interface JournalIntegratedScreenProps {
  route?: {
    params?: {
      initialTab?: TabType;
    };
  };
}

export default function JournalIntegratedScreen({ route }: JournalIntegratedScreenProps) {
  // const { t } = useTranslation(); // Removed - using static Korean strings
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'history');

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    // hideNavBar prop을 전달하여 내부 네비게이션 바를 숨김
    switch (activeTab) {
      case 'history':
        return <HistoryScreen hideNavBar={true} />;
      case 'stats':
        return <StatsScreen hideNavBar={true} />;
      default:
        return <HistoryScreen hideNavBar={true} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.navContent}>
          <Text style={styles.navTitle}>My Coffee</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <StatusBadge />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('history', '기록')}
        {renderTabButton('stats', '통계')}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.gray6,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
  },
  betaBadge: {
    marginLeft: HIGConstants.SPACING_XS,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.gray6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#8B4513',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  activeTabText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});