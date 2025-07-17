import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface LanguageSwitchProps {
  style?: any;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ style }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={toggleLanguage}
        activeOpacity={0.7}
      >
        <Text style={styles.languageText}>
          {i18n.language === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default LanguageSwitch;