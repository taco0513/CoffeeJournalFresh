# TastingFlow Enhancement Components

이 폴더는 TastingFlow 개선을 위해 만들어진 프로토타입 컴포넌트들을 포함합니다.

## 🎯 목적
사용자의 주관적인 커피 테이스팅 경험을 존중하면서도, 경험 레벨에 따라 적절한 가이드를 제공하는 컴포넌트 세트입니다.

## 📦 컴포넌트 목록

### 핵심 컴포넌트 (Core Components)
- **UserLevelSelector.tsx** - 사용자 경험 레벨 선택 화면
- **EnhancedProgressBar.tsx** - 필수/선택 단계를 표시하는 진행 바
- **FlavorWheel.tsx** - 레벨별 향미 선택 인터페이스
- **PersonalFlavorLibrary.tsx** - 개인 향미 라이브러리 관리
- **ContextualHint.tsx** - 상황별 도움말 표시

### 기존 컴포넌트 (Existing Components)
- **TastingScreenLayout.tsx** - 테이스팅 화면 레이아웃
- **DraftRecoveryModal.tsx** - 임시 저장 복구 모달

## 🚀 사용 방법

```typescript
import {
  UserLevelSelector,
  EnhancedProgressBar,
  FlavorWheel,
  PersonalFlavorLibrary,
  ContextualHint
} from '@/components/tasting-enhancement';
```

## 📱 프로토타입 변환
이 컴포넌트들은 웹 버전으로 쉽게 변환할 수 있도록 설계되었습니다.
웹 Claude에게 이 폴더의 컴포넌트들을 제공하여 인터랙티브 프로토타입을 생성할 수 있습니다.

## 📝 관련 문서
- [TastingFlow Enhancement Specification](/docs/TASTINGFLOW_ENHANCEMENT_SPEC.md)