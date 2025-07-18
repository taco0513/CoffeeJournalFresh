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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, signOut } = useUserStore();
  const [stats, setStats] = useState({
    totalTastings: 0,
    avgScore: 0,
    favoriteRoaster: '',
    tastingStreak: 0,
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
        
        const totalTastings = tastings.length;
        const avgScore = totalTastings > 0 
          ? tastings.reduce((sum, tasting) => sum + tasting.matchScoreTotal, 0) / totalTastings 
          : 0;
        
        // 가장 많이 방문한 로스터 찾기
        const roasterCounts = {};
        tastings.forEach(tasting => {
          const roaster = tasting.roastery;
          roasterCounts[roaster] = (roasterCounts[roaster] || 0) + 1;
        });
        
        const favoriteRoaster = Object.keys(roasterCounts).reduce((a, b) => 
          roasterCounts[a] > roasterCounts[b] ? a : b
        , '') || 'None';

        setStats({
          totalTastings,
          avgScore: Math.round(avgScore),
          favoriteRoaster,
          tastingStreak: Math.min(totalTastings, 7), // 임시 스트릭 계산
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
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
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: '사진 갤러리',
      icon: '📸',
      onPress: () => {
        navigation.navigate('PhotoGallery' as never);
      }
    },
    {
      title: '설정',
      icon: '⚙️',
      onPress: () => {
        // 설정 화면으로 이동 (추후 구현)
        Alert.alert('설정', '설정 화면은 추후 구현 예정입니다.');
      }
    },
    {
      title: '데이터 내보내기',
      icon: '📤',
      onPress: () => {
        navigation.navigate('Export' as never);
      }
    },
    {
      title: '데이터 테스트',
      icon: '🧪',
      onPress: () => {
        navigation.navigate('DataTest' as never);
      }
    },
    {
      title: '도움말',
      icon: '❓',
      onPress: () => {
        Alert.alert('도움말', '도움말 화면은 추후 구현 예정입니다.');
      }
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.username}>{currentUser?.username || 'Guest'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'guest@example.com'}</Text>
        </View>

        {/* 통계 카드 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>내 테이스팅 통계</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalTastings}</Text>
                <Text style={styles.statLabel}>총 테이스팅</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.avgScore}</Text>
                <Text style={styles.statLabel}>평균 점수</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.tastingStreak}</Text>
                <Text style={styles.statLabel}>연속 기록</Text>
              </View>
            </View>
            <View style={styles.favoriteRoaster}>
              <Text style={styles.favoriteLabel}>선호 로스터</Text>
              <Text style={styles.favoriteValue}>{stats.favoriteRoaster}</Text>
            </View>
          </View>
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
    backgroundColor: HIGColors.systemBackground,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
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
    backgroundColor: HIGColors.systemBackground,
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
  menuContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemBackground,
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