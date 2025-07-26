/**
 * CupNote Design System - Header Component
 * 
 * 모든 화면에서 일관된 헤더 제공
 * TastingFlow와 다른 화면들의 헤더 통일
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, Component } from '../tokens';

export interface HeaderProps {
  title: string;
  leftAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
};
  rightAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
};
  showBorder?: boolean;
  progressPercent?: number;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftAction,
  rightAction,
  showBorder = true,
  progressPercent,
  style,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {/* Main Header */}
      <View style={[
        styles.header,
        showBorder && styles.headerWithBorder,
      ]}>
        {/* Left Action */}
        <View style={styles.leftContainer}>
          {leftAction && (
            <TouchableOpacity 
              onPress={leftAction.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>{leftAction.text || leftAction.icon || ''}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Action */}
        <View style={styles.rightContainer}>
          {rightAction && (
            <TouchableOpacity 
              onPress={rightAction.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>{rightAction.text || rightAction.icon || ''}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      {progressPercent !== undefined && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercent}%` }
            ]} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background.primary,
},

  header: {
    height: Component.header.height,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Component.header.padding,
    backgroundColor: Colors.background.primary,
},

  headerWithBorder: {
    borderBottomWidth: Component.header.borderWidth,
    borderBottomColor: Colors.border.light,
},

  leftContainer: {
    width: 80,
    alignItems: 'flex-start',
},

  titleContainer: {
    flex: 1,
    alignItems: 'center',
},

  rightContainer: {
    width: 80,
    alignItems: 'flex-end',
},

  actionButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
},


  actionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[500],
},

  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
},

  // Progress Bar
  progressContainer: {
    height: 3,
    backgroundColor: Colors.gray[200],
    overflow: 'hidden',
},

  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary[500],
},
});

// 기본 헤더 프리셋들
export const HeaderPresets = {
  // TastingFlow용 헤더
  tastingFlow: (title: string, onBack: () => void, onSkip: () => void, progress: number) => (
    <Header
      title={title}
      leftAction={{ text: '뒤로', onPress: onBack }}
      rightAction={{ text: '건너뛰기', onPress: onSkip }}
      progressPercent={progress}
    />
  ),

  // 일반 화면용 헤더  
  basic: (title: string, onBack?: () => void) => (
    <Header
      title={title}
      leftAction={onBack ? { text: '뒤로', onPress: onBack } : undefined}
    />
  ),

  // 액션이 있는 헤더
  withAction: (title: string, onBack: () => void, actionText: string, onAction: () => void) => (
    <Header
      title={title}
      leftAction={{ text: '뒤로', onPress: onBack }}
      rightAction={{ text: actionText, onPress: onAction }}
    />
  ),
};