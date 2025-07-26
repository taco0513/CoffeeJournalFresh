import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

export type UserLevel = 'beginner' | 'intermediate' | 'expert';

interface UserLevelSelectorProps {
  onSelectLevel: (level: UserLevel) => void;
}

interface LevelOption {
  level: UserLevel;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const levelOptions: LevelOption[] = [
  {
    level: 'beginner',
    icon: '',
    title: '이제 막 시작했어요',
    description: '커피 테이스팅이 처음이신가요?',
    features: [
      '간단한 향미 선택 (5개 카테고리)',
      '친절한 가이드 메시지',
      '기본 감각 평가',
    ],
},
  {
    level: 'intermediate',
    icon: 'Intermediate',
    title: '어느 정도 익숙해요',
    description: '여러 번 테이스팅해보셨나요?',
    features: [
      '전체 향미 휠 사용',
      '상세한 감각 평가',
      '이전 기록과 비교',
    ],
},
  {
    level: 'expert',
    icon: 'Expert',
    title: '전문가예요 (Phase 2)',
    description: 'Lab Mode 기능들이 Phase 2에서 제공됩니다',
    features: [
      '상세한 감각 평가',
      '고급 비교 기능',
      '전문 용어 사용 (Phase 2에서 더 많은 기능)',
    ],
},
];

export const UserLevelSelector: React.FC<UserLevelSelectorProps> = ({
  onSelectLevel,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>당신의 커피 경험은?</Text>
        <Text style={styles.subtitle}>
          맞춤형 테이스팅 경험을 제공해드릴게요
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {levelOptions.map((option) => (
          <TouchableOpacity
            key={option.level}
            style={styles.levelCard}
            onPress={() => onSelectLevel(option.level)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{option.icon}</Text>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              {option.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>선택하기</Text>
              <Text style={styles.selectButtonArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footerText}>
        나중에 설정에서 변경할 수 있어요
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
},
  header: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
},
  optionsContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
},
  levelCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_MD,
},
  icon: {
    fontSize: 36,
    marginRight: HIGConstants.SPACING_MD,
},
  cardTitleContainer: {
    flex: 1,
},
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  cardDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
},
  featuresContainer: {
    marginBottom: HIGConstants.SPACING_MD,
},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_XS,
},
  featureBullet: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    marginRight: HIGConstants.SPACING_SM,
},
  featureText: {
    flex: 1,
    fontSize: 14,
    color: HIGColors.label,
    lineHeight: 20,
},
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingVertical: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_SM,
},
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
    marginRight: HIGConstants.SPACING_XS,
},
  selectButtonArrow: {
    fontSize: 16,
    color: HIGColors.white,
},
  footerText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: HIGConstants.SPACING_XL,
},
});