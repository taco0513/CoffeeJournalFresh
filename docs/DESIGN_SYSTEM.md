# CupNote Design System

## Overview

CupNote의 통합 디자인 시스템은 일관되고 접근 가능하며 확장 가능한 UI를 위한 연구 기반 디자인 토큰을 제공합니다.

## 핵심 원칙

1. **토큰 우선**: 항상 디자인 시스템 토큰 사용, 하드코딩 금지
2. **접근성 준수**: WCAG AA 기준 준수 (4.5:1 대비율)
3. **의미있는 명명**: 기능 중심의 토큰 이름 사용
4. **일관성**: 모든 컴포넌트에서 통일된 패턴 적용

## Typography System

### 토큰 매핑

| Tamagui Token | 크기 | 용도 | 예시 |
|---------------|------|------|------|
| `$1` | 11px | 상태 배지, 메타데이터만 | DEV/BETA 배지 |
| `$2` | 13px | 보조 정보, 도움말 | 캡션, 폼 힌트 |
| `$3` | 16px | 본문, 주요 라벨 (기준선) | 통계 라벨, 메인 콘텐츠 |
| `$4` | 18px | 섹션 헤더, 중요 라벨 | 카드 제목, 중요 섹션 |
| `$5` | 22px | 페이지 제목, 통계 값 | 홈스크린 통계 숫자 |
| `$6` | 26px | 화면 제목 | 페이지 헤더 |
| `$7` | 30px | 히어로 텍스트 | 환영 메시지 |
| `$8` | 34px | 큰 디스플레이 | 랜딩 헤더 |

### 텍스트 크기 사용 가이드

**✅ 11px ($1) - 배지/메타데이터만:**
- 상태 배지 (DEV, BETA)
- 버전 정보, 빌드 번호

**✅ 13px ($2) - 보조 정보:**
- 도움말 텍스트, 캡션
- 폼 힌트, 각주

**✅ 16px ($3) - 기준선 (메인 콘텐츠):**
- 본문 텍스트, 통계 라벨
- 네비게이션 라벨, 폼 입력
- 주요 사용자 대면 텍스트

**✅ 18px ($4) - 섹션 헤더:**
- 카드 제목, 중요한 라벨
- 섹션 헤더

**✅ 22px ($5) - 제목/통계 값:**
- 페이지 제목, 통계 숫자
- 주요 헤딩

**❌ 사용 금지 (11px 이하):**
- 주요 네비게이션 텍스트
- 기본 콘텐츠 본문
- 중요한 액션 텍스트
- 에러 메시지

## Color System

### 브랜드 컬러
```typescript
$cupBlue: '#1565C0'    // 4.77:1 대비율 ✅
$cupBrown: '#8B4513'   // 커피 브랜드 컬러
```

### 시맨틱 컬러
```typescript
$success: '#2E7D32'    // 5.49:1 대비율 ✅
$warning: '#EF6C00'    // 4.52:1 대비율 ✅
$error: '#C62828'      // 7.00:1 대비율 ✅
```

### 상태 컬러
```typescript
$gray1-$gray12         // 그레이 스케일
$red1-$red12          // 에러/위험
$green1-$green12      // 성공/확인
$blue1-$blue12        // 정보/기본
```

## Spacing System

```typescript
$xxs: 2px    // 마이크로 간격
$xs: 4px     // 매우 작음
$sm: 8px     // 작음
$md: 16px    // 기본 (베이스 단위)
$lg: 24px    // 큼
$xl: 32px    // 매우 큼
$xxl: 48px   // 두 배 큼
$xxxl: 64px  // 세 배 큼
```

## Component Sizes

### 버튼
```typescript
$buttonHeightSm: 32px
$buttonHeightMd: 40px
$buttonHeightLg: 48px
$buttonHeightXl: 56px
```

### 네비게이션
```typescript
$navBarHeight: 44px    // iOS 표준
$tabBarHeight: 49px    // iOS 표준
```

### 터치 타겟
```typescript
$touchTargetMinimum: 44px  // WCAG 요구사항
```

## Usage Examples

### 올바른 사용법 ✅

```tsx
// Typography
<Text fontSize="$3" fontWeight="600" color="$cupBlue">
  주요 텍스트
</Text>

// 상태 배지 (작은 텍스트 허용)
<Text fontSize="$1" fontWeight="700" color="white">
  DEV
</Text>

// 간격
<YStack padding="$lg" marginBottom="$md">
  {children}
</YStack>

// 컴포넌트 크기
<Button height="$buttonHeightMd" borderRadius="$3">
  버튼
</Button>
```

### 잘못된 사용법 ❌

```tsx
// 하드코딩된 값들
<Text fontSize={10} color="#FF0000">  // ❌
<View padding={15} height={44}>       // ❌
<Button style={{fontSize: 12}}>       // ❌
```

## Accessibility Guidelines

### 최소 요구사항
- **대비율**: 일반 텍스트 4.5:1, 큰 텍스트(18px+) 3:1
- **터치 타겟**: 최소 44px
- **포커스 표시**: 모든 인터랙티브 요소에 가시적 포커스 상태
- **텍스트 스케일링**: 시스템 폰트 스케일링 지원

### 구현 예시
```tsx
// 접근성 준수 버튼
<Button
  height="$touchTargetMinimum"
  focusStyle={{
    borderColor: '$focusRing',
    borderWidth: 2,
  }}
  accessible={true}
  accessibilityLabel="액션 실행"
  accessibilityRole="button"
>
  액션
</Button>
```

## Migration Guide

### Legacy 코드에서 마이그레이션

**Before:**
```tsx
fontSize: 12,
padding: 16,
height: 44,
color: '#1565C0'
```

**After:**
```tsx
fontSize: '$1',     // 12px for labels/badges
padding: '$md',     // 16px
height: '$navBarHeight',  // 44px
color: '$cupBlue'   // Brand blue
```

### 단계별 마이그레이션

1. **하드코딩된 값 식별**: `fontSize: \d+`, `padding: \d+` 등 검색
2. **적절한 토큰 매핑**: 용도에 맞는 시맨틱 토큰 선택
3. **접근성 검증**: 대비율 및 터치 타겟 크기 확인
4. **일관성 검사**: 유사한 컴포넌트 간 일관성 확인

## Code Review Checklist

- [ ] 하드코딩된 fontSize 값 없음
- [ ] 하드코딩된 색상 값 없음
- [ ] 하드코딩된 spacing 값 없음
- [ ] 하드코딩된 컴포넌트 크기 없음
- [ ] 12px 이하 텍스트는 메타데이터/라벨만
- [ ] 터치 타겟 최소 44px
- [ ] 적절한 색상 대비율 유지
- [ ] 시맨틱 토큰 명명 사용

## Reference Files

- **Typography System**: `src/design-system/typography.ts`
- **Unified Tokens**: `src/styles/tamagui-unified-tokens.ts`
- **Component Guidelines**: `src/design-system/tokens.ts`
- **Example Implementation**: `src/components/StatusBadge.tsx`

## Resources

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Typography](https://material.io/design/typography/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tamagui Documentation](https://tamagui.dev/)