import { create } from 'zustand';
import { UserProfile, PublicProfile } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/supabase/auth';
import appleAuthService from '../services/supabase/appleAuth';
import { GoogleAuthService } from '../services/supabase/googleAuth';
import { supabase } from '../services/supabase/client';
import { Logger } from '../services/LoggingService';
// import { setSentryUser, clearSentryUser } from '../utils/sentry';

interface UserStore {
  // Current user
  currentUser: UserProfile | null;
  user: UserProfile | null; // Alias for compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile cache (for viewed profiles)
  profileCache: Map<string, PublicProfile>;
  
  // Actions
  signUp: (email: string, username: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setTestUser: () => Promise<void>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changeUsername: (newUsername: string) => Promise<void>;
  
  // Helper functions
  createOrUpdateSocialProfile: (authUser: unknown, provider: 'apple' | 'google') => Promise<void>;
  
  // Social actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  
  // Profile viewing
  getPublicProfile: (userId: string) => Promise<PublicProfile>;
  
  // Local storage
  loadStoredUser: () => Promise<void>;
  clearStoredUser: () => Promise<void>;
}

const STORAGE_KEY = '@cupnote_user';

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  user: null, // Alias for compatibility
  isAuthenticated: false,
  isLoading: false,
  profileCache: new Map(),

  signUp: async (email, username, password) => {
    set({ isLoading: true });
    try {
      // Sign up with Supabase Auth
      const authUser = await authService.signUp(email, password);
      
      // Create user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          username,
          level: 1,
          total_tastings: 0,
          badges: [],
          is_verified: false,
          is_moderator: false,
          followers_count: 0,
          following_count: 0,
          privacy_level: 'public',
      });
      
      if (profileError) throw profileError;
      
      // Create user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: authUser.id,
          language: 'ko',
          theme: 'light',
          notifications: {
            push: true,
            email: false,
            new_follower: true,
            challenge_invite: true,
            weekly_report: true,
            community_mentions: true,
            achievement_unlocked: true,
        },
      });
      
      if (prefsError) throw prefsError;
      
      // Create local user profile
      const newUser: UserProfile = {
        id: authUser.id,
        email,
        username,
        authProvider: 'email',
        privacyLevel: 'public',
        level: 1,
        totalTastings: 0,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        badges: [],
        isVerified: false,
        isModerator: false,
        followersCount: 0,
        followingCount: 0,
        preferredLanguage: 'ko',
        notifications: {
          push: true,
          email: false,
          newFollower: true,
          challengeInvite: true,
          weeklyReport: true,
          communityMentions: true,
          achievementUnlocked: true,
      },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
      
      set({ currentUser: newUser, user: newUser, isAuthenticated: true, isLoading: false });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      
      // Set Sentry user context
      // setSentryUser({ id: newUser.id, username: newUser.username }); // Temporarily disabled
  } catch (error) {
      // console.error('Sign up error:', error);
      set({ isLoading: false });
      throw error;
  }
},

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      // Sign in with Supabase Auth
      const authUser = await authService.signIn(email, password);
      
      // Fetch user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError || !userProfile) {
        throw new Error('User profile not found');
    }
      
      // Fetch user preferences
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      
      // Create local user profile
      const user: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        username: userProfile.username,
        authProvider: 'email',
        displayName: userProfile.display_name,
        avatarUrl: userProfile.avatar_url,
        bio: userProfile.bio,
        privacyLevel: userProfile.privacy_level || 'public',
        level: userProfile.level || 1,
        totalTastings: userProfile.total_tastings || 0,
        joinedAt: new Date(userProfile.created_at),
        lastActiveAt: new Date(),
        badges: userProfile.badges || [],
        isVerified: userProfile.is_verified || false,
        isModerator: userProfile.is_moderator || false,
        followersCount: userProfile.followers_count || 0,
        followingCount: userProfile.following_count || 0,
        preferredLanguage: userPrefs?.language || 'ko',
        notifications: userPrefs?.notifications || {
          push: true,
          email: false,
          newFollower: true,
          challengeInvite: true,
          weeklyReport: true,
          communityMentions: true,
          achievementUnlocked: true,
      },
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at),
    };
      
      set({ currentUser: user, user: user, isAuthenticated: true, isLoading: false });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      // Set Sentry user context
      // setSentryUser({ id: user.id, username: user.username }); // Temporarily disabled
  } catch (error) {
      // console.error('Sign in error:', error);
      set({ isLoading: false });
      throw error;
  }
},


  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null, isAuthenticated: false, isLoading: false });
      
      // Clear Sentry user context
      // clearSentryUser(); // Temporarily disabled
  } catch (error) {
      // console.error('Sign out error:', error);
      set({ isLoading: false });
      throw error;
  }
},


  setTestUser: async () => {
    Logger.debug('setTestUser called', 'store', { component: 'useUserStore' });
    // 개발자 테스트용 로그인 바이패스
    const testUser: UserProfile = {
      id: '00000000-0000-4000-8000-000000000001',
      username: 'Developer',
      email: 'dev@test.com',
      authProvider: 'email',
      displayName: '개발자',
      bio: '개발자 테스트 계정입니다.',
      avatarUrl: '',
      privacyLevel: 'public',
      level: 10,
      totalTastings: 100,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      badges: ['coffee_explorer_1', 'coffee_explorer_2', 'coffee_explorer_3'],
      isVerified: true,
      isModerator: true,
      followersCount: 50,
      followingCount: 30,
      preferredLanguage: 'ko',
      notifications: {
        push: true,
        email: false,
        newFollower: true,
        challengeInvite: true,
        weeklyReport: true,
        communityMentions: true,
        achievementUnlocked: true,
    },
      createdAt: new Date(),
      updatedAt: new Date(),
  };

    Logger.debug('Test user created:', 'store', { component: 'useUserStore', data: testUser.username });
    
    // Store in AsyncStorage for persistence
    try {
      Logger.debug('Storing test user in AsyncStorage...', 'store', { component: 'useUserStore' });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(testUser));
      Logger.debug('Test user stored successfully', 'store', { component: 'useUserStore' });
  } catch (error) {
      Logger.error('🔧 Failed to store test user:', 'store', { component: 'useUserStore', error: error });
      throw error; // Re-throw to catch in SignInScreen
  }
    
    Logger.debug('Setting state...', 'store', { component: 'useUserStore' });
    set({
      currentUser: testUser,
      user: testUser, // Alias for compatibility
      isAuthenticated: true, // 개발자 모드에서는 인증된 상태
      isLoading: false,
  });
    Logger.debug('State set successfully - isAuthenticated: true', 'store', { component: 'useUserStore' });
},


  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      // Apple Sign-In 실행
      const authUser = await appleAuthService.signIn();
      
      // 기존 유저 프로필 확인 또는 생성
      await get().createOrUpdateSocialProfile(authUser, 'apple');
  } catch (error) {
      Logger.error('Apple Sign-In error:', 'store', { component: 'useUserStore', error: error });
      set({ isLoading: false });
      throw error;
  }
},

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      // Google Sign-In 실행
      const result = await GoogleAuthService.signIn();
      
      if (!result.success) {
        throw new Error(result.error || 'Google Sign-In failed');
    }
      
      const authUser = result.user;
      
      // 기존 유저 프로필 확인 또는 생성
      await get().createOrUpdateSocialProfile(authUser, 'google');
  } catch (error) {
      Logger.error('Google Sign-In error:', 'store', { component: 'useUserStore', error: error });
      set({ isLoading: false });
      throw error;
  }
},

  // 소셜 로그인 프로필 생성/업데이트 헬퍼 함수
  createOrUpdateSocialProfile: async (authUser: unknown, provider: 'apple' | 'google') => {
    try {
      // 기존 유저 프로필 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!existingProfile) {
        // 새 유저 프로필 생성
        const username = authUser.user_metadata?.name || 
                        authUser.user_metadata?.full_name || 
                        `user_${authUser.id.slice(0, 8)}`;
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.id,
            username,
            level: 1,
            total_tastings: 0,
            badges: [],
            is_verified: false,
            is_moderator: false,
            followers_count: 0,
            following_count: 0,
            privacy_level: 'public',
        });

        if (profileError) throw profileError;

        // 유저 기본 설정 생성
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: authUser.id,
            language: 'ko',
            theme: 'light',
            notifications: {
              push: true,
              email: false,
              new_follower: true,
              challenge_invite: true,
              weekly_report: true,
              community_mentions: true,
              achievement_unlocked: true,
          },
        });

        if (prefsError) throw prefsError;
    }

      // 최신 프로필 데이터 가져오기
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error('Failed to fetch user profile');
    }

      // 유저 기본 설정 가져오기
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // 로컬 유저 프로필 생성
      const user: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        username: userProfile.username,
        authProvider: provider,
        displayName: userProfile.display_name || authUser.user_metadata?.name,
        avatarUrl: userProfile.avatar_url || authUser.user_metadata?.avatar_url,
        bio: userProfile.bio,
        privacyLevel: userProfile.privacy_level || 'public',
        level: userProfile.level || 1,
        totalTastings: userProfile.total_tastings || 0,
        joinedAt: new Date(userProfile.created_at),
        lastActiveAt: new Date(),
        badges: userProfile.badges || [],
        isVerified: userProfile.is_verified || false,
        isModerator: userProfile.is_moderator || false,
        followersCount: userProfile.followers_count || 0,
        followingCount: userProfile.following_count || 0,
        preferredLanguage: userPrefs?.language || 'ko',
        notifications: userPrefs?.notifications || {
          push: true,
          email: false,
          newFollower: true,
          challengeInvite: true,
          weeklyReport: true,
          communityMentions: true,
          achievementUnlocked: true,
      },
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at),
    };

      set({ currentUser: user, user: user, isAuthenticated: true, isLoading: false });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      // Set Sentry user context
      // setSentryUser({ id: user.id, username: user.username }); // Temporarily disabled
  } catch (error) {
      Logger.error('Social profile creation/update error:', 'store', { component: 'useUserStore', error: error });
      set({ isLoading: false });
      throw error;
  }
},

  updateProfile: async (updates) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    try {
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date(),
    };
      
      // TODO: Save to Supabase
      set({ currentUser: updatedUser });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  } catch (error) {
      // console.error('Update profile error:', error);
      throw error;
  }
},


  changeUsername: async (newUsername) => {
    // TODO: Check username availability in Supabase
    await get().updateProfile({ username: newUsername });
},

  followUser: async (userId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    // TODO: Implement Supabase follow relationship
    await get().updateProfile({ 
      followingCount: currentUser.followingCount + 1 
  });
},

  unfollowUser: async (userId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    // TODO: Implement Supabase unfollow
    await get().updateProfile({ 
      followingCount: Math.max(0, currentUser.followingCount - 1) 
  });
},

  getPublicProfile: async (userId) => {
    const { profileCache, currentUser } = get();
    
    // Check if requesting own profile
    if (currentUser?.id === userId) {
      return {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        bio: currentUser.bio,
        level: currentUser.level,
        totalTastings: currentUser.totalTastings,
        badges: currentUser.badges,
        isVerified: currentUser.isVerified,
        followersCount: currentUser.followersCount,
        joinedAt: currentUser.joinedAt,
    } as PublicProfile;
  }
    
    // Check cache
    if (profileCache.has(userId)) {
      return profileCache.get(userId)!;
  }
    
    // TODO: Fetch from Supabase
    // Mock implementation
    const mockProfile: PublicProfile = {
      id: userId,
      username: `user_${userId}`,
      displayName: 'Coffee Explorer',
      level: 3,
      totalTastings: 45,
      badges: ['flavor-hunter'],
      isVerified: false,
      followersCount: 12,
      joinedAt: new Date('2024-06-01'),
  };
    
    profileCache.set(userId, mockProfile);
    set({ profileCache: new Map(profileCache) });
    
    return mockProfile;
},

  loadStoredUser: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        // Convert date strings back to Date objects
        user.joinedAt = new Date(user.joinedAt);
        user.lastActiveAt = new Date(user.lastActiveAt);
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);
        
        set({ currentUser: user, isAuthenticated: true });
        
        // Set Sentry user context for restored session
        // setSentryUser({ id: user.id, username: user.username }); // Temporarily disabled
    }
  } catch (error) {
      // console.error('Load stored user error:', error);
  } finally {
      set({ isLoading: false });
  }
},

  clearStoredUser: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ currentUser: null, isAuthenticated: false });
    
    // Clear Sentry user context
    // clearSentryUser(); // Temporarily disabled
},
}));