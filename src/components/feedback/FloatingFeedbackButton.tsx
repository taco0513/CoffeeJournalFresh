import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { View, Text, Button, styled } from 'tamagui';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import ScreenContextService from '../../services/ScreenContextService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const SAFE_AREA = 20;

// Styled Components
const Container = styled(View, {
  name: 'FloatingFeedbackContainer',
  position: 'absolute',
  bottom: 120, // Above tab bar
  right: SAFE_AREA,
  zIndex: 9999,
  alignItems: 'center',
});

const FloatingButton = styled(Button, {
  name: 'FloatingButton',
  backgroundColor: '$cupBlue',
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: BUTTON_SIZE / 2,
  borderWidth: 0,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  pressStyle: { opacity: 0.9 },
  variants: {
    expanded: {
      true: {
        width: 120,
        height: 50,
        borderRadius: 25,
      },
    },
  } as const,
});

const ExpandedContent = styled(View, {
  name: 'ExpandedContent',
  alignItems: 'center',
  justifyContent: 'center',
});

const ExpandedText = styled(Text, {
  name: 'ExpandedText',
  color: 'white',
  fontSize: '$3',
  fontWeight: '600',
});

const ExpandedSubtext = styled(Text, {
  name: 'ExpandedSubtext',
  color: 'white',
  fontSize: '$1',
  opacity: 0.8,
});

const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontSize: 24,
});

const BetaBadge = styled(View, {
  name: 'BetaBadge',
  backgroundColor: '$orange9',
  paddingHorizontal: '$1',
  paddingVertical: '$1',
  borderRadius: '$1',
  marginTop: '$1',
});

const BetaBadgeText = styled(Text, {
  name: 'BetaBadgeText',
  color: 'white',
  fontSize: '$1',
  fontWeight: '700',
});

export const FloatingFeedbackButton: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { showSmartFeedback, setScreenContext } = useFeedbackStore();
  const [expanded, setExpanded] = useState(false);

  const handlePress = async () => {
    if (expanded) {
      // Capture current screen context and screenshot before opening feedback
      try {
        const screenContext = await ScreenContextService.getCurrentContext();
        if (screenContext) {
          setScreenContext(screenContext);
        }
        
        // Auto-capture screenshot of current screen
        await captureCurrentScreen();
      } catch (error) {
        console.error('Error capturing screen context:', error);
      }
      
      showSmartFeedback();
      setExpanded(false);
    } else {
      setExpanded(true);
      // Auto collapse after 5 seconds
      setTimeout(() => setExpanded(false), 5000);
    }
  };

  const captureCurrentScreen = async () => {
    try {
      // Import ViewShot dynamically to avoid issues
      const ViewShot = require('react-native-view-shot');
      
      // Capture the entire screen
      const uri = await ViewShot.captureScreen({
        format: 'jpg',
        quality: 0.8,
        result: 'tmpfile',
      });
      
      if (uri) {
        const { setScreenshot } = useFeedbackStore.getState();
        setScreenshot(uri);
        console.log('Screen captured automatically:', uri);
      }
    } catch (error) {
      console.log('Auto screenshot capture failed, will allow manual capture:', error);
      // Don't show error to user, just log it
    }
  };

  if (!visible) return null;

  return (
    <Container>
      <FloatingButton
        expanded={expanded}
        onPress={handlePress}
        unstyled
      >
        {expanded ? (
          <ExpandedContent>
            <ExpandedText>피드백</ExpandedText>
            <ExpandedSubtext>탭하여 열기</ExpandedSubtext>
          </ExpandedContent>
        ) : (
          <ButtonText>💭</ButtonText>
        )}
      </FloatingButton>
      
      {/* Beta Badge */}
      <BetaBadge>
        <BetaBadgeText>BETA</BetaBadgeText>
      </BetaBadge>
    </Container>
  );
};