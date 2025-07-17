# 🔧 Coffee Tasting Journal - 개발 환경 설정

> AI 도구를 활용한 1인 개발 환경 구축 가이드

---

## 📋 사전 준비 사항

### 필수 하드웨어
- **Mac** (M1 이상 권장): iOS 개발은 Mac 필수
- **iPhone**: 실제 테스트용 (선택사항)

### 필수 소프트웨어
- **macOS**: Monterey 이상
- **Xcode**: 14.0 이상
- **Node.js**: 18.0 이상

> 전체 기술 요구사항은 [TECH-STACK.md](TECH-STACK.md) 참조

---

## 🚀 Step 1: 기본 개발 도구 설치

### 1.1 Homebrew 설치
```bash
# Terminal을 열고 실행
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 설치 확인
brew --version
```

### 1.2 Node.js 설치
```bash
# Homebrew로 설치
brew install node

# 또는 공식 사이트에서 다운로드
# https://nodejs.org

# 설치 확인
node --version  # v18.0.0 이상
npm --version   # 9.0.0 이상
```

### 1.3 Watchman 설치 (Facebook의 파일 감시 도구)
```bash
brew install watchman

# 설치 확인
watchman --version
```

### 1.4 CocoaPods 설치
```bash
sudo gem install cocoapods

# 설치 확인
pod --version
```

---

## 🤖 Step 2: AI 개발 도구 설치

### 2.1 Windsurf 설치
1. [Windsurf 다운로드](https://windsurf.ai)
2. 다운로드한 앱을 Applications 폴더로 이동
3. 처음 실행 시 보안 경고: 시스템 설정 > 보안에서 허용

### 2.2 Windsurf AI 설정
```yaml
# Windsurf 실행 후
1. Settings (Cmd + ,)
2. AI > API Keys
3. 다음 키 입력:
   - Anthropic API Key: sk-ant-...
   - OpenAI API Key: sk-...

# API 키 얻는 방법:
- Claude: https://console.anthropic.com
- OpenAI: https://platform.openai.com
```

### 2.3 Claude Code CLI 설치
```bash
# 전역 설치
npm install -g @anthropic/claude

# API 키 설정
claude login
# 브라우저가 열리면 로그인

# 설치 확인
claude --version
```

---

## 📱 Step 3: React Native 프로젝트 생성

### 3.1 프로젝트 초기화
```bash
# 프로젝트 생성
npx react-native init CoffeeJournal --template react-native-template-typescript

# 프로젝트 폴더로 이동
cd CoffeeJournal
```

### 3.2 iOS 의존성 설치
```bash
# iOS 폴더로 이동
cd ios

# CocoaPods 설치
pod install

# 프로젝트 루트로 돌아가기
cd ..
```

### 3.3 첫 실행 테스트
```bash
# Metro 서버 시작 (터미널 1)
npm start

# iOS 시뮬레이터 실행 (터미널 2)
npm run ios

# 또는 특정 시뮬레이터 지정
npx react-native run-ios --simulator="iPhone 15"
```

---

## 📦 Step 4: 필수 패키지 설치

### 4.1 패키지 설치
```bash
# 한 번에 모든 패키지 설치
npm install \
  zustand \
  realm @realm/react \
  @supabase/supabase-js \
  @react-navigation/native @react-navigation/stack \
  react-native-screens react-native-safe-area-context \
  react-native-gesture-handler \
  @react-native-community/slider \
  react-native-vector-icons

# 개발 의존성
npm install --save-dev \
  @types/react-native-vector-icons
```

### 4.2 iOS 설정
```bash
# iOS 의존성 업데이트
cd ios && pod install && cd ..
```

> 각 패키지의 역할과 선택 이유는 [TECH-STACK.md](TECH-STACK.md) 참조

---

## 🔐 Step 5: 환경 변수 설정

### 5.1 환경 변수 패키지 설치
```bash
npm install react-native-dotenv
```

### 5.2 .env 파일 생성
```bash
# 프로젝트 루트에 .env 파일 생성
touch .env
```

### 5.3 .env 내용 추가
```env
# Supabase
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# API Keys (선택사항)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### 5.4 .gitignore에 추가
```bash
echo ".env" >> .gitignore
```

---

## 🏗️ Step 6: 프로젝트 구조 설정

### 6.1 폴더 구조 생성
```bash
# src 폴더 구조 생성
mkdir -p src/{screens,components,services,stores,utils,data,types}

# 문서 폴더
mkdir -p docs

# AI 프롬프트 폴더
mkdir -p prompts/{screens,components,debug}
```

### 6.2 TypeScript 설정
```json
// tsconfig.json 수정
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@screens/*": ["src/screens/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

---

## 🎨 Step 7: Windsurf 프로젝트 설정

### 7.1 Windsurf에서 프로젝트 열기
```bash
# 터미널에서
windsurf .

# 또는 Windsurf 앱에서
File > Open Folder > CoffeeJournal 선택
```

### 7.2 AI 컨텍스트 설정
```yaml
# .windsurf/project.yml 생성
project:
  name: Coffee Tasting Journal
  type: React Native
  platform: iOS
  
context:
  - 1인 AI 개발
  - TypeScript 사용
  - Realm 로컬 DB
  - Zustand 상태 관리
  - 와이어프레임 UI (흑백, 시스템 폰트)
  
preferences:
  - 한글 주석 포함
  - 에러 처리 포함
  - 타입 안전성 중시
```

---

## ✅ Step 8: 설치 확인

### 8.1 체크리스트
```bash
# 각 명령어가 에러 없이 실행되는지 확인

✅ node --version          # v18 이상
✅ npm --version           # v9 이상
✅ pod --version           # 1.11 이상
✅ claude --version        # 설치됨
✅ watchman --version      # 설치됨
```

### 8.2 프로젝트 실행 확인
```bash
# iOS 시뮬레이터에서 앱 실행
npm run ios

# 다음이 보이면 성공:
# - Welcome to React Native 화면
# - 에러 없이 실행
```

---

## 🚨 일반적인 문제 해결

### 문제 1: Metro 서버 연결 안됨
```bash
# 해결 방법
npx react-native start --reset-cache

# 그래도 안되면
cd ios && pod deintegrate && pod install && cd ..
```

### 문제 2: 시뮬레이터 실행 안됨
```bash
# Xcode 열기
open ios/CoffeeJournal.xcworkspace

# Xcode에서 직접 실행 (▶️ 버튼)
```

### 문제 3: 패키지 설치 에러
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install

# iOS 관련 에러면
cd ios && rm -rf Pods && pod install && cd ..
```

> 더 많은 문제 해결 방법은 [08-TROUBLESHOOTING.md](08-TROUBLESHOOTING.md) 참조

---

## 🎯 다음 단계

설정이 완료되었다면:

1. **첫 화면 만들기**
   ```bash
   # Windsurf에서
   "HomeScreen 컴포넌트를 만들어줘. 
   큰 + 버튼과 최근 기록 3개를 보여줘"
   ```

2. **네비게이션 설정**
   ```bash
   # Claude Code로
   claude "React Navigation으로 6개 화면 네비게이션 설정해줘"
   ```

3. **개발 시작!**

---

## 📚 추가 리소스

### 공식 문서
- [React Native](https://reactnative.dev/docs/getting-started)
- [Realm React Native](https://www.mongodb.com/docs/realm/sdk/react-native/)
- [Zustand](https://github.com/pmndrs/zustand)

### AI 도구 문서
- [Windsurf Docs](https://docs.windsurf.ai)
- [Claude API](https://docs.anthropic.com)

### 프로젝트 문서
- [아키텍처 설계](05-ARCHITECTURE.md)
- [API 연동](06-API.md)
- [문제 해결](08-TROUBLESHOOTING.md)

---

> 💡 **팁**: 모든 명령어는 복사해서 그대로 사용할 수 있도록 작성했습니다.  
> 에러가 발생하면 Claude에게 에러 메시지를 그대로 보여주세요!