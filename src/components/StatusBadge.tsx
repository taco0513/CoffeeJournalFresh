import React from 'react';
import { XStack, Text } from 'tamagui';
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
    <XStack
      onPress={handleTogglePress}
      backgroundColor={getBadgeColor()}
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      borderRadius="$3"
      minWidth={80}
      height={36}
      alignItems="center"
      justifyContent="center"
      pressStyle={{ opacity: 0.7 }}
      hoverStyle={{ opacity: 0.8 }}
      cursor="pointer"
    >
      <Text
        fontSize="$4"
        fontWeight="700"
        color="white"
        letterSpacing={0.3}
        textAlign="center"
      >
        {getBadgeText()}
      </Text>
    </XStack>
  );
};

export default StatusBadge;