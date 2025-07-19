import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import LinearGradient from 'react-native-linear-gradient';

interface CoffeeDiscoveryAlertProps {
  visible: boolean;
  type: 'discovered' | 'approved';
  coffeeName?: string;
  roasteryName?: string;
  badgeLevel?: number;
  onClose: () => void;
}

export const CoffeeDiscoveryAlert: React.FC<CoffeeDiscoveryAlertProps> = ({
  visible,
  type,
  coffeeName,
  roasteryName,
  badgeLevel = 1,
  onClose,
}) => {
  const [animation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getMessage = () => {
    if (type === 'discovered') {
      return {
        title: '🎉 새로운 커피 발견!',
        subtitle: `${roasteryName}의 "${coffeeName}"`,
        message: '축하합니다! 새로운 커피를 발견하셨네요.\n관리자 검수 후 모든 사용자가 이용할 수 있게 됩니다.',
        badge: '🏆 커피 탐험가',
        gradientColors: ['#FFD700', '#FFA500'],
      };
    } else {
      return {
        title: '✅ 커피가 등록되었습니다!',
        subtitle: `${roasteryName}의 "${coffeeName}"`,
        message: '관리자가 검수를 완료했습니다.\n이제 모든 사용자가 이 커피를 검색할 수 있어요!',
        badge: `🏆 커피 발견자 Lv.${badgeLevel}`,
        gradientColors: ['#4ECDC4', '#44A08D'],
      };
    }
  };

  const { title, subtitle, message, badge, gradientColors } = getMessage();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: animation,
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              </View>

              <Text style={styles.message}>{message}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 350,
    borderRadius: HIGConstants.BORDER_RADIUS * 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    padding: 1,
  },
  content: {
    backgroundColor: HIGColors.systemBackground,
    margin: 1,
    borderRadius: HIGConstants.BORDER_RADIUS * 2 - 1,
    padding: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_LG,
    textAlign: 'center',
  },
  badgeContainer: {
    marginVertical: HIGConstants.SPACING_LG,
  },
  badge: {
    backgroundColor: HIGColors.gray6,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS * 3,
  },
  badgeText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XL,
  },
  button: {
    backgroundColor: HIGColors.blue,
    paddingHorizontal: HIGConstants.SPACING_XL * 2,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS * 3,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});