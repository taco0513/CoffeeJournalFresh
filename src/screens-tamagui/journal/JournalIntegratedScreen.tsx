import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  styled,
  Button,
} from 'tamagui';
import SimpleProfileHistoryScreen from '../analytics/SimpleProfileHistoryScreen';
import StatsScreen from '../analytics/StatsScreen';
import { useScreenPerformance } from '../../hooks/useScreenPerformance';
import { DummyDataInput } from '../../components/dev/DummyDataInput';
import { useDevStore } from '../../stores/useDevStore';

const { width } = Dimensions.get('window');

type TabType = 'history' | 'stats';

interface JournalIntegratedScreenProps {
  route?: {
    params?: {
      initialTab?: TabType;
  };
};
}

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
})


const TabContainer = styled(XStack, {
  backgroundColor: '$background',
  paddingHorizontal: '$lg',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const TabButton = styled(Button, {
  flex: 1,
  paddingVertical: '$md',
  alignItems: 'center',
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
  backgroundColor: 'transparent',
  borderRadius: 0,
  height: 'auto',
  
  pressStyle: {
    backgroundColor: '$gray2',
    opacity: 0.8,
},
  
  variants: {
    active: {
      true: {
        borderBottomColor: '$bean',
    },
  },
} as const,
})

const TabText = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  color: '$gray11',
  fontFamily: '$body',
  
  variants: {
    active: {
      true: {
        color: '$bean',
        fontWeight: '600',
    },
  },
} as const,
})

const ContentContainer = styled(YStack, {
  flex: 1,
})

const TabIndicator = styled(XStack, {
  position: 'absolute',
  bottom: 0,
  height: 2,
  backgroundColor: '$bean',
  borderRadius: 1,
})

export default function JournalIntegratedScreenTamagui({ route }: JournalIntegratedScreenProps) {
  // Performance measurement
  useScreenPerformance('JournalIntegratedScreen');
  
  const { isDeveloperMode } = useDevStore();
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'history');

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TabButton
        key={`journal-tab-${tab}`}
        active={isActive}
        onPress={() => setActiveTab(tab)}
        pressStyle={{
          scale: 0.98,
      }}
      >
        <TabText active={isActive}>{label}</TabText>
      </TabButton>
    );
};

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <SimpleProfileHistoryScreen key="journal-history-screen" />;
      case 'stats':
        return <StatsScreen hideNavBar={true} key="journal-stats-screen" />;
      default:
        return (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$lg">
            <Text fontSize="$6" fontWeight="600" color="$color" marginBottom="$md">저널</Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
              통계를 확인하려면 상단 탭을 선택하세요.
            </Text>
          </YStack>
        );
  }
};

  return (
    <Container>
      <YStack flex={1}>
        <YStack flex={1}>
          {/* Tab Navigation */}
          <TabContainer>
            {renderTabButton('history', '기록')}
            {renderTabButton('stats', '통계')}
            
            {/* Animated Tab Indicator */}
            <TabIndicator
              width={width / 2 - 24} // Half screen width minus padding
              left={activeTab === 'history' ? 24 : width / 2}
            />
          </TabContainer>

          {/* Content with Animation */}
          <ContentContainer>
              <YStack
                key={`content-${activeTab}`}
                flex={1}
              >
                {renderContent()}
              </YStack>
          </ContentContainer>
        </YStack>
      </YStack>
      
      {/* Status & Developer Tools */}
      <DummyDataInput />
    </Container>
  );
}