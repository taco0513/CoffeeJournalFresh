import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SliderSection } from './SliderSection';
import { HIGConstants } from '../../styles/common';

const { width: screenWidth } = Dimensions.get('window');

interface SensoryAttribute {
  title: string;
  value: number;
  onValueChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  description: string;
}

interface CompactSensoryGridProps {
  attributes: SensoryAttribute[];
}

export const CompactSensoryGrid = memo<CompactSensoryGridProps>(({ attributes }) => {
  // Use 2 items per row for better readability
  const itemsPerRow = 2;
  const horizontalPadding = HIGConstants.SPACING_LG * 2;
  const spacing = HIGConstants.SPACING_MD;
  const cardWidth = (screenWidth - horizontalPadding - spacing) / itemsPerRow;

  // Group attributes into rows
  const rows = [];
  for (let i = 0; i < attributes.length; i += itemsPerRow) {
    rows.push(attributes.slice(i, i + itemsPerRow));
}

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((attribute, index) => (
            <View 
              key={attribute.title} 
              style={[
                styles.attributeContainer,
                { width: cardWidth },
                index < row.length - 1 && { marginRight: spacing }
              ]}
            >
              <SliderSection
                title={attribute.title}
                value={attribute.value}
                onValueChange={attribute.onValueChange}
                leftLabel={attribute.leftLabel}
                rightLabel={attribute.rightLabel}
                description={attribute.description}
              />
            </View>
          ))}
          {/* Fill remaining space if row is incomplete */}
          {row.length < itemsPerRow && (
            <View style={{ width: cardWidth * (itemsPerRow - row.length) + HIGConstants.SPACING_SM * (itemsPerRow - row.length - 1) }} />
          )}
        </View>
      ))}
    </View>
  );
});

CompactSensoryGrid.displayName = 'CompactSensoryGrid';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
},
  row: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_MD,
},
  attributeContainer: {
    flex: 0,
},
});