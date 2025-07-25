# CupNote 🌏☕

> 나만의 커피 취향을 발견하는 가장 쉬운 방법

**글로벌 커피 저널 앱** - 한국 최초 개인 맞춤형 커피 감각 평가 앱. 44가지 한국어 표현으로 커피를 기록하고 나의 취향을 찾아가는 여정을 시작하세요.

**Brand Identity**: "Your Coffee, Your Notes, Your Story"

## 🎯 프로젝트 개요

CupNote는 한국 스페셜티 커피 입문자와 홈카페족을 위한 글로벌 커피 저널 앱입니다. 복잡한 영어 표현 대신 친숙한 한국어로 커피의 맛과 향을 기록할 수 있습니다.

**글로벌 진출 준비**: 미국 시장 동시 대응 완료

### 주요 특징

- 🇰🇷 **한국어 네이티브**: 44개 한국어 감각 표현 시스템
- 🎯 **초보자 친화적**: 4단계 온보딩으로 쉽게 시작
- 🏠 **듀얼 모드**: 카페 방문자 & 홈카페족 전용 모드
- 🏆 **성취 시스템**: 게이미피케이션으로 재미있게 기록
- 📊 **개인 통계**: 나의 커피 취향 분석 및 인사이트
- 🆓 **무료 핵심 기능**: 기본 기능은 완전 무료

## 📱 시장 현황 & 차별화

### 한국 커피 시장 (2024)
- 전체 시장 규모: **17.2조원**
- 스페셜티 커피: **1조원** (전체의 20%)
- 커피 아울렛: **99,000개** (역대 최고)
- 홈카페족: **20만+ 명**

### 경쟁 앱 대비 우위
| 기능 | CupNote | Bean Conqueror | iBrewCoffee | Tasting Grounds |
|------|---------------------|----------------|-------------|-----------------|
| 한국어 지원 | ✅ 네이티브 | ❌ | ❌ | ❌ |
| 글로벌 지원 | ✅ 미국 진출 준비 | ⚪ 제한적 | ⚪ 제한적 | ⚪ 제한적 |
| 가격 | 무료 | 무료 | $4.99 | 무료 |
| 초보자 친화성 | ✅ 매우 높음 | ❌ 복잡함 | ⚪ 보통 | ⚪ 보통 |
| 홈카페 모드 | ✅ 전용 모드 | ⚪ 일부 | ❌ | ❌ |

## 🎨 UI 아키텍처 (Tamagui 마이그레이션 완료!)

**2025년 1월 업데이트**: CupNote는 이제 Tamagui UI 프레임워크를 사용하여 더 나은 성능과 애니메이션을 제공합니다.

- ⚡ **네이티브 성능**: 60fps 스프링 애니메이션
- 🎨 **커피 테마 디자인**: 에스프레소부터 라떼까지 커피 색상 시스템
- 📱 **반응형 UI**: 모든 기기에 최적화된 인터페이스
- 🌙 **다크 모드 준비**: 향후 다크 모드 지원 예정

자세한 내용은 [Tamagui 빠른 시작 가이드](./TAMAGUI_QUICK_START.md)를 참조하세요.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- React Native 0.80
- iOS 13.0+ / Android 6.0+
- Xcode 14+ (iOS 개발)
- Android Studio (Android 개발)

### 설치 방법

```bash
# 저장소 클론
git clone https://github.com/your-username/CupNote.git
cd CupNote

# 의존성 설치
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..

# 개발 서버 실행
npm start

# iOS 실행
npx react-native run-ios

# Android 실행
npx react-native run-android
```

### 환경 설정

1. `.env.example`을 `.env`로 복사
2. Supabase 프로젝트 생성 및 API 키 설정
3. Google Sign-In 설정 (선택사항)

```bash
cp .env.example .env
# .env 파일 편집하여 API 키 입력
```

## 🏗️ 프로젝트 구조

```
src/
├── screens/          # 앱 화면 컴포넌트
├── components/       # 재사용 가능한 컴포넌트
├── services/         # 비즈니스 로직 & API
├── stores/           # Zustand 상태 관리
├── hooks/            # 커스텀 React 훅
├── navigation/       # React Navigation 설정
└── types/            # TypeScript 타입 정의
```

## 🎨 주요 기능

### 1. 모드 선택
- **카페 모드**: 간편한 카페 방문 기록
- **홈카페 모드**: 상세한 추출 실험 기록

### 2. 한국어 감각 평가 (SCA 2024 CATA)
- 6개 카테고리: 산미, 단맛, 쓴맛, 바디, 애프터, 밸런스
- 44개 한국어 표현 (싱그러운, 달콤한, 묵직한 등)
- 카테고리별 최대 3개 선택

### 3. 향미 선택 시스템
- 3단계 향미 계층 구조
- 시각적 향미 휠
- 검색 및 필터링 기능

### 4. 성취 시스템
- 18개 성취 목표
- 단계별 보상
- 진행률 추적

## 🛠️ 기술 스택

- **Frontend**: React Native 0.80, TypeScript
- **State Management**: Zustand
- **Local DB**: Realm
- **Backend**: Supabase
- **Authentication**: Apple/Google Sign-In
- **Analytics**: React Native Performance

## 📊 개발 현황

### 현재 상태 (2025-07-24)
- ✅ MVP 98% 완성
- ✅ 홈카페 모드 백엔드 구현 완료
- ✅ 한국어 감각 평가 시스템 구현
- ✅ TypeScript 에러 해결 (319 → 193)
- ✅ iOS 빌드 성공

### 다음 단계
- [ ] 브랜드명 최종 결정
- [ ] 프리미엄 구독 모델 구현
- [ ] 베타 테스트 실시
- [ ] 앱스토어 출시 준비

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무 수정
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📚 관련 문서

- [BMAD 분석 보고서](BMAD_ANALYSIS_REPORT.md)
- [브랜드명 분석](BRAND_NAME_ANALYSIS.md)
- [MVP 상태 보고서](MVP_STATUS.md)
- [모드별 UX 제안](MODE_BASED_UX_PROPOSAL.md)

## 👥 팀

- **개발**: Coffee Journal Fresh Team
- **디자인**: [디자이너 이름]
- **기획**: [기획자 이름]

## 📞 문의

- Email: contact@coffeejournalfresh.com
- Instagram: @coffeejournalfresh
- Website: [준비중]

---

Made with ❤️ for Korean Coffee Lovers