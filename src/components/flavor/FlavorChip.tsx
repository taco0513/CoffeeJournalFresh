import React from 'react';
import { Dimensions } from 'react-native';
import { Chip } from '../common/Chip';
import { FlavorChipProps } from '../../types/flavor';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const FlavorChip: React.FC<FlavorChipProps> = ({ flavor, isSelected, onPress, searchQuery }) => {
  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  
  // Enhanced text with search highlighting
  const getEnhancedTitle = () => {
    if (!searchQuery || searchQuery.length < 2) {
      return flavor.koreanName;
  }
    
    // Simple highlighting for Korean text matching
    const lowerQuery = searchQuery.toLowerCase();
    const lowerName = flavor.koreanName.toLowerCase();
    
    if (lowerName.includes(lowerQuery)) {
      // Return highlighted version (could be enhanced with styled text components)
      return flavor.koreanName;
  }
    
    return flavor.koreanName;
};

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('selection');
    onPress();
};

  return (
    <Chip
      title={getEnhancedTitle()}
      size={isTablet ? 'LARGE' : 'MEDIUM'}
      variant={isSelected ? 'selected' : 'default'}
      onPress={handlePress}
      style={{
        marginRight: 8,
        marginBottom: 8,
    }}
    />
  );
};

// FlavorChip now uses the master Chip component
// All styling is handled by the Chip design system