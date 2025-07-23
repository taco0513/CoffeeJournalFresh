import { Alert } from 'react-native';
import { supabase } from '../supabase/supabase';
import { SecureStorage } from '../auth/SecureStorage';

export interface UserConsent {
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  locationData: boolean;
  biometricData: boolean;
  timestamp: number;
  version: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: number;
  completedAt?: number;
  downloadUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expiresAt: number;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: number;
  scheduledFor: number;
  status: 'pending' | 'scheduled' | 'processing' | 'completed';
  reason?: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareAnalytics: boolean;
  shareWithCommunity: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  dataRetentionDays: number;
}

/**
 * Privacy Manager
 * Handles GDPR compliance, user consent, data export/deletion, and privacy settings
 */
export class PrivacyManager {
  private static readonly CONSENT_KEY = 'user_consent_v2';
  private static readonly PRIVACY_SETTINGS_KEY = 'privacy_settings_v2';
  private static readonly CURRENT_CONSENT_VERSION = '2.0';

  /**
   * Initialize privacy manager and check consent status
   */
  static async initialize(): Promise<void> {
    try {
      console.log('PrivacyManager initialized successfully');
    } catch (error) {
      console.error('PrivacyManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get current user consent
   */
  static async getUserConsent(): Promise<UserConsent | null> {
    try {
      const result = await SecureStorage.getItem(this.CONSENT_KEY);
      
      if (result.success && result.value) {
        return JSON.parse(result.value);
      }

      return null;
    } catch (error) {
      console.error('Failed to get user consent:', error);
      return null;
    }
  }

  /**
   * Update user consent
   */
  static async updateUserConsent(consent: Partial<UserConsent>): Promise<boolean> {
    try {
      const existingConsent = await this.getUserConsent();
      
      const updatedConsent: UserConsent = {
        dataCollection: consent.dataCollection ?? existingConsent?.dataCollection ?? false,
        analytics: consent.analytics ?? existingConsent?.analytics ?? false,
        marketing: consent.marketing ?? existingConsent?.marketing ?? false,
        thirdPartySharing: consent.thirdPartySharing ?? existingConsent?.thirdPartySharing ?? false,
        locationData: consent.locationData ?? existingConsent?.locationData ?? false,
        biometricData: consent.biometricData ?? existingConsent?.biometricData ?? false,
        timestamp: Date.now(),
        version: this.CURRENT_CONSENT_VERSION,
      };

      const storeResult = await SecureStorage.setItem(
        this.CONSENT_KEY,
        JSON.stringify(updatedConsent)
      );

      if (storeResult.success) {
        // Also store in Supabase for backup and compliance
        await this.syncConsentToServer(updatedConsent);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update user consent:', error);
      return false;
    }
  }

  /**
   * Check if consent is required (new version or missing consent)
   */
  static async isConsentRequired(): Promise<boolean> {
    try {
      const consent = await this.getUserConsent();
      
      if (!consent) {
        return true;
      }

      // Check if consent version is outdated
      if (consent.version !== this.CURRENT_CONSENT_VERSION) {
        return true;
      }

      // Check if consent is older than 1 year (re-consent requirement)
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      if (consent.timestamp < oneYearAgo) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check consent requirement:', error);
      return true; // Default to requiring consent on error
    }
  }

  /**
   * Show consent dialog
   */
  static async showConsentDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '개인정보 처리 동의',
        'CupNote를 사용하기 위해 개인정보 처리에 대한 동의가 필요합니다.\n\n• 서비스 제공을 위한 기본 데이터 수집\n• 앱 개선을 위한 익명 분석 데이터\n• 마케팅 정보 수신 (선택)\n\n자세한 내용은 개인정보처리방침을 확인해주세요.',
        [
          {
            text: '거부',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: '개인정보처리방침',
            onPress: () => {
              this.showPrivacyPolicy();
              resolve(false);
            },
          },
          {
            text: '동의',
            onPress: async () => {
              const success = await this.updateUserConsent({
                dataCollection: true,
                analytics: true,
                marketing: false, // Default to false for marketing
                thirdPartySharing: false,
                locationData: false,
                biometricData: false,
              });
              resolve(success);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Get privacy settings
   */
  static async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const result = await SecureStorage.getItem(this.PRIVACY_SETTINGS_KEY);
      
      if (result.success && result.value) {
        return JSON.parse(result.value);
      }

      // Return default settings
      return this.getDefaultPrivacySettings();
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      return this.getDefaultPrivacySettings();
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<boolean> {
    try {
      const existingSettings = await this.getPrivacySettings();
      const updatedSettings = { ...existingSettings, ...settings };

      const storeResult = await SecureStorage.setItem(
        this.PRIVACY_SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );

      if (storeResult.success) {
        // Sync to server
        await this.syncPrivacySettingsToServer(updatedSettings);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      return false;
    }
  }

  /**
   * Request data export (GDPR Article 20)
   */
  static async requestDataExport(): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        return {
          success: false,
          error: '사용자 인증이 필요합니다.',
        };
      }

      const exportRequest: Omit<DataExportRequest, 'id'> = {
        userId: userData.user.id,
        requestedAt: Date.now(),
        status: 'pending',
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const { data, error } = await supabase
        .from('data_export_requests')
        .insert([exportRequest])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: '데이터 내보내기 요청에 실패했습니다.',
        };
      }

      return {
        success: true,
        requestId: data.id,
      };
    } catch (error) {
      console.error('Data export request failed:', error);
      return {
        success: false,
        error: '요청 처리 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Request account deletion (GDPR Article 17)
   */
  static async requestAccountDeletion(reason?: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
    return new Promise((resolve) => {
      Alert.alert(
        '계정 삭제 요청',
        '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.\n\n삭제는 30일 후에 실행되며, 그 전까지는 로그인하여 취소할 수 있습니다.\n\n정말로 계정을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => resolve({ success: false }),
          },
          {
            text: '삭제 요청',
            style: 'destructive',
            onPress: async () => {
              try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                
                if (userError || !userData.user) {
                  resolve({
                    success: false,
                    error: '사용자 인증이 필요합니다.',
                  });
                  return;
                }

                const deletionRequest: Omit<DataDeletionRequest, 'id'> = {
                  userId: userData.user.id,
                  requestedAt: Date.now(),
                  scheduledFor: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
                  status: 'scheduled',
                  reason,
                };

                const { data, error } = await supabase
                  .from('data_deletion_requests')
                  .insert([deletionRequest])
                  .select()
                  .single();

                if (error) {
                  resolve({
                    success: false,
                    error: '계정 삭제 요청에 실패했습니다.',
                  });
                  return;
                }

                resolve({
                  success: true,
                  requestId: data.id,
                });
              } catch (error) {
                console.error('Account deletion request failed:', error);
                resolve({
                  success: false,
                  error: '요청 처리 중 오류가 발생했습니다.',
                });
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Cancel account deletion request
   */
  static async cancelAccountDeletion(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('status', 'scheduled');

      return !error;
    } catch (error) {
      console.error('Failed to cancel account deletion:', error);
      return false;
    }
  }

  /**
   * Get data processing activities for transparency
   */
  static getDataProcessingInfo() {
    return {
      categories: [
        {
          name: '계정 정보',
          data: ['이메일 주소', '사용자명', '프로필 사진'],
          purpose: '서비스 제공 및 계정 관리',
          retention: '계정 삭제 시까지',
          sharing: '없음',
        },
        {
          name: '커피 기록',
          data: ['테이스팅 노트', '평점', '선호도', '방문 기록'],
          purpose: '개인화된 추천 및 통계 제공',
          retention: '3년 또는 계정 삭제 시까지',
          sharing: '커뮤니티 기능 사용 시 다른 사용자와 공유',
        },
        {
          name: '사용 분석',
          data: ['앱 사용 패턴', '클릭 데이터', '오류 로그'],
          purpose: '서비스 개선 및 버그 수정',
          retention: '2년',
          sharing: '익명화되어 분석 목적으로만 사용',
        },
        {
          name: '기기 정보',
          data: ['기기 ID', 'OS 버전', '앱 버전'],
          purpose: '기술 지원 및 호환성 보장',
          retention: '1년',
          sharing: '없음',
        },
      ],
      rights: [
        '개인정보 처리 현황 확인 (열람권)',
        '개인정보 수정 및 삭제 요구 (정정·삭제권)',
        '개인정보 처리 정지 요구 (처리정지권)',
        '개인정보 손해 시 피해 구제 요구',
        '개인정보 보호책임자에게 처리 현황 신고',
      ],
      contact: {
        email: 'privacy@cupnote.app',
        phone: '+82-2-0000-0000',
        address: '서울특별시 강남구 테헤란로 xxx번길',
      },
    };
  }

  /**
   * Show privacy policy
   */
  static showPrivacyPolicy(): void {
    Alert.alert(
      '개인정보처리방침',
      '상세한 개인정보처리방침은 앱 설정에서 확인하실 수 있습니다.\n\n주요 내용:\n• 최소한의 개인정보만 수집\n• 서비스 제공 목적으로만 사용\n• 사용자 동의 없이 제3자에게 제공하지 않음\n• 언제든지 동의 철회 가능\n• GDPR 및 개인정보보호법 준수',
      [
        { text: '확인' },
        {
          text: '전체 보기',
          onPress: () => {
            // Navigate to privacy policy screen
            console.log('Navigate to privacy policy screen');
          },
        },
      ]
    );
  }

  /**
   * Sync consent to server for compliance
   */
  private static async syncConsentToServer(consent: UserConsent): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        return;
      }

      await supabase
        .from('user_consent_logs')
        .insert([{
          user_id: userData.user.id,
          consent_data: consent,
          timestamp: consent.timestamp,
          version: consent.version,
        }]);
    } catch (error) {
      console.error('Failed to sync consent to server:', error);
    }
  }

  /**
   * Sync privacy settings to server
   */
  private static async syncPrivacySettingsToServer(settings: PrivacySettings): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        return;
      }

      await supabase
        .from('user_privacy_settings')
        .upsert([{
          user_id: userData.user.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        }]);
    } catch (error) {
      console.error('Failed to sync privacy settings to server:', error);
    }
  }

  /**
   * Get default privacy settings
   */
  private static getDefaultPrivacySettings(): PrivacySettings {
    return {
      profileVisibility: 'friends',
      shareAnalytics: true,
      shareWithCommunity: false,
      allowDirectMessages: true,
      showOnlineStatus: false,
      dataRetentionDays: 1095, // 3 years
    };
  }

  /**
   * Clear all privacy-related data
   */
  static async clearPrivacyData(): Promise<void> {
    try {
      await SecureStorage.removeItem(this.CONSENT_KEY);
      await SecureStorage.removeItem(this.PRIVACY_SETTINGS_KEY);
      console.log('Privacy data cleared');
    } catch (error) {
      console.error('Failed to clear privacy data:', error);
    }
  }

  /**
   * Export user consent data
   */
  static async exportConsentData(): Promise<any> {
    try {
      const consent = await this.getUserConsent();
      const settings = await this.getPrivacySettings();
      
      return {
        consent,
        settings,
        exportedAt: new Date().toISOString(),
        version: this.CURRENT_CONSENT_VERSION,
      };
    } catch (error) {
      console.error('Failed to export consent data:', error);
      return null;
    }
  }
}