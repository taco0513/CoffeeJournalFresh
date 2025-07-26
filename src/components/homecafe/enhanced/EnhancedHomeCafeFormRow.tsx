// EnhancedHomeCafeFormRow.tsx
// Reusable form row component for EnhancedHomeCafeScreen

import React from 'react';
import {
  FormRow,
  FormLabel,
  FormValue,
  ValueButton,
  ValueText,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeFormRowProps {
  label: string;
  value: string | number;
  onPress: () => void;
}

export const EnhancedHomeCafeFormRow: React.FC<EnhancedHomeCafeFormRowProps> = ({
  label,
  value,
  onPress,
}) => {
  return (
    <FormRow>
      <FormLabel>{label}</FormLabel>
      <FormValue>
        <ValueButton onPress={onPress} unstyled>
          <ValueText>{value}</ValueText>
        </ValueButton>
      </FormValue>
    </FormRow>
  );
};