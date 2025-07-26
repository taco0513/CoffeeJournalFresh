/**
 * iOS Human Interface Guidelines 2024 기준 디자인 시스템
 * CupNote 앱 전체에 적용되는 표준 스타일 가이드
 */

import { Platform } from 'react-native';

// ===== Typography System =====
// iOS 17 SF Pro 표준 타이포그래피
export const IOSTypography = {
  // Large Title (34pt) - 스크롤 전 큰 제목
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.374,
},
  
  // Title 1 (28pt) - 주요 화면 제목
  title1: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    letterSpacing: 0.364,
},
  
  // Title 2 (22pt) - 섹션 헤더
  title2: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0.352,
},
  
  // Title 3 (20pt) - 서브섹션 헤더
  title3: {
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
},
  
  // Headline (17pt Bold) - Navigation Title
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.408,
},
  
  // Body (17pt) - 기본 본문
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.408,
},
  
  // Callout (16pt) - 강조 텍스트
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
},
  
  // Subheadline (15pt) - 보조 제목
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
},
  
  // Footnote (13pt) - 각주, 보조 정보
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.078,
},
  
  // Caption 1 (12pt) - 캡션
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
},
  
  // Caption 2 (11pt) - 작은 캡션
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.066,
},
};

// ===== Color System =====
// iOS 색상 시스템 (Light 모드 전용)
export const IOSColors = {
  // System Colors (Light mode only)
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D92',
  systemTeal: '#30B0C7',
  systemIndigo: '#5856D6',
  systemBrown: '#A2845E',
  
  // Gray Scale
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // Label Colors (Text)
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  quaternaryLabel: 'rgba(60, 60, 67, 0.18)',
  
  // Background Colors
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  
  // Grouped Background Colors
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',
  
  // Separator Colors
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  
  // Fill Colors
  systemFill: 'rgba(120, 120, 128, 0.2)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',
  
  // Link Color
  link: '#007AFF',
  
  // Placeholder Text
  placeholderText: 'rgba(60, 60, 67, 0.3)',
};

// ===== Spacing System =====
// iOS 표준 간격 시스템
export const IOSSpacing = {
  // 기본 간격
  xxxs: 2,   // 최소 간격
  xxs: 4,    // 매우 작은 간격
  xs: 8,     // 작은 간격
  sm: 12,    // 중간 작은 간격
  md: 16,    // 기본 간격 (표준 마진)
  lg: 20,    // 큰 간격
  xl: 24,    // 매우 큰 간격
  xxl: 32,   // 특별히 큰 간격
  xxxl: 40,  // 최대 간격
  
  // 화면 여백
  screenPadding: 16,
  screenPaddingLarge: 20,
  
  // 섹션 간격
  sectionSpacing: 32,
  sectionSpacingSmall: 24,
  
  // 리스트 아이템 간격
  listItemSpacing: 12,
  listItemPadding: 16,
};

// ===== Layout Constants =====
// iOS 표준 레이아웃 상수
export const IOSLayout = {
  // Touch Targets
  minTouchTarget: 44,
  
  // Navigation Bar
  navBarHeight: 44,
  navBarLargeTitleHeight: 96,
  
  // Tab Bar
  tabBarHeight: 49,
  tabBarHeightCompact: 32,
  
  // Status Bar
  statusBarHeight: Platform.select({
    ios: 20,
    android: 0,
}),
  
  // Safe Area (iPhone X+)
  safeAreaTop: 44,
  safeAreaBottom: 34,
  
  // Corner Radius
  cornerRadiusSmall: 8,
  cornerRadiusMedium: 12,
  cornerRadiusLarge: 16,
  cornerRadiusXLarge: 20,
  
  // Border Width
  borderWidthThin: 0.5,
  borderWidthMedium: 1,
  borderWidthThick: 2,
  
  // Icon Sizes
  iconSizeSmall: 20,
  iconSizeMedium: 24,
  iconSizeLarge: 28,
  iconSizeXLarge: 32,
  
  // Button Heights
  buttonHeightSmall: 32,
  buttonHeightMedium: 44,
  buttonHeightLarge: 50,
  
  // List Row Heights
  listRowHeightSmall: 44,
  listRowHeightMedium: 60,
  listRowHeightLarge: 76,
};

// ===== Shadow Styles =====
// iOS 표준 그림자 효과
export const IOSShadows = {
  // 작은 그림자 (카드, 버튼)
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
    android: {
      elevation: 2,
  },
}),
  
  // 중간 그림자 (모달, 플로팅 요소)
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
  },
    android: {
      elevation: 4,
  },
}),
  
  // 큰 그림자 (팝업, 드롭다운)
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
  },
    android: {
      elevation: 8,
  },
}),
};

// ===== Animation Constants =====
// iOS 표준 애니메이션 시간
export const IOSAnimation = {
  // Duration
  durationInstant: 100,
  durationFast: 200,
  durationNormal: 300,
  durationSlow: 400,
  
  // Spring Animation
  springDamping: 0.8,
  springStiffness: 100,
  
  // Easing
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
},
};

