import React, { useState } from 'react';
import { SafeAreaView, Dimensions } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  styled,
  AnimatePresence,
  Button,
} from 'tamagui';
import HistoryScreen from './HistoryScreen';
import StatsScreen from './StatsScreen';
import StatusBadge from '../components/StatusBadge';

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

const NavigationBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const NavContent = styled(XStack, {
  alignItems: 'center',
  gap: '$xs',
})

const NavTitle = styled(Text, {
  fontSize: 17,
  fontWeight: '600',
  color: '$color',
  fontFamily: '$heading',
})

const BetaBadge = styled(XStack, {
  backgroundColor: '$primary',
  paddingHorizontal: '$xs',
  paddingVertical: 2,
  borderRadius: '$1',
  alignItems: 'center',
  justifyContent: 'center',
})

const BetaText = styled(Text, {
  fontSize: 10,
  fontWeight: '700',
  color: 'white',
  fontFamily: '$body',
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
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'history');

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TabButton
        key={tab}
        active={isActive}
        onPress={() => setActiveTab(tab)}
        animation="quick"
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
        return <HistoryScreen hideNavBar={true} />;
      case 'stats':
        return <StatsScreen hideNavBar={true} />;
      default:
        return <HistoryScreen hideNavBar={true} />;
    }
  };

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          {/* Navigation Bar */}
          <NavigationBar>
            <NavContent>
              <NavTitle>My Coffee</NavTitle>
              <BetaBadge animation="lazy">
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </NavContent>
            <StatusBadge />
          </NavigationBar>

          {/* Tab Navigation */}
          <TabContainer>
            {renderTabButton('history', '기록')}
            {renderTabButton('stats', '통계')}
            
            {/* Animated Tab Indicator */}
            <TabIndicator
              width={width / 2 - 24} // Half screen width minus padding
              left={activeTab === 'history' ? 24 : width / 2}
              animation="quick"
              enterStyle={{
                opacity: 0,
                x: -10,
              }}
              exitStyle={{
                opacity: 0,
                x: 10,
              }}
            />
          </TabContainer>

          {/* Content with Animation */}
          <ContentContainer>
            <AnimatePresence>
              <YStack
                key={activeTab}
                flex={1}
                animation="lazy"
                enterStyle={{
                  opacity: 0,
                  x: activeTab === 'history' ? -20 : 20,
                }}
                exitStyle={{
                  opacity: 0,
                  x: activeTab === 'history' ? 20 : -20,
                }}
              >
                {renderContent()}
              </YStack>
            </AnimatePresence>
          </ContentContainer>
        </YStack>
      </SafeAreaView>
    </Container>
  );
}