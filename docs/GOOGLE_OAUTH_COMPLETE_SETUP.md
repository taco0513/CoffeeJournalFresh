# Google OAuth Complete Setup Guide

## Coffee Journal - Google 로그인 완전 설정 가이드

이 문서는 Coffee Journal 앱에서 Google 로그인을 완전히 구성하기 위한 단계별 가이드입니다.

---

## 📋 개요

Google OAuth 설정은 다음 단계로 구성됩니다:
1. Google Cloud Console에서 프로젝트 생성
2. OAuth 2.0 자격 증명 생성 (iOS/Android/Web)
3. 앱에 자격 증명 추가
4. Google Sign-In 패키지 설치 및 구성
5. 보안 설정 및 테스트

---

## 🚀 1단계: Google Cloud Console 프로젝트 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
   - 프로젝트 이름: `Coffee Journal`
   - 조직: 개인 또는 회사 조직

### 1.2 Google Sign-In API 활성화
1. **API 및 서비스** → **라이브러리** 이동
2. "Google Sign-In API" 검색 및 활성화
3. "Google+ API" 활성화 (선택사항)

### 1.3 OAuth 동의 화면 구성
1. **API 및 서비스** → **OAuth 동의 화면** 이동
2. 사용자 유형 선택:
   - **외부**: 일반 사용자용 (권장)
   - **내부**: G Suite 조직 내부용
3. 앱 정보 입력:
   ```
   앱 이름: Coffee Journal
   사용자 지원 이메일: [개발자 이메일]
   앱 로고: [Coffee Journal 로고 업로드]
   승인된 도메인: 
   - yourdomain.com (웹사이트가 있는 경우)
   개발자 연락처: [개발자 이메일]
   ```

---

## 🔑 2단계: OAuth 자격 증명 생성

### 2.1 iOS 클라이언트 ID 생성
1. **API 및 서비스** → **사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **iOS**
4. 설정값 입력:
   ```
   이름: Coffee Journal iOS
   번들 ID: com.coffeejournal.fresh
   ```
5. **생성** 클릭하여 클라이언트 ID 획득

### 2.2 Android 클라이언트 ID 생성 (미래 확장용)
1. 애플리케이션 유형: **Android**
2. 설정값 입력:
   ```
   이름: Coffee Journal Android  
   패키지 이름: com.coffeejournal.fresh
   SHA-1 인증서 지문: [키스토어에서 추출]
   ```

### 2.3 웹 클라이언트 ID 생성 (Web Admin용)
1. 애플리케이션 유형: **웹 애플리케이션**
2. 설정값 입력:
   ```
   이름: Coffee Journal Web Admin
   승인된 JavaScript 원본: 
   - http://localhost:3000 (개발용)
   - https://yourdomain.com (프로덕션용)
   승인된 리디렉션 URI:
   - http://localhost:3000/auth/callback
   - https://yourdomain.com/auth/callback
   ```

---

## 🔧 3단계: 앱에 OAuth 자격 증명 추가

### 3.1 iOS 설정 파일 생성
```bash
# 프로젝트 루트에서
touch ios/GoogleService-Info.plist
```

Google Cloud Console에서 다운로드한 `GoogleService-Info.plist` 파일을:
1. `ios/GoogleService-Info.plist`로 복사
2. Xcode에서 프로젝트에 추가 (Copy items if needed 체크)

### 3.2 환경 변수 설정
`.env` 파일 생성 또는 업데이트:
```bash
# Google OAuth Configuration
GOOGLE_OAUTH_IOS_CLIENT_ID="[iOS 클라이언트 ID].apps.googleusercontent.com"
GOOGLE_OAUTH_WEB_CLIENT_ID="[웹 클라이언트 ID].apps.googleusercontent.com"
GOOGLE_OAUTH_ANDROID_CLIENT_ID="[Android 클라이언트 ID].apps.googleusercontent.com"

# Web Admin Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="[웹 클라이언트 ID].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[웹 클라이언트 시크릿]"
```

### 3.3 React Native 설정 업데이트
`src/config/googleAuth.ts` 파일 업데이트:
```typescript
export const GoogleAuthConfig = {
  iosClientId: process.env.GOOGLE_OAUTH_IOS_CLIENT_ID || '',
  webClientId: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID || '',
  androidClientId: process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID || '',
  // 다른 설정들...
};
```

---

## 📱 4단계: Google Sign-In 패키지 설치

### 4.1 패키지 설치
```bash
# React Native Google Sign-In 설치
npm install @react-native-google-signin/google-signin

# iOS 의존성 설치
cd ios && pod install && cd ..
```

### 4.2 iOS 설정
`ios/CoffeeJournalFresh/Info.plist`에 URL Scheme 추가:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>GoogleSignIn</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.[REVERSED_CLIENT_ID]</string>
        </array>
    </dict>
</array>
```

### 4.3 Android 설정 (미래 확장용)
`android/app/src/main/res/values/strings.xml`:
```xml
<string name="server_client_id">[웹 클라이언트 ID]</string>
```

---

## 🔐 5단계: 보안 설정 및 구현

### 5.1 GoogleAuthService 업데이트
`src/services/supabase/googleAuth.ts` 파일에서 비활성화된 메소드들을 다시 활성화하고 구현:

```typescript
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';
import { GoogleAuthConfig } from '@/config/googleAuth';

export class GoogleAuthService {
  static isConfigured = false;

  static configure() {
    try {
      GoogleSignin.configure({
        iosClientId: GoogleAuthConfig.iosClientId,
        webClientId: GoogleAuthConfig.webClientId,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
      this.isConfigured = true;
      console.log('Google Sign-In configured successfully');
    } catch (error) {
      console.error('Google Sign-In configuration failed:', error);
      throw error;
    }
  }

  static async signIn() {
    if (!this.isConfigured) {
      this.configure();
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });

        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        throw new Error('Google Sign-In failed: No ID token received');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      await supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out error:', error);
      return { success: false, error: error.message };
    }
  }

  static async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Google Sign-In status check failed:', error);
      return false;
    }
  }

  static async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Get current Google user failed:', error);
      return null;
    }
  }
}
```

### 5.2 SignInScreen 업데이트
Google 로그인 버튼 활성화:
```typescript
// src/screens/auth/SignInScreen.tsx에서
const isGoogleConfigured = GoogleAuthConfig.iosClientId && GoogleAuthConfig.webClientId;

// Google 버튼 조건부 렌더링
{isGoogleConfigured && (
  <TouchableOpacity
    style={[styles.socialButton, styles.googleButton]}
    onPress={handleGoogleSignIn}
    disabled={loading}
  >
    <Text style={styles.googleButtonText}>Google로 계속하기</Text>
  </TouchableOpacity>
)}
```

---

## 🧪 6단계: 테스트 및 검증

### 6.1 개발 환경 테스트
```bash
# Metro 시작
npm start

# iOS 실행
npx react-native run-ios --device
```

### 6.2 테스트 체크리스트
- [ ] Google 로그인 버튼이 표시되는가?
- [ ] 로그인 플로우가 정상 작동하는가?
- [ ] 사용자 정보가 올바르게 저장되는가?
- [ ] 로그아웃이 정상 작동하는가?
- [ ] 에러 핸들링이 적절한가?

### 6.3 프로덕션 배포 전 확인사항
- [ ] 프로덕션 도메인이 OAuth 설정에 추가되었는가?
- [ ] 환경 변수가 프로덕션 환경에 설정되었는가?
- [ ] Apple App Store Review를 위한 테스트 계정이 준비되었는가?

---

## 🔒 7단계: 보안 강화

### 7.1 추가 인증 플로우
```typescript
// src/services/auth/EnhancedAuthService.ts
export class EnhancedAuthService {
  static async validateGoogleToken(idToken: string) {
    // Google 토큰 유효성 검사
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const tokenInfo = await response.json();
      
      if (tokenInfo.error) {
        throw new Error('Invalid Google token');
      }
      
      return tokenInfo;
    } catch (error) {
      console.error('Google token validation failed:', error);
      throw error;
    }
  }

  static async checkAccountSecurity(userId: string) {
    // 계정 보안 상태 확인
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || { user_id: userId, security_level: 'basic' };
  }
}
```

### 7.2 권한 관리 시스템
```typescript
// src/services/auth/PermissionService.ts
export enum Permission {
  READ_PROFILE = 'read:profile',
  WRITE_PROFILE = 'write:profile',
  READ_TASTINGS = 'read:tastings',
  WRITE_TASTINGS = 'write:tastings',
  ADMIN_ACCESS = 'admin:access',
}

export class PermissionService {
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(p => p.permission as Permission);
  }

  static async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }
}
```

---

## 📚 8단계: 문서화 완료

### 8.1 README 업데이트
프로젝트 README에 Google OAuth 설정 섹션 추가

### 8.2 환경 설정 문서
`.env.example` 파일 업데이트:
```bash
# Google OAuth - Required for Google Sign-In
GOOGLE_OAUTH_IOS_CLIENT_ID="your-ios-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_WEB_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_ANDROID_CLIENT_ID="your-android-client-id.apps.googleusercontent.com"
```

---

## ⚠️ 주의사항

1. **개발 vs 프로덕션**: 개발과 프로덕션 환경에서 다른 OAuth 클라이언트 ID 사용 권장
2. **보안**: 클라이언트 시크릿은 절대 클라이언트 앱에 포함하지 마세요
3. **테스트**: 실제 기기에서만 테스트 가능 (iOS 시뮬레이터에서는 작동하지 않음)
4. **App Store**: 앱 스토어 리뷰 시 테스트 계정 제공 필요

---

## 🆘 문제 해결

### 일반적인 오류들
1. **'GoogleService-Info.plist' 파일이 없음**
   - Google Cloud Console에서 다운로드하여 ios/ 폴더에 추가

2. **URL Scheme 오류**
   - Info.plist의 URL Scheme이 올바른지 확인

3. **토큰 검증 실패**
   - 클라이언트 ID가 올바른지 확인
   - 번들 ID가 일치하는지 확인

4. **권한 오류**
   - OAuth 동의 화면 설정이 완료되었는지 확인

---

## 📞 지원

문제가 지속되면 다음을 확인하세요:
- [Google Sign-In 공식 문서](https://developers.google.com/identity/sign-in/ios)
- [React Native Google Sign-In 문서](https://github.com/react-native-google-signin/google-signin)
- Coffee Journal 개발팀 연락: hello@zimojin.com