import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useUserStore } from '../stores/useUserStore';
import { validateUsername } from '../types/user';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Coffee Journal</Text>
          <Text style={styles.subtitle}>커피 테이스팅 여정을 시작하세요</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignUp}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          Your data is stored securely in the cloud.{'\n'}
          Join the community and learn from other coffee lovers.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderUsernameScreen = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Identity</Text>
          <Text style={styles.subtitle}>How you'll appear in the community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username (Required)</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="coffee_lover_123"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              3-20 characters, letters, numbers, underscore, hyphen
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Coffee Explorer"
              autoCapitalize="words"
            />
            <Text style={styles.hint}>
              This is how you'll appear in the community
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCompleteSignUp}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Creating Account...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('signup')}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          Your personal data is stored securely.{'\n'}
          Only your username is shown in the community.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  switch (step) {
    case 'signup':
      return renderSignUpScreen();
    case 'username':
      return renderUsernameScreen();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  hint: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 6,
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 16,
  },
  secondaryButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default ProfileSetupScreen;