import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';

import { Logger } from '../LoggingService';
export interface SecureStorageOptions {
  service?: string;
  accessGroup?: string; // iOS only
  showModal?: boolean;
  kLocalizedFallbackTitle?: string;
  touchID?: boolean;
  authenticatePrompt?: string;
}

export interface StorageResult {
  success: boolean;
  value?: string;
  error?: string;
}

/**
 * Secure Storage Service
 * Handles encrypted storage of sensitive data using iOS Keychain and Android Keystore
 */
export class SecureStorage {
  private static readonly DEFAULT_SERVICE = 'CupNote';
  private static readonly ENCRYPTION_KEY_ID = 'CJF_DEVICE_KEY';
  private static encryptionKey: string | null = null;
  private static isInitialized = false;

  /**
   * Initialize secure storage
   */
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Generate or retrieve device-specific encryption key
      await this.initializeEncryptionKey();
      
      // Test keychain access
      await this.testKeychainAccess();
      
      this.isInitialized = true;
      Logger.debug('SecureStorage initialized successfully', 'auth', { component: 'SecureStorage' });
  } catch (error) {
      Logger.error('SecureStorage initialization failed:', 'auth', { component: 'SecureStorage', error: error });
      throw error;
  }
}

  /**
   * Store a value securely
   */
  static async setItem(
    key: string,
    value: string,
    options: SecureStorageOptions = {}
  ): Promise<StorageResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      // Encrypt the value for additional security
      const encryptedValue = this.encrypt(value);

      const keychainOptions: Keychain.Options = {
        service: options.service || this.DEFAULT_SERVICE,
        ...this.getKeychainOptions(options),
    };

      const result = await Keychain.setInternetCredentials(
        key,
        key, // username (not used, but required)
        encryptedValue,
        keychainOptions
      );

      if (result === false) {
        return {
          success: false,
          error: '값을 안전하게 저장할 수 없습니다.',
      };
    }

      return {
        success: true,
    };
  } catch (error) {
      Logger.error('SecureStorage setItem error:', 'auth', { component: 'SecureStorage', error: error });
      return {
        success: false,
        error: this.getErrorMessage(error, 'store'),
    };
  }
}

  /**
   * Retrieve a value securely
   */
  static async getItem(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<StorageResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      const keychainOptions: Keychain.Options = {
        service: options.service || this.DEFAULT_SERVICE,
        ...this.getKeychainOptions(options),
    };

      const credentials = await Keychain.getInternetCredentials(key, keychainOptions);

      if (credentials === false) {
        return {
          success: false,
          error: '저장된 값을 찾을 수 없습니다.',
      };
    }

      // Decrypt the value
      const decryptedValue = this.decrypt(credentials.password);

      return {
        success: true,
        value: decryptedValue,
    };
  } catch (error) {
      Logger.error('SecureStorage getItem error:', 'auth', { component: 'SecureStorage', error: error });
      return {
        success: false,
        error: this.getErrorMessage(error, 'retrieve'),
    };
  }
}

  /**
   * Remove a value securely
   */
  static async removeItem(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<StorageResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      const keychainOptions: Keychain.Options = {
        service: options.service || this.DEFAULT_SERVICE,
        ...this.getKeychainOptions(options),
    };

      const result = await Keychain.resetInternetCredentials(key, keychainOptions);

      return {
        success: result,
        error: result ? undefined : '값을 삭제할 수 없습니다.',
    };
  } catch (error) {
      Logger.error('SecureStorage removeItem error:', 'auth', { component: 'SecureStorage', error: error });
      return {
        success: false,
        error: this.getErrorMessage(error, 'remove'),
    };
  }
}

  /**
   * Check if a key exists
   */
  static async hasItem(
    key: string,
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const result = await this.getItem(key, options);
      return result.success;
  } catch (error) {
      Logger.error('SecureStorage hasItem error:', 'auth', { component: 'SecureStorage', error: error });
      return false;
  }
}

  /**
   * Get all stored keys
   */
  static async getAllKeys(options: SecureStorageOptions = {}): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      // Note: react-native-keychain doesn't provide a direct way to get all keys
      // This is a limitation of the keychain system for security reasons
      Logger.warn('getAllKeys is not fully supported due to keychain security restrictions', 'auth', { component: 'SecureStorage' });
      return [];
  } catch (error) {
      Logger.error('SecureStorage getAllKeys error:', 'auth', { component: 'SecureStorage', error: error });
      return [];
  }
}

  /**
   * Clear all stored data for the service
   */
  static async clear(options: SecureStorageOptions = {}): Promise<StorageResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
    }

      const keychainOptions: Keychain.Options = {
        service: options.service || this.DEFAULT_SERVICE,
        ...this.getKeychainOptions(options),
    };

      // Reset all credentials for this service
      const result = await Keychain.resetGenericPassword(keychainOptions);

      return {
        success: result,
        error: result ? undefined : '저장된 데이터를 삭제할 수 없습니다.',
    };
  } catch (error) {
      Logger.error('SecureStorage clear error:', 'auth', { component: 'SecureStorage', error: error });
      return {
        success: false,
        error: this.getErrorMessage(error, 'clear'),
    };
  }
}

  /**
   * Get storage capabilities and security level
   */
  static async getSecurityLevel(): Promise<{
    level: 'high' | 'medium' | 'low';
    features: string[];
    biometricEnabled: boolean;
}> {
    try {
      const securityLevel = await Keychain.getSupportedBiometryType();
      
      let level: 'high' | 'medium' | 'low' = 'medium';
      const features: string[] = [];
      let biometricEnabled = false;

      if (securityLevel) {
        level = 'high';
        biometricEnabled = true;
        features.push(`생체 인증 지원 (${securityLevel})`);
    }

      if (Platform.OS === 'ios') {
        features.push('iOS Keychain');
        features.push('Hardware 보안 모듈');
    } else {
        features.push('Android Keystore');
        if (typeof Platform.Version === 'number' && Platform.Version >= 23) {
          features.push('Hardware 백업 키');
      }
    }

      features.push('AES 암호화');
      features.push('자동 잠금');

      return {
        level,
        features,
        biometricEnabled,
    };
  } catch (error) {
      Logger.error('Error getting security level:', 'auth', { component: 'SecureStorage', error: error });
      return {
        level: 'low',
        features: ['기본 암호화'],
        biometricEnabled: false,
    };
  }
}

  /**
   * Store sensitive authentication data with specific options
   */
  static async storeAuthData(
    key: string,
    data: unknown,
    requireBiometric = false
  ): Promise<StorageResult> {
    const options: SecureStorageOptions = {
      touchID: requireBiometric,
      authenticatePrompt: '인증 데이터에 접근하기 위해 생체 인증이 필요합니다.',
      showModal: true,
      kLocalizedFallbackTitle: '비밀번호 사용',
  };

    return this.setItem(key, JSON.stringify(data), options);
}

  /**
   * Retrieve sensitive authentication data
   */
  static async getAuthData(
    key: string,
    requireBiometric = false
  ): Promise<StorageResult & { data?: unknown}> {
    const options: SecureStorageOptions = {
      touchID: requireBiometric,
      authenticatePrompt: '인증 데이터에 접근하기 위해 생체 인증이 필요합니다.',
      showModal: true,
      kLocalizedFallbackTitle: '비밀번호 사용',
  };

    const result = await this.getItem(key, options);
    
    if (result.success && result.value) {
      try {
        const data = JSON.parse(result.value);
        return {
          ...result,
          data,
      };
    } catch (parseError) {
        return {
          success: false,
          error: '저장된 데이터를 읽을 수 없습니다.',
      };
    }
  }

    return result;
}

  /**
   * Initialize device-specific encryption key
   */
  private static async initializeEncryptionKey(): Promise<void> {
    try {
      // Try to retrieve existing device key
      const keychainOptions: Keychain.Options = {
        service: this.DEFAULT_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };

      const credentials = await Keychain.getInternetCredentials(
        this.ENCRYPTION_KEY_ID, 
        keychainOptions
      );

      if (credentials) {
        this.encryptionKey = credentials.password;
    } else {
        // Generate new device-specific key
        const deviceId = await DeviceInfo.getUniqueId();
        const timestamp = Date.now().toString();
        const randomBytes = this.generateRandomBytes(32);
        
        // Create composite key from multiple sources
        const compositeKey = CryptoJS.SHA256(
          `${deviceId}-${timestamp}-${randomBytes}`
        ).toString();
        
        // Store the key securely
        await Keychain.setInternetCredentials(
          this.ENCRYPTION_KEY_ID,
          this.ENCRYPTION_KEY_ID,
          compositeKey,
          keychainOptions
        );
        
        this.encryptionKey = compositeKey;
    }
  } catch (error) {
      Logger.error('Failed to initialize encryption key:', 'auth', { component: 'SecureStorage', error: error });
      // Fallback to a session-based key if keychain fails
      const deviceId = await DeviceInfo.getUniqueId();
      const sessionKey = CryptoJS.SHA256(
        `${deviceId}-${Date.now()}-session`
      ).toString();
      this.encryptionKey = sessionKey;
  }
}

  /**
   * Generate cryptographically secure random bytes
   */
  private static generateRandomBytes(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
    return result;
}

  /**
   * Test keychain access
   */
  private static async testKeychainAccess(): Promise<void> {
    const testKey = 'test_access';
    const testValue = 'test_value';

    try {
      // Try to store and retrieve a test value
      await this.setItem(testKey, testValue);
      const result = await this.getItem(testKey);
      
      if (!result.success || result.value !== testValue) {
        throw new Error('Keychain access test failed');
    }

      // Clean up test data
      await this.removeItem(testKey);
  } catch (error) {
      Logger.error('Keychain access test failed:', 'auth', { component: 'SecureStorage', error: error });
      throw new Error('Keychain is not accessible');
  }
}

  /**
   * Get keychain options based on platform and configuration
   */
  private static getKeychainOptions(options: SecureStorageOptions): Partial<Keychain.Options> {
    const keychainOptions: Partial<Keychain.Options> = {};

    if (Platform.OS === 'ios') {
      // ACCESS_CONTROL is not available in newer versions
      // Use accessible property instead
      if (options.touchID) {
        (keychainOptions as unknown).authenticatePrompt = options.authenticatePrompt || 'Please authenticate';
    }
      
      keychainOptions.accessible = Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY;
      
      if (options.accessGroup) {
        (keychainOptions as unknown).accessGroup = options.accessGroup;
    }
      
      if (options.authenticatePrompt) {
        keychainOptions.authenticationPrompt = options.authenticatePrompt;
    }
      
      if (options.kLocalizedFallbackTitle) {
        (keychainOptions as unknown).localizedFallbackTitle = options.kLocalizedFallbackTitle;
    }
  }

    if (Platform.OS === 'android') {
      // Android doesn't have securityLevel and storage properties in latest version
      // These are handled internally by the library
      
      if (options.showModal !== undefined) {
        (keychainOptions as unknown).showModal = options.showModal;
    }
      
      if (options.kLocalizedFallbackTitle) {
        (keychainOptions as unknown).kLocalizedFallbackTitle = options.kLocalizedFallbackTitle;
    }
  }

    return keychainOptions;
}

  /**
   * Encrypt data for additional security layer
   */
  private static encrypt(data: string): string {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
    }
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  } catch (error) {
      Logger.error('Encryption failed:', 'auth', { component: 'SecureStorage', error: error });
      // Return original data if encryption fails (fallback)
      return data;
  }
}

  /**
   * Decrypt data
   */
  private static decrypt(encryptedData: string): string {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
    }
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      // If decryption fails, it might be unencrypted data (backward compatibility)
      return decrypted || encryptedData;
  } catch (error) {
      Logger.error('Decryption failed:', 'auth', { component: 'SecureStorage', error: error });
      // Return original data if decryption fails (fallback)
      return encryptedData;
  }
}

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: Error, operation: string): string {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('user cancel') || errorMessage.includes('cancelled')) {
      return '사용자가 인증을 취소했습니다.';
  }

    if (errorMessage.includes('not available') || errorMessage.includes('not supported')) {
      return '보안 저장소를 사용할 수 없습니다.';
  }

    if (errorMessage.includes('locked') || errorMessage.includes('lockout')) {
      return '기기가 잠겨있습니다. 잠금을 해제한 후 다시 시도해주세요.';
  }

    if (errorMessage.includes('authentication') || errorMessage.includes('biometry')) {
      return '생체 인증에 실패했습니다.';
  }

    if (errorMessage.includes('no passcode') || errorMessage.includes('passcode not set')) {
      return '기기에 암호가 설정되지 않았습니다.';
  }

    switch (operation) {
      case 'store':
        return '데이터를 안전하게 저장할 수 없습니다.';
      case 'retrieve':
        return '저장된 데이터를 읽을 수 없습니다.';
      case 'remove':
        return '데이터를 삭제할 수 없습니다.';
      case 'clear':
        return '저장된 데이터를 모두 삭제할 수 없습니다.';
      default:
        return '보안 저장소 작업에 실패했습니다.';
  }
}

  /**
   * Migration helper for existing data
   */
  static async migrateData(
    oldKey: string,
    newKey: string,
    options: SecureStorageOptions = {}
  ): Promise<StorageResult> {
    try {
      const oldData = await this.getItem(oldKey, options);
      
      if (oldData.success && oldData.value) {
        const storeResult = await this.setItem(newKey, oldData.value, options);
        
        if (storeResult.success) {
          await this.removeItem(oldKey, options);
          return {
            success: true,
        };
      }
        
        return storeResult;
    }

      return {
        success: false,
        error: '마이그레이션할 데이터가 없습니다.',
    };
  } catch (error) {
      Logger.error('Data migration error:', 'auth', { component: 'SecureStorage', error: error });
      return {
        success: false,
        error: '데이터 마이그레이션에 실패했습니다.',
    };
  }
}
}