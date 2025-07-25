import React, { useState, useCallback } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  ScrollView,
  Separator,
  H2,
  H3,
  Paragraph,
  Progress,
  useTheme,
} from 'tamagui';
import { RefreshControl, Alert } from 'react-native';
import { 
  performanceTest, 
  runAutomatedPerformanceTests, 
  analyzeBundleSize,
  PerformanceComparison 
} from '../../utils/performanceTestUtils';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PerformanceTestingScreen() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [comparisons, setComparisons] = useState<PerformanceComparison[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);
  const [report, setReport] = useState<string>('');

  const loadComparisons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await performanceTest.getAllComparisons();
      setComparisons(data);
      
      const reportText = await performanceTest.generateReport();
      setReport(reportText);
      
      const bundle = await analyzeBundleSize();
      setBundleAnalysis(bundle);
    } catch (error) {
      console.error('Error loading comparisons:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);

  const runTests = async () => {
    Alert.alert(
      'Run Performance Tests',
      'This will navigate through screens and measure performance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Tests',
          onPress: async () => {
            setIsLoading(true);
            try {
              // List of screens to test
              const screens = [
                'HomeScreen',
                'JournalIntegratedScreen',
                'TastingDetailScreen',
                'UnifiedFlavorScreen',
                'SensoryScreen',
                'ProfileScreen',
                'AchievementGalleryScreen',
                'StatsScreen',
              ];
              
              await runAutomatedPerformanceTests(screens);
              await loadComparisons();
              
              Alert.alert('Success', 'Performance tests completed!');
            } catch (error) {
              Alert.alert('Error', 'Failed to run performance tests');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const clearData = async () => {
    Alert.alert(
      'Clear Performance Data',
      'This will remove all stored performance metrics. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await performanceTest.clearMetrics();
            setComparisons([]);
            setReport('');
            setBundleAnalysis(null);
            Alert.alert('Success', 'Performance data cleared');
          },
        },
      ]
    );
  };

  const renderComparison = (comp: PerformanceComparison) => {
    const renderImprovement = comp.improvement.renderTime;
    const interactionImprovement = comp.improvement.interactionTime;
    
    return (
      <Card key={comp.screenName} mb="$2" p="$3" bg="$background">
        <H3 size="$4" mb="$2">{comp.screenName}</H3>
        
        <YStack space="$2">
          <XStack jc="space-between" ai="center">
            <Text size="$2" color="$color11">Render Time:</Text>
            <XStack ai="center" space="$2">
              <Text size="$2">{comp.legacy?.renderTime.toFixed(0)}ms → {comp.tamagui?.renderTime.toFixed(0)}ms</Text>
              <XStack ai="center" space="$1">
                {renderImprovement > 0 ? (
                  <Icon name="trending-up" size={16} color={theme.green10.get()} />
                ) : (
                  <Icon name="trending-down" size={16} color={theme.red10.get()} />
                )}
                <Text 
                  size="$2" 
                  fontWeight="600"
                  color={renderImprovement > 0 ? '$green10' : '$red10'}
                >
                  {Math.abs(renderImprovement).toFixed(1)}%
                </Text>
              </XStack>
            </XStack>
          </XStack>

          <XStack jc="space-between" ai="center">
            <Text size="$2" color="$color11">Interaction Time:</Text>
            <XStack ai="center" space="$2">
              <Text size="$2">{comp.legacy?.interactionTime.toFixed(0)}ms → {comp.tamagui?.interactionTime.toFixed(0)}ms</Text>
              <XStack ai="center" space="$1">
                {interactionImprovement > 0 ? (
                  <Icon name="trending-up" size={16} color={theme.green10.get()} />
                ) : (
                  <Icon name="trending-down" size={16} color={theme.red10.get()} />
                )}
                <Text 
                  size="$2" 
                  fontWeight="600"
                  color={interactionImprovement > 0 ? '$green10' : '$red10'}
                >
                  {Math.abs(interactionImprovement).toFixed(1)}%
                </Text>
              </XStack>
            </XStack>
          </XStack>

          <Progress 
            value={Math.max(0, Math.min(100, renderImprovement))} 
            h="$1"
            mt="$2"
          >
            <Progress.Indicator 
              animation="medium"
              bg={renderImprovement > 0 ? '$green9' : '$red9'}
            />
          </Progress>
        </YStack>
      </Card>
    );
  };

  const calculateAverageImprovement = () => {
    if (comparisons.length === 0) return { render: 0, interaction: 0 };
    
    const totalRender = comparisons.reduce((sum, comp) => sum + comp.improvement.renderTime, 0);
    const totalInteraction = comparisons.reduce((sum, comp) => sum + comp.improvement.interactionTime, 0);
    
    return {
      render: totalRender / comparisons.length,
      interaction: totalInteraction / comparisons.length,
    };
  };

  const averages = calculateAverageImprovement();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadComparisons} />
      }
    >
      <YStack f={1} p="$4" space="$4">
        <YStack space="$2">
          <H2 size="$7">Performance Testing</H2>
          <Paragraph size="$2" color="$color11">
            Measure and compare performance between legacy and Tamagui screens
          </Paragraph>
        </YStack>

        <XStack space="$2">
          <Button 
            size="$3" 
            theme="blue" 
            onPress={runTests}
            disabled={isLoading}
            icon={Activity}
          >
            Run Tests
          </Button>
          <Button 
            size="$3" 
            theme="red" 
            onPress={clearData}
            disabled={isLoading}
            icon={X}
          >
            Clear Data
          </Button>
        </XStack>

        {/* Summary Card */}
        {comparisons.length > 0 && (
          <Card p="$4" bg="$background" borderWidth={1} borderColor="$borderColor">
            <H3 size="$5" mb="$3">Overall Performance</H3>
            
            <YStack space="$3">
              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">Average Render Improvement</Text>
                <XStack ai="center" space="$2">
                  {averages.render > 0 ? (
                    <Icon name="checkmark-circle" size={20} color={theme.green10.get()} />
                  ) : (
                    <Icon name="close-circle" size={20} color={theme.red10.get()} />
                  )}
                  <Text 
                    size="$4" 
                    fontWeight="700"
                    color={averages.render > 0 ? '$green10' : '$red10'}
                  >
                    {Math.abs(averages.render).toFixed(1)}%
                  </Text>
                </XStack>
              </XStack>

              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">Average Interaction Improvement</Text>
                <XStack ai="center" space="$2">
                  {averages.interaction > 0 ? (
                    <Icon name="checkmark-circle" size={20} color={theme.green10.get()} />
                  ) : (
                    <Icon name="close-circle" size={20} color={theme.red10.get()} />
                  )}
                  <Text 
                    size="$4" 
                    fontWeight="700"
                    color={averages.interaction > 0 ? '$green10' : '$red10'}
                  >
                    {Math.abs(averages.interaction).toFixed(1)}%
                  </Text>
                </XStack>
              </XStack>

              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">Screens Tested</Text>
                <Text size="$4" fontWeight="700">
                  {comparisons.length}
                </Text>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Bundle Size Analysis */}
        {bundleAnalysis && (
          <Card p="$4" bg="$background" borderWidth={1} borderColor="$borderColor">
            <XStack ai="center" space="$2" mb="$3">
              <Icon name="cube-outline" size={20} color={theme.color.get()} />
              <H3 size="$5">Bundle Size Analysis</H3>
            </XStack>
            
            <YStack space="$3">
              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">Total Bundle Size</Text>
                <XStack ai="center" space="$2">
                  <Text size="$2" color="$color11">
                    {(bundleAnalysis.legacy.totalSize / 1024 / 1024).toFixed(1)}MB → {(bundleAnalysis.tamagui.totalSize / 1024 / 1024).toFixed(1)}MB
                  </Text>
                  <Text 
                    size="$3" 
                    fontWeight="700"
                    color="$green10"
                  >
                    -{bundleAnalysis.improvement.total}%
                  </Text>
                </XStack>
              </XStack>

              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">JavaScript Size</Text>
                <Text size="$3" fontWeight="700" color="$green10">
                  -{bundleAnalysis.improvement.js}%
                </Text>
              </XStack>

              <XStack jc="space-between" ai="center">
                <Text size="$3" fontWeight="500">Assets Size</Text>
                <Text size="$3" fontWeight="700" color="$green10">
                  -{bundleAnalysis.improvement.assets}%
                </Text>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Individual Screen Comparisons */}
        {comparisons.length > 0 && (
          <>
            <Separator />
            <H3 size="$5">Screen Comparisons</H3>
            {comparisons.map(renderComparison)}
          </>
        )}

        {/* Empty State */}
        {comparisons.length === 0 && !isLoading && (
          <Card p="$6" bg="$background" ai="center" jc="center">
            <Icon name="pulse" size={48} color={theme.color8.get()} style={{ marginBottom: 12 }} />
            <Text size="$4" color="$color11" ta="center">
              No performance data available yet.
              {'\n'}Run tests to start measuring performance.
            </Text>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}