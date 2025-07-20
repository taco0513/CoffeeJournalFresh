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
import { useUserStore } from '../stores/useUserStore';
import RealmService from '../services/realm/RealmService';
import { HIGConstants, HIGColors, commonButtonStyles } from '../styles/common';
import AuthService from '../services/supabase/auth';
import { generateGuestStats } from '../utils/guestMockData';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, signOut } = useUserStore();
  const [stats, setStats] = useState({
    joinedDaysAgo: 0,
    achievementCount: 0,
    favoriteRoaster: '',
  });

  // 게스트 모드 체크
  const isGuestMode = currentUser?.username === 'Guest' || !currentUser;

  const realmService = RealmService.getInstance();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // 게스트 모드인 경우 mock 데이터 사용
      if (isGuestMode) {
        setStats({
          joinedDaysAgo: 45,
          achievementCount: 8,
          favoriteRoaster: 'Blue Bottle Coffee',
        });
        return;
      }

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
    // Feature Backlog - Photo Gallery
    // {
    //   title: '사진 갤러리',
    //   icon: '📸',
    //   onPress: () => {
    //     navigation.navigate('PhotoGallery' as never);
    //   }
    // },
    // Feature Backlog - Settings
    // {
    //   title: '설정',
    //   icon: '⚙️',
    //   onPress: () => {
    //     // 설정 화면으로 이동 (추후 구현)
    //     Alert.alert('설정', '설정 화면은 추후 구현 예정입니다.');
    //   }
    // },
    {
      title: '개발자 모드',
      icon: '⚙️',
      onPress: () => {
        navigation.navigate('DeveloperScreen' as never);
      }
    },
    {
      title: '데이터 테스트',
      icon: '🧪',
      onPress: () => {
        navigation.navigate('DataTest' as never);
      }
    },
    // Feature Backlog - Help
    // {
    //   title: '도움말',
    //   icon: '❓',
    //   onPress: () => {
    //     Alert.alert('도움말', '도움말 화면은 추후 구현 예정입니다.');
    //   }
    // },
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
        {/* 게스트 모드 안내 */}
        {isGuestMode && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>🔍 게스트 모드로 둘러보는 중입니다</Text>
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => navigation.navigate('Auth' as never)}
            >
              <Text style={styles.loginPromptText}>로그인하고 나만의 기록 시작하기 →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.username}>{currentUser?.username || 'Guest'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'guest@example.com'}</Text>
        </View>

        {/* 빠른 메뉴 */}
        <View style={styles.quickMenuContainer}>
          <TouchableOpacity 
            style={styles.quickMenuItem}
            onPress={() => navigation.navigate('Stats' as never)}
          >
            <View style={styles.quickMenuIconContainer}>
              <Text style={styles.quickMenuIcon}>📊</Text>
            </View>
            <View style={styles.quickMenuContent}>
              <Text style={styles.quickMenuTitle}>내 테이스팅 통계</Text>
              <Text style={styles.quickMenuDescription}>상세한 분석과 차트 보기</Text>
            </View>
            <Text style={styles.quickMenuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickMenuItem}
            onPress={() => navigation.navigate('PersonalTasteDashboard' as never)}
          >
            <View style={styles.quickMenuIconContainer}>
              <Text style={styles.quickMenuIcon}>🎯</Text>
            </View>
            <View style={styles.quickMenuContent}>
              <Text style={styles.quickMenuTitle}>취향 분석</Text>
              <Text style={styles.quickMenuDescription}>나만의 커피 DNA 확인</Text>
            </View>
            <Text style={styles.quickMenuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickMenuItem}
            onPress={() => Alert.alert('준비 중', '곧 추가될 예정입니다!')}
          >
            <View style={styles.quickMenuIconContainer}>
              <Text style={styles.quickMenuIcon}>🏆</Text>
            </View>
            <View style={styles.quickMenuContent}>
              <Text style={styles.quickMenuTitle}>나의 업적</Text>
              <Text style={styles.quickMenuDescription}>획득한 배지와 마일스톤</Text>
            </View>
            <Text style={styles.quickMenuArrow}>→</Text>
          </TouchableOpacity>
        </View>


        {/* 메뉴 아이템 */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃/로그인 버튼 */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={[commonButtonStyles.buttonSecondary, styles.signOutButton]}
            onPress={isGuestMode ? 
              () => navigation.navigate('Auth' as never) : 
              handleSignOut
            }
          >
            <Text style={styles.signOutText}>
              {isGuestMode ? '로그인' : '로그아웃'}
            </Text>
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
  guestNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    margin: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  guestNoticeText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  loginPromptButton: {
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  loginPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
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
  
  // Quick Menu Styles
  quickMenuContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
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
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginBottom: HIGConstants.SPACING_SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    marginRight: HIGConstants.SPACING_MD,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
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
});

export default ProfileScreen;