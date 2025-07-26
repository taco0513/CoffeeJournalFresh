# CupNote Typography System Documentation

## 📖 Overview

CupNote의 타이포그라피 시스템은 **접근성, 가독성, 일관성**을 최우선으로 하여 설계되었습니다. Material Design과 data-heavy interface 모범 사례를 기반으로 하며, WCAG AA 접근성 기준을 준수합니다.

## 🎯 Core Principles

1. **Accessibility First**: 모든 텍스트는 WCAG AA 기준 (4.5:1 contrast ratio) 준수
2. **Semantic Hierarchy**: 의미적 계층 구조로 정보의 우선순위 명확화
3. **Consistency**: Tamagui 토큰 시스템을 통한 일관된 스타일 적용
4. **Scalability**: 시스템 폰트 크기 조정 지원
5. **Performance**: 토큰 기반 시스템으로 번들 크기 최적화

## 📏 Typography Scale

### Primary Scale (Main Content)

| Token | Size | Usage | Example |
|-------|------|-------|---------|
| `$8` | 36px | H1 Titles | 페이지 제목, 브랜딩 |
| `$7` | 28px | H2 Section Headers | 주요 섹션 제목 |
| `$6` | 24px | H3 Subsection Headers | 하위 섹션 제목 |
| `$5` | 20px | H4 Component Headers | 컴포넌트 제목 |
| `$4` | 18px | Large Body Text | 중요한 본문, 부제목 |
| `$3` | 16px | **Body Text** | **기본 본문 텍스트** |

### Secondary Scale (Metadata & Labels)

| Token | Size | Usage | Example |
|-------|------|-------|---------|
| `$2` | 14px | **Captions** | 네비게이션, 통계 라벨 |
| `$1` | 12px | **Micro Text** | 상태 배지, 메타데이터 |
| `10px` | 10px | **System Info** | 타임스탬프, 버전 정보 |

## 🚦 Usage Guidelines

### ✅ Recommended Uses

#### **16px ($3) - Primary Content**
```tsx
<Text fontSize="$3" color="$color">
  이것은 기본 본문 텍스트입니다.
</Text>
```
- 기사 본문
- 설명 텍스트
- 사용자 입력 내용
- 주요 정보

#### **14px ($2) - Secondary Information**
```tsx
<Text fontSize="$2" color="$secondaryLabel">
  보조 정보와 라벨
</Text>
```
- 네비게이션 라벨
- 통계 수치 라벨
- 폼 필드 라벨
- 캡션

#### **12px ($1) - Metadata**
```tsx
<Text fontSize="$1" color="$tertiaryLabel">
  상태 정보
</Text>
```
- 상태 배지 (DEV, BETA)
- 도움말 텍스트
- 업적 배지
- 플로팅 버튼 서브텍스트

### ❌ Prohibited Uses

#### **12px 이하 사용 금지 대상:**
- 주요 네비게이션 텍스트
- 기본 본문 내용
- 중요한 액션 버튼 텍스트
- 에러 메시지

## 🎨 Semantic Typography Patterns

### Headings Hierarchy

```tsx
// Page Title
<H1 fontSize="$8" fontWeight="700" color="$color">
  커피 테이스팅 기록
</H1>

// Section Header
<H2 fontSize="$6" fontWeight="600" color="$color">
  이번 주 인사이트
</H2>

// Component Header
<H3 fontSize="$5" fontWeight="600" color="$color">
  향미 분석
</H3>

// Sub-component Header
<Text fontSize="$4" fontWeight="500" color="$color">
  선택된 향미
</Text>
```

### Body Text Patterns

```tsx
// Primary content
<Paragraph fontSize="$3" lineHeight="$6" color="$color">
  여기는 주요 본문 내용입니다.
</Paragraph>

// Secondary description
<Text fontSize="$2" lineHeight="$5" color="$secondaryLabel">
  부가 설명이나 캡션 텍스트
</Text>

// Metadata
<Text fontSize="$1" color="$tertiaryLabel">
  2시간 전 • 5분 읽기
</Text>
```

## 🏷️ Component-Specific Typography

### Navigation
```tsx
// Tab labels
<Text fontSize="$2" fontWeight="500" color="$cupBlue">
  홈
</Text>

// Page titles
<Text fontSize="$5" fontWeight="600" color="$color">
  커피 기록
</Text>
```

### Cards
```tsx
// Card title
<Text fontSize="$4" fontWeight="600" color="$color">
  에티오피아 예가체프
</Text>

// Card subtitle
<Text fontSize="$3" color="$secondaryLabel">
  테라로사
</Text>

// Card metadata
<Text fontSize="$2" color="$tertiaryLabel">
  2025.07.26
</Text>
```

### Forms
```tsx
// Field labels
<Text fontSize="$2" fontWeight="500" color="$color">
  커피 이름
</Text>

// Input text
<TextInput fontSize="$3" color="$color" />

// Helper text
<Text fontSize="$1" color="$secondaryLabel">
  로스터가 제공한 정확한 이름을 입력하세요
</Text>
```

### Statistics
```tsx
// Stat value
<Text fontSize="$6" fontWeight="700" color="$cupBlue">
  47
</Text>

// Stat label
<Text fontSize="$2" color="$color">
  총 테이스팅
</Text>
```

## 🌈 Color Integration

### Text Color Hierarchy

```tsx
// Primary text
color="$color"                    // 기본 텍스트
color="$secondaryLabel"           // 보조 정보
color="$tertiaryLabel"           // 메타데이터

// Semantic colors
color="$cupBlue"                 // 브랜드 강조
color="$red9"                    // 에러, 경고
color="$green9"                  // 성공, 완료
color="$orange9"                 // 주의, 알림
```

### Brand Typography
```tsx
// Brand name
<Text fontSize="$7" fontWeight="700" color="$cupBlue">
  CupNote
</Text>

// Tagline
<Text fontSize="$3" color="$secondaryLabel">
  나만의 커피 취향을 발견하는 가장 쉬운 방법
</Text>
```

## 📱 Responsive Typography

### Screen Size Adaptations

```tsx
// Responsive font sizes
const isSmallScreen = screenWidth < 375;
const isLargeScreen = screenWidth > 414;

const responsiveSize = useMemo(() => ({
  title: isSmallScreen ? '$6' : isLargeScreen ? '$8' : '$7',
  body: isSmallScreen ? '$2' : '$3',
  caption: '$2', // Always consistent
}), [isSmallScreen, isLargeScreen]);

<H1 fontSize={responsiveSize.title}>제목</H1>
```

## ♿ Accessibility Features

### WCAG AA Compliance

```tsx
// Minimum contrast ratios
const textColors = {
  primary: '$color',        // 4.5:1 ratio
  secondary: '$gray11',     // 4.5:1 ratio  
  tertiary: '$gray10',      // 4.5:1 ratio
};

// Focus indicators
const focusStyles = {
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    outlineColor: '$focusRing',
    outlineWidth: 2,
  }
};
```

### Dynamic Type Support

```tsx
// Support system font scaling
<Text 
  fontSize="$3"
  allowFontScaling={true}
  maxFontSizeMultiplier={1.5}
>
  접근성을 위한 폰트 크기 조정 지원
</Text>
```

## 🔧 Implementation Examples

### Status Badge Component
```tsx
const StatusBadge = styled(Text, {
  name: 'StatusBadge',
  fontSize: '$1',           // 12px for badges
  fontWeight: '700',
  color: 'white',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$xs',
  paddingVertical: '$xxs',
  borderRadius: '$2',
  textAlign: 'center',
  letterSpacing: '$wide',
});

// Usage
<StatusBadge>BETA</StatusBadge>
```

### Insight Card Typography
```tsx
const InsightCard = () => (
  <Card padding="$lg">
    <XStack alignItems="center" marginBottom="$sm">
      <Text fontSize="$iconMedium" marginRight="$sm">💡</Text>
      <Text fontSize="$4" fontWeight="600" color="$color">
        인사이트 제목
      </Text>
    </XStack>
    
    <Paragraph fontSize="$3" lineHeight="$6" color="$color">
      이번 주 산미에 대한 선호도가 15% 증가했어요.
    </Paragraph>
    
    <Text fontSize="$2" color="$secondaryLabel" marginTop="$sm">
      더 밝은 로스팅의 커피를 시도해보세요!
    </Text>
  </Card>
);
```

## 🚨 Code Review Checklist

### ❌ Anti-patterns
```tsx
// Hardcoded values
fontSize: 14
fontSize: '16px'
color: '#333333'
fontWeight: 'bold'

// Inconsistent hierarchy
<H1 fontSize="$3">  // Too small for H1
<Text fontSize="$8"> // Too large for body text
```

### ✅ Correct patterns
```tsx
// Token-based
fontSize: '$3'
color: '$color'
fontWeight: '600'

// Semantic hierarchy
<H1 fontSize="$7">   // Appropriate for main title
<Text fontSize="$3"> // Appropriate for body text
```

## 📊 Performance Considerations

### Token Benefits
- **Tree Shaking**: 사용되지 않는 스타일 자동 제거
- **Consistent Bundle**: 중복 스타일 코드 방지
- **Runtime Optimization**: 컴파일 타임 최적화

### Best Practices
```tsx
// Prefer styled components for reusable typography
const CardTitle = styled(Text, {
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

// Use tokens consistently
const theme = useTheme();
// ❌ Don't access raw values
const badSize = theme.fontSize3.val;
// ✅ Use tokens
fontSize: '$3'
```

## 🔄 Migration Guide

### From Legacy HIGConstants
```tsx
// Old (HIGConstants)
fontSize: HIGConstants.FONT_SIZE_BODY     // 16
fontSize: HIGConstants.FONT_SIZE_CAPTION  // 14

// New (Tamagui tokens)
fontSize: '$3'  // 16px
fontSize: '$2'  // 14px
```

### Gradual Migration Strategy
1. **Phase 1**: Update new components with tokens
2. **Phase 2**: Refactor high-impact legacy components
3. **Phase 3**: Complete migration of remaining components
4. **Phase 4**: Remove HIGConstants dependencies

## 📚 Resources

### Reference Files
- **Design Tokens**: `src/styles/tamagui-unified-tokens.ts`
- **Component Examples**: `src/components/StatusBadge.tsx`
- **Theme Configuration**: `tamagui.config.ts`

### External References
- [Material Design Typography](https://material.io/design/typography)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tamagui Typography Documentation](https://tamagui.dev/docs/core/text)

---

**Last Updated**: 2025-07-26  
**Version**: 1.0  
**Status**: ✅ Production Ready