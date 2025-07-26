export interface UserProfile {
  id: string;
  // Authentication
  email?: string; // Optional - some users might use social login
  authProvider: 'email' | 'google' | 'apple';
  
  // Public Profile (shown in community)
  username: string; // Unique, like Reddit
  displayName?: string; // Optional display name
  avatarUrl?: string; // Profile picture URL
  bio?: string; // Short bio (160 chars)
  
  // Profile Settings
  privacyLevel: 'public' | 'followers' | 'private';
  
  // Coffee Stats (public)
  level: number;
  totalTastings: number;
  joinedAt: Date;
  lastActiveAt: Date;
  
  // Achievements & Recognition
  badges: string[]; // Badge IDs
  isVerified: boolean; // Verified expert
  isModerator: boolean;
  
  // Social
  followersCount: number;
  followingCount: number;
  
  // Preferences
  preferredLanguage: 'ko' | 'en';
  notifications: NotificationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  // Specific notifications
  newFollower: boolean;
  challengeInvite: boolean;
  weeklyReport: boolean;
  communityMentions: boolean;
  achievementUnlocked: boolean;
}

export interface PublicProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  totalTastings: number;
  badges: string[];
  isVerified: boolean;
  followersCount: number;
  joinedAt: Date;
}

// For comments and community interactions
export interface UserMention {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

// Username validation (Reddit-style)
export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_-]+$/, // Letters, numbers, underscore, hyphen
  reserved: [
    'admin', 'moderator', 'anonymous', 'deleted', 'system',
    'coffee', 'api', 'app', 'official', 'support', 'help'
  ]
};

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < USERNAME_RULES.minLength) {
    return { valid: false, error: `Username must be at least ${USERNAME_RULES.minLength} characters` };
}
  
  if (username.length > USERNAME_RULES.maxLength) {
    return { valid: false, error: `Username must be no more than ${USERNAME_RULES.maxLength} characters` };
}
  
  if (!USERNAME_RULES.pattern.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscore, and hyphen' };
}
  
  if (USERNAME_RULES.reserved.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
}
  
  return { valid: true };
}