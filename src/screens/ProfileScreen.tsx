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
import AuthService from '../services/supabase/auth';
import { AchievementSummaryCard } from '../components/achievements/AchievementSummaryCard';
import { useAchievements } from '../hooks/useAchievements';
import { useDevStore } from '../stores/useDevStore';

// Tab navigation type definition
type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Stats: undefined;
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
  const { achievements, stats: achievementStats, getNextAchievement, isLoading: isLoadingAchievements, error: achievementError } = useAchievements();
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
        const roasterCounts = {};
        tastings.forEach(tasting => {
          const roaster = tasting.roastery;
          roasterCounts[roaster] = (roasterCounts[roaster] || 0) + 1;
        });
        
        const favoriteRoaster = Object.keys(roasterCounts).reduce((a, b) => 
          roasterCounts[a] > roasterCounts[b] ? a : b
        , '') || 'None';

        // 가입일부터 경과 일수 계산 (임시로 테이스팅 데이터 기준)
        const joinedDaysAgo = tastings.length > 0 
          ? Math.floor((Date.now() - new Date(tastings[tastings.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
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
          <Text style={styles.navigationTitle}>프로필</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <View style={{ width: 80 }} />
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

        {/* 나의 업적 섹션 */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>나의 업적</Text>
          {achievementError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>업적 시스템을 불러올 수 없습니다</Text>
              <Text style={styles.errorSubtext}>{achievementError}</Text>
            </View>
          ) : isLoadingAchievements ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>업적 정보 로딩 중...</Text>
            </View>
          ) : (
            <>
              {/* 업적 통계 카드들 */}
              <View style={styles.achievementStatsGrid}>
                <TouchableOpacity 
                  style={styles.achievementStatCard}
                  onPress={() => navigation.navigate('AchievementGallery' as never)}
                >
                  <Text style={styles.achievementStatNumber}>{achievementStats.unlockedAchievements}</Text>
                  <Text style={styles.achievementStatLabel}>달성한 업적</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.achievementStatCard}
                  onPress={() => navigation.navigate('AchievementGallery' as never)}
                >
                  <Text style={styles.achievementStatNumber}>{Math.round((achievementStats.unlockedAchievements / Math.max(achievementStats.totalAchievements, 1)) * 100)}%</Text>
                  <Text style={styles.achievementStatLabel}>완료율</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.achievementStatCard}
                  onPress={() => navigation.navigate('AchievementGallery' as never)}
                >
                  <Text style={styles.achievementStatNumber}>{achievementStats.totalPoints}</Text>
                  <Text style={styles.achievementStatLabel}>포인트</Text>
                </TouchableOpacity>
              </View>

              {/* 다음 목표 */}
              {getNextAchievement() && (
                <TouchableOpacity 
                  style={styles.nextGoalCard}
                  onPress={() => navigation.navigate('AchievementGallery' as never)}
                >
                  <View style={styles.nextGoalHeader}>
                    <Text style={styles.nextGoalIcon}>🎯</Text>
                    <Text style={styles.nextGoalTitle}>다음 목표</Text>
                    <Text style={styles.nextGoalArrow}>›</Text>
                  </View>
                  <View style={styles.nextGoalContent}>
                    <Text style={styles.nextGoalIcon}>{getNextAchievement()?.icon}</Text>
                    <View style={styles.nextGoalInfo}>
                      <Text style={styles.nextGoalName}>{getNextAchievement()?.title}</Text>
                      <Text style={styles.nextGoalProgress}>
                        {Math.round((getNextAchievement()?.progress || 0) * 100)}% 완료
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* 전체 업적 보기 버튼 */}
              <TouchableOpacity 
                style={styles.viewAllAchievementsButton}
                onPress={() => navigation.navigate('AchievementGallery' as never)}
              >
                <Text style={styles.viewAllAchievementsText}>전체 업적 보기</Text>
                <Text style={styles.viewAllAchievementsArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}
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
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  betaBadge: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '700',
    color: HIGColors.white,
    letterSpacing: 0.5,
  },
  languageSwitch: {},
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: HIGColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  email: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
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
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  achievementStatsGrid: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_LG,
  },
  achievementStatCard: {
    flex: 1,
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.systemBlue,
    marginBottom: 4,
  },
  achievementStatLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  nextGoalCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  nextGoalIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  nextGoalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  nextGoalArrow: {
    fontSize: 20,
    color: HIGColors.systemGray4,
  },
  nextGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextGoalInfo: {
    flex: 1,
    marginLeft: HIGConstants.SPACING_MD,
  },
  nextGoalName: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 2,
  },
  nextGoalProgress: {
    fontSize: 13,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  viewAllAchievementsButton: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllAchievementsText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
    marginRight: HIGConstants.SPACING_SM,
  },
  viewAllAchievementsArrow: {
    fontSize: 16,
    color: HIGColors.white,
    fontWeight: '300',
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
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: HIGConstants.SPACING_LG,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIGColors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  menuArrow: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
  },
  signOutContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  signOutButton: {
    backgroundColor: HIGColors.red,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.systemRed,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.systemRed,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  errorSubtext: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
  },
  loadingText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
});

export default ProfileScreen;