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
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';
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
    backgroundColor: IOSColors.systemBackground,
  },
  navigationBar: {
    height: IOSLayout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: IOSSpacing.screenPadding,
    backgroundColor: IOSColors.systemBackground,
    borderBottomWidth: IOSLayout.borderWidthThin,
    borderBottomColor: IOSColors.separator,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    ...IOSTypography.headline,
    color: IOSColors.label,
  },
  betaBadge: {
    marginLeft: IOSSpacing.xs,
    backgroundColor: IOSColors.systemBlue,
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: IOSSpacing.xxxs,
    borderRadius: IOSLayout.cornerRadiusSmall,
  },
  betaText: {
    ...IOSTypography.caption2,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: IOSColors.systemBackground,
    paddingHorizontal: IOSSpacing.screenPadding,
    borderBottomWidth: IOSLayout.borderWidthThin,
    borderBottomColor: IOSColors.separator,
  },
  tabButton: {
    flex: 1,
    paddingVertical: IOSSpacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: IOSColors.systemBrown,
  },
  tabText: {
    ...IOSTypography.body,
    fontWeight: '500' as const,
    color: IOSColors.secondaryLabel,
  },
  activeTabText: {
    color: IOSColors.systemBrown,
    fontWeight: '600' as const,
  },
  contentContainer: {
    flex: 1,
  },
});