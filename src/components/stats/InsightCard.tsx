import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';

interface InsightCardProps {
  icon: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  detail?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  title,
  value,
  trend,
  detail,
}) => {
  const renderTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <Text style={styles.trendIcon}>↑</Text>;
      case 'down':
        return <Text style={styles.trendIcon}>↓</Text>;
      case 'stable':
        return <Text style={styles.trendIcon}>→</Text>;
      default:
        return null;
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {renderTrendIcon()}
        </View>
        {detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F0',
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: '#FFE5CC',
},
  icon: {
    fontSize: 32,
    marginRight: HIGConstants.SPACING_LG,
},
  content: {
    flex: 1,
},
  title: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
},
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_XS,
},
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
},
  trendIcon: {
    fontSize: 16,
    color: HIGColors.green,
},
  detail: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    marginTop: 4,
},
});