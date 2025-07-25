import React from 'react';
import {
  UserInfoCard,
  UserAvatar,
  UserAvatarText,
  UserDetails,
  UserName,
  UserEmail,
  UserBadges,
  UserBadge,
  UserBadgeText,
} from './DeveloperScreenStyles';

interface UserInfoSectionProps {
  userName?: string;
  userEmail?: string;
  isDeveloper: boolean;
  isBetaUser: boolean;
  isAdmin?: boolean;
}

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  userName = '개발자',
  userEmail = 'dev@cupnote.app',
  isDeveloper,
  isBetaUser,
  isAdmin = false,
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBadges = () => {
    const badges = [];
    
    if (isDeveloper) {
      badges.push({
        type: 'developer' as const,
        label: '개발자',
      });
    }
    
    if (isBetaUser) {
      badges.push({
        type: 'beta' as const,
        label: '베타',
      });
    }
    
    if (isAdmin) {
      badges.push({
        type: 'admin' as const,
        label: '관리자',
      });
    }
    
    return badges;
  };

  return (
    <UserInfoCard>
      <UserAvatar>
        <UserAvatarText>{getInitials(userName)}</UserAvatarText>
      </UserAvatar>
      
      <UserDetails>
        <UserName>{userName}</UserName>
        <UserEmail>{userEmail}</UserEmail>
        
        <UserBadges>
          {getBadges().map((badge, index) => (
            <UserBadge key={index} type={badge.type}>
              <UserBadgeText type={badge.type}>
                {badge.label}
              </UserBadgeText>
            </UserBadge>
          ))}
        </UserBadges>
      </UserDetails>
    </UserInfoCard>
  );
};