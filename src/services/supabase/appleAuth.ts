import appleAuth, {
  AppleRequestOperation,
  AppleRequestScope,
  AppleCredentialState,
} from '@invertase/react-native-apple-authentication';
import { supabase } from './client';

class AppleAuthService {
  // Apple Sign-In 지원 여부 확인
  async isSupported(): Promise<boolean> {
    try {
      return await appleAuth.isSupported;
    } catch (error) {
      console.error('Apple Sign-In support check failed:', error);
      return false;
    }
  }

  // Apple Sign-In 실행
  async signIn(): Promise<any> {
    try {
      // Apple Sign-In 지원 여부 확인
      const isSupported = await this.isSupported();
      if (!isSupported) {
        throw new Error('Apple Sign-In is not supported on this device');
      }

      // Apple Sign-In 요청
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleRequestOperation.LOGIN,
        requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
      });

      // 자격 증명 상태 확인
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState !== AppleCredentialState.AUTHORIZED) {
        throw new Error('Apple Sign-In authorization failed');
      }

      // Supabase에 Apple 토큰으로 로그인
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken!,
        nonce: appleAuthRequestResponse.nonce,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Apple Sign-In failed: No user returned');
      }

      return data.user;
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      throw error;
    }
  }

  // Apple Sign-In 자격 증명 상태 확인
  async checkCredentialState(userID: string): Promise<AppleCredentialState> {
    try {
      return await appleAuth.getCredentialStateForUser(userID);
    } catch (error) {
      console.error('Failed to check Apple credential state:', error);
      throw error;
    }
  }

  // Apple Sign-In 상태 변경 리스너
  onCredentialRevoked(callback: () => void): () => void {
    return appleAuth.onCredentialRevoked(callback);
  }
}

export default new AppleAuthService();