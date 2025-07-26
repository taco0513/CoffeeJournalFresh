import React from 'react';
import {
  YStack,
  XStack,
  Text,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  Button,
  ScrollView,
  styled,
  useTheme,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTastingStore } from '../../stores/tastingStore';
import { TastingMode } from '../../types/tasting';

// Styled components
const Container = styled(YStack, {
  name: 'Container',
  flex: 1,
  backgroundColor: '$background',
});

// Header, BackButton 제거됨 - 네비게이션 헤더 사용

const ModeCard = styled(Card, {
  name: 'ModeCard',
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 2,
  padding: '$lg',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  elevate: true,
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
},
  animation: 'quick',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
},
});

const Badge = styled(YStack, {
  name: 'Badge',
  position: 'absolute',
  top: -8,
  right: 16,
  borderRadius: '$3',
  paddingHorizontal: '$sm',
  paddingVertical: '$xxs',
  zIndex: 1,
  height: '$badgeMedium',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModeSelectionScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
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
      icon: '',
      color: '$cupBlue',
      popular: true,
  },
    {
      id: 'home_cafe' as TastingMode,
      title: t('homeCafeMode'),
      subtitle: t('homeCafeModeDesc'),
      description: t('homeCafeModeDesc'),
      icon: '',
      color: '$green9',
      popular: false,
      badge: t('comingSoon'),
  },
    {
      id: 'lab' as TastingMode,
      title: t('labMode'),
      subtitle: t('labModeDesc'),
      description: t('labModeDesc'),
      icon: '',
      color: '$purple9',
      popular: false,
      badge: t('beta'),
  },
  ];

  const getBadgeColor = (badge?: string) => {
    if (!badge) return '$orange9';
    if (badge === t('beta')) return '$purple9';
    if (badge === t('comingSoon')) return '$green9';
    return '$orange9';
};

  return (
    <Container>

      <ScrollView 
        flex={1} 
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingBottom: 24
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <YStack paddingVertical="$lg" alignItems="center">
          <H1 
            fontSize="$7" 
            fontWeight="700" 
            color="$color" 
            textAlign="center"
            lineHeight="$xxl"
            marginBottom="$sm"
          >
            {t('howRecordCoffee', { defaultValue: '어떤 방식으로\n커피를 기록하시나요?' })}
          </H1>
          <Paragraph 
            fontSize="$3" 
            color="$gray11" 
            textAlign="center"
          >
            {t('canChangeAnytime', { defaultValue: '언제든지 변경할 수 있습니다' })}
          </Paragraph>
        </YStack>

        {/* Mode Options */}
        <YStack gap="$lg">
            {modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                borderColor={mode.color}
                onPress={() => handleModeSelect(mode.id)}
              >
                {(mode.popular || mode.badge) && (
                  <Badge backgroundColor={getBadgeColor(mode.badge)}>
                    <Text 
                      color="white" 
                      fontSize="$3" 
                      fontWeight="700"
                    >
                      {mode.badge || '인기'}
                    </Text>
                  </Badge>
                )}
                
                <YStack marginRight="$lg">
                  <Text fontSize="$iconLarge">{mode.icon}</Text>
                </YStack>
                
                <YStack flex={1}>
                  <H3 
                    fontSize="$5" 
                    fontWeight="700" 
                    color="$color" 
                    marginBottom="$xxs"
                  >
                    {mode.title}
                  </H3>
                  <Text 
                    fontSize="$3" 
                    fontWeight="500" 
                    color="$gray11" 
                    lineHeight="$lg"
                  >
                    {mode.subtitle}
                  </Text>
                </YStack>
                
                <YStack marginLeft="$md">
                  <Text 
                    fontSize="$6" 
                    fontWeight="300" 
                    color={mode.color}
                  >
                    →
                  </Text>
                </YStack>
              </ModeCard>
            ))}
        </YStack>

        {/* Bottom Info */}
        <YStack paddingVertical="$lg" alignItems="center">
          <Text 
            fontSize="$3" 
            color="$gray11" 
            textAlign="center" 
            lineHeight="$lg"
          >
            {t('modeChangeInfo', { defaultValue: '모드는 테이스팅 중에도 언제든 변경 가능합니다' })}
          </Text>
        </YStack>
      </ScrollView>
    </Container>
  );
};

export default ModeSelectionScreen;