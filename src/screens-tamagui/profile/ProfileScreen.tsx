import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  styled,
  ScrollView,
  H2,
  H3,
  Avatar,
  Circle,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUserStore } from '../../stores/useUserStore';
import RealmService from '../../services/realm/RealmService';
import { useDevStore } from '../../stores/useDevStore';

import { Logger } from '../../services/LoggingService';
// Tab navigation type definition
type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  AddCoffee: undefined;
  Achievements: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

interface MenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
}

interface ProfileScreenProps {
  hideNavBar?: boolean;
}

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
  // Ensure container fills the screen properly
  width: '100%',
  height: '100%',
})

const NavigationBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const TitleContainer = styled(XStack, {
  alignItems: 'center',
  gap: '$xs',
})

const NavigationTitle = styled(Text, {
  fontSize: 17,
  fontWeight: '600',
  color: '$color',
  fontFamily: '$heading',
})

const BetaBadge = styled(XStack, {
  backgroundColor: '$primary',
  paddingHorizontal: '$xs',
  paddingVertical: 2,
  borderRadius: '$1',
  alignItems: 'center',
  justifyContent: 'center',
})

const BetaText = styled(Text, {
  fontSize: 10,
  fontWeight: '700',
  color: 'white',
  fontFamily: '$body',
  letterSpacing: 0.5,
})

const ProfileHeader = styled(YStack, {
  alignItems: 'center',
  paddingVertical: '$xl',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
})

const AvatarContainer = styled(YStack, {
  marginBottom: '$md',
  alignItems: 'center',
})

const StyledAvatar = styled(Circle, {
  size: 80,
  backgroundColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
})

const AvatarText = styled(Text, {
  fontSize: 32,
  fontWeight: '600',
  color: 'white',
  fontFamily: '$heading',
})

const Username = styled(H2, {
  fontSize: 22,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
  textAlign: 'center',
})

const Email = styled(Text, {
  fontSize: 16,
  color: '$gray11',
  fontFamily: '$body',
  textAlign: 'center',
})

const MenuContainer = styled(YStack, {
  paddingHorizontal: '$lg',
  marginBottom: '$lg',
  gap: '$sm',
})

const SectionTitle = styled(H3, {
  fontSize: 20,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
})

const MenuItem = styled(Card, {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '$gray2',
  paddingVertical: '$md',
  paddingHorizontal: '$lg',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
})

const MenuIconContainer = styled(Circle, {
  size: 44,
  backgroundColor: '$gray6',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '$md',
})

const MenuIcon = styled(Text, {
  fontSize: 24,
})

const MenuContent = styled(YStack, {
  flex: 1,
  gap: '$xs',
})

const MenuTitle = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: '$color',
  fontFamily: '$body',
})

const MenuSubtitle = styled(Text, {
  fontSize: 14,
  color: '$gray11',
  fontFamily: '$body',
})

const MenuArrow = styled(Text, {
  fontSize: 20,
  color: '$gray10',
  marginLeft: '$sm',
})

const SignOutContainer = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingBottom: '$xl',
})

const SignOutButton = styled(Button, {
  backgroundColor: '$error',
  height: 48,
  borderRadius: '$3',
})

const SignOutText = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
  fontFamily: '$body',
})

// StatCard styled like HomeScreen
const StatCard = styled(YStack, {
  name: 'StatCard',
  flex: 1,
  backgroundColor: 'transparent',
  padding: '$sm',
  paddingVertical: '$md',
  alignItems: 'center',
  minHeight: '$statCardSmall',
  
  // WCAG 2.4.7 Focus Visible - Enhanced accessibility
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    shadowColor: '$focusRing',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    outlineColor: '$focusRing',
    outlineWidth: 2,
    outlineOffset: 2,
},
})

const ProfileScreenTamagui: React.FC<ProfileScreenProps> = ({ hideNavBar = true }) => {
  Logger.debug(' ProfileScreen: Component rendering...', 'screen', { component: 'ProfileScreen' });
  
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { currentUser, signOut } = useUserStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevStore();
  const [stats, setStats] = useState({
    joinedDaysAgo: 0,
    achievementCount: 0,
    favoriteRoaster: 'None',
});
  const [isLoading, setIsLoading] = useState(true);

  const realmService = RealmService.getInstance();

  useEffect(() => {
    Logger.debug(' ProfileScreen: useEffect triggered', 'screen', { component: 'ProfileScreen' });
    const timeoutId = setTimeout(() => {
      loadUserStats();
  }, 100); // 작은 지연으로 렌더링 블로킹 방지
    
    return () => clearTimeout(timeoutId);
}, []);

  const loadUserStats = async () => {
    try {
      Logger.debug(' ProfileScreen: Loading user stats...', 'screen', { component: 'ProfileScreen' });
      
      if (!realmService.isInitialized) {
        Logger.debug('ProfileScreen: Realm not initialized, skipping stats load', 'screen', { component: 'ProfileScreen' });
        setIsLoading(false);
        return;
    }
      
      const realm = realmService.getRealm();
      if (!realm) {
        Logger.debug('ProfileScreen: No realm instance available', 'screen', { component: 'ProfileScreen' });
        setIsLoading(false);
        return;
    }
      
      const tastings = Array.from(realm.objects('TastingRecord').filtered('isDeleted = false'));
      Logger.debug(`ProfileScreen: Found ${tastings.length} tastings`, 'screen', { component: 'ProfileScreen' });
      
      if (tastings.length === 0) {
        setStats({
          joinedDaysAgo: 0,
          achievementCount: 0,
          favoriteRoaster: 'None',
      });
        setIsLoading(false);
        return;
    }
      
      // Find most visited roaster
      const roasterCounts: Record<string, number> = {};
      tastings.forEach((tasting: unknown) => {
        const roaster = tasting.roastery;
        if (roaster && typeof roaster === 'string') {
          roasterCounts[roaster] = (roasterCounts[roaster] || 0) + 1;
      }
    });
      
      const favoriteRoaster = Object.keys(roasterCounts).length > 0 
        ? Object.keys(roasterCounts).reduce((a, b) => 
            roasterCounts[a] > roasterCounts[b] ? a : b
          )
        : 'None';

      // Calculate days since joining (use earliest record)
      const earliestTasting = tastings.reduce((earliest: unknown, current: unknown) => {
        return new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest;
    }, tastings[0]);
      
      const joinedDaysAgo = earliestTasting 
        ? Math.floor((Date.now() - new Date(earliestTasting.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const newStats = {
        joinedDaysAgo,
        achievementCount: Math.min(tastings.length, 15),
        favoriteRoaster,
    };
      
      Logger.debug('ProfileScreen: Stats loaded:', 'screen', { component: 'ProfileScreen', data: newStats });
      setStats(newStats);
      
  } catch (error) {
      Logger.error('ProfileScreen: Error loading stats:', 'screen', { component: 'ProfileScreen', error: error });
      // Set default stats on error
      setStats({
        joinedDaysAgo: 0,
        achievementCount: 0,
        favoriteRoaster: 'None',
    });
  } finally {
      setIsLoading(false);
  }
};

  const handleSignOut = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive', 
          onPress: async () => {
            try {
              Logger.debug('🔐 ProfileScreen: Signing out...', 'screen', { component: 'ProfileScreen' });
              await signOut();
              Logger.debug('ProfileScreen: Sign out completed', 'screen', { component: 'ProfileScreen' });
              // Reset은 상위 네비게이터에서 처리하도록 변경
          } catch (error) {
              Logger.error('ProfileScreen: Sign out error:', 'screen', { component: 'ProfileScreen', error: error });
          }
        }
      },
      ]
    );
};

  const menuItems: MenuItem[] = [
    {
      title: '설정',
      subtitle: '앱 설정 및 환경설정',
      icon: '',
      onPress: () => {
        Alert.alert('설정', '설정 화면은 추후 구임 예정입니다.');
    }
  },
    isDeveloperMode ? {
      title: '개발자 모드',
      subtitle: '디버깅 및 개발 도구',
      icon: '',
      onPress: () => {
        navigation.navigate('Developer' as never);
    }
  } : {
      title: '개발자 모드 활성화',
      subtitle: '개발자 도구 사용하기',
      icon: '',
      onPress: () => {
        Alert.alert(
          '개발자 모드 활성화',
          '개발자 모드를 활성화하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '활성화', 
              onPress: () => {
                toggleDeveloperMode();
                Alert.alert('완료', '개발자 모드가 활성화되었습니다. 상단의 DEV 배지를 탭하여 비활성화할 수 있습니다.');
            }
          }
          ]
        );
    }
  },
    {
      title: '도움말',
      subtitle: '앱 사용법 및 FAQ',
      icon: '',
      onPress: () => {
        Alert.alert('도움말', '도움말 화면은 추후 구현 예정입니다.');
    }
  },
  ];

  Logger.debug(' ProfileScreen: About to render, isLoading:', 'screen', { component: 'ProfileScreen', data: isLoading });
  
  if (isLoading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text fontSize="$6" color="$gray11">프로필 로딩 중...</Text>
          </YStack>
        </SafeAreaView>
      </Container>
    );
}

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          {/* Navigation Bar */}
          {!hideNavBar && (
            <NavigationBar>
              <TitleContainer>
                <NavigationTitle>Profile</NavigationTitle>
                <BetaBadge>
                  <BetaText>BETA</BetaText>
                </BetaBadge>
              </TitleContainer>
            </NavigationBar>
          )}

          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Profile Header */}
            <ProfileHeader>
              <AvatarContainer>
                <StyledAvatar>
                  <AvatarText>
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarText>
                </StyledAvatar>
              </AvatarContainer>
              <Username>{currentUser?.username || 'User'}</Username>
              <Email>{currentUser?.email || 'user@example.com'}</Email>
            </ProfileHeader>

            {/* Stats Section */}
            <YStack paddingHorizontal="$lg" marginBottom="$lg">
              <XStack justifyContent="space-between" marginBottom="$md">
                <StatCard>
                  <Text 
                    fontSize="$6" 
                    fontWeight="600" 
                    color="$cupBlue"
                    marginBottom="$xxs"
                  >
                    {stats.joinedDaysAgo}
                  </Text>
                  <Text 
                    fontSize="$3" 
                    color="$color"
                    textAlign="center"
                  >
                    가입 일수
                  </Text>
                </StatCard>
                
                {/* Vertical Separator */}
                <YStack 
                  width={1} 
                  backgroundColor="$gray5" 
                  marginVertical="$sm"
                />
                
                <StatCard>
                  <Text 
                    fontSize="$6" 
                    fontWeight="600" 
                    color="$cupBlue"
                    marginBottom="$xxs"
                  >
                    {stats.achievementCount}
                  </Text>
                  <Text 
                    fontSize="$3" 
                    color="$color"
                    textAlign="center"
                  >
                    달성 업적
                  </Text>
                </StatCard>
                
                {/* Vertical Separator */}
                <YStack 
                  width={1} 
                  backgroundColor="$gray5" 
                  marginVertical="$sm"
                />
                
                <StatCard>
                  <Text 
                    fontSize="$6" 
                    fontWeight="600" 
                    color="$cupBlue"
                    marginBottom="$xxs"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {stats.favoriteRoaster}
                  </Text>
                  <Text 
                    fontSize="$3" 
                    color="$color"
                    textAlign="center"
                  >
                    최애 로스터리
                  </Text>
                </StatCard>
              </XStack>
            </YStack>

            {/* Menu Items */}
            <MenuContainer>
              <SectionTitle>앱 기능</SectionTitle>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onPress={item.onPress}
                >
                  <MenuIconContainer>
                    <MenuIcon>{item.icon}</MenuIcon>
                  </MenuIconContainer>
                  <MenuContent>
                    <MenuTitle>{item.title}</MenuTitle>
                    {item.subtitle && (
                      <MenuSubtitle>{item.subtitle}</MenuSubtitle>
                    )}
                  </MenuContent>
                  <MenuArrow>›</MenuArrow>
                </MenuItem>
              ))}
            </MenuContainer>

            {/* Sign Out Button */}
            <SignOutContainer>
              <SignOutButton
                onPress={handleSignOut}
              >
                <SignOutText>로그아웃</SignOutText>
              </SignOutButton>
            </SignOutContainer>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Container>
  );
};

export default ProfileScreenTamagui;