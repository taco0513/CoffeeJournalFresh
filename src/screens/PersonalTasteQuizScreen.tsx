import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { FlavorLearningEngine, FlavorQuiz, FlavorQuestion, FlavorIdentification } from '@/services/FlavorLearningEngine';
import { HIGColors } from '@/constants/HIG';
import { useUserStore } from '@/stores/useUserStore';
import { getRealm } from '@/services/realmService';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalTasteQuiz'>;

export const PersonalTasteQuizScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useUserStore();
  const [quiz, setQuiz] = useState<FlavorQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [answers, setAnswers] = useState<FlavorIdentification[]>([]);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const flavorEngine = useRef<FlavorLearningEngine | null>(null);

  useEffect(() => {
    initializeQuiz();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: (currentQuestionIndex / (quiz?.questions.length || 1)) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, quiz]);

  const initializeQuiz = async () => {
    try {
      setIsLoading(true);
      const realm = await getRealm();
      flavorEngine.current = new FlavorLearningEngine(realm);
      
      const generatedQuiz = await flavorEngine.current.generatePersonalizedQuiz(
        user?.id || 'guest'
      );
      
      setQuiz(generatedQuiz);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error initializing quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = async () => {
    if (selectedOption === null || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.options[selectedOption];
    const isCorrect = 
      selectedAnswer.category === currentQuestion.correctAnswer.category &&
      selectedAnswer.subcategory === currentQuestion.correctAnswer.subcategory;

    // Record answer
    const flavorIdentification: FlavorIdentification = {
      flavorCategory: currentQuestion.correctAnswer.category,
      flavorSubcategory: currentQuestion.correctAnswer.subcategory,
      specificFlavor: currentQuestion.correctAnswer.specific,
      userSelection: selectedAnswer.displayName,
      isCorrect,
      confidence: showHint ? 0.5 : 0.8, // Lower confidence if hint was used
      responseTime: Date.now() - startTime,
    };

    setAnswers([...answers, flavorIdentification]);

    if (isCorrect) {
      setScore(score + currentQuestion.points);
    }

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Move to next question or finish
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowHint(false);
      setStartTime(Date.now());
    } else {
      // Quiz completed
      await saveQuizResults();
    }
  };

  const saveQuizResults = async () => {
    try {
      if (!flavorEngine.current || !user?.id) return;

      // Update flavor progress for each answer
      for (const answer of answers) {
        await flavorEngine.current.updateFlavorProgress(user.id, answer);
      }

      // Navigate to results screen
      navigation.replace('PersonalTasteQuizResults', {
        score,
        totalPoints: quiz?.questions.reduce((sum, q) => sum + q.points, 0) || 0,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalQuestions: quiz?.questions.length || 0,
        focusAreas: quiz?.focusAreas || [],
      });
    } catch (error) {
      console.error('Error saving quiz results:', error);
      Alert.alert('Error', 'Failed to save quiz results.');
    }
  };

  const renderQuestion = () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length) return null;

    const question = quiz.questions[currentQuestionIndex];

    return (
      <Animated.View style={{ opacity: fadeAnimation }}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.questionText}>{question.description}</Text>
          
          {showHint && (
            <View style={styles.hintContainer}>
              <Icon name="bulb-outline" size={16} color={HIGColors.warning} />
              <Text style={styles.hintText}>{question.hints[0]}</Text>
            </View>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.selectedOption,
              ]}
              onPress={() => handleOptionSelect(index)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionRadio,
                    selectedOption === index && styles.selectedRadio,
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === index && styles.selectedOptionText,
                  ]}
                >
                  {option.displayName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionContainer}>
          {!showHint && (
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowHint(true)}
            >
              <Icon name="help-circle-outline" size={20} color={HIGColors.primary} />
              <Text style={styles.hintButtonText}>Need a hint?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedOption === null && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={selectedOption === null}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
            </Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HIGColors.primary} />
        <Text style={styles.loadingText}>Preparing your personalized quiz...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Exit Quiz',
              'Are you sure you want to exit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Icon name="close" size={24} color={HIGColors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.scoreContainer}>
          <Icon name="star" size={20} color={HIGColors.warning} />
          <Text style={styles.scoreText}>{score} points</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((currentQuestionIndex / (quiz?.questions.length || 1)) * 100)}% Complete
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderQuestion()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIGColors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  scoreText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.text.primary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: HIGColors.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: HIGColors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: HIGColors.text.secondary,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionNumber: {
    fontSize: 14,
    color: HIGColors.text.secondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.text.primary,
    lineHeight: 28,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  hintText: {
    marginLeft: 8,
    fontSize: 14,
    color: HIGColors.text.primary,
    flex: 1,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E8F5E8',
    borderColor: HIGColors.success,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: HIGColors.border.light,
    marginRight: 12,
  },
  selectedRadio: {
    borderColor: HIGColors.success,
    backgroundColor: HIGColors.success,
  },
  optionText: {
    fontSize: 16,
    color: HIGColors.text.primary,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: HIGColors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  disabledButton: {
    backgroundColor: HIGColors.disabled,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});