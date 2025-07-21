import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { UserLevel } from './UserLevelSelector';

export interface HintData {
  icon: string;
  text: string;
  dismissible: boolean;
  actionText?: string;
  onAction?: () => void;
}

interface ContextualHintProps {
  screen: string;
  userLevel: UserLevel;
  tastingHistory?: {
    totalTastings: number;
    lastTastingDate?: Date;
    favoriteOrigins?: string[];
    commonFlavors?: string[];
  };
  onDismiss?: () => void;
}

const HINTS: Record<string, Record<UserLevel, HintData[]>> = {
  'coffee-info': {
    beginner: [
      {
        icon: '💡',
        text: '커피 봉투에서 원산지와 로스팅 날짜를 찾아보세요',
        dismissible: true,
      },
      {
        icon: '📸',
        text: '카메라 버튼을 눌러 라벨을 스캔할 수 있어요',
        dismissible: true,
      },
    ],
    intermediate: [
      {
        icon: '🌍',
        text: '같은 원산지 커피를 비교해보면 지역별 특성을 발견할 수 있어요',
        dismissible: true,
      },
    ],
    expert: [
      {
        icon: '🔬',
        text: '가공 방식과 품종 정보도 기록하면 더 정확한 분석이 가능해요',
        dismissible: true,
      },
    ],
  },
  'roaster-notes': {
    beginner: [
      {
        icon: '📝',
        text: '로스터가 추천하는 향미를 먼저 읽어보세요',
        dismissible: true,
      },
      {
        icon: '🎯',
        text: '나중에 내가 찾은 향미와 비교해보면 재미있어요',
        dismissible: true,
      },
    ],
    intermediate: [
      {
        icon: '🤔',
        text: '로스터 노트는 참고만 하고, 자신의 감각을 믿으세요',
        dismissible: true,
      },
    ],
    expert: [
      {
        icon: '🎭',
        text: '블라인드 테이스팅 모드를 켜서 선입견 없이 테이스팅해보세요',
        dismissible: true,
        actionText: '블라인드 모드',
      },
    ],
  },
  'flavor-selection': {
    beginner: [
      {
        icon: '🎨',
        text: '처음 느껴지는 맛 2-3개를 선택해보세요',
        dismissible: true,
      },
      {
        icon: '🍓',
        text: '과일맛이 난다면 어떤 과일인지 생각해보세요',
        dismissible: true,
      },
    ],
    intermediate: [
      {
        icon: '🔍',
        text: '향미는 시간에 따라 변해요. 처음, 중간, 마지막 맛을 구분해보세요',
        dismissible: true,
      },
      {
        icon: '⭐',
        text: '자주 사용하는 향미는 별표를 눌러 저장하세요',
        dismissible: true,
      },
    ],
    expert: [
      {
        icon: '📊',
        text: '이전 테이스팅과 비교하면서 향미의 강도 차이를 느껴보세요',
        dismissible: true,
      },
    ],
  },
  'sensory': {
    beginner: [
      {
        icon: '👅',
        text: '입안의 무게감과 질감에 집중해보세요',
        dismissible: true,
      },
      {
        icon: '🍋',
        text: '신맛은 혀 옆쪽에서, 단맛은 혀 끝에서 느껴져요',
        dismissible: true,
      },
    ],
    intermediate: [
      {
        icon: '⚖️',
        text: '바디감은 우유의 무게감과 비교해보면 쉬워요',
        dismissible: true,
      },
      {
        icon: '🌡️',
        text: '온도가 내려가면서 달라지는 맛도 기록해보세요',
        dismissible: true,
      },
    ],
    expert: [
      {
        icon: '🎼',
        text: '산미의 종류(시트릭, 말릭, 타르타릭)를 구분해보세요',
        dismissible: true,
      },
    ],
  },
  'personal-comment': {
    beginner: [
      {
        icon: '✍️',
        text: '이 커피를 마시며 떠오른 기억이나 느낌을 자유롭게 적어보세요',
        dismissible: true,
      },
    ],
    intermediate: [
      {
        icon: '💭',
        text: '다시 마시고 싶은지, 누구에게 추천하고 싶은지 적어보세요',
        dismissible: true,
      },
    ],
    expert: [
      {
        icon: '📈',
        text: '추출 변수를 바꿔서 테이스팅하면 어떤 차이가 있을지 예상해보세요',
        dismissible: true,
      },
    ],
  },
};

export const ContextualHint: React.FC<ContextualHintProps> = ({
  screen,
  userLevel,
  tastingHistory,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const getContextualHint = (): HintData | null => {
    const screenHints = HINTS[screen]?.[userLevel];
    if (!screenHints || screenHints.length === 0) return null;

    // 컨텍스트 기반 힌트 선택 로직
    if (tastingHistory) {
      // 첫 테이스팅인 경우
      if (tastingHistory.totalTastings === 0) {
        return screenHints[0];
      }
      
      // 일주일 이상 테이스팅하지 않은 경우
      if (tastingHistory.lastTastingDate) {
        const daysSinceLastTasting = Math.floor(
          (new Date().getTime() - tastingHistory.lastTastingDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastTasting > 7 && screenHints.length > 1) {
          return screenHints[1];
        }
      }
    }

    // 랜덤하게 힌트 선택
    const randomIndex = Math.floor(Math.random() * screenHints.length);
    return screenHints[randomIndex];
  };

  const hint = getContextualHint();

  useEffect(() => {
    if (hint) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hint]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!hint) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{hint.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.hintText}>{hint.text}</Text>
          {hint.actionText && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                hint.onAction?.();
                handleDismiss();
              }}
            >
              <Text style={styles.actionButtonText}>{hint.actionText}</Text>
            </TouchableOpacity>
          )}
        </View>
        {hint.dismissible && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dismissButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBlue + '15',
    borderRadius: HIGConstants.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: HIGColors.systemBlue + '30',
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: HIGConstants.SPACING_MD,
  },
  icon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_MD,
  },
  textContainer: {
    flex: 1,
  },
  hintText: {
    fontSize: 14,
    color: HIGColors.label,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.white,
  },
  dismissButton: {
    marginLeft: HIGConstants.SPACING_SM,
  },
  dismissButtonText: {
    fontSize: 18,
    color: HIGColors.tertiaryLabel,
  },
});