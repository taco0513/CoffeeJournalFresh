import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Input,
  H1,
  H2,
  Paragraph,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
  Spinner,
} from 'tamagui';
import { useUserStore } from '../../stores/useUserStore';
import { validateUsername } from '../../types/user';

// Styled Components
const Container = styled(View, {
  name: 'ProfileSetupContainer',
  flex: 1,
  backgroundColor: '$background',
});

const Content = styled(ScrollView, {
  name: 'Content',
  flexGrow: 1,
  padding: '$5',
});

const Header = styled(YStack, {
  name: 'Header',
  alignItems: 'center',
  marginBottom: '$8',
  marginTop: '$12',
  gap: '$sm',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: -20,
},
});

const Title = styled(Text, {
  name: 'Title',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
});

const Subtitle = styled(Text, {
  name: 'Subtitle',
  fontSize: '$4',
  color: '$gray11',
});

const Form = styled(YStack, {
  name: 'Form',
  flex: 1,
  gap: '$lg',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
},
});

const InputContainer = styled(YStack, {
  name: 'InputContainer',
  gap: '$sm',
});

const Label = styled(Text, {
  name: 'Label',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const StyledInput = styled(Input, {
  name: 'StyledInput',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$md',
  fontSize: '$4',
  color: '$color',
  backgroundColor: '$background',
  animation: 'quick',
  placeholderTextColor: '$gray9',
  focusStyle: {
    borderColor: '$cupBlue',
    backgroundColor: '$backgroundFocus',
},
});

const Hint = styled(Text, {
  name: 'Hint',
  fontSize: '$2',
  color: '$gray10',
  lineHeight: '$1',
});

const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  backgroundColor: '$cupBrown',
  borderRadius: 25,
  paddingVertical: '$md',
  paddingHorizontal: '$lg',
  alignItems: 'center',
  marginBottom: '$md',
  borderWidth: 0,
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBrownDark',
},
  disabledStyle: {
    opacity: 0.5,
},
});

const PrimaryButtonText = styled(Text, {
  name: 'PrimaryButtonText',
  color: 'white',
  fontSize: '$5',
  fontWeight: '600',
});

const SecondaryButton = styled(Button, {
  name: 'SecondaryButton',
  backgroundColor: 'transparent',
  alignItems: 'center',
  padding: '$md',
  borderWidth: 0,
  animation: 'quick',
  pressStyle: {
    opacity: 0.6,
},
});

const SecondaryButtonText = styled(Text, {
  name: 'SecondaryButtonText',
  color: '$gray11',
  fontSize: '$4',
});

const PrivacyNote = styled(Text, {
  name: 'PrivacyNote',
  fontSize: '$2',
  color: '$gray10',
  textAlign: 'center',
  lineHeight: '$1',
  marginTop: '$5',
  paddingHorizontal: '$5',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
},
});

const LoadingOverlay = styled(YStack, {
  name: 'LoadingOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$md',
  zIndex: 100,
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$gray11',
});

export type ProfileSetupScreenProps = GetProps<typeof Container> & {
  onComplete: () => void;
};

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete, ...props }) => {
  const theme = useTheme();
  const { signUp } = useUserStore();
  
  const [step, setStep] = useState<'signup' | 'username'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
  }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
  }

    setStep('username');
};

  const handleCompleteSignUp = async () => {
    const validation = validateUsername(username);
    if (!validation.valid) {
      Alert.alert('Invalid Username', validation.error);
      return;
  }

    setIsLoading(true);
    try {
      await signUp(email, username, password);
      onComplete();
  } catch (error) {
      Alert.alert('Error', 'Failed to create account');
  } finally {
      setIsLoading(false);
  }
};

  const renderSignUpScreen = () => (
    <AnimatePresence>
      <Header>
        <Title>Welcome to CupNote</Title>
        <Subtitle>커피 테이스팅 여정을 시작하세요</Subtitle>
      </Header>

      <Form>
        <InputContainer>
          <Label>Email</Label>
          <StyledInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </InputContainer>

        <InputContainer>
          <Label>Password</Label>
          <StyledInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />
        </InputContainer>

        <YStack gap="$md">
          <PrimaryButton unstyled onPress={handleSignUp}>
            <PrimaryButtonText>Next</PrimaryButtonText>
          </PrimaryButton>
        </YStack>
      </Form>

      <PrivacyNote>
        Your data is stored securely in the cloud.{'\n'}
        Join the community and learn from other coffee lovers.
      </PrivacyNote>
    </AnimatePresence>
  );

  const renderUsernameScreen = () => (
    <AnimatePresence>
      <Header>
        <Title>Choose Your Identity</Title>
        <Subtitle>How you'll appear in the community</Subtitle>
      </Header>

      <Form>
        <InputContainer>
          <Label>Username (Required)</Label>
          <StyledInput
            value={username}
            onChangeText={setUsername}
            placeholder="coffee_lover_123"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Hint>
            3-20 characters, letters, numbers, underscore, hyphen
          </Hint>
        </InputContainer>

        <InputContainer>
          <Label>Display Name (Optional)</Label>
          <StyledInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Coffee Explorer"
            autoCapitalize="words"
          />
          <Hint>
            This is how you'll appear in the community
          </Hint>
        </InputContainer>

        <YStack gap="$md">
          <PrimaryButton 
            unstyled 
            onPress={handleCompleteSignUp}
            disabled={isLoading}
          >
            <PrimaryButtonText>
              {isLoading ? 'Creating Account...' : 'Complete Setup'}
            </PrimaryButtonText>
          </PrimaryButton>

          <SecondaryButton
            unstyled
            onPress={() => setStep('signup')}
          >
            <SecondaryButtonText>Back</SecondaryButtonText>
          </SecondaryButton>
        </YStack>
      </Form>

      <PrivacyNote>
        Your personal data is stored securely.{'\n'}
        Only your username is shown in the community.
      </PrivacyNote>
    </AnimatePresence>
  );

  return (
    <Container {...props}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Content showsVerticalScrollIndicator={false}>
          {step === 'signup' ? renderSignUpScreen() : renderUsernameScreen()}
        </Content>
      </KeyboardAvoidingView>
      
      {isLoading && (
        <LoadingOverlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          animateOnly={['opacity']}
        >
          <Spinner size="large" color="$cupBlue" />
          <LoadingText>Creating your account...</LoadingText>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default ProfileSetupScreen;