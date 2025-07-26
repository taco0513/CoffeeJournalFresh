// TastingDetailNavigation.tsx
// Navigation header component for TastingDetailScreen

import React from 'react';
import { Text, Button, YStack } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { NavigationBar } from './TastingDetailStyledComponents';

interface TastingDetailNavigationProps {
  hideNavBar?: boolean;
  title?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const TastingDetailNavigation: React.FC<TastingDetailNavigationProps> = ({
  hideNavBar = false,
  title = '테이스팅 상세',
  showDeleteButton = false,
  onDelete,
  isDeleting = false,
}) => {
  const navigation = useNavigation();

  if (hideNavBar) {
    return null;
}

  return (
    <NavigationBar>
      <Button 
        unstyled 
        onPress={() => navigation.goBack()} 
        pressStyle={{ opacity: 0.7 }}
      >
        <Text fontSize="$6" color="$cupBlue">←</Text>
      </Button>
      
      <Text fontSize="$4" fontWeight="600" color="$color">
        {title}
      </Text>
      
      {showDeleteButton && onDelete ? (
        <Button
          unstyled
          onPress={onDelete}
          pressStyle={{ opacity: 0.7 }}
          disabled={isDeleting}
        >
          <Text fontSize="$5" color="$red9">
            {isDeleting ? '...' : '🗑'}
          </Text>
        </Button>
      ) : (
        <YStack width={24} />
      )}
    </NavigationBar>
  );
};