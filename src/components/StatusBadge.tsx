import React from 'react';
import { Button, Text, styled } from 'tamagui';
import { useDevStore } from '../stores/useDevStore';
import { useFeedbackStore } from '../stores/useFeedbackStore';

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

  // 현재 상태에 따른 배지 색상
  const getBadgeColor = () => {
    if (isDeveloperMode && isBetaUser) {
      return '$purple9';
    } else if (isDeveloperMode) {
      return '$red9';
    } else {
      return '$orange9';
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
    <Button
      onPress={handleTogglePress}
      backgroundColor={getBadgeColor()}
      paddingHorizontal="$1"
      paddingVertical="$1"
      borderRadius="$1"
      borderWidth={0}
      pressStyle={{ opacity: 0.7 }}
      fontSize="$1"
      fontWeight="700"
      color="white"
      letterSpacing={0.5}
    >
      {getBadgeText()}
    </Button>
  );
};

export default StatusBadge;