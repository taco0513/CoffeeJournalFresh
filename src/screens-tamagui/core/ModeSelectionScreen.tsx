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
  AnimatePresence,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTastingStore } from '../../stores/tastingStore';
import { TastingMode } from '../../types/tasting';
import LanguageSwitch from '../../components/LanguageSwitch';

// Styled components
const Container = styled(YStack, {
  name: 'Container',
  flex: 1,
  backgroundColor: '$background',
});

const Header = styled(XStack, {
  name: 'Header',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  unstyled: true,
  marginRight: '$md',
  pressStyle: {
    opacity: 0.7,
  },
});

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
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  zIndex: 1,
});

const ModeSelectionScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { t } = useTranslation();
  const { setTastingMode } = useTastingStore();
  const insets = useSafeAreaInsets();

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
      icon: '☕',
      color: '$cupBlue',
      popular: true,
    },
    {
      id: 'home_cafe' as TastingMode,
      title: t('homeCafeMode'),
      subtitle: t('homeCafeModeDesc'),
      description: t('homeCafeModeDesc'),
      icon: '🏠',
      color: '$green9',
      popular: false,
      badge: t('comingSoon'),
    },
    {
      id: 'lab' as TastingMode,
      title: t('labMode'),
      subtitle: t('labModeDesc'),
      description: t('labModeDesc'),
      icon: '🧪',
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
      {/* Header */}
      <Header style={{ paddingTop: insets.top + 16 }}>
        <BackButton onPress={() => navigation.goBack()}>
          <Text fontSize="$6" color="$cupBlue">←</Text>
        </BackButton>
        <Text fontSize="$4" fontWeight="600" color="$color" flex={1}>
          {t('modeSelection')}
        </Text>
        <LanguageSwitch compact style={{ marginLeft: 16 }} />
      </Header>

      <ScrollView 
        flex={1} 
        contentContainerStyle={{ paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <YStack paddingVertical="$xl" alignItems="center">
          <H1 
            fontSize="$7" 
            fontWeight="700" 
            color="$color" 
            textAlign="center"
            lineHeight={32}
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
        <YStack gap="$lg" flex={1}>
          <AnimatePresence>
            {modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                borderColor={mode.color}
                onPress={() => handleModeSelect(mode.id)}
                enterStyle={{
                  opacity: 0,
                  y: 20,
                  scale: 0.9,
                }}
                exitStyle={{
                  opacity: 0,
                  y: -20,
                  scale: 0.9,
                }}
                animation="lazy"
                animateOnly={['transform', 'opacity']}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {(mode.popular || mode.badge) && (
                  <Badge backgroundColor={getBadgeColor(mode.badge)}>
                    <Text 
                      color="white" 
                      fontSize="$2" 
                      fontWeight="700"
                    >
                      {mode.badge || '인기'}
                    </Text>
                  </Badge>
                )}
                
                <YStack marginRight="$lg">
                  <Text fontSize={48}>{mode.icon}</Text>
                </YStack>
                
                <YStack flex={1}>
                  <H3 
                    fontSize="$5" 
                    fontWeight="700" 
                    color="$color" 
                    marginBottom={4}
                  >
                    {mode.title}
                  </H3>
                  <Text 
                    fontSize="$3" 
                    fontWeight="500" 
                    color="$gray11" 
                    lineHeight={20}
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
          </AnimatePresence>
        </YStack>

        {/* Bottom Info */}
        <YStack paddingVertical="$xl" alignItems="center">
          <Text 
            fontSize="$3" 
            color="$gray11" 
            textAlign="center" 
            lineHeight={20}
          >
            {t('modeChangeInfo', { defaultValue: '💡 모드는 테이스팅 중에도 언제든 변경 가능합니다' })}
          </Text>
        </YStack>
      </ScrollView>
    </Container>
  );
};

export default ModeSelectionScreen;