// EnhancedHomeCafeBottomActions.tsx
// Bottom action buttons for EnhancedHomeCafeScreen

import React from 'react';
import { Text } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import {
  BottomActions,
  SecondaryButton,
  PrimaryButton,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeBottomActionsProps {
  onNext?: () => void;
}

export const EnhancedHomeCafeBottomActions: React.FC<EnhancedHomeCafeBottomActionsProps> = ({
  onNext,
}) => {
  const navigation = useNavigation();

  return (
    <BottomActions>
      <SecondaryButton onPress={() => navigation.goBack()} unstyled>
        <Text fontSize="$4" color="$color">취소</Text>
      </SecondaryButton>
      <PrimaryButton onPress={onNext || (() => navigation.goBack())}>
        다음
      </PrimaryButton>
    </BottomActions>
  );
};