import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { PublicProfile } from '../types/user';

interface UserProfileDisplayProps {
  profile: PublicProfile | null;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
  onPress?: () => void;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  profile,
  size = 'medium',
  showStats = false,
  onPress,
}) => {
  if (!profile) {
    return null;
}

  
  const avatarSize = {
    small: 32,
    medium: 48,
    large: 64,
}[size];

  const renderAvatar = () => {
    if (profile.avatarUrl) {
      return (
        <Image
          source={{ uri: profile.avatarUrl }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
        />
      );
  }

    // Default avatar with first letter of username
    const firstLetter = profile.username.charAt(0).toUpperCase();
    return (
      <View style={[styles.avatarPlaceholder, { width: avatarSize, height: avatarSize }]}>
        <Text style={[styles.avatarLetter, { fontSize: avatarSize * 0.4 }]}>
          {firstLetter}
        </Text>
      </View>
    );
};

  const renderBadges = () => {
    if (!profile.badges || profile.badges.length === 0) {
      return null;
  }

    const badgeEmojis: Record<string, string> = {
      'early-adopter': '🌟',
      'flavor-hunter': '🎯',
      'accuracy-master': '🏆',
      'community-builder': '👥',
      'verified': '✓',
  };

    return (
      <View style={styles.badgesContainer}>
        {profile.badges.slice(0, 3).map((badge: string) => (
          <Text key={badge} style={styles.badge}>
            {badgeEmojis[badge] || '🏅'}
          </Text>
        ))}
      </View>
    );
};

  const content = (
    <View style={[styles.container, size === 'small' && styles.containerSmall]}>
      {renderAvatar()}
      
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={[styles.displayName, size === 'small' && styles.displayNameSmall]}>
            {profile.displayName || profile.username}
          </Text>
          {profile.isVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
        </View>
        
        {size !== 'small' && (
          <Text style={styles.username}>@{profile.username}</Text>
        )}
        
        {showStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.stat}>Level {profile.level}</Text>
            <Text style={styles.statSeparator}>•</Text>
            <Text style={styles.stat}>{profile.totalTastings} tastings</Text>
            {profile.followersCount !== undefined && (
              <>
                <Text style={styles.statSeparator}>•</Text>
                <Text style={styles.stat}>{profile.followersCount} followers</Text>
              </>
            )}
          </View>
        )}
        
        {size === 'large' && profile.bio && (
          <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        )}
      </View>
      
      {size !== 'small' && renderBadges()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
}

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
},
  containerSmall: {
    padding: 8,
},
  avatar: {
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
},
  avatarPlaceholder: {
    borderRadius: 50,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
},
  avatarLetter: {
    fontWeight: '600',
    color: '#666',
},
  avatarEmoji: {
    textAlign: 'center',
},
  infoContainer: {
    flex: 1,
    marginLeft: 12,
},
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
},
  displayNameSmall: {
    fontSize: 14,
},
  username: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
},
  verifiedBadge: {
    fontSize: 14,
    color: '#1DA1F2',
    marginLeft: 4,
    fontWeight: '700',
},
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
},
  stat: {
    fontSize: 12,
    color: '#95A5A6',
},
  statSeparator: {
    fontSize: 12,
    color: '#BDC3C7',
    marginHorizontal: 6,
},
  bio: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 6,
    lineHeight: 18,
},
  badgesContainer: {
    flexDirection: 'row',
    marginLeft: 8,
},
  badge: {
    fontSize: 16,
    marginLeft: 4,
},
});

export default UserProfileDisplay;