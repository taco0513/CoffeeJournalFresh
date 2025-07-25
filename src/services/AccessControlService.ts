import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../utils/logger';

export enum UserRole {
  REGULAR = 'regular',
  BETA = 'beta',
  DEVELOPER = 'developer',
  ADMIN = 'admin'
}

export interface UserPermissions {
  // Basic app features
  canUseApp: boolean;
  
  // Testing features
  canAccessBetaFeatures: boolean;
  canProvideFeedback: boolean;
  canAccessShakeToFeedback: boolean;
  
  // Developer features
  canAccessMockData: boolean;
  canAccessDebugLogs: boolean;
  canBypassLogin: boolean;
  canAccessDeveloperScreen: boolean;
  canManageSettings: boolean;
  
  // Admin features
  canAccessAdminDashboard: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageContent: boolean;
  
  // Data management
  canExportData: boolean;
  canDeleteAllData: boolean;
  canAccessRealmLogs: boolean;
  canAccessNetworkLogs: boolean;
}

export interface UserProfile {
  role: UserRole;
  permissions: UserPermissions;
  metadata: {
    isFirstTime: boolean;
    lastRoleChange?: Date;
    experimentalFeatures: string[];
    betaOptIn: boolean;
  };
}

const STORAGE_KEY = '@user_access_control';

export class AccessControlService {
  private static instance: AccessControlService;
  private currentUserProfile: UserProfile | null = null;

  private constructor() {}

  static getInstance(): AccessControlService {
    if (!AccessControlService.instance) {
      AccessControlService.instance = new AccessControlService();
    }
    return AccessControlService.instance;
  }

  /**
   * Initialize user profile based on environment and stored preferences
   */
  async initialize(): Promise<UserProfile> {
    try {
      // Try to load existing profile
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUserProfile = JSON.parse(stored);
        Logger.info('User profile loaded from storage', 'access_control', { 
          data: { role: this.currentUserProfile?.role }
        });
      }

      // If no stored profile, create default based on environment
      if (!this.currentUserProfile) {
        const defaultRole = this.getDefaultUserRole();
        this.currentUserProfile = this.createUserProfile(defaultRole);
        await this.saveUserProfile();
        Logger.info('Created new user profile', 'access_control', { 
          data: { role: defaultRole, source: 'environment_default' }
        });
      }

      return this.currentUserProfile;
    } catch (error) {
      Logger.error('Failed to initialize user profile', 'access_control', undefined, error as Error);
      
      // Fallback to safe default
      const fallbackRole = __DEV__ ? UserRole.DEVELOPER : UserRole.REGULAR;
      this.currentUserProfile = this.createUserProfile(fallbackRole);
      return this.currentUserProfile;
    }
  }

  /**
   * Get default user role based on environment
   */
  private getDefaultUserRole(): UserRole {
    // Development environment
    if (__DEV__) {
      return UserRole.DEVELOPER;
    }
    
    // Beta builds (TestFlight, internal testing)
    if (Config.BUILD_TYPE === 'beta' || Config.IS_BETA_BUILD === 'true') {
      return UserRole.BETA;
    }
    
    // Check for admin override
    if (Config.FORCE_ADMIN_MODE === 'true') {
      return UserRole.ADMIN;
    }
    
    // Production default
    return UserRole.REGULAR;
  }

  /**
   * Create user profile with permissions based on role
   */
  private createUserProfile(role: UserRole): UserProfile {
    return {
      role,
      permissions: this.getPermissionsForRole(role),
      metadata: {
        isFirstTime: true,
        experimentalFeatures: [],
        betaOptIn: role !== UserRole.REGULAR
      }
    };
  }

  /**
   * Get permissions matrix for a specific role
   */
  private getPermissionsForRole(role: UserRole): UserPermissions {
    // Base permissions (all false except canUseApp)
    const basePermissions: UserPermissions = {
      canUseApp: true,
      canAccessBetaFeatures: false,
      canProvideFeedback: false,
      canAccessShakeToFeedback: false,
      canAccessMockData: false,
      canAccessDebugLogs: false,
      canBypassLogin: false,
      canAccessDeveloperScreen: false,
      canManageSettings: false,
      canAccessAdminDashboard: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canManageContent: false,
      canExportData: false,
      canDeleteAllData: false,
      canAccessRealmLogs: false,
      canAccessNetworkLogs: false
    };

    switch (role) {
      case UserRole.REGULAR:
        return {
          ...basePermissions,
          canExportData: true // Regular users can export their own data
        };

      case UserRole.BETA:
        return {
          ...basePermissions,
          canAccessBetaFeatures: true,
          canProvideFeedback: true,
          canAccessShakeToFeedback: true,
          canAccessDebugLogs: true,
          canExportData: true,
          canAccessNetworkLogs: true
        };

      case UserRole.DEVELOPER:
        return {
          ...basePermissions,
          canAccessBetaFeatures: true,
          canProvideFeedback: true,
          canAccessShakeToFeedback: true,
          canAccessMockData: true,
          canAccessDebugLogs: true,
          canBypassLogin: true,
          canAccessDeveloperScreen: true,
          canManageSettings: true,
          canExportData: true,
          canDeleteAllData: true,
          canAccessRealmLogs: true,
          canAccessNetworkLogs: true
        };

      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canAccessBetaFeatures: true,
          canProvideFeedback: true,
          canAccessShakeToFeedback: true,
          canAccessMockData: true,
          canAccessDebugLogs: true,
          canBypassLogin: true,
          canAccessDeveloperScreen: true,
          canManageSettings: true,
          canAccessAdminDashboard: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageContent: true,
          canExportData: true,
          canDeleteAllData: true,
          canAccessRealmLogs: true,
          canAccessNetworkLogs: true
        };

      default:
        return basePermissions;
    }
  }

  /**
   * Get current user profile
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfile;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): UserRole {
    return this.currentUserProfile?.role || UserRole.REGULAR;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: keyof UserPermissions): boolean {
    if (!this.currentUserProfile) {
      return false;
    }
    
    return this.currentUserProfile.permissions[permission];
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Change user role (with validation)
   */
  async changeUserRole(newRole: UserRole, reason?: string): Promise<boolean> {
    try {
      if (!this.currentUserProfile) {
        await this.initialize();
      }

      const oldRole = this.currentUserProfile!.role;
      
      // Validate role change
      if (!this.canChangeToRole(oldRole, newRole)) {
        Logger.warn('Role change denied', 'access_control', { 
          data: { from: oldRole, to: newRole, reason: 'insufficient_permissions' } 
        });
        return false;
      }

      // Update profile
      this.currentUserProfile = {
        ...this.currentUserProfile!,
        role: newRole,
        permissions: this.getPermissionsForRole(newRole),
        metadata: {
          ...this.currentUserProfile!.metadata,
          lastRoleChange: new Date(),
          isFirstTime: false
        }
      };

      await this.saveUserProfile();

      Logger.info('User role changed successfully', 'access_control', { 
        data: { from: oldRole, to: newRole, reason } 
      });

      return true;
    } catch (error) {
      Logger.error('Failed to change user role', 'access_control', undefined, error as Error);
      return false;
    }
  }

  /**
   * Check if role change is allowed
   */
  private canChangeToRole(fromRole: UserRole, toRole: UserRole): boolean {
    // Allow any change in development
    if (__DEV__) {
      return true;
    }

    // Regular users can become beta users
    if (fromRole === UserRole.REGULAR && toRole === UserRole.BETA) {
      return true;
    }

    // Beta users can revert to regular
    if (fromRole === UserRole.BETA && toRole === UserRole.REGULAR) {
      return true;
    }

    // Developer/Admin changes require existing elevated permissions
    if (fromRole === UserRole.DEVELOPER || fromRole === UserRole.ADMIN) {
      return true;
    }

    return false;
  }

  /**
   * Toggle beta participation
   */
  async toggleBetaParticipation(): Promise<boolean> {
    const currentRole = this.getCurrentUserRole();
    
    if (currentRole === UserRole.REGULAR) {
      return await this.changeUserRole(UserRole.BETA, 'user_opt_in');
    } else if (currentRole === UserRole.BETA) {
      return await this.changeUserRole(UserRole.REGULAR, 'user_opt_out');
    }
    
    return false;
  }

  /**
   * Enable experimental feature
   */
  async enableExperimentalFeature(featureName: string): Promise<boolean> {
    if (!this.hasPermission('canAccessBetaFeatures')) {
      return false;
    }

    if (!this.currentUserProfile) {
      return false;
    }

    const features = this.currentUserProfile.metadata.experimentalFeatures;
    if (!features.includes(featureName)) {
      features.push(featureName);
      await this.saveUserProfile();
      
      Logger.info('Experimental feature enabled', 'access_control', { 
        data: { feature: featureName, userRole: this.currentUserProfile.role }
      });
    }

    return true;
  }

  /**
   * Disable experimental feature
   */
  async disableExperimentalFeature(featureName: string): Promise<boolean> {
    if (!this.currentUserProfile) {
      return false;
    }

    const features = this.currentUserProfile.metadata.experimentalFeatures;
    const index = features.indexOf(featureName);
    
    if (index > -1) {
      features.splice(index, 1);
      await this.saveUserProfile();
      
      Logger.info('Experimental feature disabled', 'access_control', { 
        data: { feature: featureName, userRole: this.currentUserProfile.role }
      });
    }

    return true;
  }

  /**
   * Check if experimental feature is enabled
   */
  isExperimentalFeatureEnabled(featureName: string): boolean {
    if (!this.currentUserProfile) {
      return false;
    }

    return this.currentUserProfile.metadata.experimentalFeatures.includes(featureName);
  }

  /**
   * Get user display badge
   */
  getUserDisplayBadge(): string | null {
    const role = this.getCurrentUserRole();
    
    switch (role) {
      case UserRole.BETA:
        return 'β';
      case UserRole.DEVELOPER:
        return 'DEV';
      case UserRole.ADMIN:
        return 'ADMIN';
      default:
        return null;
    }
  }

  /**
   * Get user display role name (Korean)
   */
  getUserDisplayName(): string {
    const role = this.getCurrentUserRole();
    
    switch (role) {
      case UserRole.REGULAR:
        return '일반 사용자';
      case UserRole.BETA:
        return '베타 테스터';
      case UserRole.DEVELOPER:
        return '개발자';
      case UserRole.ADMIN:
        return '관리자';
      default:
        return '알 수 없음';
    }
  }

  /**
   * Save user profile to storage
   */
  private async saveUserProfile(): Promise<void> {
    if (!this.currentUserProfile) {
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUserProfile));
    } catch (error) {
      Logger.error('Failed to save user profile', 'access_control', { error });
    }
  }

  /**
   * Reset user profile to default
   */
  async resetToDefault(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      this.currentUserProfile = null;
      await this.initialize();
      
      Logger.info('User profile reset to default', 'access_control', { 
        data: { newRole: this.currentUserProfile?.role as string | undefined } 
      });
    } catch (error) {
      Logger.error('Failed to reset user profile', 'access_control', undefined, error as Error);
    }
  }

  /**
   * Validate current permissions (for security)
   */
  validatePermissions(): boolean {
    if (!this.currentUserProfile) {
      return false;
    }

    const expectedPermissions = this.getPermissionsForRole(this.currentUserProfile.role);
    const currentPermissions = this.currentUserProfile.permissions;

    // Check if permissions match the role
    for (const [key, expectedValue] of Object.entries(expectedPermissions) as Array<[keyof UserPermissions, boolean]>) {
      if (currentPermissions[key] !== expectedValue) {
        Logger.warn('Permission mismatch detected', 'access_control', { 
          data: { permission: key, expected: expectedValue, actual: currentPermissions[key], role: this.currentUserProfile.role }
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Repair corrupted permissions
   */
  async repairPermissions(): Promise<boolean> {
    if (!this.currentUserProfile) {
      return false;
    }

    try {
      this.currentUserProfile.permissions = this.getPermissionsForRole(this.currentUserProfile.role);
      await this.saveUserProfile();
      
      Logger.info('Permissions repaired successfully', 'access_control', { 
        role: this.currentUserProfile.role as string 
      });
      
      return true;
    } catch (error) {
      Logger.error('Failed to repair permissions', 'access_control', { error });
      return false;
    }
  }
}

export default AccessControlService.getInstance();