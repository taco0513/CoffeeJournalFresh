# CupNote Tamagui - Quick Start Guide

## 🚀 For Developers Working on CupNote

### What Changed?

**Before**: Screens in `src/screens/` using React Native + StyleSheet  
**After**: Screens in `src/screens-tamagui/` using Tamagui components

### New Folder Structure

```
src/
├── screens-tamagui/        ← 🆕 USE THIS for main app screens
│   ├── core/              ← Home, ModeSelection
│   ├── tasting/           ← Coffee tasting flow  
│   ├── journal/           ← History, Stats
│   └── profile/           ← User profile
├── screens/               ← Original screens (being phased out)
└── screens-legacy/        ← Archived replaced screens
```

### Importing Screens

```typescript
// ❌ OLD WAY
import HomeScreen from '../screens/HomeScreen';

// ✅ NEW WAY  
import { HomeScreen } from '../screens-tamagui';

// All available screens:
import {
  HomeScreen,
  ModeSelectionScreen,
  CoffeeInfoScreen,
  SensoryScreen,
  PersonalCommentScreen,
  ResultScreen,
  HomeCafeScreen,
  UnifiedFlavorScreen,
  JournalIntegratedScreen,
  ProfileScreen,
} from '../screens-tamagui';
```

### Working with Tamagui

#### Basic Components

```typescript
// Instead of React Native components
import { View, Text, TouchableOpacity } from 'react-native';

// Use Tamagui components
import { YStack, XStack, Text, Button } from 'tamagui';

// YStack = Vertical Stack (like View with flexDirection: 'column')
// XStack = Horizontal Stack (like View with flexDirection: 'row')
```

#### Styling

```typescript
// ❌ OLD: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  }
});

// ✅ NEW: Tamagui styled components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
  padding: '$md', // Uses token system
});

// Or inline
<YStack flex={1} backgroundColor="$background" padding="$md">
  <Text>Hello</Text>
</YStack>
```

#### Using Theme Tokens

```typescript
// Coffee-themed tokens available:
colors: {
  $espresso: '#3E2723',      // Dark coffee
  $latte: '#D7CCC8',         // Light coffee
  $foam: '#EFEBE9',          // Milk foam
  $bean: '#6F4E37',          // Coffee bean
  $cupBlue: '#2196F3',       // Brand color
  $acidity: '#FF9800',       // Sensory colors
  $sweetness: '#E91E63',
  $body: '#9C27B0',
}

// Spacing tokens
space: {
  $xs: 4,
  $sm: 8,  
  $md: 16,
  $lg: 24,
  $xl: 32,
}
```

#### Animations

```typescript
// Tamagui has built-in animations
<Button
  animation="bouncy"
  pressStyle={{ scale: 0.95 }}
  onPress={handlePress}
>
  <Text>Animated Button</Text>
</Button>

// Available animations: 'bouncy', 'lazy', 'quick'
```

### Common Patterns

#### Screen Container
```typescript
const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
});

// Usage
<ScreenContainer>
  <SafeAreaView style={{ flex: 1 }}>
    {/* Your content */}
  </SafeAreaView>
</ScreenContainer>
```

#### Header Bar
```typescript
const HeaderBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});
```

#### Card Component
```typescript
<Card
  padding="$lg"
  backgroundColor="$background"
  borderRadius="$3"
  elevate
  animation="lazy"
>
  <H3>Card Title</H3>
  <Paragraph>Card content</Paragraph>
</Card>
```

### Working with Existing Components

Most existing React Native components work fine with Tamagui screens:

```typescript
// These still work normally
import { AutocompleteInput } from '../components/common';
import StatusBadge from '../components/StatusBadge';
import { InsightCard } from '../components/stats/InsightCard';
```

### Development Tips

1. **Hot Reload**: Works normally - make changes and see updates
2. **TypeScript**: Full type support for all Tamagui components
3. **Debugging**: Use React DevTools as usual
4. **Performance**: Tamagui optimizes at compile time

### Need Help?

- Check existing Tamagui screens for examples
- Read Tamagui docs: https://tamagui.dev
- Look at `tamagui.config.ts` for available tokens
- Ask team about migration questions

### Current Status

✅ **Phase 1 Complete**: All main screens migrated  
🚧 **Phase 2 Planning**: Component migration next  
📱 **Production Ready**: Yes, with testing

---

**Quick Commands**:
```bash
# Run the app
npm start
npm run ios

# Type checking
npm run type-check

# See all available tokens
cat tamagui.config.ts
```

Happy coding with Tamagui! 🚀