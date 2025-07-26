import TouchID from 'react-native-touch-id';
import { Platform } from 'react-native';

import { Logger } from '../LoggingService';
export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: string | null;
  isEnrolled: boolean;
  errorMessage?: string;
}

/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Android fingerprint authentication
 */
export class BiometricAuth {
  private static isInitialized = false;
  private static capabilities: BiometricCapabilities | null = null;

  /**
   * Initialize biometric authentication
   */
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      this.capabilities = await this.checkCapabilities();
      this.isInitialized = true;

      Logger.debug('BiometricAuth initialized:', 'auth', { component: 'BiometricAuth', data: this.capabilities });
  } catch (error) {
      Logger.error('BiometricAuth initialization failed:', 'auth', { component: 'BiometricAuth', error: error });
      this.capabilities = {
        isAvailable: false,
        biometryType: null,
        isEnrolled: false,
        errorMessage: 'Initialization failed',
    };
  }
}

  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
  }
    return this.capabilities?.isAvailable || false;
}

  /**
   * Get biometric capabilities
   */
  static async getCapabilities(): Promise<BiometricCapabilities> {
    if (!this.isInitialized) {
      await this.initialize();
  }
    return this.capabilities || {
      isAvailable: false,
      biometryType: null,
      isEnrolled: false,
      errorMessage: 'Not initialized',
  };
}

  /**
   * Authenticate using biometrics
   */
  static async authenticate(reason?: string): Promise<BiometricResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      if (!this.capabilities?.isAvailable) {
        return {
          success: false,
          error: this.capabilities?.errorMessage || '생체 인증을 사용할 수 없습니다.',
      };
    }

      const biometryType = this.capabilities.biometryType;
      const defaultReason = this.getDefaultReason(biometryType);

      const config = {
        title: '생체 인증',
        reason: reason || defaultReason,
        fallbackLabel: '비밀번호 사용',
        cancelLabel: '취소',
        // iOS specific options
        showErrorMessage: true,
        fallbackToPinCodeAction: false,
        suppressEnterPassword: true,
        // Android specific options
        imageColor: '#e00606',
        imageErrorColor: '#ff0000',
        sensorDescription: '센서에 손가락을 올려주세요',
        sensorErrorDescription: '인식에 실패했습니다',
        cancelText: '취소',
        unifiedErrors: false,
        passcodeFallback: false,
    };

      await TouchID.authenticate(defaultReason, config);

      return {
        success: true,
        biometryType: biometryType || undefined,
    };
  } catch (error) {
      Logger.error('Biometric authentication error:', 'auth', { component: 'BiometricAuth', error: error });
      return this.handleBiometricError(error);
  }
}

  /**
   * Check if user has enrolled biometrics
   */
  static async isEnrolled(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
  }
    return this.capabilities?.isEnrolled || false;
}

  /**
   * Get the type of biometric authentication available
   */
  static async getBiometryType(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
  }
    return this.capabilities?.biometryType || null;
}

  /**
   * Get user-friendly name for biometric type
   */
  static getBiometricDisplayName(biometryType?: string | null): string {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return '지문 인식';
      case 'Biometrics':
        return '생체 인증';
      default:
        return '생체 인증';
  }
}

  /**
   * Get supported biometric types
   */
  static async getSupportedBiometrics(): Promise<string[]> {
    try {
      const supportedBiometrics = await TouchID.getSupportedBiometryType();
      return Array.isArray(supportedBiometrics) ? supportedBiometrics : [supportedBiometrics || ''];
  } catch (error) {
      Logger.error('Error getting supported biometrics:', 'auth', { component: 'BiometricAuth', error: error });
      return [];
  }
}

  /**
   * Check detailed biometric capabilities
   */
  private static async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      // Check if Touch ID/Face ID is supported
      const biometryType = await TouchID.getSupportedBiometryType();
      
      if (!biometryType) {
        return {
          isAvailable: false,
          biometryType: null,
          isEnrolled: false,
          errorMessage: '이 기기는 생체 인증을 지원하지 않습니다.',
      };
    }

      // Try a test authentication to check if enrolled
      try {
        const config = {
          title: '생체 인증 확인',
          reason: '생체 인증 설정을 확인하는 중입니다.',
          fallbackLabel: '',
          cancelLabel: '취소',
          showErrorMessage: false,
          suppressEnterPassword: true,
          unifiedErrors: false,
          passcodeFallback: false,
      };

        await TouchID.authenticate('생체 인증 확인', config);
        
        return {
          isAvailable: true,
          biometryType,
          isEnrolled: true,
      };
    } catch (enrollmentError: unknown) {
        // Check if the error indicates biometrics are not enrolled
        if (this.isNotEnrolledError(enrollmentError)) {
          return {
            isAvailable: true,
            biometryType,
            isEnrolled: false,
            errorMessage: '생체 인증이 등록되지 않았습니다. 설정에서 생체 인증을 등록해주세요.',
        };
      }

        // If user cancelled or other non-critical error, assume it's available
        return {
          isAvailable: true,
          biometryType,
          isEnrolled: true,
      };
    }
  } catch (error) {
      Logger.error('Biometric capability check error:', 'auth', { component: 'BiometricAuth', error: error });
      return {
        isAvailable: false,
        biometryType: null,
        isEnrolled: false,
        errorMessage: this.getCapabilityErrorMessage(error),
    };
  }
}

  /**
   * Handle biometric authentication errors
   */
  private static handleBiometricError(error: Error): BiometricResult {
    Logger.error('Biometric authentication error details:', 'auth', { component: 'BiometricAuth', error: error });

    const errorCode = error.code;
    const errorMessage = error.message;

    // iOS error codes
    if (Platform.OS === 'ios') {
      switch (errorCode) {
        case 'LAErrorUserCancel':
          return {
            success: false,
            error: '사용자가 인증을 취소했습니다.',
        };
        case 'LAErrorUserFallback':
          return {
            success: false,
            error: '비밀번호를 사용하여 인증해주세요.',
        };
        case 'LAErrorBiometryNotAvailable':
          return {
            success: false,
            error: '생체 인증을 사용할 수 없습니다.',
        };
        case 'LAErrorBiometryNotEnrolled':
          return {
            success: false,
            error: '생체 인증이 등록되지 않았습니다. 설정에서 등록해주세요.',
        };
        case 'LAErrorBiometryLockout':
          return {
            success: false,
            error: '생체 인증이 잠겼습니다. 기기 잠금을 해제한 후 다시 시도해주세요.',
        };
        case 'LAErrorAuthenticationFailed':
          return {
            success: false,
            error: '생체 인증에 실패했습니다. 다시 시도해주세요.',
        };
        case 'LAErrorPasscodeNotSet':
          return {
            success: false,
            error: '기기에 암호가 설정되지 않았습니다.',
        };
        case 'LAErrorSystemCancel':
          return {
            success: false,
            error: '시스템에 의해 인증이 취소되었습니다.',
        };
        default:
          return {
            success: false,
            error: '생체 인증에 실패했습니다.',
        };
    }
  }

    // Android error handling
    if (Platform.OS === 'android') {
      if (errorMessage?.includes('cancelled') || errorMessage?.includes('cancel')) {
        return {
          success: false,
          error: '사용자가 인증을 취소했습니다.',
      };
    }
      if (errorMessage?.includes('not enrolled') || errorMessage?.includes('no fingerprints')) {
        return {
          success: false,
          error: '지문이 등록되지 않았습니다. 설정에서 지문을 등록해주세요.',
      };
    }
      if (errorMessage?.includes('lockout') || errorMessage?.includes('locked')) {
        return {
          success: false,
          error: '지문 인식이 잠겼습니다. 잠시 후 다시 시도해주세요.',
      };
    }
      if (errorMessage?.includes('hardware')) {
        return {
          success: false,
          error: '지문 센서를 사용할 수 없습니다.',
      };
    }
  }

    return {
      success: false,
      error: '생체 인증에 실패했습니다. 다시 시도해주세요.',
  };
}

  /**
   * Check if error indicates biometrics are not enrolled
   */
  private static isNotEnrolledError(error: Error): boolean {
    const errorCode = error.code;
    const errorMessage = error.message?.toLowerCase() || '';

    return (
      errorCode === 'LAErrorBiometryNotEnrolled' ||
      errorCode === 'BiometryNotEnrolled' ||
      errorMessage.includes('not enrolled') ||
      errorMessage.includes('no fingerprints') ||
      errorMessage.includes('not set up')
    );
}

  /**
   * Get capability error message
   */
  private static getCapabilityErrorMessage(error: Error): string {
    const errorCode = error.code;
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorCode === 'LAErrorBiometryNotAvailable' || errorMessage.includes('not available')) {
      return '이 기기는 생체 인증을 지원하지 않습니다.';
  }

    if (errorCode === 'LAErrorPasscodeNotSet' || errorMessage.includes('passcode')) {
      return '기기에 암호가 설정되지 않았습니다.';
  }

    if (errorMessage.includes('hardware')) {
      return '생체 인증 하드웨어를 사용할 수 없습니다.';
  }

    return '생체 인증을 확인할 수 없습니다.';
}

  /**
   * Get default authentication reason based on biometry type
   */
  private static getDefaultReason(biometryType?: string | null): string {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID로 앱에 로그인하세요';
      case 'TouchID':
        return 'Touch ID로 앱에 로그인하세요';
      case 'Fingerprint':
        return '지문으로 앱에 로그인하세요';
      default:
        return '생체 인증으로 앱에 로그인하세요';
  }
}

  /**
   * Prompt user to set up biometrics
   */
  static getSetupMessage(biometryType?: string | null): string {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID를 설정하면 더 빠르고 안전하게 로그인할 수 있습니다. 설정 > Face ID 및 암호에서 설정해주세요.';
      case 'TouchID':
        return 'Touch ID를 설정하면 더 빠르고 안전하게 로그인할 수 있습니다. 설정 > Touch ID 및 암호에서 설정해주세요.';
      case 'Fingerprint':
        return '지문 인식을 설정하면 더 빠르고 안전하게 로그인할 수 있습니다. 설정 > 보안에서 설정해주세요.';
      default:
        return '생체 인증을 설정하면 더 빠르고 안전하게 로그인할 수 있습니다. 기기 설정에서 설정해주세요.';
  }
}
}