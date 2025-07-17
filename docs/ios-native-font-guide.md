# 📱 iOS Native Font 사용 가이드

> React Native에서 iOS 시스템 폰트 올바르게 사용하기

## 🎯 핵심 원칙

**React Native에서는 fontFamily를 지정하지 않으면 자동으로 iOS 시스템 폰트(San Francisco)를 사용합니다.**

## ✅ 올바른 사용법

### 1. fontFamily 지정하지 않기
```typescript
// ✅ Good - iOS 시스템 폰트 자동 사용
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700', // Bold
  },
  body: {
    fontSize: 17,
    fontWeight: '400', // Regular
  }
});

// ❌ Bad - 불필요한 폰트 지정
const styles = StyleSheet.create({
  title: {
    fontFamily: 'SF Pro Display', // 사용하지 마세요!
    fontSize: 28,
  }
});
```

### 2. fontWeight로 다양한 굵기 표현
```typescript
// iOS 시스템 폰트의 fontWeight 옵션
const FontWeights = {
  ultraLight: '100',   // Ultra Light
  thin: '200',         // Thin
  light: '300',        // Light
  regular: '400',      // Regular (기본값)
  medium: '500',       // Medium
  semibold: '600',     // Semibold
  bold: '700',         // Bold
  heavy: '800',        // Heavy
  black: '900',        // Black
};

// 사용 예시
const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700', // Bold
  },
  headline: {
    fontSize: 17,
    fontWeight: '600', // Semibold
  },
  body: {
    fontSize: 17,
    fontWeight: '400', // Regular
  },
  caption: {
    fontSize: 12,
    fontWeight: '400', // Regular
  }
});
```

### 3. Platform 별 분기
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontSize: 17,
    fontWeight: '600',
    // iOS는 시스템 폰트, Android는 Roboto
    ...Platform.select({
      android: {
        fontFamily: 'Roboto',
      },
      // iOS는 fontFamily 지정 안 함
    }),
  }
});
```

## 📏 iOS Typography 가이드라인

### 텍스트 스타일 및 크기
| 스타일 | 크기 | fontWeight | 용도 |
|--------|------|------------|------|
| Large Title | 34pt | 700 (Bold) | 주요 화면 제목 |
| Title 1 | 28pt | 700 (Bold) | 섹션 제목 |
| Title 2 | 22pt | 700 (Bold) | 서브 섹션 |
| Title 3 | 20pt | 600 (Semibold) | 카드 제목 |
| Headline | 17pt | 600 (Semibold) | 중요 텍스트 |
| Body | 17pt | 400 (Regular) | 본문 |
| Callout | 16pt | 400 (Regular) | 강조 본문 |
| Subheadline | 15pt | 400 (Regular) | 보조 정보 |
| Footnote | 13pt | 400 (Regular) | 작은 정보 |
| Caption 1 | 12pt | 400 (Regular) | 캡션 |
| Caption 2 | 11pt | 400 (Regular) | 최소 텍스트 |

## 🎨 Typography 유틸리티 클래스

```typescript
// utils/typography.ts
export const Typography = {
  // 크기 정의
  sizes: {
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,
  },
  
  // 굵기 정의
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // 미리 정의된 스타일
  styles: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 41,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
};
```

## 💫 Dynamic Type 지원

```typescript
import { PixelRatio } from 'react-native';

// 사용자의 텍스트 크기 설정 반영
const scaleFactor = PixelRatio.getFontScale();

const scaledFontSize = (size: number) => {
  return size * scaleFactor;
};

// 사용 예시
const styles = StyleSheet.create({
  title: {
    fontSize: scaledFontSize(28),
    fontWeight: '700',
  },
  body: {
    fontSize: scaledFontSize(17),
    fontWeight: '400',
  },
});
```

## ⚠️ 주의사항

### 1. 커스텀 폰트 사용 시
만약 특별한 브랜드 폰트가 필요한 경우에만 커스텀 폰트를 추가하세요:

```typescript
// iOS: Info.plist에 폰트 추가
// Android: assets/fonts 폴더에 추가

const styles = StyleSheet.create({
  brandText: {
    fontFamily: Platform.select({
      ios: 'CustomFont-Bold',
      android: 'custom_font_bold',
    }),
  },
});
```

### 2. 이모지와 특수문자
iOS 시스템 폰트는 이모지를 완벽하게 지원합니다:

```typescript
const styles = StyleSheet.create({
  emojiText: {
    fontSize: 24,
    // fontFamily 지정 안 함 - 시스템이 자동 처리
  },
});
```

## 📚 참고 자료

- [Apple Typography Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography)
- [React Native Text Styling](https://reactnative.dev/docs/text-style-props)
- [iOS Font Weights](https://developer.apple.com/documentation/uikit/uifont/weight)

---

> **팁**: iOS 시스템 폰트를 사용하면 앱이 더 네이티브하게 보이고, 
> 사용자의 접근성 설정을 자동으로 존중합니다.