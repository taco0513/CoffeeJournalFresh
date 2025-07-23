import { supabase } from '../supabase/client';

export enum Permission {
  // Profile permissions
  READ_PROFILE = 'read:profile',
  WRITE_PROFILE = 'write:profile',
  DELETE_PROFILE = 'delete:profile',
  
  // Tasting permissions
  READ_TASTINGS = 'read:tastings',
  WRITE_TASTINGS = 'write:tastings',
  DELETE_TASTINGS = 'delete:tastings',
  
  // Coffee catalog permissions
  READ_COFFEE_CATALOG = 'read:coffee_catalog',
  WRITE_COFFEE_CATALOG = 'write:coffee_catalog',
  APPROVE_COFFEE_SUBMISSIONS = 'approve:coffee_submissions',
  
  // Community permissions
  READ_COMMUNITY = 'read:community',
  WRITE_COMMUNITY = 'write:community',
  MODERATE_COMMUNITY = 'moderate:community',
  
  // Analytics permissions
  READ_ANALYTICS = 'read:analytics',
  READ_USER_ANALYTICS = 'read:user_analytics',
  
  // Admin permissions
  ADMIN_ACCESS = 'admin:access',
  ADMIN_USERS = 'admin:users',
  ADMIN_CONTENT = 'admin:content',
  ADMIN_SYSTEM = 'admin:system',
  
  // Special permissions
  BETA_FEATURES = 'beta:features',
  DEVELOPER_MODE = 'developer:mode',
  EXPORT_DATA = 'export:data',
  
  // Enhanced permissions for coffee discovery
  LOCATION_ACCESS = 'location:access',
  PHOTO_SAVE = 'photo:save',
  NOTIFICATIONS = 'notifications:receive',
  SOCIAL_SHARING = 'social:sharing',
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  level: number;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: string;
}

export class PermissionService {
  private static permissionCache = new Map<string, Permission[]>();
  private static roleCache = new Map<string, UserRole>();
  
  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    if (cached) {
      return cached;
    }

    try {
      // Get user role and associated permissions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          role,
          is_verified,
          is_moderator,
          is_admin,
          user_permissions (
            permission
          )
        `)
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user permissions:', userError);
        return [];
      }

      // Get role-based permissions
      const rolePermissions = await this.getRolePermissions(userData.role || 'user');
      
      // Get user-specific permissions
      const userSpecificPermissions = userData.user_permissions?.map(
        (p: any) => p.permission as Permission
      ) || [];

      // Add special permissions based on user status
      const statusPermissions = this.getStatusBasedPermissions(userData);

      // Combine all permissions and remove duplicates
      const allPermissions = [
        ...rolePermissions,
        ...userSpecificPermissions,
        ...statusPermissions,
      ];
      
      const uniquePermissions = [...new Set(allPermissions)];
      
      // Cache the result
      this.permissionCache.set(userId, uniquePermissions);
      
      return uniquePermissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: Permission): Promise<PermissionCheck> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const hasPermission = permissions.includes(permission);
      
      if (hasPermission) {
        return { hasPermission: true };
      }

      // Get required role for this permission
      const requiredRole = await this.getRequiredRoleForPermission(permission);
      
      return {
        hasPermission: false,
        reason: `Permission '${permission}' requires role '${requiredRole}' or higher`,
        requiredRole,
      };
    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        hasPermission: false,
        reason: 'Error checking permissions',
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  static async hasPermissions(userId: string, permissions: Permission[]): Promise<Map<Permission, PermissionCheck>> {
    const results = new Map<Permission, PermissionCheck>();
    
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      for (const permission of permissions) {
        if (userPermissions.includes(permission)) {
          results.set(permission, { hasPermission: true });
        } else {
          const requiredRole = await this.getRequiredRoleForPermission(permission);
          results.set(permission, {
            hasPermission: false,
            reason: `Permission '${permission}' requires role '${requiredRole}' or higher`,
            requiredRole,
          });
        }
      }
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      for (const permission of permissions) {
        results.set(permission, {
          hasPermission: false,
          reason: 'Error checking permissions',
        });
      }
    }
    
    return results;
  }

  /**
   * Get permissions for a specific role
   */
  private static async getRolePermissions(roleName: string): Promise<Permission[]> {
    // Check cache first
    const cached = this.roleCache.get(roleName);
    if (cached) {
      return cached.permissions;
    }

    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          level,
          role_permissions (
            permission
          )
        `)
        .eq('name', roleName)
        .single();

      if (error) {
        console.error('Error fetching role permissions:', error);
        return this.getDefaultPermissions(roleName);
      }

      const permissions = data.role_permissions?.map(
        (rp: any) => rp.permission as Permission
      ) || [];

      // Cache the role
      this.roleCache.set(roleName, {
        id: data.id,
        name: data.name,
        permissions,
        level: data.level,
      });

      return permissions;
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return this.getDefaultPermissions(roleName);
    }
  }

  /**
   * Get status-based permissions (admin, moderator, verified)
   */
  private static getStatusBasedPermissions(userData: any): Permission[] {
    const permissions: Permission[] = [];

    if (userData.is_admin) {
      permissions.push(
        Permission.ADMIN_ACCESS,
        Permission.ADMIN_USERS,
        Permission.ADMIN_CONTENT,
        Permission.ADMIN_SYSTEM,
        Permission.APPROVE_COFFEE_SUBMISSIONS,
        Permission.MODERATE_COMMUNITY,
        Permission.READ_ANALYTICS,
        Permission.READ_USER_ANALYTICS,
        Permission.DEVELOPER_MODE
      );
    }

    if (userData.is_moderator) {
      permissions.push(
        Permission.MODERATE_COMMUNITY,
        Permission.APPROVE_COFFEE_SUBMISSIONS,
        Permission.READ_ANALYTICS
      );
    }

    if (userData.is_verified) {
      permissions.push(
        Permission.WRITE_COMMUNITY,
        Permission.WRITE_COFFEE_CATALOG,
        Permission.BETA_FEATURES
      );
    }

    return permissions;
  }

  /**
   * Get default permissions for roles (fallback)
   */
  private static getDefaultPermissions(roleName: string): Permission[] {
    const rolePermissions: Record<string, Permission[]> = {
      admin: [
        Permission.READ_PROFILE,
        Permission.WRITE_PROFILE,
        Permission.DELETE_PROFILE,
        Permission.READ_TASTINGS,
        Permission.WRITE_TASTINGS,
        Permission.DELETE_TASTINGS,
        Permission.READ_COFFEE_CATALOG,
        Permission.WRITE_COFFEE_CATALOG,
        Permission.APPROVE_COFFEE_SUBMISSIONS,
        Permission.READ_COMMUNITY,
        Permission.WRITE_COMMUNITY,
        Permission.MODERATE_COMMUNITY,
        Permission.READ_ANALYTICS,
        Permission.READ_USER_ANALYTICS,
        Permission.ADMIN_ACCESS,
        Permission.ADMIN_USERS,
        Permission.ADMIN_CONTENT,
        Permission.ADMIN_SYSTEM,
        Permission.BETA_FEATURES,
        Permission.DEVELOPER_MODE,
        Permission.EXPORT_DATA,
        Permission.LOCATION_ACCESS,
        Permission.PHOTO_SAVE,
        Permission.NOTIFICATIONS,
        Permission.SOCIAL_SHARING,
      ],
      moderator: [
        Permission.READ_PROFILE,
        Permission.WRITE_PROFILE,
        Permission.READ_TASTINGS,
        Permission.WRITE_TASTINGS,
        Permission.DELETE_TASTINGS,
        Permission.READ_COFFEE_CATALOG,
        Permission.WRITE_COFFEE_CATALOG,
        Permission.APPROVE_COFFEE_SUBMISSIONS,
        Permission.READ_COMMUNITY,
        Permission.WRITE_COMMUNITY,
        Permission.MODERATE_COMMUNITY,
        Permission.READ_ANALYTICS,
        Permission.BETA_FEATURES,
      ],
      verified_user: [
        Permission.READ_PROFILE,
        Permission.WRITE_PROFILE,
        Permission.READ_TASTINGS,
        Permission.WRITE_TASTINGS,
        Permission.DELETE_TASTINGS,
        Permission.READ_COFFEE_CATALOG,
        Permission.WRITE_COFFEE_CATALOG,
        Permission.READ_COMMUNITY,
        Permission.WRITE_COMMUNITY,
        Permission.BETA_FEATURES,
        Permission.EXPORT_DATA,
        Permission.LOCATION_ACCESS,
        Permission.PHOTO_SAVE,
        Permission.NOTIFICATIONS,
        Permission.SOCIAL_SHARING,
      ],
      user: [
        Permission.READ_PROFILE,
        Permission.WRITE_PROFILE,
        Permission.READ_TASTINGS,
        Permission.WRITE_TASTINGS,
        Permission.DELETE_TASTINGS,
        Permission.READ_COFFEE_CATALOG,
        Permission.READ_COMMUNITY,
        Permission.LOCATION_ACCESS,
        Permission.PHOTO_SAVE,
        Permission.NOTIFICATIONS,
        Permission.SOCIAL_SHARING,
      ],
    };

    return rolePermissions[roleName] || rolePermissions.user;
  }

  /**
   * Get required role for a permission
   */
  private static async getRequiredRoleForPermission(permission: Permission): Promise<string> {
    // Admin-only permissions
    if ([
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_USERS,
      Permission.ADMIN_CONTENT,
      Permission.ADMIN_SYSTEM,
      Permission.READ_USER_ANALYTICS,
      Permission.DEVELOPER_MODE,
    ].includes(permission)) {
      return 'admin';
    }

    // Moderator-level permissions
    if ([
      Permission.MODERATE_COMMUNITY,
      Permission.APPROVE_COFFEE_SUBMISSIONS,
      Permission.READ_ANALYTICS,
    ].includes(permission)) {
      return 'moderator';
    }

    // Verified user permissions
    if ([
      Permission.WRITE_COMMUNITY,
      Permission.WRITE_COFFEE_CATALOG,
      Permission.BETA_FEATURES,
    ].includes(permission)) {
      return 'verified_user';
    }

    // Basic user permissions
    return 'user';
  }

  /**
   * Clear permission cache (useful after role changes)
   */
  static clearPermissionCache(userId?: string): void {
    if (userId) {
      this.permissionCache.delete(userId);
    } else {
      this.permissionCache.clear();
      this.roleCache.clear();
    }
  }

  /**
   * Grant permission to user
   */
  static async grantPermission(userId: string, permission: Permission, grantedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission,
          granted_by: grantedBy,
          granted_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error granting permission:', error);
        return false;
      }

      // Clear cache for this user
      this.clearPermissionCache(userId);
      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      return false;
    }
  }

  /**
   * Revoke permission from user
   */
  static async revokePermission(userId: string, permission: Permission, revokedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission', permission);

      if (error) {
        console.error('Error revoking permission:', error);
        return false;
      }

      // Log the revocation
      await supabase
        .from('permission_audit_log')
        .insert({
          user_id: userId,
          permission,
          action: 'revoked',
          performed_by: revokedBy,
          performed_at: new Date().toISOString(),
        });

      // Clear cache for this user
      this.clearPermissionCache(userId);
      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      return false;
    }
  }

  /**
   * Check if user can perform action on resource
   */
  static async canPerformAction(
    userId: string,
    action: 'read' | 'write' | 'delete' | 'moderate',
    resource: 'profile' | 'tastings' | 'community' | 'coffee_catalog' | 'analytics',
    resourceOwnerId?: string
  ): Promise<PermissionCheck> {
    // Users can always perform actions on their own resources (except moderate)
    if (resourceOwnerId && resourceOwnerId === userId && action !== 'moderate') {
      return { hasPermission: true };
    }

    // Map action + resource to permission
    const permissionMap: Record<string, Permission> = {
      'read_profile': Permission.READ_PROFILE,
      'write_profile': Permission.WRITE_PROFILE,
      'delete_profile': Permission.DELETE_PROFILE,
      'read_tastings': Permission.READ_TASTINGS,
      'write_tastings': Permission.WRITE_TASTINGS,
      'delete_tastings': Permission.DELETE_TASTINGS,
      'read_community': Permission.READ_COMMUNITY,
      'write_community': Permission.WRITE_COMMUNITY,
      'moderate_community': Permission.MODERATE_COMMUNITY,
      'read_coffee_catalog': Permission.READ_COFFEE_CATALOG,
      'write_coffee_catalog': Permission.WRITE_COFFEE_CATALOG,
      'read_analytics': Permission.READ_ANALYTICS,
    };

    const permissionKey = `${action}_${resource}`;
    const requiredPermission = permissionMap[permissionKey];

    if (!requiredPermission) {
      return {
        hasPermission: false,
        reason: `Unknown action '${action}' on resource '${resource}'`,
      };
    }

    return await this.hasPermission(userId, requiredPermission);
  }
}