/**
 * CupNote Design System - Card Component
 * 
 * 일관된 카드 레이아웃을 위한 기본 컴포넌트
 * HomeCafe, Recipe, 기타 정보 카드들의 통일된 기반
 */

import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { Colors, Layout, Component } from '../tokens';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'subtle' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Component.card.radius,
    backgroundColor: Colors.background.primary,
},

  // Size variants
  size_sm: {
    padding: Component.card.padding.sm,
},
  size_md: {
    padding: Component.card.padding.md,
},
  size_lg: {
    padding: Component.card.padding.lg,
},

  // Visual variants
  variant_default: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
},

  variant_outlined: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
},

  variant_elevated: {
    backgroundColor: Colors.background.primary,
    ...Layout.shadow.md,
    borderWidth: 0,
},

  variant_subtle: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 0,
},

  variant_primary: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
},
});

// 특화된 카드 컴포넌트들
export interface InputCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  description,
  children,
  ...props
}) => {
  return (
    <Card variant="default" {...props}>
      <View style={inputCardStyles.header}>
        <Text style={inputCardStyles.title}>{title}</Text>
        {description && (
          <Text style={inputCardStyles.description}>{description}</Text>
        )}
      </View>
      <View style={inputCardStyles.content}>
        {children}
      </View>
    </Card>
  );
};

export interface ResultCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  badge,
  children,
  ...props
}) => {
  return (
    <Card variant="primary" {...props}>
      <View style={resultCardStyles.header}>
        <Text style={resultCardStyles.title}>{title}</Text>
        {badge && (
          <Text style={resultCardStyles.badge}>{badge}</Text>
        )}
      </View>
      <View style={resultCardStyles.content}>
        {children}
      </View>
    </Card>
  );
};

const inputCardStyles = StyleSheet.create({
  header: {
    marginBottom: 12,
},
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
},
  description: {
    fontSize: 11,
    color: Colors.text.tertiary,
},
  content: {
    // Content styling handled by children
},
});

const resultCardStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
},
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
},
  badge: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.primary[700],
},
  content: {
    // Content styling handled by children
},
});