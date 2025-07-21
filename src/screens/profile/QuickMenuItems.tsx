import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { UserLevel } from '../../components/tasting-enhancement/UserLevelSelector';

interface QuickMenuItem {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  available?: boolean;
}

interface QuickMenuItemsProps {
  userLevel?: UserLevel;
}

export const QuickMenuItems: React.FC<QuickMenuItemsProps> = ({ userLevel = 'beginner' }) => {
  const navigation = useNavigation();

  const getMenuItemsForLevel = (): QuickMenuItem[] => {
    const baseItems: QuickMenuItem[] = [
      {
        title: '커피 지식',
        subtitle: '커피 용어와 기초 지식',
        icon: '📚',
        onPress: () => {
          Alert.alert('준비 중', '커피 지식 기능은 곧 업데이트됩니다.');
        },
        available: false,
      },
    ];

    const intermediateItems: QuickMenuItem[] = [
      {
        title: '향미 라이브러리',
        subtitle: '내가 저장한 향미 관리',
        icon: '🎨',
        onPress: () => {
          navigation.navigate('FlavorLibrary' as never);
        },
        available: true,
      },
      {
        title: '테이스팅 가이드',
        subtitle: '단계별 테이스팅 방법',
        icon: '🎯',
        onPress: () => {
          Alert.alert('준비 중', '테이스팅 가이드는 곧 업데이트됩니다.');
        },
        available: false,
      },
    ];

    const expertItems: QuickMenuItem[] = [
      {
        title: '블라인드 테이스팅',
        subtitle: '편견 없는 객관적 평가 (Phase 2)',
        icon: '🎭',
        onPress: () => {
          Alert.alert('준비 중', '블라인드 테이스팅은 Phase 2에서 구현 예정입니다.');
        },
        available: false,
      },
      {
        title: '추출 실험실',
        subtitle: '추출 변수와 맛의 상관관계 (Phase 2)',
        icon: '⚗️',
        onPress: () => {
          Alert.alert('준비 중', '추출 실험실은 Phase 2에서 구현 예정입니다.');
        },
        available: false,
      },
    ];

    switch (userLevel) {
      case 'beginner':
        return baseItems;
      case 'intermediate':
        return [...baseItems, ...intermediateItems];
      case 'expert':
        return [...baseItems, ...intermediateItems, ...expertItems];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItemsForLevel();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>빠른 메뉴</Text>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            !item.available && styles.disabledMenuItem
          ]}
          onPress={item.onPress}
          disabled={!item.available}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={[
              styles.menuTitle,
              !item.available && styles.disabledText
            ]}>
              {item.title}
            </Text>
            <Text style={[
              styles.menuSubtitle,
              !item.available && styles.disabledText
            ]}>
              {item.subtitle}
            </Text>
          </View>
          <Text style={[
            styles.menuArrow,
            !item.available && styles.disabledText
          ]}>
            {item.available ? '›' : '🔒'}
          </Text>
        </TouchableOpacity>
      ))}
      
      {userLevel === 'beginner' && (
        <View style={styles.levelUpHint}>
          <Text style={styles.levelUpIcon}>💡</Text>
          <Text style={styles.levelUpText}>
            더 많은 기능을 사용하려면 설정에서 경험 레벨을 변경하세요
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.white,
    paddingVertical: HIGConstants.SPACING_LG,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledMenuItem: {
    opacity: 0.6,
    backgroundColor: HIGColors.systemGray6,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: HIGColors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  menuIcon: {
    fontSize: 24,
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
  disabledText: {
    color: HIGColors.tertiaryLabel,
  },
  menuArrow: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
  },
  levelUpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemBlue + '15',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginTop: HIGConstants.SPACING_SM,
    gap: HIGConstants.SPACING_SM,
  },
  levelUpIcon: {
    fontSize: 16,
  },
  levelUpText: {
    flex: 1,
    fontSize: 14,
    color: HIGColors.systemBlue,
    lineHeight: 20,
  },
});