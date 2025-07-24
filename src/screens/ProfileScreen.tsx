import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUserStore } from '../stores/useUserStore';
import RealmService from '../services/realm/RealmService';
import { HIGConstants, HIGColors, commonButtonStyles } from '../styles/common';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';
import AuthService from '../services/supabase/auth';
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

const ProfileScreen = () => {
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
        
        // 가장 많이 방문한 로스터 찾기
        const roasterCounts: Record<string, number> = {};
        tastings.forEach((tasting: any) => {
          const roaster = tasting.roastery;
          roasterCounts[roaster] = (roasterCounts[roaster] || 0) + 1;
        });
        
        const favoriteRoaster = Object.keys(roasterCounts).reduce((a, b) => 
          roasterCounts[a] > roasterCounts[b] ? a : b
        , '') || 'None';

        // 가입일부터 경과 일수 계산 (임시로 테이스팅 데이터 기준)
        const joinedDaysAgo = tastings.length > 0 
          ? Math.floor((Date.now() - new Date((tastings[tastings.length - 1] as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setStats({
          joinedDaysAgo,
          achievementCount: Math.min(tastings.length, 15), // 임시 achievement 계산
          favoriteRoaster,
        });
      }
    } catch (error) {
      // console.error('Error loading user stats:', error);
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



  const menuItems = [
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
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>Profile</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <StatusBadge />
      </View>

      <ScrollView style={styles.scrollView}>

        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.username}>{currentUser?.username || 'User'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'user@example.com'}</Text>
        </View>



        {/* 메뉴 아이템 */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>앱 기능</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={[commonButtonStyles.buttonSecondary, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOSColors.systemBackground,
  },
  navigationBar: {
    height: IOSLayout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: IOSSpacing.screenPadding,
    backgroundColor: IOSColors.systemBackground,
    borderBottomWidth: IOSLayout.borderWidthThin,
    borderBottomColor: IOSColors.separator,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: IOSSpacing.xs,
  },
  navigationTitle: {
    ...IOSTypography.headline,
    color: IOSColors.label,
  },
  betaBadge: {
    backgroundColor: IOSColors.systemBlue,
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: IOSSpacing.xxxs,
    borderRadius: IOSLayout.cornerRadiusSmall,
  },
  betaText: {
    ...IOSTypography.caption2,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
    letterSpacing: 0.5,
  },
  languageSwitch: {},
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: IOSSpacing.xl,
    paddingHorizontal: IOSSpacing.screenPadding,
    backgroundColor: IOSColors.systemBackground,
  },
  avatarContainer: {
    marginBottom: IOSSpacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: IOSColors.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: IOSColors.systemBackground,
  },
  username: {
    ...IOSTypography.title2,
    color: IOSColors.label,
    marginBottom: IOSSpacing.xxs,
  },
  email: {
    ...IOSTypography.callout,
    color: IOSColors.secondaryLabel,
  },
  statsContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_MD,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.blue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  favoriteRoaster: {
    borderTopWidth: 1,
    borderTopColor: HIGColors.gray4,
    paddingTop: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  favoriteLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  favoriteValue: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  
  // Achievement Styles
  achievementSection: {
    paddingHorizontal: IOSSpacing.screenPadding,
    marginBottom: IOSSpacing.lg,
  },
  sectionTitle: {
    ...IOSTypography.title3,
    color: IOSColors.label,
    marginBottom: IOSSpacing.md,
  },
  achievementStatsGrid: {
    flexDirection: 'row',
    gap: IOSSpacing.sm,
    marginBottom: IOSSpacing.lg,
  },
  achievementStatCard: {
    flex: 1,
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.md,
    alignItems: 'center',
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.separator,
    ...IOSShadows.small,
  },
  achievementStatNumber: {
    ...IOSTypography.title2,
    fontWeight: '700' as const,
    color: IOSColors.systemBlue,
    marginBottom: IOSSpacing.xxs,
  },
  achievementStatLabel: {
    ...IOSTypography.caption1,
    color: IOSColors.secondaryLabel,
    textAlign: 'center',
  },
  nextGoalCard: {
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.lg,
    marginBottom: IOSSpacing.md,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.separator,
    ...IOSShadows.small,
  },
  nextGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IOSSpacing.md,
  },
  nextGoalIcon: {
    fontSize: IOSLayout.iconSizeMedium,
    marginRight: IOSSpacing.sm,
  },
  nextGoalTitle: {
    flex: 1,
    ...IOSTypography.headline,
    color: IOSColors.label,
  },
  nextGoalArrow: {
    fontSize: IOSLayout.iconSizeMedium,
    color: IOSColors.tertiaryLabel,
  },
  nextGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextGoalInfo: {
    flex: 1,
    marginLeft: IOSSpacing.md,
  },
  nextGoalName: {
    ...IOSTypography.subheadline,
    fontWeight: '500' as const,
    color: IOSColors.label,
    marginBottom: IOSSpacing.xxxs,
  },
  nextGoalProgress: {
    ...IOSTypography.footnote,
    color: IOSColors.systemBlue,
    fontWeight: '500' as const,
  },
  viewAllAchievementsButton: {
    backgroundColor: IOSColors.systemBlue,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...IOSShadows.small,
  },
  viewAllAchievementsText: {
    ...IOSTypography.headline,
    color: IOSColors.systemBackground,
    marginRight: IOSSpacing.sm,
  },
  viewAllAchievementsArrow: {
    ...IOSTypography.body,
    color: IOSColors.systemBackground,
    fontWeight: '300' as const,
  },
  quickMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginBottom: HIGConstants.SPACING_SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickMenuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: HIGColors.gray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  quickMenuIcon: {
    fontSize: 24,
  },
  quickMenuContent: {
    flex: 1,
  },
  quickMenuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  quickMenuDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  quickMenuArrow: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
  },
  
  menuContainer: {
    paddingHorizontal: IOSSpacing.screenPadding,
    marginBottom: IOSSpacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    paddingVertical: IOSSpacing.md,
    paddingHorizontal: IOSSpacing.lg,
    borderRadius: IOSLayout.cornerRadiusMedium,
    marginBottom: IOSSpacing.sm,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.separator,
    ...IOSShadows.small,
  },
  menuIconContainer: {
    width: IOSLayout.minTouchTarget,
    height: IOSLayout.minTouchTarget,
    borderRadius: IOSLayout.minTouchTarget / 2,
    backgroundColor: IOSColors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: IOSSpacing.md,
  },
  menuIcon: {
    fontSize: IOSLayout.iconSizeMedium,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...IOSTypography.body,
    fontWeight: '600' as const,
    color: IOSColors.label,
    marginBottom: IOSSpacing.xxxs,
  },
  menuSubtitle: {
    ...IOSTypography.footnote,
    color: IOSColors.secondaryLabel,
  },
  menuArrow: {
    fontSize: IOSLayout.iconSizeMedium,
    color: IOSColors.tertiaryLabel,
  },
  signOutContainer: {
    paddingHorizontal: IOSSpacing.screenPadding,
    paddingBottom: IOSSpacing.xl,
  },
  signOutButton: {
    backgroundColor: IOSColors.systemRed,
    minHeight: IOSLayout.buttonHeightLarge,
    borderRadius: IOSLayout.cornerRadiusMedium,
  },
  signOutText: {
    ...IOSTypography.body,
    fontWeight: '600' as const,
    color: IOSColors.systemBackground,
  },
  errorContainer: {
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.lg,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.systemRed,
  },
  errorText: {
    ...IOSTypography.headline,
    color: IOSColors.systemRed,
    textAlign: 'center',
    marginBottom: IOSSpacing.sm,
  },
  errorSubtext: {
    ...IOSTypography.footnote,
    color: IOSColors.secondaryLabel,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.lg,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.separator,
  },
  loadingText: {
    ...IOSTypography.body,
    color: IOSColors.secondaryLabel,
    textAlign: 'center',
  },
});

export default ProfileScreen;