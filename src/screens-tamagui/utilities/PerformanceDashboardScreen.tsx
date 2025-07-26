import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, RefreshControl, Alert } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  Spinner,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { performanceAnalyzer, PerformanceReport } from '../../utils/performanceAnalysis';
import { performanceMonitor } from '../../services/PerformanceMonitor';
import { flavorDataOptimizer } from '../../services/FlavorDataOptimizer';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}

// Styled Components
const Container = styled(View, {
  name: 'PerformanceDashboardContainer',
  flex: 1,
  backgroundColor: '$background',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$md',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
});

const HeaderSection = styled(XStack, {
  name: 'HeaderSection',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const RefreshButton = styled(Button, {
  name: 'RefreshButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  color: '$cupBlue',
  fontWeight: '500',
  pressStyle: {
    opacity: 0.7,
    scale: 0.98,
  },
});

const RefreshButtonText = styled(Text, {
  name: 'RefreshButtonText',
  fontSize: '$4',
  color: '$cupBlue',
  fontWeight: '500',
});

const TabBar = styled(XStack, {
  name: 'TabBar',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: '$md',
  borderRadius: 0,
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
  animation: 'quick',
  variants: {
    active: {
      true: {
        borderBottomColor: '$cupBlue',
      },
    },
  } as const,
  pressStyle: {
    scale: 1,
    backgroundColor: '$backgroundHover',
  },
});

const TabText = styled(Text, {
  name: 'TabText',
  fontSize: '$4',
  fontWeight: '500',
  variants: {
    active: {
      true: {
        color: '$cupBlue',
      },
      false: {
        color: '$gray11',
      },
    },
  } as const,
});

const TabContent = styled(ScrollView, {
  name: 'TabContent',
  flex: 1,
  padding: '$lg',
  showsVerticalScrollIndicator: false,
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
  marginTop: '$lg',
});

const MetricsGrid = styled(XStack, {
  name: 'MetricsGrid',
  flexWrap: 'wrap',
  gap: '$sm',
  marginBottom: '$lg',
});

const MetricCardContainer = styled(Card, {
  name: 'MetricCardContainer',
  width: '48%',
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  borderRadius: '$4',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  variants: {
    clickable: {
      true: {
        borderColor: '$cupBlue',
        pressStyle: {
          scale: 0.98,
          backgroundColor: '$backgroundPress',
        },
      },
    },
  } as const,
});

const MetricTitle = styled(Text, {
  name: 'MetricTitle',
  fontSize: '$2',
  color: '$gray11',
  marginBottom: '$xs',
  textAlign: 'center',
});

const MetricValue = styled(Text, {
  name: 'MetricValue',
  fontSize: '$8',
  fontWeight: '700',
  marginBottom: '$xs',
  textAlign: 'center',
});

const MetricSubtitle = styled(Text, {
  name: 'MetricSubtitle',
  fontSize: '$1',
  color: '$gray10',
  textAlign: 'center',
});

const OperationCard = styled(Card, {
  name: 'OperationCard',
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  borderRadius: '$2',
  marginBottom: '$xs',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
});

const OperationHeader = styled(XStack, {
  name: 'OperationHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const OperationName = styled(Text, {
  name: 'OperationName',
  fontSize: '$3',
  color: '$color',
  flex: 1,
});

const OperationTime = styled(Text, {
  name: 'OperationTime',
  fontSize: '$3',
  fontWeight: '600',
});

const IssueCard = styled(Card, {
  name: 'IssueCard',
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  borderRadius: '$2',
  marginBottom: '$sm',
  borderLeftWidth: 4,
  borderLeftColor: '$red9',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 15,
  },
});

const IssueHeader = styled(XStack, {
  name: 'IssueHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$xs',
});

const IssueType = styled(Text, {
  name: 'IssueType',
  fontSize: '$2',
  fontWeight: '600',
  color: '$color',
});

const SeverityBadge = styled(View, {
  name: 'SeverityBadge',
  paddingHorizontal: '$xs',
  paddingVertical: '$1',
  borderRadius: '$1',
  variants: {
    severity: {
      high: {
        backgroundColor: '$red9',
      },
      medium: {
        backgroundColor: '$orange9',
      },
      low: {
        backgroundColor: '$yellow9',
      },
    },
  } as const,
});

const SeverityText = styled(Text, {
  name: 'SeverityText',
  fontSize: '$1',
  fontWeight: '600',
  color: 'white',
});

const IssueDescription = styled(Text, {
  name: 'IssueDescription',
  fontSize: '$3',
  color: '$gray11',
});

const RecommendationCard = styled(Card, {
  name: 'RecommendationCard',
  backgroundColor: '$green2',
  padding: '$md',
  borderRadius: '$2',
  marginBottom: '$xs',
  borderLeftWidth: 4,
  borderLeftColor: '$green9',
  borderWidth: 0.5,
  borderColor: '$green5',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
});

const RecommendationText = styled(Text, {
  name: 'RecommendationText',
  fontSize: '$3',
  color: '$color',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  backgroundColor: '$cupBlue',
  borderRadius: '$2',
  paddingVertical: '$md',
  marginBottom: '$sm',
  animation: 'quick',
  variants: {
    variant: {
      primary: {
        backgroundColor: '$cupBlue',
      },
      danger: {
        backgroundColor: '$red9',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
});

const ActionButtonText = styled(Text, {
  name: 'ActionButtonText',
  fontSize: '$4',
  fontWeight: '600',
  variants: {
    variant: {
      primary: {
        color: 'white',
      },
      danger: {
        color: 'white',
      },
    },
  } as const,
});

const CacheEntryCard = styled(Card, {
  name: 'CacheEntryCard',
  backgroundColor: '$backgroundStrong',
  padding: '$sm',
  borderRadius: '$2',
  marginBottom: '$xs',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 5,
  },
});

const CacheEntryName = styled(Text, {
  name: 'CacheEntryName',
  fontSize: '$3',
  color: '$color',
  fontFamily: 'monospace',
});

export type PerformanceDashboardScreenProps = GetProps<typeof Container>;

const TamaguiMetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = '$cupBlue',
  onPress 
}) => (
  <MetricCardContainer
    clickable={!!onPress}
    onPress={onPress}
    animation="lazy"
    enterStyle={{
      opacity: 0,
      scale: 0.9,
      y: 20,
    }}
    animateOnly={['opacity', 'transform']}
  >
    <MetricTitle>{title}</MetricTitle>
    <MetricValue style={{ color }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </MetricValue>
    {subtitle && <MetricSubtitle>{subtitle}</MetricSubtitle>}
  </MetricCardContainer>
);

const TamaguiIssueCard: React.FC<{
  issue: PerformanceReport['criticalIssues'][0];
}> = ({ issue }) => {
  return (
    <IssueCard>
      <IssueHeader>
        <IssueType>{issue.type.replace(/_/g, ' ').toUpperCase()}</IssueType>
        <SeverityBadge severity={issue.severity}>
          <SeverityText>{issue.severity.toUpperCase()}</SeverityText>
        </SeverityBadge>
      </IssueHeader>
      <IssueDescription>{issue.description}</IssueDescription>
    </IssueCard>
  );
};

const PerformanceDashboardScreen: React.FC<PerformanceDashboardScreenProps> = () => {
  const theme = useTheme();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'cache'>('overview');

  const loadReport = useCallback(async () => {
    try {
      const newReport = performanceAnalyzer.generateReport();
      setReport(newReport);
    } catch (error) {
      console.error('Failed to load performance report:', error);
      Alert.alert('Error', 'Failed to load performance data');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  }, [loadReport]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached performance data and flavor data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            performanceAnalyzer.clearMetrics();
            flavorDataOptimizer.clearCache();
            loadReport();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  }, [loadReport]);

  const handleExportData = useCallback(() => {
    const exportData = performanceAnalyzer.exportData();
    console.log('Performance Export:', JSON.stringify(exportData, null, 2));
    Alert.alert(
      'Data Exported',
      'Performance data has been logged to console. In production, this would be shared or uploaded.'
    );
  }, []);

  const handleFlushQueue = useCallback(async () => {
    try {
      await performanceMonitor.flushQueue();
      Alert.alert('Success', 'Performance queue flushed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to flush performance queue');
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const getOperationTimeColor = (duration: number) => {
    if (duration > 2000) return '$red9';
    if (duration > 1000) return '$orange9';
    return '$green9';
  };

  const getErrorRateColor = (rate: number) => {
    return rate > 0.05 ? '$red9' : '$green9';
  };

  const getMemoryIssueColor = (issues: number) => {
    return issues > 0 ? '$orange9' : '$green9';
  };

  const renderOverview = () => (
    <TabContent
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <AnimatePresence>
        {/* Summary Metrics */}
        <SectionTitle
          animation="lazy"
          enterStyle={{ opacity: 0, y: -10 }}
          animateOnly={['opacity', 'transform']}
        >
          Performance Summary
        </SectionTitle>
        
        <MetricsGrid
          animation="lazy"
          enterStyle={{ opacity: 0, y: 20 }}
          animateOnly={['opacity', 'transform']}
        >
          <TamaguiMetricCard
            title="Total Operations"
            value={report?.summary.totalOperations || 0}
            subtitle="Last 24 hours"
          />
          <TamaguiMetricCard
            title="Avg Response Time"
            value={`${(report?.summary.averageResponseTime || 0).toFixed(0)}ms`}
            color={getOperationTimeColor(report?.summary.averageResponseTime || 0)}
          />
          <TamaguiMetricCard
            title="Error Rate"
            value={`${((report?.summary.errorRate || 0) * 100).toFixed(1)}%`}
            color={getErrorRateColor(report?.summary.errorRate || 0)}
          />
          <TamaguiMetricCard
            title="Memory Issues"
            value={report?.summary.memoryIssues || 0}
            color={getMemoryIssueColor(report?.summary.memoryIssues || 0)}
          />
        </MetricsGrid>

        {/* Slowest Operations */}
        {report?.summary?.slowestOperations && report.summary.slowestOperations.length > 0 && (
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            <SectionTitle>Slowest Operations</SectionTitle>
            {report?.summary?.slowestOperations?.map((op, index) => (
              <OperationCard key={index}>
                <OperationHeader>
                  <OperationName>{op.name}</OperationName>
                  <OperationTime style={{ color: getOperationTimeColor(op.duration) }}>
                    {op.duration.toFixed(0)}ms
                  </OperationTime>
                </OperationHeader>
              </OperationCard>
            ))}
          </YStack>
        )}

        {/* Critical Issues */}
        {report?.criticalIssues && report.criticalIssues.length > 0 && (
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            <SectionTitle>Critical Issues</SectionTitle>
            {report?.criticalIssues?.map((issue, index) => (
              <TamaguiIssueCard key={index} issue={issue} />
            ))}
          </YStack>
        )}

        {/* Recommendations */}
        {report?.recommendations && report.recommendations.length > 0 && (
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            <SectionTitle>Recommendations</SectionTitle>
            {report?.recommendations?.map((rec, index) => (
              <RecommendationCard key={index}>
                <RecommendationText>• {rec}</RecommendationText>
              </RecommendationCard>
            ))}
          </YStack>
        )}
      </AnimatePresence>
    </TabContent>
  );

  const renderDetails = () => (
    <TabContent>
      <AnimatePresence>
        <SectionTitle
          animation="lazy"
          enterStyle={{ opacity: 0, y: -10 }}
          animateOnly={['opacity', 'transform']}
        >
          Fastest Operations
        </SectionTitle>
        
        <YStack
          animation="lazy"
          enterStyle={{ opacity: 0, y: 20 }}
          animateOnly={['opacity', 'transform']}
        >
          {report?.summary.fastestOperations.map((op, index) => (
            <OperationCard key={index}>
              <OperationHeader>
                <OperationName>{op.name}</OperationName>
                <OperationTime style={{ color: '$green9' }}>
                  {op.duration.toFixed(0)}ms
                </OperationTime>
              </OperationHeader>
            </OperationCard>
          ))}
        </YStack>

        <SectionTitle
          animation="lazy"
          enterStyle={{ opacity: 0, y: -10 }}
          animateOnly={['opacity', 'transform']}
        >
          Performance Actions
        </SectionTitle>
        
        <YStack
          animation="lazy"
          enterStyle={{ opacity: 0, y: 20 }}
          animateOnly={['opacity', 'transform']}
          gap="$sm"
        >
          <ActionButton variant="primary" unstyled onPress={handleFlushQueue}>
            <ActionButtonText variant="primary">Flush Performance Queue</ActionButtonText>
          </ActionButton>
          
          <ActionButton variant="primary" unstyled onPress={handleExportData}>
            <ActionButtonText variant="primary">Export Performance Data</ActionButtonText>
          </ActionButton>
        </YStack>
      </AnimatePresence>
    </TabContent>
  );

  const renderCache = () => {
    const cacheStats = flavorDataOptimizer.getCacheStats();
    
    return (
      <TabContent>
        <AnimatePresence>
          <SectionTitle
            animation="lazy"
            enterStyle={{ opacity: 0, y: -10 }}
            animateOnly={['opacity', 'transform']}
          >
            Cache Statistics
          </SectionTitle>
          
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            <TamaguiMetricCard
              title="Flavor Cache Entries"
              value={cacheStats.size}
              subtitle={`${cacheStats.entries.join(', ')}`}
            />
          </YStack>

          <SectionTitle
            animation="lazy"
            enterStyle={{ opacity: 0, y: -10 }}
            animateOnly={['opacity', 'transform']}
          >
            Cache Management
          </SectionTitle>
          
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            <ActionButton variant="danger" unstyled onPress={handleClearCache}>
              <ActionButtonText variant="danger">Clear All Caches</ActionButtonText>
            </ActionButton>
          </YStack>

          <SectionTitle
            animation="lazy"
            enterStyle={{ opacity: 0, y: -10 }}
            animateOnly={['opacity', 'transform']}
          >
            Cache Entries
          </SectionTitle>
          
          <YStack
            animation="lazy"
            enterStyle={{ opacity: 0, y: 20 }}
            animateOnly={['opacity', 'transform']}
          >
            {cacheStats.entries.map((entry, index) => (
              <CacheEntryCard key={index}>
                <CacheEntryName>{entry}</CacheEntryName>
              </CacheEntryCard>
            ))}
          </YStack>
        </AnimatePresence>
      </TabContent>
    );
  };

  if (!report) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>Loading performance data...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <AnimatePresence>
          {/* Header */}
          <HeaderSection
            animation="lazy"
            enterStyle={{ opacity: 0, y: -20 }}
            animateOnly={['opacity', 'transform']}
          >
            <HeaderTitle>Performance Dashboard</HeaderTitle>
            <RefreshButton unstyled onPress={handleRefresh} disabled={refreshing}>
              <RefreshButtonText>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </RefreshButtonText>
            </RefreshButton>
          </HeaderSection>

          {/* Tabs */}
          <TabBar
            animation="lazy"
            enterStyle={{ opacity: 0, y: -10 }}
            animateOnly={['opacity', 'transform']}
          >
            {(['overview', 'details', 'cache'] as const).map((tab) => (
              <Tab
                key={tab}
                active={selectedTab === tab}
                unstyled
                onPress={() => setSelectedTab(tab)}
              >
                <TabText active={selectedTab === tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabText>
              </Tab>
            ))}
          </TabBar>

          {/* Tab Content */}
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'details' && renderDetails()}
          {selectedTab === 'cache' && renderCache()}
        </AnimatePresence>
      </SafeAreaView>
    </Container>
  );
};

export default PerformanceDashboardScreen;