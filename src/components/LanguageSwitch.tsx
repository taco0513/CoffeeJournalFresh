import React from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  styled,
  useTheme,
} from 'tamagui';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, isKoreanMarket } from '../services/i18n';
import { Logger } from '../services/LoggingService';

interface LanguageSwitchProps {
  showLabels?: boolean;
  compact?: boolean;
}

// Styled components
const CompactContainer = styled(XStack, {
  name: 'CompactContainer',
  backgroundColor: '$gray5',
  borderRadius: '$4',
  padding: '$xxs',
});

const CompactButton = styled(Button, {
  name: 'CompactButton',
  unstyled: true,
  width: '$iconMedium + $xs',
  height: '$badgeLarge + $xxs',
  borderRadius: '$4',
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: '$xxxs',
  pressStyle: {
    scale: 0.95,
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$background',
        shadowColor: '$borderColor',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
      },
    },
  } as const,
});

const SwitchContainer = styled(XStack, {
  name: 'SwitchContainer',
  backgroundColor: '$gray5',
  borderRadius: '$3',
  padding: '$xxs',
});

const LanguageButton = styled(Button, {
  name: 'LanguageButton',
  unstyled: true,
  paddingVertical: '$sm',
  paddingHorizontal: '$lg',
  borderRadius: '$3 - $xxs',
  minWidth: 100,
  alignItems: 'center',
  marginHorizontal: '$xxxs',
  pressStyle: {
    scale: 0.98,
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$background',
        shadowColor: '$borderColor',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    },
  } as const,
});

const MarketIndicator = styled(YStack, {
  name: 'MarketIndicator',
  marginTop: '$sm',
  paddingVertical: '$xxs',
  paddingHorizontal: '$sm',
  backgroundColor: '$gray6',
  borderRadius: '$2',
  alignItems: 'center',
});

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
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
      Logger.error('Failed to change language:', 'component', { component: 'LanguageSwitch', error: error });
    }
  };

  if (compact) {
    return (
      <CompactContainer>
        <CompactButton
          active={currentLanguage === 'ko'}
          onPress={() => handleLanguageChange('ko')}
        >
          <Text 
            fontSize="$2" 
            fontWeight="600" 
            color={currentLanguage === 'ko' ? '$color' : '$gray11'}
          >
            한
          </Text>
        </CompactButton>
        
        <CompactButton
          active={currentLanguage === 'en'}
          onPress={() => handleLanguageChange('en')}
        >
          <Text 
            fontSize="$2" 
            fontWeight="600" 
            color={currentLanguage === 'en' ? '$color' : '$gray11'}
          >
            EN
          </Text>
        </CompactButton>
      </CompactContainer>
    );
  }

  return (
    <YStack alignItems="center">
      {showLabels && (
        <Text fontSize="$3" fontWeight="600" color="$color" marginBottom="$sm">
          {t('language')}
        </Text>
      )}
      
      <SwitchContainer>
        <LanguageButton
          active={currentLanguage === 'ko'}
          onPress={() => handleLanguageChange('ko')}
        >
          <Text 
            fontSize="$3" 
            fontWeight="500" 
            color={currentLanguage === 'ko' ? '$color' : '$gray11'}
          >
            한국어
          </Text>
        </LanguageButton>
        
        <LanguageButton
          active={currentLanguage === 'en'}
          onPress={() => handleLanguageChange('en')}
        >
          <Text 
            fontSize="$3" 
            fontWeight="500" 
            color={currentLanguage === 'en' ? '$color' : '$gray11'}
          >
            English
          </Text>
        </LanguageButton>
      </SwitchContainer>
      
      {/* Market indicator */}
      <MarketIndicator>
        <Text fontSize="$2" color="$gray11" fontWeight="500">
          {isKoreanMarket() ? 'Korean Market' : 'US Beta Market'}
        </Text>
      </MarketIndicator>
    </YStack>
  );
};

export default LanguageSwitch;