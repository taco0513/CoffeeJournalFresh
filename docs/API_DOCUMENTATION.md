# API Documentation for CupNote

This document contains comprehensive documentation for all third-party APIs and frameworks used in the CupNote coffee journaling app. This documentation is sourced from official libraries and their latest documentation to ensure accuracy and completeness.

## Table of Contents

1. [React Native Framework](#react-native-framework)
2. [Supabase Backend Services](#supabase-backend-services)
3. [Tamagui UI Framework](#tamagui-ui-framework)
4. [Authentication Services](#authentication-services)
5. [Data Storage Solutions](#data-storage-solutions)
6. [Navigation and Utilities](#navigation-and-utilities)
7. [Additional Services](#additional-services)

---

## React Native Framework

### Overview
React Native 0.80 provides the core mobile app development framework for CupNote, enabling cross-platform iOS and Android development with native performance.

### Key Implementation Patterns

#### Navigation Setup
```typescript
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

#### Component Structure
```typescript
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export const CoffeeCard = ({ coffee, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{coffee.name}</Text>
      <Text style={styles.description}>{coffee.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
})
```

### Dependencies in CupNote
- `react-native: 0.80.1` - Core framework
- `@react-navigation/native: ^7.1.14` - Navigation system
- `@react-navigation/stack: ^7.4.2` - Stack navigation
- `@react-navigation/bottom-tabs: ^7.4.2` - Tab navigation

---

## Supabase Backend Services

### Overview
Supabase provides the complete backend infrastructure for CupNote, including authentication, database, and real-time capabilities. The integration uses `@supabase/supabase-js: ^2.52.0`.

### Client Initialization

#### Basic Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
```

#### Typed Client with React Native
```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from './database.types'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### Authentication Patterns

#### Email/Password Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Sign out
const { error } = await supabase.auth.signOut()
```

#### Session Management
```typescript
import { useEffect, useState } from 'react'

export function useSupabaseAuth() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}
```

### Database Operations

#### Basic CRUD Operations
```typescript
// Select data
const { data, error } = await supabase
  .from('tasting_records')
  .select('*')
  .eq('user_id', userId)

// Insert data
const { data, error } = await supabase
  .from('tasting_records')
  .insert([
    { coffee_name: 'Ethiopian Yirgacheffe', rating: 4.5, user_id: userId }
  ])

// Update data
const { data, error } = await supabase
  .from('tasting_records')
  .update({ rating: 5 })
  .eq('id', recordId)

// Delete data
const { data, error } = await supabase
  .from('tasting_records')
  .delete()
  .eq('id', recordId)
```

#### Real-time Subscriptions
```typescript
useEffect(() => {
  const channel = supabase
    .channel('tasting_records_changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'tasting_records' }, 
      (payload) => {
        console.log('New record:', payload.new)
        // Update local state
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Row Level Security (RLS)
```sql
-- Enable RLS on tasting_records table
ALTER TABLE tasting_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own records
CREATE POLICY "Users can view own records" ON tasting_records
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own records  
CREATE POLICY "Users can insert own records" ON tasting_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Configuration Requirements
```bash
# Environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## Tamagui UI Framework

### Overview
Tamagui provides a comprehensive UI system for CupNote with styled components, theming, and cross-platform compatibility. Version: `^1.132.12`.

### Basic Setup and Configuration

#### Core Imports
```typescript
import { TamaguiProvider, createTamagui } from 'tamagui'
import { config } from './tamagui.config'

export default function App() {
  return (
    <TamaguiProvider config={config}>
      {/* Your app components */}
    </TamaguiProvider>
  )
}
```

### Styled Components

#### Creating Basic Styled Components
```typescript
import { View, Text, styled } from '@tamagui/core'

const Container = styled(View, {
  padding: '$4',
  backgroundColor: '$background',
  borderRadius: '$3',
})

const Title = styled(Text, {
  fontSize: '$6',
  fontWeight: 'bold',
  color: '$color',
})

// Usage
export const CoffeeCard = ({ title, children }) => (
  <Container>
    <Title>{title}</Title>
    {children}
  </Container>
)
```

#### Advanced Styled Components with Variants
```typescript
import { View, styled } from '@tamagui/core'

export const Button = styled(View, {
  borderRadius: '$2',
  paddingVertical: '$2',
  paddingHorizontal: '$3',
  backgroundColor: '$background',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',

  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },

  pressStyle: {
    backgroundColor: '$backgroundPress',
  },

  variants: {
    size: {
      small: {
        paddingVertical: '$1',
        paddingHorizontal: '$2',
      },
      large: {
        paddingVertical: '$3',
        paddingHorizontal: '$4',
      },
    },
    variant: {
      primary: {
        backgroundColor: '$blue9',
        color: '$white',
      },
      secondary: {
        backgroundColor: '$gray4',
        color: '$gray12',
      },
    },
  } as const,
})
```

### Theme System

#### Defining Custom Themes
```typescript
const light = {
  background: '#fff',
  backgroundHover: '#f5f5f5',
  backgroundPress: '#e0e0e0',
  color: '#000',
  colorHover: '#111',
  borderColor: '#ddd',
  // Coffee-specific theme colors
  coffeeAccent: '#8B4513',
  coffeeSecondary: '#D2691E',
}

const dark = {
  background: '#000',
  backgroundHover: '#111',
  backgroundPress: '#222',
  color: '#fff',
  colorHover: '#eee',
  borderColor: '#333',
  // Coffee-specific theme colors
  coffeeAccent: '#CD853F',
  coffeeSecondary: '#F4A460',
}
```

#### Using Themes in Components
```typescript
import { Theme, Button, useTheme } from 'tamagui'

// Apply theme context
export const CoffeeSection = ({ children }) => (
  <Theme name="coffee">
    {children}
  </Theme>
)

// Access theme values
export const ThemedComponent = () => {
  const theme = useTheme()
  
  return (
    <View backgroundColor={theme.coffeeAccent.val}>
      <Text color={theme.color.val}>Coffee themed content</Text>
    </View>
  )
}
```

### Component System

#### Layout Components
```typescript
import { XStack, YStack, Stack } from 'tamagui'

export const CoffeeRatingCard = () => (
  <YStack space="$3" padding="$4">
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontSize="$5" fontWeight="bold">Ethiopian Yirgacheffe</Text>
      <Text fontSize="$4" color="$yellow9">★★★★☆</Text>
    </XStack>
    <Stack>
      <Text fontSize="$3" color="$gray10">
        Bright acidity with floral notes and citrus undertones
      </Text>
    </Stack>
  </YStack>
)
```

#### Text Components
```typescript
import { Text, SizableText, Paragraph, H1, H2 } from 'tamagui'

export const CoffeeDetails = ({ coffee }) => (
  <YStack space="$2">
    <H1 color="$coffeeAccent">{coffee.name}</H1>
    <H2 color="$gray9">{coffee.origin}</H2>
    <Paragraph fontSize="$4" lineHeight="$5">
      {coffee.description}
    </Paragraph>
    <SizableText size="$3" color="$gray8">
      Roasted on: {coffee.roastDate}
    </SizableText>
  </YStack>
)
```

### Animation Support
```typescript
import { AnimatePresence, View } from 'tamagui'

export const CoffeeCardWithAnimation = ({ isVisible, coffee }) => (
  <AnimatePresence>
    {isVisible && (
      <View
        key={coffee.id}
        animation="bouncy"
        backgroundColor="$background"
        padding="$4"
        borderRadius="$3"
        enterStyle={{
          opacity: 0,
          y: 10,
          scale: 0.9,
        }}
        exitStyle={{
          opacity: 0,
          y: -10,
          scale: 0.9,
        }}
      >
        <Text>{coffee.name}</Text>
      </View>
    )}
  </AnimatePresence>
)
```

### Dependencies in CupNote
- `tamagui: ^1.132.12` - Core UI system
- `@tamagui/core: ^1.132.12` - Core styling engine
- `@tamagui/themes: ^1.132.12` - Default themes
- `@tamagui/font-inter: ^1.132.12` - Font integration
- `@tamagui/animations-react-native: ^1.132.12` - Animation support

---

## Authentication Services

### Apple Sign-In Integration

#### Configuration
```typescript
import { AppleButton } from '@invertase/react-native-apple-authentication'
import { supabase } from './supabase'

// Apple Sign-In component
export const AppleSignInButton = () => {
  const handleAppleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      })

      const { identityToken, nonce } = appleAuthRequestResponse
      
      if (identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
          nonce,
        })
        
        if (error) {
          console.error('Apple Sign-In error:', error)
        }
      }
    } catch (error) {
      console.error('Apple Auth error:', error)
    }
  }

  return (
    <AppleButton
      buttonStyle={AppleButton.Style.BLACK}
      buttonType={AppleButton.Type.SIGN_IN}
      onPress={handleAppleSignIn}
    />
  )
}
```

### Google OAuth Integration

#### Current Implementation Status
The Google OAuth service is currently implemented as a stub in `src/services/supabase/googleAuth.ts`:

```typescript
export class GoogleAuthService {
  static async signIn(): Promise<GoogleSignInResult> {
    console.log('Google Sign-In is not available. Please install @react-native-google-signin/google-signin package.')
    return {
      success: false,
      error: 'Google Sign-In is not installed. Please install the required package.',
    }
  }
  
  // Additional stub methods...
}
```

#### Full Implementation Pattern
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { supabase } from './supabase'

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'your-web-client-id.apps.googleusercontent.com',
  iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
})

export class GoogleAuthService {
  static async signIn() {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken,
      })
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

### Environment Configuration
```bash
# Apple Sign-In
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id

# Google OAuth
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

---

## Data Storage Solutions

### Realm Database (Local Storage)

#### Configuration and Setup
```typescript
import Realm from 'realm'

// Define schemas
const TastingRecordSchema = {
  name: 'TastingRecord',
  primaryKey: 'id',
  properties: {
    id: 'string',
    coffeeName: 'string',
    rating: 'double',
    notes: 'string?',
    brewMethod: 'string?',
    createdAt: 'date',
    userId: 'string',
  },
}

// Initialize Realm
export const initRealm = async () => {
  return await Realm.open({
    schema: [TastingRecordSchema],
    schemaVersion: 1,
  })
}
```

#### Data Operations
```typescript
// Create record
export const createTastingRecord = async (data) => {
  const realm = await initRealm()
  realm.write(() => {
    realm.create('TastingRecord', {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    })
  })
  realm.close()
}

// Query records
export const getTastingRecords = async (userId) => {
  const realm = await initRealm()
  const records = realm.objects('TastingRecord')
    .filtered('userId == $0', userId)
    .sorted('createdAt', true)
  
  return Array.from(records)
}
```

### AsyncStorage (Settings & Preferences)

#### Basic Usage Patterns
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

// Store user preferences
export const saveUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences))
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}

// Load user preferences
export const loadUserPreferences = async () => {
  try {
    const value = await AsyncStorage.getItem('userPreferences')
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Error loading preferences:', error)
    return null
  }
}

// Store onboarding state
export const setOnboardingComplete = async () => {
  await AsyncStorage.setItem('onboardingComplete', 'true')
}

export const hasCompletedOnboarding = async () => {
  const value = await AsyncStorage.getItem('onboardingComplete')
  return value === 'true'
}
```

### Dependencies
- `realm: ^20.1.0` - Local database
- `@react-native-async-storage/async-storage: ^2.2.0` - Key-value storage

---

## Navigation and Utilities

### React Navigation

#### Stack Navigator Setup
```typescript
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Coffee Journal' }}
        />
        <Stack.Screen 
          name="TastingDetail" 
          component={TastingDetailScreen}
          options={{ title: 'Tasting Notes' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

#### Tab Navigator Integration
```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator()

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowIcon: false,
        // Icons removed - using text labels instead
      })}
    >
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Statistics" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
```

### Internationalization (i18next)

#### Configuration
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

const resources = {
  en: {
    translation: {
      "coffee": "Coffee",
      "tasting_notes": "Tasting Notes",
      "rating": "Rating",
    }
  },
  ko: {
    translation: {
      "coffee": "커피",
      "tasting_notes": "테이스팅 노트",
      "rating": "평점",
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
```

#### Usage in Components
```typescript
import { useTranslation } from 'react-i18next'

export const CoffeeCard = ({ coffee }) => {
  const { t } = useTranslation()
  
  return (
    <View>
      <Text>{t('coffee')}: {coffee.name}</Text>
      <Text>{t('rating')}: {coffee.rating}</Text>
    </View>
  )
}
```

### State Management (Zustand)

#### Store Definition
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface TastingStore {
  records: TastingRecord[]
  currentUser: User | null
  addRecord: (record: TastingRecord) => void
  setUser: (user: User) => void
  clearRecords: () => void
}

export const useTastingStore = create<TastingStore>()(
  persist(
    (set, get) => ({
      records: [],
      currentUser: null,
      
      addRecord: (record) => set((state) => ({
        records: [record, ...state.records]
      })),
      
      setUser: (user) => set({ currentUser: user }),
      
      clearRecords: () => set({ records: [] }),
    }),
    {
      name: 'tasting-store',
      storage: {
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: (name, value) => AsyncStorage.setItem(name, value),
        removeItem: (name) => AsyncStorage.removeItem(name),
      },
    }
  )
)
```

#### Usage in Components
```typescript
import { useTastingStore } from './store'

export const JournalScreen = () => {
  const { records, addRecord } = useTastingStore()
  
  const handleAddRecord = (newRecord) => {
    addRecord(newRecord)
  }
  
  return (
    <FlatList
      data={records}
      renderItem={({ item }) => <TastingCard record={item} />}
      keyExtractor={(item) => item.id}
    />
  )
}
```

### Dependencies
- `@react-navigation/native: ^7.1.14` - Core navigation
- `@react-navigation/stack: ^7.4.2` - Stack navigation
- `@react-navigation/bottom-tabs: ^7.4.2` - Tab navigation
- `i18next: ^25.3.2` - Internationalization core
- `react-i18next: ^15.6.0` - React integration
- `zustand: ^5.0.6` - State management

---

## Additional Services

### Firecrawl Integration

#### Market Intelligence Service
CupNote integrates Firecrawl for real-time coffee industry data intelligence. The service is implemented in `src/services/FirecrawlCoffeeService.ts`.

```typescript
// Example usage from FIRECRAWL_SETUP.md
const firecrawlService = {
  async getKoreanMarketData() {
    // Scrape Korean coffee roasters
    return await firecrawl.scrape('https://coffeelibrary.co.kr')
  },
  
  async getUSMarketData() {
    // Scrape US coffee roasters  
    return await firecrawl.scrape('https://bluebottlecoffee.com')
  },
  
  async getCompetitorAnalysis() {
    // Monitor coffee app competitors
    return await firecrawl.search('coffee journal app store')
  }
}
```

#### Configuration
```bash
# Firecrawl API configuration
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### Analytics and Monitoring

#### Sentry Integration
```typescript
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

// Error tracking
export const trackError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Performance monitoring
export const trackPerformance = (operationName, operation) => {
  const transaction = Sentry.startTransaction({ name: operationName })
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction))
  
  try {
    const result = operation()
    transaction.setStatus('ok')
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    throw error
  } finally {
    transaction.finish()
  }
}
```

### Device Integration

#### React Native Device Info
```typescript
import DeviceInfo from 'react-native-device-info'

export const getDeviceInfo = async () => {
  return {
    deviceId: await DeviceInfo.getUniqueId(),
    deviceName: await DeviceInfo.getDeviceName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    appVersion: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
  }
}
```

#### Haptic Feedback
```typescript
import HapticFeedback from 'react-native-haptic-feedback'

export const provideFeedback = (type = 'impactLight') => {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  }
  
  HapticFeedback.trigger(type, options)
}

// Usage in rating component
export const StarRating = ({ onRatingChange }) => {
  const handleRatingPress = (rating) => {
    provideFeedback('impactLight')
    onRatingChange(rating)
  }
  
  return (
    // Rating component JSX
  )
}
```

### Additional Dependencies
- `@sentry/react-native` - Error tracking and performance monitoring
- `react-native-device-info: ^14.0.4` - Device information
- `react-native-haptic-feedback: ^2.3.3` - Haptic feedback
- `react-native-permissions: ^5.4.2` - Permission management
- `react-native-share: ^12.1.0` - Content sharing
- `react-native-image-picker: ^8.2.1` - Camera and photo picker

---

## Environment Configuration Summary

### Required Environment Variables
```bash
# Supabase Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Authentication
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Analytics & Monitoring
SENTRY_DSN=your-sentry-dsn

# Optional APIs
OPENAI_API_KEY=your-openai-api-key
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### Development Settings
```bash
NODE_ENV=development
DEBUG=true
```

---

## Best Practices and Implementation Notes

### Error Handling
1. Always wrap async operations in try-catch blocks
2. Use Sentry for error tracking in production
3. Provide meaningful user feedback for errors
4. Implement offline-first patterns with local storage fallbacks

### Performance Optimization
1. Use React.memo for component optimization
2. Implement lazy loading for large lists
3. Cache frequently accessed data in AsyncStorage
4. Use Realm for complex queries and offline data

### Security Considerations
1. Never expose API keys in client code
2. Use Row Level Security (RLS) with Supabase
3. Validate all user inputs
4. Implement proper authentication flows
5. Use HTTPS for all network requests

### Cross-Platform Compatibility
1. Test all features on both iOS and Android
2. Use platform-specific code when necessary
3. Follow platform design guidelines
4. Implement proper keyboard handling
5. Test various screen sizes and orientations

---

This documentation serves as a comprehensive reference for all third-party integrations in the CupNote application. It should be updated as new services are added or existing integrations are modified.