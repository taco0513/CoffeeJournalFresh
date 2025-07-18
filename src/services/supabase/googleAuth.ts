import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './client';

class GoogleAuthService {
  // Google Sign-In 초기화
  async configure(): Promise<void> {
    try {
      await GoogleSignin.configure({
        webClientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // TODO: 실제 웹 클라이언트 ID로 교체
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    } catch (error) {
      console.error('Google Sign-In configuration failed:', error);
      throw error;
    }
  }

  // Google Sign-In 실행
  async signIn(): Promise<any> {
    try {
      // Google Sign-In 초기화
      await this.configure();

      // Google Play Services 확인
      await GoogleSignin.hasPlayServices();

      // Google Sign-In 실행
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('Google Sign-In failed: No ID token received');
      }

      // Supabase에 Google 토큰으로 로그인
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Google Sign-In failed: No user returned');
      }

      return data.user;
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        console.error('Google Sign-In failed:', error);
        throw error;
      }
    }
  }

  // Google Sign-Out
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out failed:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<any> {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      return userInfo;
    } catch (error) {
      console.error('Failed to get current Google user:', error);
      return null;
    }
  }

  // Google Sign-In 상태 확인
  async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Failed to check Google sign-in status:', error);
      return false;
    }
  }
}

export default new GoogleAuthService();