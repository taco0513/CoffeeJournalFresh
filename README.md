# ☕ Coffee Tasting Journey

> **"Personal Taste, Shared Journey"**  
> **"개인의 고유한 커피 취향을 발견하고, 전문가·커뮤니티와 함께 나누며 성장하는 소셜 테이스팅 플랫폼"**

### Core Philosophy: "Quality over Quantity"
- **특별한 커피 경험만 기록** - 매일의 습관이 아닌, 기억하고 싶은 순간들
- **부담 없는 사용** - 주 1-2회 스페셜티 커피 경험 중심
- **개인 커피 아카이브** - 의미 있는 커피 여정의 큐레이션

Coffee Tasting Journey는 개인의 고유한 미각과 표현을 존중하면서도, 전문가와 커뮤니티와 함께 체계적인 커피 테이스팅 능력과 감각 언어를 개발할 수 있는 소셜 러닝 플랫폼입니다.

> 📱 **iOS**: ✅ v0.6.0 Production Ready - Complete analytics & performance monitoring  
> 🤖 **Android**: 📅 Planned - After iOS feature completion  
> ✅ **Latest Update**: July 20, 2025 - Analytics & Performance Monitoring System

## 🚀 Current Status - MVP v0.6.0 ✅ PRODUCTION READY

### ✅ 완성된 핵심 기능
- **📊 Analytics & Performance Monitoring**: 완전한 사용자 행동 추적 및 성능 모니터링 시스템 ✨ **NEW**
- **커피 테이스팅 플로우**: 정보입력 → 향미선택(4단계) → 감각평가 → 결과
- **🎯 Personal Taste Discovery**: 개인 맞춤 퀴즈, 취향 분석, 성장 추적
- **🌐 Web Admin Dashboard**: 실시간 분석 차트 및 커피 카탈로그 관리
- **Supabase 인증**: Apple Sign-In 구현 (실기기 전용) + Google Sign-In 준비
- **로컬 데이터**: Realm DB 저장 + 오프라인 지원
- **4개 탭 네비게이션**: 홈, 저널, 통계, 프로필
- **Coffee-themed UI**: 커피 테마 디자인 시스템
- **🔧 Developer Mode**: 완전한 테스트 도구 및 mock 데이터
- **📱 Beta Feedback**: Shake-to-feedback 및 실시간 피드백 수집
- **Enhanced Error Handling**: 크래시 리포팅 및 사용자 신고 기능

## 🎯 다음 목표 - Phase 2 Development

### ✅ MVP v0.4.0 "Personal Taste Discovery" - COMPLETED
- **✅ 개인 대시보드**: "나의 커피 여정" 섹션 - 주간/월간 하이라이트
- **✅ Personal Taste Quiz**: 개인 맞춤 퀴즈 시스템 및 결과 분석
- **✅ Achievement System**: 커피 탐험가 배지 및 성장 추적

### 🚀 Phase 2: Enhanced Analytics & Community (다음 단계)
- **A/B Testing Framework**: 기능 개선을 위한 실험 환경
- **Advanced Pattern Recognition**: 사용자 행동 패턴 분석
- **Community Features**: 취향 유사도 매칭 및 소셜 학습
- **취향 분석 엔진**: Taste DNA, 선호 패턴 분석
- **학습 도구**: 플레이버 휠 탐험, 선택적 향미 학습
- **성취 시스템**: 커피 탐험 마일스톤, 품질 중심 보상
- **개인화 추천**: 취향 기반 다음 커피 제안

### 🚀 향후 로드맵
- **MVP v0.5.0** (3-4개월): Shared Journey - 커뮤니티 기능
- **MVP v1.0.0** (6개월): 완전한 플랫폼 - Lab Pro 구독 + 원두 구독

## 📱 Screenshots

*Coming soon...*

## 🛠️ 기술 스택

### 현재 (MVP v0.3.0)
- **React Native 0.80** - 크로스 플랫폼 모바일 앱
- **TypeScript** - 타입 안정성
- **Realm DB** - 로컬 데이터 저장
- **Supabase** - BaaS (인증, 데이터베이스)
- **React Navigation** - 네비게이션
- **Zustand** - 상태 관리

### 향후 확장 (v1.0.0+)
- **Microservices** - 마이크로서비스 아키텍처
- **AI/ML Pipeline** - NLP, 추천 엔진
- **Redis** - 캐싱 및 세션 관리
- **Docker** - 컨테이너화

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Xcode 15+
- iOS Simulator or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/taco0513/CoffeeJournalFresh.git
cd CoffeeJournalFresh

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro
npm start

# Run on iOS
npm run ios
# or for physical device
npm run ios-device
```

## 📁 프로젝트 구조

```
CoffeeJournalFresh/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   ├── navigation/         # 네비게이션 설정
│   ├── services/           # 비즈니스 로직 및 API
│   ├── stores/             # 상태 관리 (Zustand)
│   ├── styles/             # 공통 스타일
│   └── utils/              # 유틸리티 함수
├── docs/                   # 프로젝트 문서
├── ios/                    # iOS 네이티브 코드
├── android/                # Android 네이티브 코드
└── 주요 문서들
    ├── MVP_ROADMAP.md
    ├── MVP_v0.4.0_DETAILED.md
    ├── EVOLUTION_PLAN.md
    └── BRANCHING_STRATEGY.md
```

## 📚 주요 문서

### 개발 로드맵
- [**MVP_ROADMAP.md**](MVP_ROADMAP.md) - MVP 단계별 출시 전략
- [**MVP_v0.4.0_DETAILED.md**](MVP_v0.4.0_DETAILED.md) - v0.4.0 상세 개발 계획
- [**EVOLUTION_PLAN.md**](EVOLUTION_PLAN.md) - 점진적 진화 계획

### 비전 및 전략
- [**docs/01-vision-core-values.md**](docs/01-vision-core-values.md) - 비전과 핵심 가치
- [**docs/02-market-analysis-business-model.md**](docs/02-market-analysis-business-model.md) - 시장 분석 및 비즈니스 모델
- [**docs/03-target-user-analysis.md**](docs/03-target-user-analysis.md) - 타겟 사용자 분석

### 기술 문서
- [**docs/08-technical-architecture-01-microservices-architecture.md**](docs/08-technical-architecture-01-microservices-architecture.md) - 마이크로서비스 아키텍처
- [**docs/07-ai-engine-data-analysis-02-recommendation-engine.md**](docs/07-ai-engine-data-analysis-02-recommendation-engine.md) - AI 추천 엔진
- [**BRANCHING_STRATEGY.md**](BRANCHING_STRATEGY.md) - 개발 브랜치 전략

## 🎯 핵심 지표

### 현재 목표 (MVP v0.4.0)
- **DAU**: 500명
- **세션 시간**: 평균 8분 (현재 3분에서 향상)
- **취향 발견률**: 80% (첫 달 내 선호 패턴 3개 이상 식별)
- **7일 리텐션**: 40%
- **30일 리텐션**: 20%

## 🤝 개발 브랜치 전략

### 브랜치 구조
- **main**: 프로덕션 준비 코드
- **stable-v0.3**: v0.3.0 안정 버전 보존
- **dev-danang-250719**: 새로운 방향 개발 (현재 활성)

### 브랜치 전환
```bash
# 안정 버전으로 돌아가기
git checkout stable-v0.3

# 새 개발 브랜치로 전환
git checkout dev-danang-250719

# 메인 브랜치로 전환
git checkout main
```

## 🤝 기여하기

### 커밋 가이드라인
```bash
# 기능 추가
feat: add personal taste dashboard

# 버그 수정
fix: resolve static class block build error

# 문서 업데이트
docs: update roadmap with v0.4.0 details

# 리팩토링
refactor: improve tasting flow performance
```

## 📄 라이선스

MIT License

---

## 🎉 특별 감사

Coffee Tasting Journey는 커피를 사랑하는 모든 사람들, 전문 바리스타, 로스터, 그리고 커피 커뮤니티의 열정적인 지원으로 만들어지고 있습니다.

**"Personal Taste, Shared Journey"** - 당신의 고유한 커피 여정이 여기서 시작됩니다! ☕✨