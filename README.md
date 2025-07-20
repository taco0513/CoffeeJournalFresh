# ☕ Coffee Tasting Journey

> **"Personal Taste, Shared Journey"**  
> **"개인의 고유한 커피 취향을 발견하고, 전문가·커뮤니티와 함께 나누며 성장하는 소셜 테이스팅 플랫폼"**

Coffee Tasting Journey는 개인의 고유한 미각과 표현을 존중하면서도, 전문가와 커뮤니티와 함께 체계적인 커피 테이스팅 능력과 감각 언어를 개발할 수 있는 소셜 러닝 플랫폼입니다.

> 📱 **iOS**: ✅ v0.3.0 Working - Core personal journal features  
> 🤖 **Android**: 📅 Planned - After iOS feature completion  
> 🌐 **Web Admin**: 🚧 In Development - Next.js dashboard for coffee catalog management  
> ✅ **Latest Update**: July 20, 2025 - Google OAuth, Web Admin, Korean Coffee Database

## 🚀 Current Status - MVP v0.3.0 ✅

### ✅ 완성된 핵심 기능
- **커피 테이스팅 플로우**: 정보입력 → 향미선택(4단계) → 감각평가 → 결과
- **Supabase 인증**: Apple Sign-In 구현 (실기기 전용)
- **로컬 데이터**: Realm DB 저장
- **4개 탭 네비게이션**: 홈, 저널, 통계, 프로필
- **모노크롬 UI**: Apple HIG 준수
- **에러 처리**: ErrorBoundary 및 네트워크 재시도

## 🎯 다음 목표 - MVP v0.4.0 "Personal Taste Discovery"

### 🎮 개인 취향 발견 (1-2개월)
- **개인 대시보드**: "나의 커피 여정" 섹션
- **취향 분석 엔진**: Taste DNA, 선호 패턴 분석
- **게임화 학습**: 플레이버 휠 퀴즈, 향미 학습 게임
- **성취도 시스템**: 15+ 성취도, 레벨 시스템
- **AI 추천**: 개인 취향 기반 커피 추천

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
- **Next.js 15** - Web Admin Dashboard
- **Python/BeautifulSoup** - Korean coffee data crawler

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
├── web-admin/              # Next.js 웹 관리자 대시보드
├── korean-coffee-crawler/  # 한국 커피 데이터 크롤러
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