import React, { useEffect } from 'react';
import { XStack, YStack, Text, styled, AnimatePresence } from 'tamagui';
import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Styled components
const ToastContainer = styled(YStack, {
  name: 'ToastContainer',
  position: 'absolute',
  top: Platform.OS === 'ios' ? 44 : 20,
  left: 0,
  right: 0,
  zIndex: 9999,
  alignItems: 'center',
  paddingHorizontal: '$lg',
});

const ToastCard = styled(XStack, {
  name: 'ToastCard',
  width: '100%',
  minHeight: 60,
  borderRadius: '$3',
  borderWidth: 1,
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
  animation: 'bouncy',
  
  enterStyle: {
    opacity: 0,
    y: -20,
    scale: 0.95,
},
  
  exitStyle: {
    opacity: 0,
    y: -20,
    scale: 0.95,
},
  
  variants: {
    type: {
      success: {
        backgroundColor: '$green9',
        borderColor: '$green10',
    },
      error: {
        backgroundColor: '$red9',
        borderColor: '$red10',
    },
      info: {
        backgroundColor: '$blue9',
        borderColor: '$blue10',
    },
  },
} as const,
  
  defaultVariants: {
    type: 'success',
},
});

const IconContainer = styled(YStack, {
  name: 'IconContainer',
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '$md',
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: '$3',
  fontWeight: 'bold',
  color: 'white',
});

const TextContainer = styled(YStack, {
  name: 'TextContainer',
  flex: 1,
});

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: '$3', // 18px
  fontWeight: '600',
  color: 'white',
  marginBottom: 2,
});

const MessageText = styled(Text, {
  name: 'MessageText',
  fontSize: '$2', // 16px
  fontWeight: '400',
  color: 'white',
  opacity: 0.9,
  lineHeight: 20,
});

// Type definitions
export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  onHide: () => void;
  duration?: number;
}

// Helper function to get icon for type
const getIconForType = (type: ToastType): string => {
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

// Main component
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
      const timer = setTimeout(() => {
        onHide();
    }, duration);

      return () => clearTimeout(timer);
  }
}, [visible, duration, onHide]);

  return (
    <ToastContainer>
      <AnimatePresence>
        {visible && (
          <ToastCard
            type={type}
            key="toast"
            animateOnly={['transform', 'opacity']}
          >
            <IconContainer>
              <IconText>{getIconForType(type)}</IconText>
            </IconContainer>
            <TextContainer>
              <TitleText>{title}</TitleText>
              {message && <MessageText>{message}</MessageText>}
            </TextContainer>
          </ToastCard>
        )}
      </AnimatePresence>
    </ToastContainer>
  );
};

export { Toast };
export default Toast;