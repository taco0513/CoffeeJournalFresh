import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { TastingMode } from '../types/tasting';

const ModeSelectionScreen = () => {
  const navigation = useNavigation();
  const { setTastingMode } = useTastingStore();

  const handleModeSelect = (mode: TastingMode) => {
    setTastingMode(mode);
    navigation.navigate('CoffeeInfo' as never);
  };

  const modes = [
    {
      id: 'cafe' as TastingMode,
      title: '카페 모드',
      subtitle: '카페에서 마신 커피 기록',
      description: '카페명, 가격, 분위기 등\n간편하게 기록하세요',
      icon: '☕',
      color: HIGColors.systemBlue,
      popular: true,
    },
    {
      id: 'home_cafe' as TastingMode,
      title: '홈카페 모드',
      subtitle: '집에서 내린 커피 기록',
      description: '장비, 레시피, 추출 변수를\n상세하게 기록하세요',
      icon: '🏠',
      color: HIGColors.systemGreen,
      popular: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>테이스팅 모드 선택</Text>
      </View>

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>어떤 방식으로{'\n'}커피를 기록하시나요?</Text>
          <Text style={styles.subtitle}>언제든지 변경할 수 있습니다</Text>
        </View>

        {/* Mode Options */}
        <View style={styles.modeContainer}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, { borderColor: mode.color }]}
              onPress={() => handleModeSelect(mode.id)}
              activeOpacity={0.7}
            >
              {mode.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>인기</Text>
                </View>
              )}
              
              <View style={styles.modeIcon}>
                <Text style={styles.iconText}>{mode.icon}</Text>
              </View>
              
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
              
              <View style={styles.arrow}>
                <Text style={[styles.arrowText, { color: mode.color }]}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>
            💡 모드는 테이스팅 중에도 언제든 변경 가능합니다
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    marginRight: HIGConstants.SPACING_MD,
  },
  backArrow: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  titleSection: {
    paddingVertical: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  modeContainer: {
    flex: 1,
    gap: HIGConstants.SPACING_LG,
  },
  modeCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    borderWidth: 2,
    padding: HIGConstants.SPACING_LG,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: HIGColors.systemOrange,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  popularText: {
    color: HIGColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modeIcon: {
    marginRight: HIGConstants.SPACING_LG,
  },
  iconText: {
    fontSize: 48,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  modeDescription: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    lineHeight: 20,
  },
  arrow: {
    marginLeft: HIGConstants.SPACING_MD,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '300',
  },
  bottomInfo: {
    paddingVertical: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ModeSelectionScreen;