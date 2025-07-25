import { supabase } from '../supabase/client';
import { GoogleAuthService } from '../supabase/googleAuth';
import AppleAuthService from '../supabase/appleAuth';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

export interface SecurityCheckResult {
  isSecure: boolean;
  securityLevel: 'basic' | 'enhanced' | 'premium';
  recommendations: string[];
  lastSecurityCheck: Date;
}

export class EnhancedAuthService {
  /**
   * Enhanced Google Sign-In with additional security checks
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      // First attempt Google Sign-In
      const googleResult = await GoogleAuthService.signIn();
      
      if (!googleResult.success) {
        return {
          success: false,
          error: googleResult.error || 'Google Sign-In failed',
        };
      }

      const user = googleResult.user;
      
      // Perform additional security checks
      if (user) {
        await this.performPostAuthSecurityCheck(user.id);
        await this.updateLastLoginTimestamp(user.id);
        await this.checkAccountSuspension(user.id);
      }

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      console.error('Enhanced Google Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Enhanced Apple Sign-In with additional security checks
   */
  static async signInWithApple(): Promise<AuthResult> {
    try {
      const appleResult = await AppleAuthService.signIn();
      
      if (!appleResult.success) {
        return {
          success: false,
          error: appleResult.error || 'Apple Sign-In failed',
        };
      }

      const user = appleResult.user;
      
      // Perform additional security checks
      if (user) {
        await this.performPostAuthSecurityCheck(user.id);
        await this.updateLastLoginTimestamp(user.id);
        await this.checkAccountSuspension(user.id);
      }

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      console.error('Enhanced Apple Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Validate Google ID token directly with Google
   */
  static async validateGoogleToken(idToken: string): Promise<any> {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const tokenInfo = await response.json();
      
      if (tokenInfo.error) {
        throw new Error(`Invalid Google token: ${tokenInfo.error}`);
      }
      
      // Additional validation
      if (tokenInfo.aud !== process.env.GOOGLE_OAUTH_WEB_CLIENT_ID) {
        throw new Error('Token audience mismatch');
      }
      
      return tokenInfo;
    } catch (error) {
      console.error('Google token validation failed:', error);
      throw error;
    }
  }

  /**
   * Check account security status
   */
  static async checkAccountSecurity(userId: string): Promise<SecurityCheckResult> {
    try {
      const { data, error } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const defaultSecurity: SecurityCheckResult = {
        isSecure: true,
        securityLevel: 'basic',
        recommendations: [],
        lastSecurityCheck: new Date(),
      };

      if (!data) {
        // Create initial security record
        await this.createUserSecurityRecord(userId);
        return defaultSecurity;
      }

      // Analyze security level
      const securityLevel = this.calculateSecurityLevel(data);
      const recommendations = this.generateSecurityRecommendations(data);

      return {
        isSecure: data.is_account_secure ?? true,
        securityLevel,
        recommendations,
        lastSecurityCheck: new Date(data.last_security_check),
      };
    } catch (error) {
      console.error('Error checking account security:', error);
      return {
        isSecure: true,
        securityLevel: 'basic',
        recommendations: ['Unable to verify security status'],
        lastSecurityCheck: new Date(),
      };
    }
  }

  /**
   * Perform post-authentication security check
   */
  private static async performPostAuthSecurityCheck(userId: string): Promise<void> {
    try {
      // Update security record
      const { error } = await supabase
        .from('user_security')
        .upsert({
          user_id: userId,
          last_login: new Date().toISOString(),
          login_count: supabase.rpc('increment_login_count', { user_id: userId }),
          last_security_check: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating security record:', error);
      }
    } catch (error) {
      console.error('Post-auth security check failed:', error);
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLoginTimestamp(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (error) {
      console.error('Failed to update last login timestamp:', error);
    }
  }

  /**
   * Check if account is suspended or restricted
   */
  private static async checkAccountSuspension(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_suspended, suspension_reason')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking account suspension:', error);
        return;
      }

      if (data?.is_suspended) {
        // Sign out suspended user
        await supabase.auth.signOut();
        throw new Error(`Account suspended: ${data.suspension_reason || 'Contact support'}`);
      }
    } catch (error) {
      console.error('Account suspension check failed:', error);
      throw error;
    }
  }

  /**
   * Create initial user security record
   */
  private static async createUserSecurityRecord(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_security')
        .insert({
          user_id: userId,
          security_level: 'basic',
          is_account_secure: true,
          login_count: 1,
          last_login: new Date().toISOString(),
          last_security_check: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating user security record:', error);
      }
    } catch (error) {
      console.error('Failed to create user security record:', error);
    }
  }

  /**
   * Calculate user security level based on various factors
   */
  private static calculateSecurityLevel(securityData: any): 'basic' | 'enhanced' | 'premium' {
    let score = 0;

    // Base score
    score += 10;

    // Login frequency (more recent = higher score)
    const daysSinceLastLogin = securityData.last_login 
      ? Math.floor((Date.now() - new Date(securityData.last_login).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceLastLogin < 7) score += 20;
    else if (daysSinceLastLogin < 30) score += 10;

    // Account age (older = more trusted)
    const accountAge = securityData.created_at
      ? Math.floor((Date.now() - new Date(securityData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (accountAge > 90) score += 20;
    else if (accountAge > 30) score += 10;

    // Login count (more logins = more engagement)
    const loginCount = securityData.login_count || 0;
    if (loginCount > 100) score += 15;
    else if (loginCount > 20) score += 10;
    else if (loginCount > 5) score += 5;

    // Determine level
    if (score >= 60) return 'premium';
    if (score >= 40) return 'enhanced';
    return 'basic';
  }

  /**
   * Generate security recommendations based on user data
   */
  private static generateSecurityRecommendations(securityData: any): string[] {
    const recommendations: string[] = [];

    const daysSinceLastLogin = securityData.last_login 
      ? Math.floor((Date.now() - new Date(securityData.last_login).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastLogin > 30) {
      recommendations.push('Welcome back! Consider reviewing your coffee preferences.');
    }

    if (!securityData.email_verified) {
      recommendations.push('Verify your email address for enhanced security.');
    }

    if ((securityData.login_count || 0) < 5) {
      recommendations.push('Complete your profile setup for better coffee recommendations.');
    }

    const daysSinceSecurityCheck = securityData.last_security_check
      ? Math.floor((Date.now() - new Date(securityData.last_security_check).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceSecurityCheck > 90) {
      recommendations.push('Consider reviewing your account security settings.');
    }

    return recommendations;
  }

  /**
   * Enhanced sign out with cleanup
   */
  static async signOut(): Promise<AuthResult> {
    try {
      // Sign out from Google if applicable
      try {
        await GoogleAuthService.signOut();
      } catch (error) {
        console.warn('Google sign out failed (expected if not signed in via Google):', error);
      }

      // Sign out from Apple if applicable
      try {
        // AppleAuthService doesn't have signOut method - Apple sign out is handled by Supabase
        // await AppleAuthService.signOut();
      } catch (error) {
        console.warn('Apple sign out failed (expected if not signed in via Apple):', error);
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Enhanced sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }
}