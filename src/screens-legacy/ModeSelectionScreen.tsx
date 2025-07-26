import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { TastingMode } from '../types/tasting';
import LanguageSwitch from '../components/LanguageSwitch';

const ModeSelectionScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { setTastingMode } = useTastingStore();

  const handleModeSelect = (mode: TastingMode) => {
    setTastingMode(mode);
    navigation.navigate('CoffeeInfo' as never);
};

  const modes = [
    {
      id: 'cafe' as TastingMode,
      title: t('cafeMode'),
      subtitle: t('cafeModeDesc'),
      description: t('cafeModeDesc'),
      icon: 'Cafe',
      color: HIGColors.systemBlue,
      popular: true,
  },
    {
      id: 'home_cafe' as TastingMode,
      title: t('homeCafeMode'),
      subtitle: t('homeCafeModeDesc'),
      description: t('homeCafeModeDesc'),
      icon: 'Home',
      color: HIGColors.systemGreen,
      popular: false,
      badge: t('comingSoon'),
  },
    {
      id: 'lab' as TastingMode,
      title: t('labMode'),
      subtitle: t('labModeDesc'),
      description: t('labModeDesc'),
      icon: 'Lab',
      color: HIGColors.systemPurple,
      popular: false,
      badge: t('beta'),
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
        <Text style={styles.headerTitle}>{t('modeSelection')}</Text>
        <LanguageSwitch compact style={styles.languageSwitch} />
      </View>

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('howRecordCoffee', { defaultValue: '어떤 방식으로\n커피를 기록하시나요?' })}</Text>
          <Text style={styles.subtitle}>{t('canChangeAnytime', { defaultValue: '언제든지 변경할 수 있습니다' })}</Text>
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
              {(mode.popular || mode.badge) && (
                <View style={[styles.popularBadge, mode.badge && styles.recommendBadge]}>
                  <Text style={[
                    styles.popularText, 
                    mode.badge === '고급' && styles.advancedText
                  ]}>
                    {mode.badge || '인기'}
                  </Text>
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
            {t('modeChangeInfo', { defaultValue: '모드는 테이스팅 중에도 언제든 변경 가능합니다' })}
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
    fontSize: HIGConstants.FONT_SIZE_H2,
    color: HIGColors.systemBlue,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
},
  languageSwitch: {
    marginLeft: HIGConstants.SPACING_MD,
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
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: HIGConstants.SPACING_SM,
},
  subtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
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
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    fontWeight: '700',
},
  recommendBadge: {
    backgroundColor: HIGColors.systemGreen,
},
  advancedText: {
    backgroundColor: HIGColors.systemPurple,
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
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 4,
},
  modeSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
},
  modeDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.tertiaryLabel,
    lineHeight: 20,
},
  arrow: {
    marginLeft: HIGConstants.SPACING_MD,
},
  arrowText: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '300',
},
  bottomInfo: {
    paddingVertical: HIGConstants.SPACING_XL,
    alignItems: 'center',
},
  infoText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
},
});

export default ModeSelectionScreen;