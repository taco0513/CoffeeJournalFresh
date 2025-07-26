import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  onHide: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  onHide,
  duration = 2000,
}) => {
  useEffect(() => {
    if (visible) {
      // 자동 숨김
      const timer = setTimeout(() => {
        onHide();
    }, duration);

      return () => clearTimeout(timer);
  }
}, [visible, duration, onHide]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '$green9',
          borderColor: '$green10',
      };
      case 'error':
        return {
          backgroundColor: '$red9',
          borderColor: '$red10',
      };
      case 'info':
        return {
          backgroundColor: '$blue9',
          borderColor: '$blue10',
      };
      default:
        return {
          backgroundColor: '$green9',
          borderColor: '$green10',
      };
  }
};

  const getIconForType = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'i';
      default:
        return '✓';
  }
};

  return (
    <>
      {visible && (
        <View style={styles.container}>
          <View style={[styles.toast, getToastStyle()]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIconForType()}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
},
  toast: {
    width: width - 32,
    minHeight: 60,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
  },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
},
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
},
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
},
  textContainer: {
    flex: 1,
},
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
},
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
},
});

export default Toast;