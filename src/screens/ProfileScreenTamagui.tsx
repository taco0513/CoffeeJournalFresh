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
import { useUserStore } from '../stores/useUserStore';
import RealmService from '../services/realm/RealmService';
import { useDevStore } from '../stores/useDevStore';
import StatusBadge from '../components/StatusBadge';

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

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
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
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
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
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
  
  pressStyle: {
    backgroundColor: '$gray3',
    scale: 0.98,
  },
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
  
  pressStyle: {
    backgroundColor: '$red9',
    scale: 0.98,
  },
})

const SignOutText = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
  fontFamily: '$body',
})

const ProfileScreenTamagui = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { currentUser, signOut } = useUserStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevStore();
  const [stats, setStats] = useState({
    joinedDaysAgo: 0,
    achievementCount: 0,
    favoriteRoaster: '',
  });

  const realmService = RealmService.getInstance();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      if (realmService.isInitialized) {
        const realm = realmService.getRealm();
        const tastings = realm.objects('TastingRecord').filtered('isDeleted = false');
        
        // Find most visited roaster
        const roasterCounts: Record<string, number> = {};
        tastings.forEach((tasting: any) => {
          const roaster = tasting.roastery;
          roasterCounts[roaster] = (roasterCounts[roaster] || 0) + 1;
        });
        
        const favoriteRoaster = Object.keys(roasterCounts).reduce((a, b) => 
          roasterCounts[a] > roasterCounts[b] ? a : b
        , '') || 'None';

        // Calculate days since joining
        const joinedDaysAgo = tastings.length > 0 
          ? Math.floor((Date.now() - new Date((tastings[tastings.length - 1] as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setStats({
          joinedDaysAgo,
          achievementCount: Math.min(tastings.length, 15),
          favoriteRoaster,
        });
      }
    } catch (error) {
      // Handle error silently
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
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' as never }],
            });
          }
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      title: '설정',
      subtitle: '앱 설정 및 환경설정',
      icon: '⚙️',
      onPress: () => {
        Alert.alert('설정', '설정 화면은 추후 구현 예정입니다.');
      }
    },
    isDeveloperMode ? {
      title: '개발자 모드',
      subtitle: '디버깅 및 개발 도구',
      icon: '🔧',
      onPress: () => {
        navigation.navigate('DeveloperScreen' as never);
      }
    } : {
      title: '개발자 모드 활성화',
      subtitle: '개발자 도구 사용하기',
      icon: '🔓',
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
      icon: '❓',
      onPress: () => {
        Alert.alert('도움말', '도움말 화면은 추후 구현 예정입니다.');
      }
    },
  ];

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          {/* Navigation Bar */}
          <NavigationBar>
            <TitleContainer>
              <NavigationTitle>Profile</NavigationTitle>
              <BetaBadge animation="lazy">
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <StatusBadge />
          </NavigationBar>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Profile Header */}
            <ProfileHeader animation="lazy">
              <AvatarContainer>
                <StyledAvatar animation="bouncy">
                  <AvatarText>
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarText>
                </StyledAvatar>
              </AvatarContainer>
              <Username>{currentUser?.username || 'User'}</Username>
              <Email>{currentUser?.email || 'user@example.com'}</Email>
            </ProfileHeader>

            {/* Menu Items */}
            <MenuContainer>
              <SectionTitle>앱 기능</SectionTitle>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onPress={item.onPress}
                  animation="quick"
                  enterStyle={{
                    opacity: 0,
                    y: 20,
                  }}
                  style={{
                    animationDelay: index * 50,
                  }}
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
                animation="quick"
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