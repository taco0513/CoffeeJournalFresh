import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDevStore } from '../stores/useDevStore';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import { HIGColors } from '../styles/common';

const StatusBadge = () => {
  const { isDeveloperMode, toggleDeveloperMode } = useDevStore();
  const { isBetaUser, setBetaStatus } = useFeedbackStore();

  // 둘 다 없으면 아무것도 표시하지 않음
  if (!isDeveloperMode && !isBetaUser) {
    return null;
  }

  const handleTogglePress = () => {
    // 현재 상태에 따라 다음 상태로 전환
    if (isDeveloperMode && isBetaUser) {
      // 둘 다 ON -> DEV만 ON
      setBetaStatus(false);
    } else if (isDeveloperMode && !isBetaUser) {
      // DEV만 ON -> BETA만 ON
      toggleDeveloperMode();
      setBetaStatus(true);
    } else if (!isDeveloperMode && isBetaUser) {
      // BETA만 ON -> 둘 다 ON
      toggleDeveloperMode();
    }
  };

  // 현재 상태에 따른 배지 표시
  const getBadgeStyle = () => {
    if (isDeveloperMode && isBetaUser) {
      return styles.bothBadge;
    } else if (isDeveloperMode) {
      return styles.developerBadge;
    } else {
      return styles.betaBadge;
    }
  };

  const getBadgeText = () => {
    if (isDeveloperMode && isBetaUser) {
      return 'DEV+BETA';
    } else if (isDeveloperMode) {
      return 'DEV';
    } else {
      return 'BETA';
    }
  };

  return (
    <TouchableOpacity
      onPress={handleTogglePress}
      activeOpacity={0.7}
      style={[styles.badge, getBadgeStyle()]}
    >
      <Text style={styles.badgeText}>{getBadgeText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  developerBadge: {
    backgroundColor: HIGColors.red,
  },
  betaBadge: {
    backgroundColor: HIGColors.orange,
  },
  bothBadge: {
    backgroundColor: HIGColors.purple,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: HIGColors.white,
    letterSpacing: 0.5,
  },
});

export default StatusBadge;