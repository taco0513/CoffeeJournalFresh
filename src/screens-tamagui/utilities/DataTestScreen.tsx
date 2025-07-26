import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  H2,
  Paragraph,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
  Spinner,
} from 'tamagui';
import RealmService from '../../services/realm/RealmService';

// Styled Components
const Container = styled(View, {
  name: 'DataTestContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'NavigationBar',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: 0,
  pressStyle: {
    opacity: 0.6,
},
});

const BackButtonText = styled(Text, {
  name: 'BackButtonText',
  fontSize: '$6',
  color: '$cupBlue',
});

const NavigationTitle = styled(Text, {
  name: 'NavigationTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const NavigationSpacer = styled(View, {
  name: 'NavigationSpacer',
  width: 30,
});

const Content = styled(ScrollView, {
  name: 'Content',
  flex: 1,
  paddingHorizontal: '$lg',
  paddingTop: '$md',
});

const Section = styled(YStack, {
  name: 'Section',
  marginBottom: '$lg',
  gap: '$md',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
},
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const StatsContainer = styled(Card, {
  name: 'StatsContainer',
  backgroundColor: '$green2',
  padding: '$md',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$green9',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
},
});

const StatText = styled(Text, {
  name: 'StatText',
  fontSize: '$3',
  color: '$color',
  marginBottom: '$xs',
});

const TastingCard = styled(Card, {
  name: 'TastingCard',
  backgroundColor: '$yellow2',
  padding: '$md',
  borderRadius: '$3',
  marginBottom: '$sm',
  borderWidth: 1,
  borderColor: '$orange9',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    x: -20,
},
});

const TastingCardContent = styled(XStack, {
  name: 'TastingCardContent',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const TastingInfo = styled(YStack, {
  name: 'TastingInfo',
  flex: 1,
  gap: '$1',
});

const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$3',
  fontWeight: '600',
  color: '$color',
});

const RoasteryName = styled(Text, {
  name: 'RoasteryName',
  fontSize: '$2',
  color: '$gray11',
});

const CafeText = styled(Text, {
  name: 'CafeText',
  fontSize: '$2',
  color: '$gray10',
});

const ScoreText = styled(Text, {
  name: 'ScoreText',
  fontSize: '$2',
  fontWeight: '600',
  color: '$cupBrown',
});

const DateText = styled(Text, {
  name: 'DateText',
  fontSize: '$1',
  color: '$gray10',
});

const DeleteButton = styled(Button, {
  name: 'DeleteButton',
  backgroundColor: '$red9',
  paddingHorizontal: '$md',
  paddingVertical: '$xs',
  borderRadius: '$2',
  borderWidth: 0,
  animation: 'quick',
  pressStyle: {
    scale: 0.95,
    backgroundColor: '$red10',
},
});

const DeleteButtonText = styled(Text, {
  name: 'DeleteButtonText',
  color: 'white',
  fontSize: '$2',
  fontWeight: '500',
});

const RefreshButton = styled(Button, {
  name: 'RefreshButton',
  backgroundColor: '$cupBlue',
  padding: '$md',
  borderRadius: '$3',
  alignItems: 'center',
  marginBottom: '$sm',
  borderWidth: 0,
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBlueDark',
},
});

const RefreshButtonText = styled(Text, {
  name: 'RefreshButtonText',
  color: 'white',
  fontSize: '$3',
  fontWeight: '600',
});

const ClearButton = styled(Button, {
  name: 'ClearButton',
  backgroundColor: '$red9',
  padding: '$md',
  borderRadius: '$3',
  alignItems: 'center',
  borderWidth: 0,
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$red10',
},
});

const ClearButtonText = styled(Text, {
  name: 'ClearButtonText',
  color: 'white',
  fontSize: '$3',
  fontWeight: '600',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$lg',
  gap: '$md',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
  padding: '$5',
});

export type DataTestScreenProps = GetProps<typeof Container>;

interface TastingData {
  id: string;
  coffeeName: string;
  roastery: string;
  cafeName?: string;
  matchScoreTotal: number;
  createdAt: string;
}

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays?: number;
  uniqueCafes?: number;
  uniqueRoasters?: number;
}

const DataTestScreen: React.FC<DataTestScreenProps & { navigation: unknown}> = ({ navigation, ...props }) => {
  const theme = useTheme();
  const [recentTastings, setRecentTastings] = useState<TastingData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get recent tastings
      const tastings = await RealmService.getRecentTastings(10);
      const formattedTastings = tastings.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
    }));
      setRecentTastings(formattedTastings);
      
      // Get statistics
      const realmService = RealmService.getInstance();
      const stats = realmService.getStatistics();
      setStatistics(stats);
  } catch (error) {
      Alert.alert('Error', 'Failed to load data');
  } finally {
      setIsLoading(false);
  }
};

  useEffect(() => {
    loadData();
}, []);

  const handleDeleteTasting = async (tastingId: string) => {
    try {
      await RealmService.getInstance().deleteTasting(tastingId);
      Alert.alert('Success', 'Tasting deleted');
      loadData(); // Reload data
  } catch (error) {
      Alert.alert('Error', 'Failed to delete tasting');
  }
};

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all tastings? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              realmService.clearAllTastings();
              Alert.alert('Success', 'All tastings deleted');
              loadData();
          } catch (error) {
              Alert.alert('Error', 'Failed to clear all tastings');
          }
        },
      },
      ]
    );
};

  return (
    <Container {...props}>
      <SafeAreaView style={{ flex: 1 }}>
        <AnimatePresence>
          {/* Navigation Bar */}
          <NavigationBar
            animation="lazy"
            enterStyle={{ opacity: 0, y: -20 }}
            animateOnly={['opacity', 'transform']}
          >
            <BackButton unstyled onPress={() => navigation.goBack()}>
              <BackButtonText>←</BackButtonText>
            </BackButton>
            <NavigationTitle>데이터 테스트</NavigationTitle>
            <NavigationSpacer />
          </NavigationBar>

          <Content showsVerticalScrollIndicator={false}>
            {/* Statistics Section */}
            <Section>
              <SectionTitle>Statistics</SectionTitle>
              {statistics && (
                <StatsContainer>
                  <StatText>
                    Total Tastings: {statistics.totalTastings}
                  </StatText>
                  <StatText>
                    Average Score: {statistics.averageScore}
                  </StatText>
                  <StatText>
                    Days Since First: {statistics.firstTastingDays}
                  </StatText>
                </StatsContainer>
              )}
            </Section>

            {/* Recent Tastings Section */}
            <Section>
              <SectionTitle>
                Recent Tastings ({recentTastings.length})
              </SectionTitle>
              {isLoading ? (
                <LoadingContainer>
                  <Spinner size="large" color="$cupBlue" />
                  <LoadingText>Loading...</LoadingText>
                </LoadingContainer>
              ) : recentTastings.length === 0 ? (
                <EmptyText>No tastings saved yet</EmptyText>
              ) : (
                <YStack gap="$sm">
                  {recentTastings.map((tasting, index) => (
                    <TastingCard
                      key={tasting.id}
                      animation="lazy"
                      enterStyle={{
                        opacity: 0,
                        x: -20,
                    }}
                      animateOnly={['opacity', 'transform']}
                    >
                      <TastingCardContent>
                        <TastingInfo>
                          <CoffeeName>{tasting.coffeeName}</CoffeeName>
                          <RoasteryName>{tasting.roastery}</RoasteryName>
                          <CafeText>
                            {tasting.cafeName || 'No cafe'}
                          </CafeText>
                          <ScoreText>
                            Score: {tasting.matchScoreTotal}
                          </ScoreText>
                          <DateText>
                            {new Date(tasting.createdAt).toLocaleDateString()}
                          </DateText>
                        </TastingInfo>
                        <DeleteButton
                          unstyled
                          onPress={() => handleDeleteTasting(tasting.id)}
                        >
                          <DeleteButtonText>Delete</DeleteButtonText>
                        </DeleteButton>
                      </TastingCardContent>
                    </TastingCard>
                  ))}
                </YStack>
              )}
            </Section>

            {/* Actions Section */}
            <Section>
              <RefreshButton unstyled onPress={loadData}>
                <RefreshButtonText>Refresh Data</RefreshButtonText>
              </RefreshButton>
              
              <ClearButton unstyled onPress={handleClearAll}>
                <ClearButtonText>Clear All Data</ClearButtonText>
              </ClearButton>
            </Section>
          </Content>
        </AnimatePresence>
      </SafeAreaView>
    </Container>
  );
};

export default DataTestScreen;