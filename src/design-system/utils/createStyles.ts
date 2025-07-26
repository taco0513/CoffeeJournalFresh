/**
 * CupNote Design System - Style Utilities
 * 
 * 디자인 토큰을 활용한 스타일 생성 유틸리티
 * 일관성 있는 스타일링을 위한 헬퍼 함수들
 */

import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Layout } from '../tokens';

import { Logger } from '../../services/LoggingService';
// 타입 안전한 스타일 생성
export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: T | ((tokens: typeof designTokens) => T)
): T => {
  if (typeof styles === 'function') {
    return StyleSheet.create(styles(designTokens));
}
  return StyleSheet.create(styles);
};

// 디자인 토큰 객체
export const designTokens = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  layout: Layout,
} as const;

// 자주 사용되는 스타일 조합들
export const commonStyles = StyleSheet.create({
  // 플렉스 레이아웃
  flexRow: {
    flexDirection: 'row',
},
  flexColumn: {
    flexDirection: 'column',
},
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
},
  flexBetween: {
    alignItems: 'center',
    justifyContent: 'space-between',
},

  // 텍스트 스타일
  textCenter: {
    textAlign: 'center',
},
  textBold: {
    fontWeight: Typography.fontWeight.bold,
},
  textSemibold: {
    fontWeight: Typography.fontWeight.semibold,
},

  // 간격
  marginBottom: {
    marginBottom: Spacing.md,
},
  paddingHorizontal: {
    paddingHorizontal: Spacing.lg,
},

  // 카드 스타일
  cardShadow: {
    ...Layout.shadow.sm,
},
  cardRounded: {
    borderRadius: Layout.radius.md,
},

  // 테두리
  borderTop: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.light,
},
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.light,
},
});

// 반응형 spacing 헬퍼
export const spacing = (size: keyof typeof Spacing) => Spacing[size];

// 색상 헬퍼
export const color = (path: string) => {
  const keys = path.split('.');
  let result: unknown = Colors;
  
  for (const key of keys) {
    result = result[key];
    if (result === undefined) {
      Logger.warn(`Color path "${path}" not found`, 'util', { component: 'createStyles' });
      return Colors.gray[500]; // fallback
  }
}
  
  return result;
};

// 그림자 헬퍼
export const shadow = (level: keyof typeof Layout.shadow) => Layout.shadow[level];