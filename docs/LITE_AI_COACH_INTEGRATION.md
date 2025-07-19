# Lite AI Coach Integration Guide

## 🤖 Overview

The Lite AI Coach provides intelligent, personalized guidance throughout the coffee tasting journey. It uses the data from PersonalTasteAnalysisService, FlavorLearningEngine, and AchievementSystem to offer contextual tips and feedback.

## 📁 New Files Created

### Services
- `src/services/LiteAICoachService.ts` - Core AI coach logic

### UI Components
- `src/components/coach/CoachTipCard.tsx` - Individual tip display
- `src/components/coach/CoachInsightBanner.tsx` - Daily insight banner
- `src/components/coach/CoachFeedbackModal.tsx` - Post-tasting feedback
- `src/components/coach/index.ts` - Component exports

## 🔧 Integration Points

### 1. Service Initialization

```typescript
// In your app initialization or context provider:
import { LiteAICoachService } from '@/services/LiteAICoachService';

const coachService = new LiteAICoachService(
  personalTasteAnalysisService,
  flavorLearningEngine,
  achievementSystem
);

// Make available through context or store
```

### 2. Home Screen Integration

```typescript
// HomeScreen.tsx
import { CoachInsightBanner } from '@/components/coach';
import { useLiteAICoach } from '@/hooks/useLiteAICoach'; // You'll create this

export const HomeScreen = () => {
  const { dailyInsight, loading } = useLiteAICoach();

  return (
    <ScrollView>
      {/* Daily AI Insight at the top */}
      {dailyInsight && !loading && (
        <CoachInsightBanner
          insight={dailyInsight}
          onAction={() => {
            // Navigate based on suggested action
            navigation.navigate('TastingFlow');
          }}
        />
      )}
      
      {/* Rest of home screen content */}
    </ScrollView>
  );
};
```

### 3. Coffee Info Screen (Pre-Tasting)

```typescript
// CoffeeInfoScreen.tsx
import { CoachTipCard } from '@/components/coach';

export const CoffeeInfoScreen = () => {
  const [guidance, setGuidance] = useState<TastingGuidance | null>(null);
  const { coachService } = useServices();

  useEffect(() => {
    loadGuidance();
  }, [coffeeInfo]);

  const loadGuidance = async () => {
    const tips = await coachService.getTastingGuidance(
      userId,
      {
        roasterName: coffeeInfo.roasterName,
        coffeeName: coffeeInfo.coffeeName,
        origin: coffeeInfo.origin,
        process: coffeeInfo.process,
        roasterNotes: coffeeInfo.roasterNotes,
      }
    );
    setGuidance(tips);
  };

  return (
    <ScrollView>
      {/* Coffee info fields */}
      
      {/* AI Coach Tips */}
      {guidance && guidance.preTastingTips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>AI Coach Tips</Text>
          {guidance.preTastingTips.map((tip) => (
            <CoachTipCard
              key={tip.id}
              tip={tip}
              onAction={(action) => {
                // Handle actions like 'learn_flavor_fruity'
                if (action.startsWith('learn_flavor_')) {
                  navigation.navigate('FlavorGuide', {
                    flavor: action.replace('learn_flavor_', ''),
                  });
                }
              }}
              autoHide={false}
            />
          ))}
        </View>
      )}

      {/* Difficulty indicator */}
      {guidance && (
        <View style={styles.difficultyBadge}>
          <Text>Difficulty: {guidance.difficulty}</Text>
        </View>
      )}
    </ScrollView>
  );
};
```

### 4. Flavor Selection Screens

```typescript
// FlavorSelectionScreen.tsx
export const FlavorSelectionScreen = () => {
  const { guidance } = useCoachGuidance(); // Custom hook to access guidance
  
  const handleFlavorPress = (flavor: string) => {
    // Show hint if available
    const hint = guidance?.flavorHints.get(flavor);
    if (hint && !hasSeenHint(flavor)) {
      Alert.alert('💡 Coach Tip', hint);
      markHintAsSeen(flavor);
    }
    
    // Continue with selection...
  };

  return (
    <View>
      {/* Show focus areas */}
      {guidance?.focusAreas.length > 0 && (
        <View style={styles.focusBar}>
          <Text style={styles.focusLabel}>Focus on:</Text>
          {guidance.focusAreas.map((area) => (
            <Badge key={area} text={area} />
          ))}
        </View>
      )}
      
      {/* Flavor wheel with hints */}
      <FlavorWheel
        onFlavorPress={handleFlavorPress}
        highlightedFlavors={guidance?.expectedFlavors}
      />
    </View>
  );
};
```

### 5. Result Screen (Post-Tasting)

```typescript
// ResultScreen.tsx
import { CoachFeedbackModal } from '@/components/coach';

export const ResultScreen = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);

  useEffect(() => {
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    const feedback = await coachService.provideFeedback(userId, {
      selectedFlavors: tastingRecord.flavorNotes.map(n => n.level1),
      roasterNotes: coffeeInfo.roasterNotes,
      sensoryRatings: {
        body: sensoryAttributes.body,
        acidity: sensoryAttributes.acidity,
        sweetness: sensoryAttributes.sweetness,
        finish: sensoryAttributes.finish,
      },
      confidence: tastingRecord.tasteConfidence,
    });
    
    setCoachFeedback(feedback);
    
    // Show feedback after a short delay
    setTimeout(() => setShowFeedback(true), 1500);
  };

  return (
    <View>
      {/* Regular result content */}
      
      {/* AI Coach Feedback Modal */}
      <CoachFeedbackModal
        visible={showFeedback}
        feedback={coachFeedback}
        onClose={() => setShowFeedback(false)}
        onAction={(action) => {
          if (action.startsWith('practice_')) {
            navigation.navigate('FlavorQuiz', {
              focusFlavor: action.replace('practice_', ''),
            });
          } else if (action === 'show_flavor_wheel') {
            navigation.navigate('FlavorGuide');
          }
        }}
      />
    </View>
  );
};
```

### 6. Quiz/Learning Games

```typescript
// FlavorQuizScreen.tsx
export const FlavorQuizScreen = () => {
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  
  const getHint = async () => {
    const hint = await coachService.getQuizHint(
      userId,
      question.type,
      question.flavorCategory,
      currentHintLevel + 1
    );
    
    setCurrentHintLevel(prev => prev + 1);
    showHint(hint);
  };

  return (
    <View>
      {/* Quiz question */}
      
      {/* Hint button */}
      <TouchableOpacity onPress={getHint}>
        <Text>Need a hint? ({3 - currentHintLevel} remaining)</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🪝 Custom Hooks

### useLiteAICoach Hook

```typescript
// src/hooks/useLiteAICoach.ts
import { useEffect, useState } from 'react';
import { useServices } from '@/contexts/ServicesContext';
import { DailyInsight, LearningPath } from '@/services/LiteAICoachService';

export const useLiteAICoach = () => {
  const { coachService, userId } = useServices();
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      setLoading(true);
      const [insight, path] = await Promise.all([
        coachService.getDailyInsight(userId),
        coachService.generateLearningPath(userId),
      ]);
      setDailyInsight(insight);
      setLearningPath(path);
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    dailyInsight,
    learningPath,
    loading,
    refresh: loadCoachData,
  };
};
```

## 📊 Analytics Integration

Track coach interactions:

```typescript
// When showing tips
Analytics.track('coach_tip_shown', {
  tip_type: tip.type,
  tip_id: tip.id,
  screen: 'coffee_info',
});

// When user takes action
Analytics.track('coach_action_taken', {
  action: action,
  tip_id: tip.id,
});

// Feedback response
Analytics.track('coach_feedback_viewed', {
  overall_rating: feedback.overall,
  match_score: feedback.matchScore,
});
```

## 🎨 UI/UX Best Practices

1. **Non-Intrusive**: Tips should enhance, not interrupt the flow
2. **Dismissible**: Users can close tips if not interested
3. **Actionable**: Each tip should have a clear action when relevant
4. **Progressive**: Start with essential tips, reveal advanced ones over time
5. **Contextual**: Tips appear when most relevant

## 🧪 Testing Coach Features

```typescript
// Mock coach service for testing
export const createMockCoachService = () => ({
  getTastingGuidance: jest.fn().mockResolvedValue({
    preTastingTips: [
      {
        id: 'test-1',
        type: 'guidance',
        priority: 'medium',
        title: 'Test Tip',
        message: 'This is a test tip',
      },
    ],
    flavorHints: new Map([['fruity', 'Think berries']]),
    focusAreas: ['fruity'],
    difficulty: 'medium',
  }),
  
  provideFeedback: jest.fn().mockResolvedValue({
    overall: 'good',
    matchScore: 75,
    strengths: ['Good flavor identification'],
    improvements: ['Try focusing on acidity'],
    tips: [],
    encouragement: 'Great job!',
  }),
  
  getDailyInsight: jest.fn().mockResolvedValue({
    fact: 'Test fact',
    personalizedMessage: 'Test message',
    suggestedAction: 'Test action',
  }),
});
```

## 🚀 Next Steps

1. **Voice Integration** (Future): Add voice notes for tasting descriptions
2. **Chat Interface** (Future): Full conversational AI coach
3. **Video Tips** (Future): Short tutorial videos for techniques
4. **Group Learning** (Future): Coach-facilitated group tastings

## 📱 Example Flow

1. **Morning**: User opens app, sees daily insight banner
2. **Pre-Tasting**: Gets personalized tips based on coffee and skill level
3. **During Tasting**: Sees hints for challenging flavors
4. **Post-Tasting**: Receives detailed feedback and encouragement
5. **Learning**: Gets quiz hints and learning path recommendations

The Lite AI Coach makes every tasting a learning opportunity! 🎯☕