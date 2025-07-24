import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, isKoreanMarket } from '../services/i18n';
import { HIGColors, HIGConstants } from '../styles/common';

interface LanguageSwitchProps {
  style?: any;
  showLabels?: boolean;
  compact?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  style,
  showLabels = true,
  compact = false,
}) => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = async (language: 'ko' | 'en') => {
    if (language === currentLanguage) return;

    try {
      await changeLanguage(language);
      
      // Show confirmation message
      const message = language === 'ko' 
        ? '언어가 한국어로 변경되었습니다'
        : 'Language changed to English';
        
      Alert.alert(
        language === 'ko' ? '언어 변경' : 'Language Changed',
        message,
        [{ text: language === 'ko' ? '확인' : 'OK' }]
      );
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={[
            styles.compactButton,
            currentLanguage === 'ko' && styles.compactButtonActive
          ]}
          onPress={() => handleLanguageChange('ko')}
        >
          <Text style={[
            styles.compactButtonText,
            currentLanguage === 'ko' && styles.compactButtonTextActive
          ]}>
            한
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.compactButton,
            currentLanguage === 'en' && styles.compactButtonActive
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[
            styles.compactButtonText,
            currentLanguage === 'en' && styles.compactButtonTextActive
          ]}>
            EN
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showLabels && (
        <Text style={styles.label}>{t('language')}</Text>
      )}
      
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            styles.leftButton,
            currentLanguage === 'ko' && styles.activeButton
          ]}
          onPress={() => handleLanguageChange('ko')}
        >
          <Text style={[
            styles.buttonText,
            currentLanguage === 'ko' && styles.activeButtonText
          ]}>
            🇰🇷 한국어
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.languageButton,
            styles.rightButton,
            currentLanguage === 'en' && styles.activeButton
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[
            styles.buttonText,
            currentLanguage === 'en' && styles.activeButtonText
          ]}>
            🇺🇸 English
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Market indicator */}
      <View style={styles.marketIndicator}>
        <Text style={styles.marketText}>
          {isKoreanMarket() ? '🇰🇷 Korean Market' : '🇺🇸 US Beta Market'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray5,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: 2,
  },
  languageButton: {
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium - 2,
    minWidth: 100,
    alignItems: 'center',
  },
  leftButton: {
    marginRight: 1,
  },
  rightButton: {
    marginLeft: 1,
  },
  activeButton: {
    backgroundColor: HIGColors.white,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  activeButtonText: {
    color: HIGColors.label,
    fontWeight: '600',
  },
  marketIndicator: {
    marginTop: HIGConstants.SPACING_SM,
    paddingVertical: 4,
    paddingHorizontal: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  marketText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 16,
    padding: 2,
  },
  compactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  compactButtonActive: {
    backgroundColor: HIGColors.white,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  compactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
  },
  compactButtonTextActive: {
    color: HIGColors.label,
  },
});

export default LanguageSwitch;