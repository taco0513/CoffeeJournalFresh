import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation resources
import { koreanTranslations } from './translations/korean';
import { englishTranslations } from './translations/english';

const STORAGE_KEY = '@cupnote_language';

// Translation resources
const resources = {
  ko: {
    translation: koreanTranslations,
  },
  en: {
    translation: englishTranslations,
  },
};

// Detect device language
const detectLanguage = (): string => {
  const deviceLocales = getLocales();
  const primaryLocale = deviceLocales[0];
  
  // Check if device is Korean
  if (primaryLocale.languageCode === 'ko') {
    return 'ko';
  }
  
  // For all other locales, default to English (US beta strategy)
  return 'en';
};

// Initialize i18n
const initializeI18n = async (): Promise<void> => {
  try {
    // Check for stored language preference
    const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    const defaultLanguage = storedLanguage || detectLanguage();
    
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: 'en', // English fallback for beta users
        interpolation: {
          escapeValue: false, // React already escapes
        },
        react: {
          useSuspense: false,
        },
        // Enable debugging in development
        debug: __DEV__,
      });
      
    console.log(`[i18n] Initialized with language: ${defaultLanguage}`);
  } catch (error) {
    console.error('[i18n] Initialization failed:', error);
    // Fallback initialization
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'ko', // Korean default as primary market
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      });
  }
};

// Change language
export const changeLanguage = async (language: 'ko' | 'en'): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    await i18n.changeLanguage(language);
    console.log(`[i18n] Language changed to: ${language}`);
  } catch (error) {
    console.error('[i18n] Failed to change language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'ko';
};

// Check if Korean market
export const isKoreanMarket = (): boolean => {
  return getCurrentLanguage() === 'ko';
};

// Check if US beta market
export const isUSBetaMarket = (): boolean => {
  return getCurrentLanguage() === 'en';
};

// Initialize on import
initializeI18n();

export default i18n;