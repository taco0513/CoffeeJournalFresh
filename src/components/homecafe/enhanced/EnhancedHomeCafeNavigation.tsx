// EnhancedHomeCafeNavigation.tsx
// Navigation header component for EnhancedHomeCafeScreen

import React from 'react';
import { Switch } from 'react-native';
import { Text } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import {
  NavigationBar,
  BackButton,
  NavigationTitle,
  AdvancedModeToggle,
  AdvancedModeText,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeNavigationProps {
  useAdvancedMode: boolean;
  onAdvancedModeToggle: (value: boolean) => void;
}

export const EnhancedHomeCafeNavigation: React.FC<EnhancedHomeCafeNavigationProps> = ({
  useAdvancedMode,
  onAdvancedModeToggle,
}) => {
  const navigation = useNavigation();

  return (
    <NavigationBar>
      <BackButton unstyled onPress={() => navigation.goBack()}>
        <Text color="$cupBlue" fontSize="$6">←</Text>
      </BackButton>
      <NavigationTitle>향상된 홈카페</NavigationTitle>
      <AdvancedModeToggle>
        <AdvancedModeText>고급</AdvancedModeText>
        <Switch
          value={useAdvancedMode}
          onValueChange={onAdvancedModeToggle}
          trackColor={{ false: '$gray6', true: '$cupBlue' }}
          thumbColor={useAdvancedMode ? '$background' : '$gray10'}
        />
      </AdvancedModeToggle>
    </NavigationBar>
  );
};