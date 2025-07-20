import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { HIGColors } from '@/constants/HIG';
import Icon from 'react-native-vector-icons/Ionicons';
import { FlavorLearningEngine, MasteryLevel } from '@/services/FlavorLearningEngine';
import { useUserStore } from '@/stores/useUserStore';
import { getRealm } from '@/services/realmService';
// import LottieView from 'lottie-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalTasteQuizResults'>;

export const PersonalTasteQuizResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { score, totalPoints, correctAnswers, totalQuestions, focusAreas } = route.params;
  const { user } = useUserStore();
  const [masteryLevels, setMasteryLevels] = useState<Map<string, MasteryLevel>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  
  const scoreAnimation = React.useRef(new Animated.Value(0)).current;
  const fadeAnimation = React.useRef(new Animated.Value(0)).current;
  const scaleAnimation = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadMasteryData();
    animateResults();
  }, []);

  const loadMasteryData = async () => {
    try {
      const realm = await getRealm();
      const flavorEngine = new FlavorLearningEngine(realm);
      
      const masteryData = new Map<string, MasteryLevel>();
      for (const area of focusAreas) {
        const mastery = await flavorEngine.evaluateFlavorMastery(user?.id || 'guest', area);
        masteryData.set(area, mastery);
      }
      
      setMasteryLevels(masteryData);
    } catch (error) {
      console.error('Error loading mastery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateResults = () => {
    Animated.parallel([
      Animated.timing(scoreAnimation, {
        toValue: score / totalPoints,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 4,
        tension: 15,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPerformanceLevel = () => {
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 90) return { label: 'Outstanding!', color: HIGColors.success };
    if (percentage >= 75) return { label: 'Great Job!', color: HIGColors.primary };
    if (percentage >= 60) return { label: 'Good Progress!', color: HIGColors.warning };
    return { label: 'Keep Practicing!', color: HIGColors.info };
  };

  const performance = getPerformanceLevel();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('PersonalTasteDashboard')}
        >
          <Icon name="close" size={24} color={HIGColors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.scoreCard,
            {
              transform: [{ scale: scaleAnimation }],
              opacity: fadeAnimation,
            },
          ]}
        >
          <View style={styles.scoreCircle}>
            <Animated.Text style={[styles.scoreNumber, { color: performance.color }]}>
              {scoreAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0', score.toString()],
              }).interpolate(value => Math.round(Number(value)).toString())}
            </Animated.Text>
            <Text style={styles.scoreDivider}>—</Text>
            <Text style={styles.totalScore}>{totalPoints}</Text>
          </View>
          
          <Text style={[styles.performanceLabel, { color: performance.color }]}>
            {performance.label}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="checkmark-circle" size={24} color={HIGColors.success} />
              <Text style={styles.statValue}>{correctAnswers}/{totalQuestions}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="trending-up" size={24} color={HIGColors.primary} />
              <Text style={styles.statValue}>
                {Math.round((correctAnswers / totalQuestions) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </Animated.View>

        {!isLoading && masteryLevels.size > 0 && (
          <Animated.View style={{ opacity: fadeAnimation }}>
            <Text style={styles.sectionTitle}>Flavor Progress</Text>
            {Array.from(masteryLevels.entries()).map(([category, mastery]) => (
              <View key={category} style={styles.masteryCard}>
                <View style={styles.masteryHeader}>
                  <Text style={styles.masteryCategory}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <View style={[styles.masteryBadge, { backgroundColor: getMasteryColor(mastery.level) }]}>
                    <Text style={styles.masteryLevel}>{mastery.level}</Text>
                  </View>
                </View>
                
                <View style={styles.masteryProgress}>
                  <View style={styles.masteryProgressBar}>
                    <View
                      style={[
                        styles.masteryProgressFill,
                        {
                          width: `${mastery.progressToNext * 100}%`,
                          backgroundColor: getMasteryColor(mastery.level),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.masteryProgressText}>{mastery.nextMilestone}</Text>
                </View>
                
                <View style={styles.masteryStats}>
                  <Text style={styles.masteryStat}>
                    Accuracy: {Math.round(mastery.accuracyRate * 100)}%
                  </Text>
                  <Text style={styles.masteryStat}>
                    Confidence: {'★'.repeat(mastery.confidenceLevel)}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnimation }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('PersonalTasteDashboard')}
          >
            <Icon name="bar-chart" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>View Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.replace('PersonalTasteQuiz')}
          >
            <Icon name="refresh" size={20} color={HIGColors.primary} />
            <Text style={styles.secondaryButtonText}>Take Another Quiz</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const getMasteryColor = (level: string): string => {
  switch (level) {
    case 'master': return '#FFD700';
    case 'expert': return '#C0C0C0';
    case 'proficient': return HIGColors.success;
    case 'apprentice': return HIGColors.primary;
    default: return HIGColors.info;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIGColors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: HIGColors.border.light,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '700',
  },
  scoreDivider: {
    fontSize: 24,
    color: HIGColors.text.secondary,
    marginVertical: 4,
  },
  totalScore: {
    fontSize: 32,
    fontWeight: '600',
    color: HIGColors.text.secondary,
  },
  performanceLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: HIGColors.text.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: HIGColors.border.light,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.text.primary,
    marginBottom: 16,
  },
  masteryCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: HIGColors.border.light,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  masteryCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.text.primary,
  },
  masteryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  masteryLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  masteryProgress: {
    marginBottom: 12,
  },
  masteryProgressBar: {
    height: 8,
    backgroundColor: HIGColors.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  masteryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  masteryProgressText: {
    fontSize: 12,
    color: HIGColors.text.secondary,
  },
  masteryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masteryStat: {
    fontSize: 14,
    color: HIGColors.text.secondary,
  },
  actionsContainer: {
    marginTop: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: HIGColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HIGColors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.primary,
    marginLeft: 8,
  },
});