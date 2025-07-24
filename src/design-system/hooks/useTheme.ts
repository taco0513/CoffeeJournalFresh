/**
 * CupNote Design System - Theme Hook
 * 
 * 디자인 토큰에 쉽게 접근할 수 있는 React Hook
 * 컴포넌트에서 일관된 스타일링을 위한 인터페이스
 */

import { useMemo } from 'react';
import { Colors, Spacing, Typography, Layout, Component } from '../tokens';

export const useTheme = () => {
  const theme = useMemo(() => ({
    colors: Colors,
    spacing: Spacing,
    typography: Typography,
    layout: Layout,
    component: Component,
    
    // 자주 사용하는 색상 조합
    presets: {
      primaryButton: {
        backgroundColor: Colors.primary[500],
        color: Colors.text.inverse,
      },
      secondaryButton: {
        backgroundColor: Colors.gray[100],
        color: Colors.text.primary,
      },
      inputField: {
        backgroundColor: Colors.background.secondary,
        borderColor: Colors.border.light,
        color: Colors.text.primary,
      },
      card: {
        backgroundColor: Colors.background.primary,
        borderColor: Colors.border.light,
        shadow: Layout.shadow.sm,
      },
      header: {
        backgroundColor: Colors.background.primary,
        borderColor: Colors.border.light,
        height: Component.header.height,
      },
    },
    
    // 유틸리티 함수들
    utils: {
      // 간격 계산
      spacing: (multiplier: number) => Spacing.md * multiplier,
      
      // 투명도 적용
      withOpacity: (color: string, opacity: number) => 
        color + Math.round(opacity * 255).toString(16).padStart(2, '0'),
      
      // 반응형 크기
      responsive: {
        fontSize: (size: keyof typeof Typography.fontSize) => Typography.fontSize[size],
        spacing: (size: keyof typeof Spacing) => Spacing[size],
      },
    },
  }), []);

  return theme;
};

// 타입 정의
export type Theme = ReturnType<typeof useTheme>;